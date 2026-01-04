// yt-web-client/app/firebase/functions.ts
// this file is used to call firebase cloud functions from the web client
// using the firebase/functions sdk for callable functions
// separate deployment on the yt-api-service repo

import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

const generateUploadUrl = httpsCallable(functions, "generateUploadUrl");
const getVideosFunction = httpsCallable(functions, "getVideos");
const getVideoByIdFunction = httpsCallable(functions, "getVideoById");
import type {Video} from "@yt/shared"

interface UploadUrlResponse {
  url: string;
  videoId: string;
  rawFilename: string;
  // Backward compatibility
  fileName?: string;
}

export async function uploadVideo(file: File) {
  const response = await generateUploadUrl({
    fileExtension: file.name.split(".").pop(),
  });

  const uploadData = response.data as UploadUrlResponse;

  // upload the file now via the signed url
  await fetch(uploadData.url, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type, // impt to specify the content type
    },
  });

  // we can now return the videoId to the client so we redirect to the watch page of this videoID
  // even before processing is complete
  return uploadData.videoId;
}

export async function getVideos(): Promise<Video[]> {
  const resp = await getVideosFunction();
  return resp.data as Video[];
}

export async function getVideoById(id: string): Promise<Video> {
  const resp = await getVideoByIdFunction({ id });
  return resp.data as Video;
}