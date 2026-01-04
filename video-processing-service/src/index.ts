import express from "express";
import {
  setupDirectories,
  convertVideo,
  downloadRawVideo,
  uploadProcessedVideo,
  deleteRawVideo,
  deleteProcessedVideo,
} from "./storage";
import { isVideoNew, setVideo } from "./firestore";

setupDirectories();

const app = express();
app.use(express.json()); // this is important to parse JSON request bodies. express as middleware


app.post("/process-video", async (req, res) => {
  // this end point will be invoked by the cloud pub/sub message (msg queue)
  // we provide this end point as the push subscription end point in the pub/sub topic
  // ex: https://video-processing.......us-central1.run.app/process-video
  let data: any;
  // console.log("Invoked /process-video request handler");

  try {
    const message = Buffer.from(req.body.message.data, "base64").toString("utf-8");
    data = JSON.parse(message);
    // console.log("PUBSUB_DECODED_MESSAGE", data);

    console.log(
      `PUBSUB_MESSAGE=${JSON.stringify({
        bucket: data.bucket,
        name: data.name,
        generation: data.generation,
      })}`
    );

    if (!data.name) {
      //.name gives the name of the file
      throw new Error("Invalid message payload");
    }
  } catch (error) {
    console.error("Bad Pub/Sub payload. Error processing message:", error);
    return res.status(400).send("Bad request: missing filename");
  }

  // If we reach this point, it means the message was valid
  // console.log("Video processing started...");
  const inputFilename = data.name; // format-> uid-date.extension
  const outputFilename = `processed-${inputFilename}`;

  // dont process until its a new video
  const videoId = inputFilename.split(".")[0]; // extract uid from filename (<uid>-<timestamp>)
  const uid = videoId.split("-")[0];

  console.log(`CHECKING_IF_VIDEO_IS_NEW=${JSON.stringify({ videoId, uid })}`);

  const isNew = await isVideoNew(videoId);
  if (!isNew) {
    // Important: 2xx so Pub/Sub stops redelivering duplicates
    console.log(`VIDEO_ALREADY_PROCESSED_OR_IN_PROCESSING=${JSON.stringify({ videoId, uid })}`);
    return res.status(204).send("Video already processed or in processing. Skipping...");
  }

  console.log(`PROCESSING_VIDEO=${JSON.stringify({ videoId, inputFilename })}`);

  await setVideo(videoId, {
    id: videoId,
    uid: uid,
    status: "processing"
  });

  // download the raw video from the cloud storage
  try {
    await downloadRawVideo(inputFilename);
  } catch (err: any) {
    // If object is missing, do NOT retry forever
    const msg = String(err?.message ?? err);
    if (msg.includes("No such object")) {
      console.warn("Raw video missing, acknowledging message:", inputFilename);
      await setVideo(videoId, { status: "failed", error: "raw video missing" });

      return res.status(204).send("Raw video missing, skipping");
    }
    console.error("Download failed:", err);

    return res.status(500).send("Download failed");
  }

  // convert the video using ffmpeg
  try {
    await convertVideo(inputFilename, outputFilename); // await for the video to be processed before proceeding to upload hte video

    // upload the processed video to cloud storage
    await uploadProcessedVideo(outputFilename);

    // update video status in firestore
    // imp ->
    //  we didnt mention the videoID while setting the video
    //  earlier because we already have the document with that ID and merge "true" option will just update the fields
    await setVideo(videoId, {
      status: "processed",
      filename: outputFilename,
    });

    // once the video is uploaded, delete the local files
    await Promise.all([
      deleteRawVideo(inputFilename),
      deleteProcessedVideo(outputFilename),
    ]);

    console.log(`PROCESS_DONE: Video processed and uploaded successfully: ${outputFilename}`);
    return res.sendStatus(200) //.send(`Video processed and uploaded successfully: ${outputFilename}`); -> this is received by pub/sub internally and it only cares about the status code

  } catch (error: any) {
    // clean up if conversion fails, both the functions can be await in parallel using promise.all
    console.error("Error converting video or uploading processed video:", error);

    await setVideo(videoId, {
      status: "failed",
      error: String(error?.message ?? error).slice(0, 500),
    });

    await Promise.allSettled([
      deleteRawVideo(inputFilename),
      deleteProcessedVideo(outputFilename),
    ]);

    // Ack to Pub/Sub to avoid useless retries on non transient failures (// pub-sub will retry on 5xx errors)
    return res.status(200)
      .send("Video processing failed, marked as failed in firestore.");
  }
});

app.get("/", (req, res) => {
  res.status(200).send("hello from video processing service ...");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Video Processing Service Server is running on port ${PORT} ...`);
});
