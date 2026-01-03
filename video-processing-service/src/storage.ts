// google cloud storage file interactiosn and local file system interactions
import { Storage } from '@google-cloud/storage';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';


const storage = new Storage(); // Initialize Google Cloud Storage client
const rawVideoBucketName = 'yt-clone-raw-uploads'; // have to be globally unique
const processedVideoBucketName = 'sidd-yt-processed-videos';

const localRawVideoDir = "./raw-videos";
const localProcessedVideoDir = "./processed-videos";

/*
    Create local directories for raw and processed videos from google cloud storage
    This is to ensure that the application has a place to store temporary files
    and processed videos before they are uploaded back to the cloud.
*/
export function setupDirectories() {
    ensureDirectoriesExist(localRawVideoDir);
    ensureDirectoriesExist(localProcessedVideoDir);
}

export function convertVideo(rawVideoName:string, processedVideoName:string): Promise<string> {
    // return a promise that resolves when the video processing is complete so that the server can respond to the client
    return new Promise((resolve, reject) => {
        // create a new ffmpeg command to process the video
        ffmpeg(`${localRawVideoDir}/${rawVideoName}`)
        .outputOptions('-vf', 'scale=-1:360') // resize to 360p
        .on("end", () => {
            console.log("Video processing finished successfully!!");
            resolve(`Video processed and saved as ${processedVideoName}`);
        })
        .on("error", (err) => {
            console.error("Error processing video:", err.message);
            reject(err);
        })
        .save(`${localProcessedVideoDir}/${processedVideoName}`); // save the processed video to the local directory
    });
}

export async function downloadRawVideo(fileName: string): Promise<void> {
    await storage.bucket(rawVideoBucketName).file(fileName)
    .download({
        destination: `${localRawVideoDir}/${fileName}`
    });

    console.log(
        `gs://${rawVideoBucketName}/${fileName} downloaded to ${localRawVideoDir}/${fileName}`
    );
}

export async function uploadProcessedVideo(fileName: string): Promise<void> {
    const bucket = storage.bucket(processedVideoBucketName)
    await bucket.upload(`${localProcessedVideoDir}/${fileName}`, {
        destination: fileName
    });

    // Make the file public so that it can be accessed via a URL in YT.
    await bucket.file(fileName).makePublic();

    console.log(
        `File ${fileName} uploaded to gs://${processedVideoBucketName}/${fileName}`
    );
}

export function deleteRawVideo(fileName: string) {
    const filePath = `${localRawVideoDir}/${fileName}`;
    deleteLocalFiles(filePath);
}

export function deleteProcessedVideo(fileName: string) {
    const filePath = `${localProcessedVideoDir}/${fileName}`;
    deleteLocalFiles(filePath);
}

function deleteLocalFiles(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(`Error deleting file ${filePath}:`, err);
                    reject(err);
                } else {
                    console.log(`File ${filePath} deleted successfully.`);
                    resolve();
                }
            });
        } else {
            console.log(`File ${filePath} does not exist, skipping deletion.`);
            resolve();
        }
    });
}

function ensureDirectoriesExist(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true }); // nested directories using recursive
        console.log(`Directory ${dirPath} created.`);
    }
}
