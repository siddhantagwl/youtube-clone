import { getVideoById } from "@/app/firebase/functions";

const videoPrefix = "https://storage.googleapis.com/sidd-yt-processed-videos/";

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  // imp - In the App Router, dynamic route parameters are treated as
  // async data sources to support streaming and deferred rendering
  const { id } = await params;

  let video;
  try {
    video = await getVideoById(id);
  } catch {
    return <div style={{ padding: 24 }}>Video not found</div>;
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 600 }}>
        {video.title || "Untitled"}
      </h1>

      {video.status === "processed" && video.filename ? (
        <video
          controls
          style={{ width: "100%", marginTop: 12, borderRadius: 12 }}
          src={`${videoPrefix}${video.filename}`}
        />
      ) : video.status === "failed" ? (
        <div style={{ marginTop: 12 }}>
          Failed to process video. {video.error ?? ""}
        </div>
      ) : (
        <div style={{ marginTop: 12 }}>
          Video is processing. Refresh in a moment.
        </div>
      )}

      {video.description ? (
        <p style={{ marginTop: 12 }}>{video.description}</p>
      ) : null}
    </div>
  );
}
