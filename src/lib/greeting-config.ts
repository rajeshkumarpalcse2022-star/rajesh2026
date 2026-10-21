import type { GreetingConfig } from "@/types/bijoya";

/** Central Bengali heading used across the whole experience. */
export const BIJOYA_HEADING = "শুভ বিজয়া দশমী";

/** Default sender shown until the visitor personalises the greeting. */
export const DEFAULT_SENDER = "Rajesh";

const PRANAM_MESSAGE =
  "Boro der pronam, chhoto der bhalobasha, aar shobar jonno roilo antorik shubhechha.";
const PRANAM_BLESSING =
  "Ma Durga-r ashirbade tomar jibon bhore uthuk anondo, shanti aar safolotay.";

/**
 * The one default greeting. Never duplicate this copy inside components —
 * derive rendered content from `selectActiveGreeting` instead.
 */
export const DEFAULT_GREETING = {
  heading: BIJOYA_HEADING,
  message: `${PRANAM_MESSAGE}\n\n${PRANAM_BLESSING}`,
  sender: DEFAULT_SENDER,
} as const;

export const greeting: GreetingConfig = {
  sender: DEFAULT_SENDER,
  year: 2026,
  cover: {
    script: "Happy Bijaya Dashami",
    bengali: BIJOYA_HEADING,
    instruction: "Click to open your greeting",
    ariaLabel: "Open your Bijoya Dashami greeting card",
    openedAriaLabel: "Greeting card opened",
  },
  interior: {
    bengali: BIJOYA_HEADING,
    romanized:
      "Tomar aar tomar poribarer jonno roilo antorik bhalobasha o shubhechha.",
  },
  festival: {
    title: "Shubho Bijoya",
    caption: "Dhaker taale, sindoorer rong-e, mon bhore uthuk anonde.",
    shots: [
      { label: "Sindoor Khela", caption: "Sindoor Khela — Dashami morning" },
      { label: "Dhunuchi Naach", caption: "Dhunuchi Naach — dhak er taale" },
    ],
    fallbackNote: "Licensed festival footage pending — see README",
  },
  mishti: {
    eyebrow: "Bijoyar mishti",
    heading: "Mishti Hok Tomar Bijoya",
    body: "Roshogollar mishti, aar shobar bhalobashay bhore uthuk tomar Bijoya.",
    imageAlt: "Bengali sweets — roshogolla and sandesh served on a festive plate",
  },
  pranam: {
    heading: BIJOYA_HEADING,
    message: PRANAM_MESSAGE,
    blessing: PRANAM_BLESSING,
  },
  finalCard: {
    script: "Happy Bijaya Dashami",
    bengali: BIJOYA_HEADING,
    romanized: PRANAM_BLESSING,
  },
  memories: {
    title: "Memorable Sharodiya Days",
    subtitle: "of",
    photoAltPrefix: "Memorable Sharodiya day",
  },
  actions: {
    share: "Share This Greeting",
    makeItYours: "Make It Yours",
    dialogTitle: "Make it yours",
    writeMessage: "Write your Bijoya message",
    yourName: "Your name",
    messagePlaceholder: "Tomar nijer shubhechha ekhane likho…",
    save: "Save",
    cancel: "Cancel",
    attachPhotos: "Attach your memorable Sharodiya days",
    replacePhoto: "Replace photos (max 6)",
    removePhoto: "Remove photo",
    replay: "Replay Experience",
    soundOn: "Sound On",
    soundOff: "Sound Off",
    copy: "Copy Greeting Text",
    shareTitle: "Happy Bijaya Dashami",
    adminLogin: "Admin Login",
    saved: "Your greeting has been saved.",
    saving: "Saving…",
    characters: "characters",
  },
};

export function buildShareText(
  config: GreetingConfig,
  sender: string,
  message: string,
): string {
  const personalMessage = message.trim() || config.finalCard.romanized;
  const lines = [
    `${config.finalCard.script} ${config.year}`,
    "",
    config.finalCard.bengali,
    "",
    personalMessage,
    `— ${sender.trim() || config.sender}`,
  ];
  return lines.join("\n");
}
