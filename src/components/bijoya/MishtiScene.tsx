import Image from "next/image";
import type { GreetingConfig, MediaConfig } from "@/types/bijoya";
import { AlpanaMotif, DustField } from "./Decor";

interface MishtiSceneProps {
  media: MediaConfig;
  greeting: GreetingConfig;
}

function MishtiPlateArt({ alt }: { alt: string }) {
  return (
    <svg
      viewBox="0 0 420 320"
      role="img"
      aria-label={alt}
      className="h-auto w-full"
    >
      <defs>
        <radialGradient id="mishti-ball" cx="34%" cy="28%" r="78%">
          <stop offset="0%" stopColor="#fffdf7" />
          <stop offset="55%" stopColor="#f8eeda" />
          <stop offset="100%" stopColor="#e6d3b1" />
        </radialGradient>
        <linearGradient id="mishti-plate" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fffdf9" />
          <stop offset="100%" stopColor="#efe0c8" />
        </linearGradient>
        <linearGradient id="mishti-sandesh" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fdf5e4" />
          <stop offset="100%" stopColor="#f0dcb4" />
        </linearGradient>
        <radialGradient id="mishti-syrup" cx="50%" cy="38%" r="72%">
          <stop offset="0%" stopColor="#f9e3ab" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#d7ad61" stopOpacity="0.5" />
        </radialGradient>
        <filter
          id="mishti-shadow"
          x="-35%"
          y="-35%"
          width="170%"
          height="185%"
          colorInterpolationFilters="sRGB"
        >
          <feDropShadow
            dx="0"
            dy="7"
            stdDeviation="8"
            floodColor="#5b2a12"
            floodOpacity="0.3"
          />
        </filter>
      </defs>

      <ellipse cx="210" cy="278" rx="158" ry="22" fill="#390d18" opacity="0.12" />

      <g filter="url(#mishti-shadow)">
        <ellipse
          cx="210"
          cy="250"
          rx="156"
          ry="48"
          fill="url(#mishti-plate)"
          stroke="#d7b15a"
          strokeWidth="2.4"
        />
        <ellipse
          cx="210"
          cy="246"
          rx="134"
          ry="37"
          fill="none"
          stroke="#d7b15a"
          strokeWidth="1"
          opacity="0.65"
        />
        <ellipse cx="210" cy="244" rx="116" ry="31" fill="url(#mishti-syrup)" />
      </g>

      {[
        { cx: 168, cy: 216, r: 36 },
        { cx: 232, cy: 208, r: 40 },
        { cx: 292, cy: 224, r: 30 },
      ].map((ball) => (
        <g key={`${ball.cx}-${ball.cy}`} filter="url(#mishti-shadow)">
          <circle
            cx={ball.cx}
            cy={ball.cy}
            r={ball.r}
            fill="url(#mishti-ball)"
            stroke="#e2cfae"
            strokeWidth="0.8"
          />
          <ellipse
            cx={ball.cx - ball.r * 0.3}
            cy={ball.cy - ball.r * 0.42}
            rx={ball.r * 0.3}
            ry={ball.r * 0.19}
            fill="#ffffff"
            opacity="0.85"
          />
          <path
            d={`M${ball.cx - ball.r * 0.75} ${ball.cy + ball.r * 0.55} Q${ball.cx} ${
              ball.cy + ball.r * 0.95
            } ${ball.cx + ball.r * 0.75} ${ball.cy + ball.r * 0.55}`}
            fill="none"
            stroke="#d7ad61"
            strokeWidth="2"
            opacity="0.6"
          />
        </g>
      ))}

      <g filter="url(#mishti-shadow)">
        <rect
          x="96"
          y="196"
          width="58"
          height="58"
          rx="9"
          fill="url(#mishti-sandesh)"
          stroke="#d7b15a"
          strokeWidth="1.4"
          transform="rotate(-9 125 225)"
        />
        <rect
          x="300"
          y="202"
          width="52"
          height="52"
          rx="9"
          fill="url(#mishti-sandesh)"
          stroke="#d7b15a"
          strokeWidth="1.4"
          transform="rotate(11 326 228)"
        />
      </g>

      <g fill="#075748" opacity="0.85">
        <circle cx="115" cy="212" r="3.4" />
        <circle cx="132" cy="230" r="3" />
        <circle cx="123" cy="242" r="2.6" />
        <circle cx="318" cy="218" r="3.2" />
        <circle cx="333" cy="234" r="2.8" />
      </g>

      <g fill="#b91c35" opacity="0.75">
        <circle cx="232" cy="196" r="3" />
        <circle cx="160" cy="204" r="2.4" />
      </g>

      <g stroke="#d7b15a" strokeWidth="1.6" opacity="0.7">
        <path d="M64 250a148 44 0 0 0 40 14" fill="none" />
        <path d="M356 250a148 44 0 0 1 -40 14" fill="none" />
      </g>
    </svg>
  );
}

export default function MishtiScene({ media, greeting }: MishtiSceneProps) {
  const { eyebrow, heading, body, imageAlt } = greeting.mishti;

  return (
    <div
      data-scene="mishti"
      data-anim="scene-mishti"
      className="story-scene"
    >
      <AlpanaMotif className="absolute top-1/2 left-1/2 h-[120vmin] w-[120vmin] -translate-x-1/2 -translate-y-1/2 text-gold/15" />
      <DustField count={9} className="opacity-70" />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-8 px-6 py-14 sm:px-10 md:grid-cols-2 md:gap-14 md:py-10">
        <div className="flex flex-col items-center gap-4 text-center md:order-2 md:items-start md:text-left">
          <p data-anim="mishti-eyebrow" className="eyebrow text-burgundy/75">
            {eyebrow}
          </p>
          <h2
            data-anim="mishti-heading"
            className="scene-heading font-medium text-wine"
          >
            {heading}
          </h2>
          <span data-anim="mishti-rule" className="gold-rule block w-32" />
          <p
            data-anim="mishti-body"
            className="scene-body max-w-md text-charcoal/80"
          >
            {body}
          </p>
        </div>

        <div
          data-anim="mishti-visual"
          className="mishti-visual relative mx-auto w-full max-w-[22rem] md:order-1 md:max-w-md"
        >
          {media.mishtiImage ? (
            <div className="relative aspect-square w-full overflow-hidden rounded-[1.5rem] shadow-[0_40px_70px_-45px_rgba(57,13,24,0.7)] ring-1 ring-gold/50">
              <Image
                src={media.mishtiImage}
                alt={imageAlt}
                fill
                sizes="(min-width: 768px) 32rem, 80vw"
                className="object-cover"
              />
            </div>
          ) : (
            <MishtiPlateArt alt={imageAlt} />
          )}
        </div>
      </div>
    </div>
  );
}
