"use client";

import { Fragment, useState } from "react";
import { uploadVideo } from "../../app/firebase/functions";
import styles from "./upload.module.css";
import { useRouter } from "next/navigation";


export default function Upload() {

    const [isUploading, setIsUploading] = useState(false);
    const router = useRouter();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (isUploading) return; // prevent multiple uploads

        const file = event.target.files?.item(0);
        if (file) {
            handleUpload(file);
        }
    };

    const handleUpload = async (file: File) => {
        try {
            setIsUploading(true);
            const videoId = await uploadVideo(file);
            router.push(`/watch/${videoId}`);
        } catch (error) {
            console.error("Error uploading video:", error);
            alert("Error uploading video: " + error);
            setIsUploading(false);
        }
    };

    return (
        // using fragment so it can wrap multiple elements else we cannot return multiple elements
        <Fragment>
            <input id="upload" className={styles.uploadInput}
             type="file"
             accept="video/*"
             disabled={isUploading}
             onChange={handleFileChange}
            />
            <label htmlFor="upload" className={`${styles.uploadButton} ${isUploading ? styles.disabled : ""}`}>
                {isUploading ? (
                    <span><b>Uploading…</b></span>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                    <path d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h8.25a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3H4.5ZM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06Z" />
                    </svg>
                )}
            </label>

        </Fragment>
    )
}