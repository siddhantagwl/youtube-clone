import Image from "next/image";
import Link from "next/link";
import styles from "./VideoCard.module.css";
import { formatRelativeTime } from "@/lib/time";

type VideoCardProps = {
  video: any;
  href: string;
  variant?: "grid" | "compact";
};

function getStatusUi(status: string | undefined) {
  if (status === "processed") {
    return { label: "Ready", className: styles.badgeReady };
  }
  if (status === "failed") {
    return { label: "Failed", className: styles.badgeFailed };
  }
  return { label: "Processing", className: styles.badgeProcessing };
}

export default function VideoCard({ video, href, variant = "grid" }: VideoCardProps) {
  const isCompact = variant === "compact";
  const statusUi = getStatusUi(video?.status);

  return (
    <Link href={href} className={`${styles.card} ${isCompact ? styles.compact : styles.grid}`}>
      <div className={styles.thumbWrap}>
        <Image
          src="/thumbnail.png"
          alt="thumbnail"
          fill
          className={styles.thumbImg}
          sizes={
            isCompact
              ? "160px"
              : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1400px) 33vw, 25vw"
          }
          priority={false}
        />
        <span className={`${styles.badge} ${statusUi.className}`}>{statusUi.label}</span>
      </div>

      <div className={styles.meta}>
        <div className={styles.title}>{video?.title || "Untitled"}</div>
        <div className={styles.sub}>Uploaded by {video?.uid ? video.uid : "unknown"}</div>
        <div className={styles.sub}>{formatRelativeTime(video?.createdAt)}</div>
      </div>
    </Link>
  );
}
