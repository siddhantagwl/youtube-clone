import { httpsCallable } from "firebase/functions";
import { Timestamp } from "firebase/firestore";
import { functions } from "./firebase";

const generateUploadUrl = httpsCallable(functions, "generateUploadUrl");
const getVideosFunction = httpsCallable(functions, "getVideos");

export interface Video {
  id?: string;
  uid?: string;
  filename?: string;
  status?: "processing" | "processed";
  title?: string;
  description?: string;
  createdAt?: Timestamp;
}

export async function uploadVideo(file: File) {
  const response: any = await generateUploadUrl({
    fileExtension: file.name.split(".").pop(),
  });

  // upload the file now via the signed url
  await fetch(response?.data?.url, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type, // impt to specify the content type
    },
  });
}

export async function getVideos(): Promise<Video[]> {
  const resp = await getVideosFunction();
  return resp.data as Video[];
}
