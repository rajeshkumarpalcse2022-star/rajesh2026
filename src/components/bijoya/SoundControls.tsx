import { RefreshCw, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import IconButton from "@/components/ui/IconButton";
import type { SoundStatus } from "@/types/bijoya";

interface SoundControlsProps {
  status: SoundStatus;
  onToggle: () => void;
}

const LABELS: Record<SoundStatus, string> = {
  idle: "Sound Off",
  playing: "Sound On",
  paused: "Sound Off",
  blocked: "Retry Sound",
  unavailable: "No Audio",
};

export default function SoundControls({ status, onToggle }: SoundControlsProps) {
  const [hint, setHint] = useState<string | null>(null);
  const hintTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (hintTimer.current !== null) window.clearTimeout(hintTimer.current);
    };
  }, []);

  const handleClick = () => {
    if (status === "unavailable") {
      setHint("Dhak audio is not bundled yet — add public/audio/dhak.mp3 (see README).");
      if (hintTimer.current !== null) window.clearTimeout(hintTimer.current);
      hintTimer.current = window.setTimeout(() => setHint(null), 6000);
      return;
    }
    setHint(null);
    onToggle();
  };

  const icon =
    status === "blocked" ? (
      <RefreshCw className="h-4 w-4" aria-hidden="true" />
    ) : status === "playing" ? (
      <Volume2 className="h-4 w-4" aria-hidden="true" />
    ) : (
      <VolumeX className="h-4 w-4" aria-hidden="true" />
    );

  return (
    <>
      {hint ? (
        <p
          role="status"
          className="fixed right-4 bottom-20 z-[60] max-w-[17rem] rounded-lg border border-gold/40 bg-midnight/95 px-3.5 py-2.5 text-xs leading-relaxed text-ivory/90 shadow-lg"
        >
          {hint}
        </p>
      ) : null}

      <IconButton
        label={
          status === "blocked"
            ? "Sound was blocked, retry playing dhak music"
            : status === "unavailable"
              ? "Dhak music is not available yet"
              : status === "playing"
                ? "Pause dhak music"
                : "Play dhak music"
        }
        onClick={handleClick}
        aria-pressed={status === "playing"}
        className="sound-toggle"
      >
        {icon}
        <span className="hidden min-w-[4.5rem] text-left sm:inline">
          {LABELS[status]}
        </span>
      </IconButton>
    </>
  );
}
