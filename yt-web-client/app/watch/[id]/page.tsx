import { getVideoById, getVideos } from "@/app/firebase/functions";
import styles from "./page.module.css";
import VideoCard from "@/components/video-card/VideoCard";

const videoPrefix = "https://storage.googleapis.com/sidd-yt-processed-videos/";

export default async function WatchPage(
  { params }: { params: Promise<{ id: string }> }
){
  // imp - In the App Router, dynamic route parameters are treated as
  // async data sources to support streaming and deferred rendering
  const { id } = await params;

  let video;
  try {
    video = await getVideoById(id);
  } catch {
    return <div style={{ padding: 24 }}>Video not found</div>;
  }

  const allVideos = await getVideos();
  const suggestions = allVideos
    .filter((v) => v.id && v.id !== id) // filter out hte current video
    .slice(0, 8); // only 8 suggestions

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.layout}>
          <section className={styles.mainCol}>
            <a href="/" className={styles.backLink}>
              ← Back
            </a>

            <div className={styles.titleRow}>
              <h1 className={styles.title}>{video.title || "Untitled"}</h1>
              <span
                className={`${styles.statusPill} ${
                  video.status === "processed"
                    ? styles.ready
                    : video.status === "failed"
                    ? styles.failedPill
                    : styles.processingPill
                }`}
              >
                {video.status === "processed"
                  ? "Ready"
                  : video.status === "failed"
                  ? "Failed"
                  : "Processing"}
              </span>
            </div>

            <div className={styles.playerShell}>
              {video.status === "processed" && (video.processedFilename || video.filename) ? (
                <video
                  controls
                  className={styles.player}
                  src={`${videoPrefix}${video.processedFilename || video.filename}`}
                />
              ) : video.status === "failed" ? (
                <div className={`${styles.playerOverlay} ${styles.failedOverlay}`}>
                  <div className={styles.overlayTitle}>Processing failed</div>
                  <div className={styles.overlayText}>
                    {video.error ? video.error : "No error details available"}
                  </div>
                  <div className={styles.actions}>
                    <a href={`/watch/${id}`} className={styles.actionBtn}>
                      Retry
                    </a>
                    <a href="/" className={styles.actionBtnSecondary}>
                      Home
                    </a>
                  </div>
                </div>
              ) : (
                <>
                  <meta httpEquiv="refresh" content="3" />
                  <div className={`${styles.playerOverlay} ${styles.processingOverlay}`}>
                    <div className={styles.skeleton}>
                      <div className={styles.shimmer} />
                    </div>
                    <div className={styles.overlayTitle}>Processing</div>
                    <div className={styles.overlayText}>
                      Auto refreshing every 3 seconds.
                    </div>
                  </div>
                </>
              )}
            </div>

            {video.description ? (
              <p className={styles.description}>{video.description}</p>
            ) : null}
          </section>

          <aside className={styles.sideCol}>
            <div className={styles.sideTitle}>Up next</div>

            <div className={styles.sideList}>
              { suggestions.length === 0 ? (
                <div className={styles.message}>No suggestions yet</div>
              ) : (
                suggestions.map((v) =>  v.id ? (
                  <VideoCard key={v.id} video={v} href={`/watch/${v.id}`} variant="compact" />
                ) : null
                ))}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
