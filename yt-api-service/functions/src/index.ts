// to deploy: cd yt-api-service && firebase deploy --only functions
// or a single function: firebase deploy --only functions:<functionName>

import * as functions from "firebase-functions/v1";
import {initializeApp} from "firebase-admin/app";
import * as logger from "firebase-functions/logger";
import {Firestore, FieldValue} from "firebase-admin/firestore";
import type {Video} from "@yt/shared";
// import {auth} from "firebase-functions/v1";
// import {onCall} from "firebase-functions/v2/https";
// import {beforeUserCreated} from "firebase-functions/v2/identity";

import {Storage} from "@google-cloud/storage";
import {onCall} from "firebase-functions/v2/https";

initializeApp();

const dbFirestore = new Firestore();

const storage = new Storage(); // Initialize Google Cloud Storage client
const rawVideoBucketName = "yt-clone-raw-uploads"; // have to be globally unique
const videoCollectionId = "videos";

// gen 1 function
export const createUser = functions.auth.user().onCreate(async (user) => {
  // Check if user exists
  if (!user) {
    logger.error("User data is undefined");
    return;
  }
  const userInfo = {
    uid: user.uid,
    email: user.email,
    photoURL: user.photoURL,
  };

  // if coll does not exist, it will create it automatically
  await dbFirestore.collection("users").doc(user.uid).set(userInfo);

  logger.info(`User created: ${JSON.stringify(userInfo)}`);
  return;
});


// gen 2 function
export const generateUploadUrl = onCall({maxInstances: 1}, async (request) => {
  // when user clicks on UI to upload a video, this function is called
  // creates a signed url for uploading the video to GCS directly and returns
  // the signed url to the client with status 'uploading' in firestore
  // client can then upload the video directly to GCS using the signed url

  // check if user is authenticated
  if (!request.auth) {
    throw new functions.https.HttpsError("unauthenticated",
      "User must be authenticated");
  }

  const auth = request.auth;
  const data = request.data;
  const bucket = storage.bucket(rawVideoBucketName);

  // get a v4 signed url for uploading file
  // generate a unique filename server side
  const videoId = `${auth.uid}-${Date.now()}`;
  const rawFilename = `${videoId}.${data.fileExtension}`;

  const file = bucket.file(rawFilename);

  const [url] = await file.getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
  });

  // Create metadata doc immediately so UI can link to /watch/:id right away
  const videoDoc: Video = {
    id: videoId,
    uid: auth.uid,
    rawFilename,
    status: "uploading",
    createdAt: FieldValue.serverTimestamp() as unknown,
  };

  await dbFirestore
    .collection(videoCollectionId)
    .doc(videoId)
    .set(videoDoc, {merge: true});

  // Keep legacy fileName field for backward compatibility in the client
  return {url, videoId, rawFilename, fileName: rawFilename};
});


export const getVideos = onCall({maxInstances: 1}, async () => {
  // we didnt check for user login, as videos are public and any one can
  // watch them.
  // return first 10 videso for simplicity
  const snapshot = await dbFirestore.collection(videoCollectionId)
    .limit(10)
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
});


export const getVideoById = onCall({maxInstances: 1}, async (request) => {
  const {id} = request.data as { id?: string };

  if (!id) {
    throw new functions.https.HttpsError("invalid-argument",
      "videoId is required");
  }

  const doc = await dbFirestore.collection(videoCollectionId).doc(id).get();

  if (!doc.exists) {
    throw new functions.https.HttpsError("not-found",
      `Video with id ${id} not found`);
  }

  return {id: doc.id, ...doc.data()};
});
