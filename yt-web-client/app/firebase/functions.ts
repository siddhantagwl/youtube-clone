import { httpsCallable } from "firebase/functions";
import { Timestamp } from "firebase/firestore";
import { functions } from "./firebase";

const generateUploadUrl = httpsCallable(functions, "generateUploadUrl");
const getVideosFunction = httpsCallable(functions, "getVideos");
const getVideoByIdFunction = httpsCallable(functions, "getVideoById");

export interface Video {
  id?: string;
  uid?: string;
  filename?: string;
  status?: "processing" | "processed" | "failed";
  error?: string
  title?: string;
  description?: string;
  createdAt?: Timestamp;
}
interface UploadUrlResponse {
  url: string;
  fileName: string;
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

  return uploadData.fileName;
}

export async function getVideos(): Promise<Video[]> {
  const resp = await getVideosFunction();
  return resp.data as Video[];
}

export async function getVideoById(id: string): Promise<Video> {
  const resp = await getVideoByIdFunction({ id });
  return resp.data as Video;
}