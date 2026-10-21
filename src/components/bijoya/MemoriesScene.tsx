import type { CSSProperties } from "react";
import { cloudinaryThumbUrl } from "@/lib/cloudinary-url";
import type { GreetingConfig, Personalization } from "@/types/bijoya";
import { AlpanaMotif, DustField, OrnamentDivider } from "./Decor";

interface MemoriesSceneProps {
  greeting: GreetingConfig;
  personal: Personalization;
}

function columnCount(count: number): number {
  if (count <= 2) return count;
  if (count === 4) return 2;
  return 3;
}

export default function MemoriesScene({
  greeting,
  personal,
}: MemoriesSceneProps) {
  const { title, subtitle, photoAltPrefix } = greeting.memories;
  const photos = personal.photos;
  const cols = columnCount(photos.length);

  return (
    <div
      data-scene="memories"
      data-anim="scene-memories"
      className="story-scene"
    >
      <AlpanaMotif className="absolute top-1/2 left-1/2 h-[125vmin] w-[125vmin] -translate-x-1/2 -translate-y-1/2 text-gold/12" />
      <DustField count={8} className="opacity-55" />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center justify-center gap-5 px-6 py-12 text-center sm:gap-6">
        <p data-anim="mem-eyebrow" className="eyebrow text-burgundy/70">
          {(personal.sender.trim() || greeting.sender)} · {greeting.year}
        </p>

        <div className="flex flex-col items-center gap-2">
          <h2 data-anim="mem-title" className="memories-title">
            {title}
          </h2>
          <p
            data-anim="mem-subtitle"
            className="text-[0.72rem] tracking-[0.42em] text-burgundy/75 uppercase"
          >
            {subtitle} {greeting.year}
          </p>
        </div>

        <span data-anim="mem-rule" className="gold-rule block w-40 max-w-full" />

        <div
          data-anim="mem-grid"
          className="memories-grid"
          style={{ "--mem-cols": cols } as CSSProperties}
        >
          {photos.map((src, index) => (
            <figure
              key={`${index}:${src}`}
              data-anim="mem-item"
              role="img"
              aria-label={`${photoAltPrefix} ${index + 1} of ${photos.length}`}
              className="memories-item"
              style={{ backgroundImage: `url(${cloudinaryThumbUrl(src, 720)})` }}
            />
          ))}
        </div>

        <span data-anim="mem-divider" className="block">
          <OrnamentDivider className="h-3 w-32 text-burgundy/45" />
        </span>
      </div>
    </div>
  );
}
