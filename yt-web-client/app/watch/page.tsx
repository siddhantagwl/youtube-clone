'use client';
// made client so that we cna grab the query prams from the url

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function VideoPlayer() {
  const videoPrefix = "https://storage.googleapis.com/sidd-yt-processed-videos/";
  const videoSrc = videoPrefix + useSearchParams().get("v");

  return (
    <div>
      <h1>Watch Page</h1>
      <video src={videoSrc} controls width="800" height="450"></video>
    </div>
  );
}

export default function WatchPage() {

  return (
    <Suspense fallback={<div>Loading video...</div>}>
      <VideoPlayer />
    </Suspense>
  );
}
