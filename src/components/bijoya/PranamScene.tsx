import Image from "next/image";
import { selectActiveGreeting } from "@/lib/active-greeting";
import type {
  GreetingConfig,
  MediaConfig,
  Personalization,
} from "@/types/bijoya";
import { AlpanaMotif, DustField, OrnamentDivider } from "./Decor";

interface PranamSceneProps {
  media: MediaConfig;
  greeting: GreetingConfig;
  personal: Personalization;
}

function splitMessage(message: string): string[] {
  const rawLines = message
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const chunks: string[] = [];

  for (const line of rawLines) {
    if (line.length <= 160) {
      chunks.push(line);
      continue;
    }
    const sentences = line.match(/[^।.!?]+[।.!?]*/g) ?? [line];
    let buffer = "";
    for (const sentence of sentences) {
      if (buffer && (buffer + sentence).length > 160) {
        chunks.push(buffer.trim());
        buffer = sentence;
      } else {
        buffer += sentence;
      }
    }
    if (buffer.trim()) chunks.push(buffer.trim());
  }

  return chunks;
}

export default function PranamScene({
  media,
  greeting,
  personal,
}: PranamSceneProps) {
  const { heading } = greeting.pranam;

  /**
   * Single authoritative greeting: the pranam scene shows the default
   * blessing until the visitor saves their own message — and then shows
   * only that message, never both.
   */
  const active = selectActiveGreeting(greeting, personal);
  const showDefault = !active.isCustomized;
  const userMessage = active.isCustomized ? active.message : "";
  const messageLines = userMessage ? splitMessage(userMessage) : [];
  const isLong = userMessage.length > 220;

  return (
    <div
      data-scene="pranam"
      data-anim="scene-pranam"
      className="story-scene"
    >
      <AlpanaMotif className="absolute top-1/2 left-1/2 h-[130vmin] w-[130vmin] -translate-x-1/2 -translate-y-1/2 text-burgundy/10" />
      <DustField count={8} className="opacity-60" />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center gap-5 px-6 py-14 text-center sm:gap-6">
        <div
          data-anim="pranam-visual"
          className="flex w-full items-center justify-center gap-4 text-gold/70"
        >
          <OrnamentDivider className="hidden h-3 w-20 text-burgundy/45 sm:block" />
          {media.pranamImage ? (
            <div className="relative aspect-[3/2] w-full max-w-sm overflow-hidden rounded-[1.35rem] ring-1 ring-gold/55 shadow-[0_36px_64px_-44px_rgba(57,13,24,0.75)]">
              <Image
                src={media.pranamImage}
                alt="Bijoya pranam — traditional festive greeting"
                fill
                sizes="(min-width: 768px) 24rem, 80vw"
                className="object-cover"
              />
            </div>
          ) : (
            <AlpanaMotif className="h-24 w-24 shrink-0 text-burgundy/65 sm:h-28 sm:w-28" />
          )}
          <OrnamentDivider className="hidden h-3 w-20 rotate-180 text-burgundy/45 sm:block" />
        </div>

        <h2
          data-anim="pranam-heading"
          lang="bn"
          className="font-bengali scene-heading font-semibold text-burgundy"
        >
          {heading}
        </h2>

        <span
          data-anim="pranam-rule"
          className="gold-rule block w-40 max-w-full"
        />

        {messageLines.length > 0 ? (
          <blockquote
            data-anim="pranam-user"
            className={`user-message${isLong ? " user-message--long" : ""}`}
          >
            <div className="user-message__text">
              {messageLines.map((line, index) => (
                <p
                  key={`${index}-${line.length}`}
                  data-anim="pranam-user-line"
                  className="user-message__line"
                >
                  {line}
                </p>
              ))}
            </div>
            <cite data-anim="pranam-user-sig" className="user-message__sig">
              — {active.sender}
            </cite>
          </blockquote>
        ) : null}

        {showDefault ? (
          <>
            <p
              data-anim="pranam-msg"
              className="scene-body max-w-2xl text-charcoal/85"
            >
              {greeting.pranam.message}
            </p>

            <p
              data-anim="pranam-msg2"
              className="scene-body max-w-2xl font-medium text-wine"
            >
              {greeting.pranam.blessing}
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}
