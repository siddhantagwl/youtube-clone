// server side component
import Link from "next/link";
import Image from "next/image";
import { getVideos } from "./firebase/functions";
import styles from "./page.module.css";
import { Timestamp } from "firebase/firestore";


function formatRelativeTime(ts?: unknown) {
  if (!ts) return "";

  // Normalize to a JS Date
  let date: Date | null = null;

  if (ts instanceof Timestamp) {
    date = ts.toDate();
  } else {
    const asAny = ts as any;
    const seconds =
      typeof asAny?.seconds === "number"
        ? asAny.seconds
        : typeof asAny?._seconds === "number"
        ? asAny._seconds
        : undefined;
    const nanoseconds =
      typeof asAny?.nanoseconds === "number"
        ? asAny.nanoseconds
        : typeof asAny?._nanoseconds === "number"
        ? asAny._nanoseconds
        : 0;

    if (typeof seconds === "number") {
      date = new Timestamp(seconds, nanoseconds).toDate();
    } else {
      const d = new Date(String(ts));
      if (!Number.isNaN(d.getTime())) date = d;
    }
  }

  if (!date) return "";

  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) return "just now";

  const sec = Math.floor(diffMs / 1000);
  if (sec < 10) return "just now";
  if (sec < 60) return `added ${sec}s ago`;

  const min = Math.floor(sec / 60);
  if (min < 60) return `added ${min}m ago`;

  const hr = Math.floor(min / 60);
  if (hr < 24) return `added ${hr}h ago`;

  const days = Math.floor(hr / 24);
  if (days < 7) return `added ${days}d ago`;

  // For older videos, fall back to a short date (keeps UI sane)
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}


export default async function Home() {
  const videos = await getVideos(); // by default, nextjs caches the server side component and this will show the same set of videos
  // console.log("Videos on home page:", videos);

  console.log(videos.map(v => v.id));
  // console.log(videos.map(v => v.createdAt));

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
                    <div className={styles.title}>{video.title || "Untitled"}</div>
                    <div className={styles.date}>{formatRelativeTime(video.createdAt)}</div>
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
