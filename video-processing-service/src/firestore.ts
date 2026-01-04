import { credential } from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import { Firestore } from "firebase-admin/firestore";

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

// optional fields
export interface Video {
  id?: string,
  uid?: string,
  filename?: string,
  status?: 'processing' | 'processed' | 'failed',
  error?: string
  title?: string,
  description?: string,
  createdAt?: FirebaseFirestore.Timestamp;
}

// fetch video metadata from Firestore
async function getVideo(videoId: string): Promise<Video> {
  const snapshot = await firestore.collection(videoCollectionId).doc(videoId).get(); // returns a snapshot of document
  return (snapshot.data() as Video) ?? {};
}

// set video metadata in Firestore
export function setVideo(videoId: string, video: Video) {
  return firestore
    .collection(videoCollectionId)
    .doc(videoId)
    .set(video, { merge: true }) // if there is a video already, merge the new fields, doesnt delete old data
}

// check if video is new (i.e., has no status field)
export async function isVideoNew(videoId: string) {
  const video = await getVideo(videoId);
  return video?.status === undefined;
}