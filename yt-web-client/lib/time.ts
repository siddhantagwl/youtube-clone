import { Timestamp } from "firebase/firestore";

export function formatRelativeTime(ts?: unknown) {
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
