import { credential } from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import { Firestore } from "firebase-admin/firestore";
import type { Video } from "@yt/shared";

initializeApp({credential: credential.applicationDefault()});

const firestore = new Firestore();

// Note: This requires setting an env variable in Cloud Run
/** if (process.env.NODE_ENV !== 'production') {
  firestore.settings({
      host: "localhost:8080", // Default port for Firestore emulator
      ssl: false
  });
} */


const videoCollectionId = 'videos';

// fetch video metadata from Firestore
async function getVideo(videoId: string): Promise<Video | null> {
  const snapshot = await firestore.collection(videoCollectionId).doc(videoId).get(); // returns a snapshot of document
  if (!snapshot.exists) {
    return null;
  }
  return snapshot.data() as Video;
}

// set video metadata in Firestore
export function setVideo(videoId: string, video: Video) {
  return firestore
    .collection(videoCollectionId)
    .doc(videoId)
    .set(video, { merge: true }) // if there is a video already, merge the new fields, doesnt delete old data
}

export async function markProcessing(videoId: string) {
  return setVideo(videoId, { status: "processing" });
}


// check if video is new (i.e., has no status field)
export async function isVideoNew(videoId: string) {
  //returns true if status is missing or uploading (web client marks as uploading initially)
  const video = await getVideo(videoId);
  // eligible if missong doc or status is uploading

  // this step is important else pub sub will keep retrying on 5xx errors
  // so now processing can recreate the doc if missing or update existing doc
  // retries stop early.
  if (!video) return true;
  return video.status === "uploading";
}