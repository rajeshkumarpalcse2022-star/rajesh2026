export interface VideoCandidate {
  file: string;
  poster: string;
  youtubeEnv: string;
  label: string;
}

export const MEDIA_CANDIDATES = {
  videos: {
    sindoor: {
      file: "/videos/sindoor-khela.mp4",
      poster: "/videos/posters/sindoor-khela.jpg",
      youtubeEnv: "BIJOYA_YOUTUBE_SINDOOR_ID",
      label: "Sindoor Khela",
    },
    dhunuchi: {
      file: "/videos/dhunuchi-naach.mp4",
      poster: "/videos/posters/dhunuchi-naach.jpg",
      youtubeEnv: "BIJOYA_YOUTUBE_DHUNUCHI_ID",
      label: "Dhunuchi Naach",
    },
  } satisfies Record<string, VideoCandidate>,
  audio: ["/audio/dhak.mp3", "/audio/dhak.m4a", "/audio/dhak.ogg"],
  images: {
    mishti: ["/images/mishti.jpg", "/images/mishti.webp", "/images/mishti.png"],
    pranam: ["/images/pranam.jpg", "/images/pranam.webp", "/images/pranam.png"],
  },
  document: {
    videos:
      "public/videos/sindoor-khela.mp4 and public/videos/dhunuchi-naach.mp4 (licensed Durga Puja footage, H.264 MP4, 1080p or lower, muted loop clips) with posters in public/videos/posters/",
    audio: "public/audio/dhak.mp3 (authentic, properly licensed dhak recording for Bijoya Dashami)",
    images:
      "public/images/mishti.jpg (roshogolla / sandesh photograph) and public/images/pranam.jpg (Bijoya pranam / festive family imagery)",
    youtube:
      "or set env vars BIJOYA_YOUTUBE_SINDOOR_ID and BIJOYA_YOUTUBE_DHUNUCHI_ID (11-character video IDs) to embed the official YouTube player instead of local files",
  },
} as const;
