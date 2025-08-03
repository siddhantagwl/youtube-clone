import express from "express";
import ffmpeg from "fluent-ffmpeg";

const app = express();
app.use(express.json()); // this is important to parse JSON request bodies. express as middleware


// app.get("/", (req, res) => {
//     res.send("Video Processing Service is running...");
// });

app.post("/process-video", (req, res) => {
    // Placeholder for video processing logic
    console.log("Video processing started...");

    const inputFilePath = req.body.inputFilePath;
    const outputFilePath = req.body.outputFilePath;

    // Validate input and output file paths , if not send client error 400
    if (!inputFilePath || !outputFilePath) {
        return res.status(400).send("Bad request: Missing input and output file paths.");
    }

    // create a new ffmpeg command to process the video
    ffmpeg(inputFilePath)
        .outputOptions('-vf', 'scale=-1:360') // resize to 360p
        .on("end", () => {
            console.log("Video processing finished successfully!!");
            res.status(200).send("Video processing finished successfully!!");
        })
        .on("error", (err) => {
            console.error("Error processing video:", err.message);
            res.status(500).send("Error processing video: " + err.message);
        })
        .save(outputFilePath);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`VPS Server is running on port ${PORT}`);
});