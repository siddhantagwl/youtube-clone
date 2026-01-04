// server side component
import Link from "next/link";
import Image from "next/image";
import { getVideos } from "./firebase/functions";
import styles from "./page.module.css";

export default async function Home() {
  const videos = await getVideos(); // by default, nextjs caches the server side component and this will show the same set of videos
  // console.log("Videos on home page:", videos);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {
            videos.map((video) => {
              if (!video.id) return null;
              return (
                <Link key={video.id} href={`/watch/${video.id}`} className={styles.card}>
                  <div className={styles.thumbWrap}>
                    <div
                      className={`${styles.badge} ${
                        video.status === "processed"
                          ? styles.ready
                          : video.status === "failed"
                          ? styles.failed
                          : styles.processing
                      }`}
                    >
                      {video.status === "processed"
                        ? "Ready"
                        : video.status === "failed"
                        ? "Failed"
                        : "Processing"}
                    </div>
                    <Image
                      src={"/thumbnail.png"}
                      alt="thumbnail"
                      fill
                      className={styles.thumbnail}
                      sizes="(max-width: 640px) 100vw,
                            (max-width: 1024px) 50vw,
                            (max-width: 1400px) 33vw,
                            25vw"
                      priority={false}
                    />
                  </div>

                  <div className={styles.meta}>
                    <div className={styles.title}>
                      {video.title || "Untitled"}
                    </div>
                  </div>
                </Link>
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
