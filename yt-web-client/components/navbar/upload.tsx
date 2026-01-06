"use client";

import { Fragment, useState } from "react";
import { uploadVideo } from "../../app/firebase/functions";
import styles from "./upload.module.css";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";

interface UploadProps {
  user: User | null;
  onSignIn: () => void;
}

export default function Upload({ user, onSignIn }: UploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const router = useRouter();

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!user) {
            return;
        }
        if (isUploading) return; // prevent multiple uploads

        const file = event.target.files?.item(0);
        event.target.value = "";

        if (file) {
            await handleUpload(file);
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
            {user ? (
            <>
            <input id="upload" className={styles.uploadInput}
             type="file"
             accept="video/*"
             disabled={isUploading}
             onChange={handleFileChange}
            />
            <label
              htmlFor="upload"
              className={`${styles.uploadButton} ${styles.signedIn} ${isUploading ? styles.disabled : ""}`}>
                {isUploading ? (
                    <span className={styles.spinner} />
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                        <path d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h8.25a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3H4.5ZM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06Z" />
                    </svg>
                )}
            </label>
            </>
            ) : (
                <button
                    type="button"
                    className={`${styles.uploadButton} ${styles.signedOut}`}
                    onClick={onSignIn}
                    title="Sign in to upload"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                        <path d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h8.25a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3H4.5ZM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06Z" />
                    </svg>
                </button>
            )}
        </Fragment>
    )
}
