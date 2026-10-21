"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDhakAudio } from "@/hooks/useDhakAudio";
import { ANIMATION } from "@/lib/animation-config";
import { DEFAULT_GREETING } from "@/lib/greeting-config";
import {
  readLastGreetingId,
  writeLastGreetingId,
} from "@/lib/greeting-owner";
import type {
  ExperiencePhase,
  GreetingConfig,
  MediaConfig,
  Personalization,
} from "@/types/bijoya";
import ExperienceActions from "./ExperienceActions";
import OpeningCard from "./OpeningCard";
import ScrollStory from "./ScrollStory";
import SoundControls from "./SoundControls";

interface BijoyaExperienceProps {
  media: MediaConfig;
  greeting: GreetingConfig;
}

interface GreetingResponse {
  id?: string;
  sender?: string;
  message?: string;
  photos?: string[];
  isCustomized?: boolean;
}

export default function BijoyaExperience({
  media,
  greeting,
}: BijoyaExperienceProps) {
  const [phase, setPhase] = useState<ExperiencePhase>("closed");

  /**
   * The single authoritative greeting state. Until a visitor saves their own
   * greeting this holds the default copy — the card never renders anything
   * other than what this object describes.
   */
  const [personal, setPersonal] = useState<Personalization>({
    sender: DEFAULT_GREETING.sender,
    message: DEFAULT_GREETING.message,
    photos: [],
    id: null,
    isCustomized: false,
  });

  const cardButtonRef = useRef<HTMLButtonElement>(null);
  const openingTimer = useRef<number | null>(null);
  const audio = useDhakAudio(media.dhakAudio);
  const { start, toggle, reset, status } = audio;

  useEffect(() => {
    return () => {
      if (openingTimer.current !== null) {
        window.clearTimeout(openingTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlId = params.get("id");
    const targetId = urlId ?? readLastGreetingId();
    if (!targetId) return;

    let cancelled = false;

    fetch(`/api/greetings/${encodeURIComponent(targetId)}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data: GreetingResponse | null) => {
        if (cancelled || !data) return;
        setPersonal({
          sender: data.sender?.trim() || DEFAULT_GREETING.sender,
          message: data.message?.trim() || DEFAULT_GREETING.message,
          photos: Array.isArray(data.photos) ? data.photos : [],
          id: data.id ?? targetId,
          isCustomized: Boolean(data.isCustomized),
        });
        writeLastGreetingId(data.id ?? targetId);
      })
      .catch(() => {
        // Silently fall back to the default greeting.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleOpen = useCallback(() => {
    if (phase !== "closed") return;
    start();
    setPhase("opening");
    openingTimer.current = window.setTimeout(
      () => setPhase("story"),
      ANIMATION.cardOpenMs,
    );
  }, [phase, start]);

  const handleReplay = useCallback(() => {
    if (openingTimer.current !== null) {
      window.clearTimeout(openingTimer.current);
      openingTimer.current = null;
    }
    reset();
    setPhase("closed");
    window.scrollTo({ top: 0, behavior: "instant" });
    requestAnimationFrame(() => {
      cardButtonRef.current?.focus({ preventScroll: true });
    });
  }, [reset]);

  return (
    <main className="relative flex min-h-dvh flex-col">
      {phase === "story" ? (
        <a
          href="#bijoya-actions"
          className="skip-link rounded-full bg-gold px-4 py-2 text-xs font-medium tracking-widest text-wine uppercase"
        >
          Skip to greeting actions
        </a>
      ) : null}

      <OpeningCard
        greeting={greeting}
        open={phase !== "closed"}
        showCue={phase === "story"}
        onOpen={handleOpen}
        buttonRef={cardButtonRef}
      />

      {phase !== "closed" ? (
        <ScrollStory media={media} greeting={greeting} personal={personal} />
      ) : null}

      {phase === "story" ? (
        <ExperienceActions
          greeting={greeting}
          personal={personal}
          onSave={setPersonal}
          soundStatus={status}
          onToggleSound={toggle}
          onReplay={handleReplay}
        />
      ) : null}

      {phase !== "closed" ? (
        <SoundControls status={status} onToggle={toggle} />
      ) : null}
    </main>
  );
}
