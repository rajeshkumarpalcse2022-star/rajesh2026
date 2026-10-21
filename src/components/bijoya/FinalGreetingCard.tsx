import Image from "next/image";
import { BIJOYA_HEADING, DEFAULT_GREETING } from "@/lib/greeting-config";
import type { GreetingConfig } from "@/types/bijoya";
import { CornerFlourish, DustField } from "./Decor";

interface FinalGreetingCardProps {
  greeting: GreetingConfig;
}

export const FINAL_CARD_EXPORT_ID = "bijoya-card-export";

/**
 * The classic Sharodiya greeting card — intentionally fixed and never
 * editable. The visitor's own words appear only in the pranam scene.
 */
export default function FinalGreetingCard({
  greeting,
}: FinalGreetingCardProps) {
  const { script } = greeting.finalCard;
  const { year } = greeting;
  const sender = greeting.sender || DEFAULT_GREETING.sender;

  return (
    <div
      data-scene="final"
      data-anim="scene-final"
      className="story-scene"
    >
      <DustField count={10} className="opacity-70" />

      <div className="final-scene relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-4 py-10 text-center sm:gap-6 sm:px-8 sm:py-14">
        <figure data-anim="final-card" className="final-card text-center">
          <span data-anim="final-frame" className="final-card__frame" />
          <CornerFlourish className="pointer-events-none absolute top-2 left-2 z-10 h-6 w-6 text-gold/70" />
          <CornerFlourish className="pointer-events-none absolute top-2 right-2 z-10 h-6 w-6 rotate-90 text-gold/70" />
          <CornerFlourish className="pointer-events-none absolute right-2 bottom-2 z-10 h-6 w-6 -rotate-90 text-gold/70" />
          <CornerFlourish className="pointer-events-none absolute bottom-2 left-2 z-10 h-6 w-6 rotate-180 text-gold/70" />

          <div
            id={FINAL_CARD_EXPORT_ID}
            className="relative z-10 flex flex-col items-center gap-3 sm:gap-4"
          >
            <span
              data-anim="final-text"
              className="eyebrow block text-burgundy/70"
            >
              Sharodiya · {year}
            </span>
            <h2 data-anim="final-text" className="final-script">
              {script}
            </h2>
            <span
              data-anim="final-text"
              lang="bn"
              className="final-heading block"
            >
              {BIJOYA_HEADING}
            </span>
            <span data-anim="final-text" className="gold-rule block w-36 max-w-full" />
            <p data-anim="final-text" className="final-message">
              {DEFAULT_GREETING.message}
            </p>

            <Image
              data-anim="final-text"
              src="/images/bijoya-card-memory.png"
              alt="Shubho Bijoya — Maa Durga, festive sweets and a river ghat at sunset"
              width={1254}
              height={1254}
              sizes="(min-width: 640px) 19rem, 90vw"
              className="mx-auto block w-full max-w-[17rem] rounded-[1.35rem] ring-1 ring-gold/55 shadow-[0_36px_64px_-44px_rgba(57,13,24,0.75)] sm:max-w-[19rem]"
            />

            <figcaption
              data-anim="final-signature"
              className="mt-1 block text-[0.62rem] tracking-[0.3em] text-burgundy/75 uppercase"
            >
              From {sender} — {year}
            </figcaption>
          </div>

          <span className="final-shimmer" aria-hidden="true">
            <span data-anim="shimmer" />
          </span>
        </figure>

        <p
          data-anim="actions-cue"
          className="text-[0.6rem] tracking-[0.3em] text-burgundy/65 uppercase"
        >
          Scroll for sharing options
        </p>
      </div>
    </div>
  );
}
