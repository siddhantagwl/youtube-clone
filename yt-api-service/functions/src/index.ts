import * as functions from "firebase-functions/v1";
import {initializeApp} from "firebase-admin/app";
import * as logger from "firebase-functions/logger";
import {Firestore} from "firebase-admin/firestore";
// import {auth} from "firebase-functions/v1";
// import {onCall} from "firebase-functions/v2/https";
// import {beforeUserCreated} from "firebase-functions/v2/identity";

import {Storage} from "@google-cloud/storage";
import {onCall} from "firebase-functions/v2/https";

initializeApp();

const dbFirestore = new Firestore();

const storage = new Storage(); // Initialize Google Cloud Storage client
const rawVideoBucketName = "yt-clone-raw-uploads"; // have to be globally unique

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
  const fileName = `${auth.uid}-${Date.now()}.${data.fileExtension}`;
  const file = bucket.file(fileName);
  const [url] = await file.getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
  });

  return {url, fileName};
});
