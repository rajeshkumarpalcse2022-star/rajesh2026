import fs from "node:fs";
import path from "node:path";
import { MEDIA_CANDIDATES } from "@/lib/media-config";
import type { MediaConfig, VideoSource } from "@/types/bijoya";

const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

function publicExists(publicPath: string): boolean {
  const relative = publicPath.replace(/^\//, "");
  try {
    return fs.existsSync(path.join(process.cwd(), "public", relative));
  } catch {
    return false;
  }
}

function firstExisting(paths: readonly string[]): string | null {
  for (const candidate of paths) {
    if (publicExists(candidate)) return candidate;
  }
  return null;
}

function resolveVideo(
  candidate: (typeof MEDIA_CANDIDATES)["videos"][keyof (typeof MEDIA_CANDIDATES)["videos"]],
  missing: string[],
): VideoSource {
  if (publicExists(candidate.file)) {
    return {
      kind: "file",
      src: candidate.file,
      poster: publicExists(candidate.poster) ? candidate.poster : null,
      label: candidate.label,
    };
  }

  const envId = process.env[candidate.youtubeEnv];
  if (envId && YOUTUBE_ID_PATTERN.test(envId)) {
    return { kind: "youtube", videoId: envId, label: candidate.label };
  }

  missing.push(`${candidate.label}: ${candidate.file}`);
  return {
    kind: "none",
    label: candidate.label,
    reason: envId
      ? `Env ${candidate.youtubeEnv} is not a valid 11-character YouTube video ID`
      : `Missing ${candidate.file}`,
  };
}

export function resolveMediaConfig(): MediaConfig {
  const missing: string[] = [];

  const dhakAudio = firstExisting(MEDIA_CANDIDATES.audio);
  if (!dhakAudio) missing.push(`Dhak audio: ${MEDIA_CANDIDATES.audio.join(" | ")}`);

  const mishtiImage = firstExisting(MEDIA_CANDIDATES.images.mishti);
  if (!mishtiImage)
    missing.push(`Mishti image: ${MEDIA_CANDIDATES.images.mishti.join(" | ")}`);

  const pranamImage = firstExisting(MEDIA_CANDIDATES.images.pranam);
  if (!pranamImage)
    missing.push(`Pranam image: ${MEDIA_CANDIDATES.images.pranam.join(" | ")}`);

  return {
    sindoorVideo: resolveVideo(MEDIA_CANDIDATES.videos.sindoor, missing),
    dhunuchiVideo: resolveVideo(MEDIA_CANDIDATES.videos.dhunuchi, missing),
    dhakAudio,
    mishtiImage,
    pranamImage,
    missing,
  };
}
