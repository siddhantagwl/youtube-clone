// google cloud storage file interactiosn and local file system interactions
import { Storage } from '@google-cloud/storage';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import fsPromises from 'fs/promises';
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

export async function convertVideo(rawVideoName:string, processedVideoName:string): Promise<string> {
    // return a promise that resolves when the video processing is complete so that the server can respond to the client

    const inputPath = `${localRawVideoDir}/${rawVideoName}`;
    const outputPath = `${localProcessedVideoDir}/${processedVideoName}`;

    // quick sanity: confirm file exists and is not empty
    const stat = await fsPromises.stat(inputPath);
    console.log(
        `FFMPEG_INPUT=${JSON.stringify({
        inputPath,
        bytes: stat.size,
        rawVideoName,
        processedVideoName,
        })}`
    );

    return new Promise((resolve, reject) => {
        const stderrLines: string[] = [];

        // create a new ffmpeg command to process the video
        ffmpeg(inputPath)
        .outputOptions('-vf', 'scale=-2:360') // resize to 360p
        // .on("start", (cmdLine) => {
        //     console.log(`FFMPEG_CMD=${cmdLine}`);
        // })
        // .on("progress", (p) => {
        //     // p can include percent, timemark, frames depending on ffmpeg
        //     console.log(`FFMPEG_PROGRESS=${JSON.stringify(p)}`);
        // })
        .on("stderr", (line) => {
            // keep last 50 lines to avoid huge logs
            stderrLines.push(line);
            if (stderrLines.length > 50) stderrLines.shift();
        })
        .on("end", () => {
            console.log("FFMPEG_END=success");
            resolve(`Video processed and saved as ${processedVideoName}`);
        })
        .on("error", (err) => {
            console.error(
            `FFMPEG_ERROR=${JSON.stringify({
                message: err?.message,
                lastStderr: stderrLines,
            })}`
            );
            reject(err);
        })
        .save(outputPath); // save the processed video to the local directory
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
    return deleteLocalFiles(filePath);
}

export function deleteProcessedVideo(fileName: string) {
    const filePath = `${localProcessedVideoDir}/${fileName}`;
    return deleteLocalFiles(filePath);
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
