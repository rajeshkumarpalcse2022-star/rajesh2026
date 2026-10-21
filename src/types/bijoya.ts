export type VideoSource =
  | { kind: "file"; src: string; poster: string | null; label: string }
  | { kind: "youtube"; videoId: string; label: string }
  | { kind: "none"; label: string; reason: string };

export interface MediaConfig {
  sindoorVideo: VideoSource;
  dhunuchiVideo: VideoSource;
  dhakAudio: string | null;
  mishtiImage: string | null;
  pranamImage: string | null;
  missing: string[];
}

export type SoundStatus = "idle" | "playing" | "paused" | "blocked" | "unavailable";

export type ExperiencePhase = "closed" | "opening" | "story";

export interface Personalization {
  sender: string;
  message: string;
  photos: string[];
  id?: string | null;
  isCustomized?: boolean;
}

/**
 * The single authoritative greeting the card renders: either the default
 * content (not customized) or the saved custom content.
 */
export interface ActiveGreeting {
  heading: string;
  message: string;
  sender: string;
  photos: string[];
  isCustomized: boolean;
}

export interface SavedGreeting {
  id: string;
  sender: string;
  message: string;
  photos: string[];
  occasion: string;
  isCustomized: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FestivalShot {
  label: string;
  caption: string;
}

export interface GreetingConfig {
  sender: string;
  year: number;
  cover: {
    script: string;
    bengali: string;
    instruction: string;
    ariaLabel: string;
    openedAriaLabel: string;
  };
  interior: {
    bengali: string;
    romanized: string;
  };
  festival: {
    title: string;
    caption: string;
    shots: [FestivalShot, FestivalShot];
    fallbackNote: string;
  };
  mishti: {
    eyebrow: string;
    heading: string;
    body: string;
    imageAlt: string;
  };
  pranam: {
    heading: string;
    message: string;
    blessing: string;
  };
  finalCard: {
    script: string;
    bengali: string;
    romanized: string;
  };
  memories: {
    title: string;
    subtitle: string;
    photoAltPrefix: string;
  };
  actions: {
    share: string;
    makeItYours: string;
    dialogTitle: string;
    writeMessage: string;
    yourName: string;
    messagePlaceholder: string;
    save: string;
    cancel: string;
    attachPhotos: string;
    replacePhoto: string;
    removePhoto: string;
    replay: string;
    soundOn: string;
    soundOff: string;
    copy: string;
    shareTitle: string;
    adminLogin: string;
    saved: string;
    saving: string;
    characters: string;
  };
}
