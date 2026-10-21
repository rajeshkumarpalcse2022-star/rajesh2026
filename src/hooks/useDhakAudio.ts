import { useCallback, useEffect, useRef, useState } from "react";
import { createDhakSynth, type DhakSynth } from "@/lib/dhak-synth";
import type { SoundStatus } from "@/types/bijoya";

export interface DhakAudioController {
  status: SoundStatus;
  hasSource: boolean;
  start: () => void;
  toggle: () => void;
  reset: () => void;
}

export function useDhakAudio(src: string | null): DhakAudioController {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<DhakSynth | null>(null);
  const idleRef = useRef(true);
  const [status, setStatus] = useState<SoundStatus>("idle");

  useEffect(() => {
    if (!src) return;

    const audio = new Audio();
    audio.src = src;
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0.9;
    audioRef.current = audio;

    const handlePlay = () => {
      idleRef.current = false;
      setStatus("playing");
    };

    const handlePause = () => {
      if (idleRef.current) {
        setStatus("idle");
        return;
      }
      setStatus("paused");
    };

    const handleError = () => {
      setStatus((previous) => (previous === "unavailable" ? previous : "blocked"));
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audioRef.current = null;
    };
  }, [src]);

  useEffect(() => {
    return () => {
      synthRef.current?.stop();
    };
  }, []);

  const start = useCallback(() => {
    if (src) {
      const audio = audioRef.current;
      if (!audio) return;
      idleRef.current = false;
      const playback = audio.play();
      if (playback !== undefined) {
        playback
          .then(() => setStatus("playing"))
          .catch(() => setStatus("blocked"));
      }
      return;
    }

    if (!synthRef.current) {
      try {
        synthRef.current = createDhakSynth();
      } catch {
        setStatus("unavailable");
        return;
      }
    }
    idleRef.current = false;
    synthRef.current
      .start()
      .then(() => setStatus("playing"))
      .catch((error: unknown) => {
        const noContext =
          error instanceof Error && error.message === "no-audio-context";
        setStatus(noContext ? "unavailable" : "blocked");
      });
  }, [src]);

  const toggle = useCallback(() => {
    if (src) {
      const audio = audioRef.current;
      if (!audio) return;
      if (audio.paused) {
        start();
        return;
      }
      audio.pause();
      setStatus("paused");
      return;
    }

    if (status === "playing") {
      synthRef.current?.stop();
      setStatus("paused");
      return;
    }
    start();
  }, [src, status, start]);

  const reset = useCallback(() => {
    idleRef.current = true;
    if (src) {
      const audio = audioRef.current;
      setStatus("idle");
      if (!audio) return;
      audio.pause();
      try {
        audio.currentTime = 0;
      } catch {
        // Media may not be seekable yet; nothing else to do.
      }
      return;
    }
    synthRef.current?.stop();
    setStatus("idle");
  }, [src]);

  return {
    status,
    hasSource: true,
    start,
    toggle,
    reset,
  };
}
