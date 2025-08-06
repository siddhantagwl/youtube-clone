import express from "express";
import { setupDirectories,
    convertVideo,
    downloadRawVideo,
    uploadProcessedVideo,
    deleteRawVideo,
    deleteProcessedVideo,
} from "./storage";


setupDirectories();

const app = express();
app.use(express.json()); // this is important to parse JSON request bodies. express as middleware


// app.get("/", (req, res) => {
//     res.send("Video Processing Service is running...");
// });

app.post("/process-video", async (req, res) => {

    // this end point will be invoked by the cloud pub/sub message (msg queue)
    let data;
    try {
        const message = Buffer.from(req.body.message.data, 'base64').toString('utf-8');
        data = JSON.parse(message);
        if (!data.name) { //.name gives the name of the file
            throw new Error("Invalid message payload");
        }
    } catch (error) {
        console.error("Error processing message:", error);
        return res.status(400).send("Bad request: missing filename");
    }

    // If we reach this point, it means the message was valid
    console.log("Video processing started...");
    const inputFilename = data.name;
    const outputFilename = `processed-${inputFilename}`;

    // download the raw video from the cloud storage
    await downloadRawVideo(inputFilename);

    // convert the video using ffmpeg
    try {
        await convertVideo(inputFilename, outputFilename); // await for the video to be processed before proceeding to upload hte video
    } catch (error) {
        // clean up if conversion fails
        // both the functions can be await in parallel using promise.all
        await Promise.all([
            deleteRawVideo(inputFilename),
            deleteProcessedVideo(outputFilename)
        ]);
        console.error("Error converting video:", error);
        return res.status(500).send("Internal server error: video conversion failed");
    }

    // upload the processed video to cloud storage
    await uploadProcessedVideo(outputFilename);

    // once the video is uploaded, delete the local files
    await Promise.all([
        deleteRawVideo(inputFilename),
        deleteProcessedVideo(outputFilename)
    ]);

    return res.status(200).send(`Video processed and uploaded successfully: ${outputFilename}`);

});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`VPS Server is running on port ${PORT}`);
});