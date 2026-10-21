import { ChevronDown } from "lucide-react";
import Link from "next/link";
import type { Ref } from "react";
import type { GreetingConfig } from "@/types/bijoya";
import {
  AlpanaMotif,
  CornerFlourish,
  DustField,
  OrnamentDivider,
} from "./Decor";

interface OpeningCardProps {
  greeting: GreetingConfig;
  open: boolean;
  showCue: boolean;
  onOpen: () => void;
  buttonRef?: Ref<HTMLButtonElement>;
}

export default function OpeningCard({
  greeting,
  open,
  showCue,
  onOpen,
  buttonRef,
}: OpeningCardProps) {
  const { cover, interior, year } = greeting;

  return (
    <section
      id="bijoya-intro"
      className="bijoya-intro grain vignette"
      aria-labelledby="bijoya-title"
    >
      <h1 id="bijoya-title" className="sr-only">
        {cover.script} — <span lang="bn">{cover.bengali}</span>
      </h1>

      <div className="relative z-10 flex w-full flex-col items-center justify-center gap-6 sm:gap-8">
        <p className="eyebrow text-gold/60">Durga Puja · {year}</p>

        <button
          ref={buttonRef}
          type="button"
          onClick={onOpen}
          disabled={open}
          aria-label={open ? cover.openedAriaLabel : cover.ariaLabel}
          className="bijoya-card-btn"
        >
          <span className="bijoya-card" data-open={open ? "true" : "false"}>
            <span className="bijoya-card__inner">
              <span className="bijoya-card__face bijoya-card__interior">
                <DustField count={8} className="opacity-50" />
                <AlpanaMotif className="pointer-events-none absolute top-1/2 left-1/2 h-[135%] w-[135%] -translate-x-1/2 -translate-y-1/2 text-burgundy/[0.07]" />
                <span className="interior-bloom" aria-hidden="true" />
                <CornerFlourish className="pointer-events-none absolute top-3 left-3 h-6 w-6 text-gold/50" />
                <CornerFlourish className="pointer-events-none absolute top-3 right-3 h-6 w-6 rotate-90 text-gold/50" />
                <CornerFlourish className="pointer-events-none absolute right-3 bottom-3 h-6 w-6 -rotate-90 text-gold/50" />
                <CornerFlourish className="pointer-events-none absolute bottom-3 left-3 h-6 w-6 rotate-180 text-gold/50" />
                <span className="interior-eyebrow reveal reveal-1 relative block">
                  Shubho Bijoya
                </span>
                <span
                  lang="bn"
                  className="interior-bengali reveal reveal-1 relative block"
                >
                  {interior.bengali}
                </span>
                <span className="gold-rule reveal reveal-2 relative mx-auto block w-32" />
                <span className="interior-message reveal reveal-3 relative block">
                  {interior.romanized}
                </span>
                <span className="interior-signature reveal reveal-4 relative block">
                  Sharodiya · {year}
                </span>
              </span>

              <span className="bijoya-card__cover">
                <span className="bijoya-card__cover-face bijoya-card__cover-front">
                  <span className="cover-frame" aria-hidden="true" />
                  <span className="cover-lit" aria-hidden="true" />
                  <DustField count={9} className="opacity-45" />
                  <span
                    lang="bn"
                    className="cover-bengali relative z-10 block"
                  >
                    {cover.bengali}
                  </span>
                  <span className="cover-script relative z-10 block">
                    {cover.script}
                  </span>
                  <OrnamentDivider className="relative z-10 h-3 w-24 text-gold/70" />
                  <span className="cover-instruction relative z-10 block">
                    {cover.instruction}
                  </span>
                  <span className="cover-sheen" aria-hidden="true" />
                </span>

                <span className="bijoya-card__cover-face bijoya-card__cover-back">
                  <CornerFlourish className="absolute left-4 top-4 h-7 w-7 rotate-90 text-gold/55" />
                  <CornerFlourish className="absolute bottom-4 right-4 h-7 w-7 -rotate-90 text-gold/55" />
                  <span className="cover-back__inner">
                    <span className="cover-back__script">Shubho Bijoya</span>
                    <OrnamentDivider className="h-3 w-32 text-gold/55" />
                    <span className="cover-back__bengali" lang="bn">
                      শুভ বিজয়া
                    </span>
                  </span>
                </span>
              </span>
            </span>
          </span>
        </button>

        <div className="flex min-h-9 items-center justify-center">
          {showCue ? (
            <p className="scroll-cue flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.32em] text-gold/75">
              Scroll to begin
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </p>
          ) : null}
        </div>

        <Link
          href="/admin/login"
          className="admin-login-link admin-login-link--dark"
          aria-label="Admin login"
        >
          {greeting.actions.adminLogin}
        </Link>
      </div>
    </section>
  );
}
