import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { GreetingConfig, MediaConfig, VideoSource } from "@/types/bijoya";
import { AlpanaMotif, DhakLine, DhunuchiLine, DustField } from "./Decor";

interface FestivalVideoSceneProps {
  media: MediaConfig;
  greeting: GreetingConfig;
  active: boolean;
}

interface ShotProps {
  source: VideoSource;
  variant: "sindoor" | "dhunuchi";
  active: boolean;
  dataAnim: string;
  title: string;
}

function Shot({ source, variant, active, dataAnim, title }: ShotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const video = videoRef.current;
    const frame = frameRef.current;

    let inView = true;
    const sync = () => {
      const shouldPlay = active && inView;
      if (source.kind === "file" && !failed) {
        if (!video) return;
        if (shouldPlay) {
          void video.play().catch(() => undefined);
        } else {
          video.pause();
        }
        return;
      }
      if (source.kind === "youtube") {
        frame?.contentWindow?.postMessage(
          JSON.stringify({
            event: "command",
            func: shouldPlay ? "playVideo" : "pauseVideo",
            args: [],
          }),
          "*",
        );
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        inView = entries[0]?.isIntersecting ?? true;
        sync();
      },
      { threshold: 0.2 },
    );
    observer.observe(container);
    sync();

    return () => {
      observer.disconnect();
      if (source.kind === "file") {
        video?.pause();
      } else if (source.kind === "youtube") {
        frame?.contentWindow?.postMessage(
          JSON.stringify({ event: "command", func: "pauseVideo", args: [] }),
          "*",
        );
      }
    };
  }, [active, failed, source.kind]);

  const useFile = source.kind === "file" && !failed;
  const useYoutube = source.kind === "youtube";
  const objectPosition =
    variant === "dhunuchi"
      ? "object-[center_48%] md:object-center"
      : "object-[center_40%] md:object-center";

  return (
    <div
      ref={containerRef}
      data-anim={dataAnim}
      className="absolute inset-0 overflow-hidden"
    >
      {useFile && source.kind === "file" ? (
        <>
          {source.poster ? (
            <Image
              src={source.poster}
              alt=""
              aria-hidden="true"
              fill
              sizes="100vw"
              className="scale-110 object-cover opacity-70 blur-2xl brightness-[0.65] md:opacity-100"
            />
          ) : null}
          <video
            ref={videoRef}
            className={`absolute inset-0 h-full w-full object-cover ${objectPosition} md:object-contain`}
            src={source.src}
            poster={source.poster ?? undefined}
            muted
            loop
            playsInline
            preload="none"
            aria-label={`${title} festival footage`}
            onError={() => setFailed(true)}
          >
            Your browser does not support embedded video.
          </video>
        </>
      ) : null}

      {useYoutube && source.kind === "youtube" ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <iframe
            ref={frameRef}
            className="aspect-[9/16] h-full w-auto border-0"
            src={`https://www.youtube-nocookie.com/embed/${source.videoId}?autoplay=1&mute=1&loop=1&playlist=${source.videoId}&controls=0&modestbranding=1&rel=0&playsinline=1`}
            title={`${title} — festival footage`}
            loading="lazy"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : null}

      {!useFile && !useYoutube ? (
        <div
          className={`cinema-shot cinema-shot--${variant} absolute inset-0`}
          aria-hidden="true"
        >
          <div className="cinema-rays" />
          {variant === "sindoor" ? (
            <AlpanaMotif className="absolute top-1/2 left-1/2 h-[74vmin] w-[74vmin] -translate-x-1/2 -translate-y-1/2 text-gold/25" />
          ) : (
            <>
              <DhunuchiLine className="absolute bottom-[12%] left-[6%] h-[38vmin] w-[28vmin] text-gold/45 sm:left-[12%]" />
              <DhakLine className="absolute top-[14%] right-[4%] h-[24vmin] w-[32vmin] text-gold/40 sm:right-[10%]" />
              <AlpanaMotif className="absolute top-1/2 left-1/2 h-[62vmin] w-[62vmin] -translate-x-1/2 -translate-y-1/2 text-bengali-green/30" />
            </>
          )}
          <DustField count={12} className="opacity-70" />
        </div>
      ) : null}
    </div>
  );
}

export default function FestivalVideoScene({
  media,
  greeting,
  active,
}: FestivalVideoSceneProps) {
  const needsFallbackNote =
    media.sindoorVideo.kind === "none" || media.dhunuchiVideo.kind === "none";

  return (
    <div
      data-scene="festival"
      data-anim="scene-festival"
      className="story-scene grain vignette"
    >
      <Shot
        source={media.sindoorVideo}
        variant="sindoor"
        active={active}
        dataAnim="shot-a"
        title={greeting.festival.shots[0].label}
      />
      <Shot
        source={media.dhunuchiVideo}
        variant="dhunuchi"
        active={active}
        dataAnim="shot-b"
        title={greeting.festival.shots[1].label}
      />

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-4 px-6 text-center sm:gap-6">
        <p data-anim="fest-eyebrow" className="eyebrow text-gold/70">
          Dashami · Sharodiya
        </p>
        <h2 data-anim="fest-title" className="scene-title">
          {greeting.festival.title}
        </h2>
        <p
          data-anim="fest-caption"
          className="max-w-sm text-sm leading-relaxed text-ivory/85 sm:max-w-lg sm:text-base"
        >
          {greeting.festival.caption}
        </p>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-start gap-3 p-5 sm:p-8">
        <div className="grid">
          <span data-anim="label-a" className="shot-label col-start-1 row-start-1">
            {greeting.festival.shots[0].label}
          </span>
          <span data-anim="label-b" className="shot-label col-start-1 row-start-1">
            {greeting.festival.shots[1].label}
          </span>
        </div>
        {needsFallbackNote ? (
          <p className="text-[0.58rem] tracking-[0.24em] text-gold/55 uppercase">
            {greeting.festival.fallbackNote}
          </p>
        ) : null}
      </div>
    </div>
  );
}
