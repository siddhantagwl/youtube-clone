'use client';
// made client so that we cna grab the query prams from the url

import { useSearchParams } from "next/navigation";

export default function WatchPage() {
  const videoPrefix = "https://storage.googleapis.com/sidd-yt-processed-videos/";
  const videoSrc = videoPrefix + useSearchParams().get("v");

  return (
    <div>
      <h1>Watch Page</h1>
      <video src={videoSrc} controls></video>
    </div>
  );
}
