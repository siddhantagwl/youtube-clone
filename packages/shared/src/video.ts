export type VideoStatus = "uploading" | "processing" | "processed" | "failed";

export interface Video {
  id?: string;
  uid?: string;

  rawFilename?: string;
  processedFilename?: string;

  // Backward compatibility for older docs
  filename?: string;

  status?: VideoStatus;
  error?: string;

  title?: string;
  description?: string;

  // Admin and client use different Timestamp types, keep it flexible
  createdAt?: unknown;
}