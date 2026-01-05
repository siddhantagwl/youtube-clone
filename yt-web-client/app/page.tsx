// server side component

import { getVideos } from "./firebase/functions";
import styles from "./page.module.css";
import VideoCard from "@/components/video-card/VideoCard";


export default async function Home() {
  const videos = await getVideos(); // by default, nextjs caches the server side component and this will show the same set of videos
  // console.log("Videos on home page:", videos);

  // console.log(videos.map(v => v.id));
  // console.log(videos.map(v => v.createdAt));

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {
            videos.map((video) => {
              if (!video.id) return null;
              return (
                <VideoCard key={video.id} video={video} href={`/watch/${video.id}`} variant="grid" />
              );
            })
          }
        </div>
      </div>
    </main>
  );
}

// as per docs:
// on this entire page , disbale caching and make it revalidate
// every 30 seconds and render page in 30 sec
// and this way. we can reduce the load on getVideos function
export const revalidate = 30;
export const dynamic = "force-dynamic"; // tells Next: always render on request, do not serve ISR snapshots.