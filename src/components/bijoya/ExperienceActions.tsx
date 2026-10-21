import {
  Copy,
  Images,
  PenLine,
  RotateCcw,
  Share2,
  User,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { buildShareText } from "@/lib/greeting-config";
import {
  ALLOWED_IMAGE_TYPES,
  DEFAULT_MESSAGE_LIMIT,
  MAX_NAME_LENGTH,
  MAX_PHOTOS,
  MAX_PHOTO_BYTES,
  MESSAGE_REQUIRED_ERROR,
  invalidPhotoTypeError,
  messageTooLongError,
  nameRequiredError,
  normalizeMessage,
  normalizeName,
  photoTooLargeError,
} from "@/lib/greeting-validation";
import { ensureOwnerKey, writeLastGreetingId } from "@/lib/greeting-owner";
import { fileToDataUrl } from "@/lib/resize-image";
import type {
  GreetingConfig,
  Personalization,
  SoundStatus,
} from "@/types/bijoya";
import { OrnamentDivider } from "./Decor";

interface ExperienceActionsProps {
  greeting: GreetingConfig;
  personal: Personalization;
  onSave: (personal: Personalization) => void;
  soundStatus: SoundStatus;
  onToggleSound: () => void;
  onReplay: () => void;
}

interface StatusMessage {
  tone: "ok" | "error";
  text: string;
}

interface SaveResponse {
  id?: string;
  sender?: string;
  message?: string;
  photos?: string[];
  error?: string;
}

function isAbortError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name?: string }).name === "AbortError"
  );
}

function fallbackCopy(text: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }
  document.body.removeChild(textarea);
  return copied;
}

export default function ExperienceActions({
  greeting,
  personal,
  onSave,
  soundStatus,
  onToggleSound,
  onReplay,
}: ExperienceActionsProps) {
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [draftName, setDraftName] = useState(personal.sender);
  const [draftMessage, setDraftMessage] = useState(personal.message);
  const [draftPhotos, setDraftPhotos] = useState<string[]>(personal.photos);

  useEffect(() => {
    if (!status) return;
    const timer = window.setTimeout(() => setStatus(null), 6000);
    return () => window.clearTimeout(timer);
  }, [status]);

  useEffect(() => {
    if (!editing) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) setEditing(false);
    };
    window.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [editing, saving]);

  const openEditor = () => {
    setDraftName(personal.sender);
    setDraftMessage(personal.message);
    setDraftPhotos(personal.photos);
    setFormError(null);
    setStatus(null);
    setEditing(true);
  };

  const closeEditor = () => {
    if (saving) return;
    setEditing(false);
    setFormError(null);
  };

  const updateMessage = (value: string) => {
    setDraftMessage(value);
    if (formError) setFormError(null);
  };

  const updateName = (value: string) => {
    setDraftName(value);
    if (formError) setFormError(null);
  };

  const handlePhotoFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const files = Array.from(input.files ?? []);
    input.value = "";
    if (files.length === 0) return;

    const accepted: File[] = [];
    let notice: string | null = null;

    for (const file of files) {
      const type = file.type.toLowerCase();
      if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(type)) {
        notice = invalidPhotoTypeError(file);
        continue;
      }
      if (file.size > MAX_PHOTO_BYTES) {
        notice = photoTooLargeError(file);
        continue;
      }
      accepted.push(file);
    }

    const room = MAX_PHOTOS - draftPhotos.length;
    if (accepted.length > room) {
      notice = notice ?? `You can attach up to ${MAX_PHOTOS} photos.`;
    }
    const selected = accepted.slice(0, Math.max(room, 0));

    if (selected.length === 0) {
      setStatus({
        tone: "error",
        text: notice ?? `You can attach up to ${MAX_PHOTOS} photos.`,
      });
      return;
    }

    setPreparing(true);
    try {
      const urls = await Promise.all(selected.map((file) => fileToDataUrl(file)));
      setDraftPhotos((previous) =>
        [...previous, ...urls].slice(0, MAX_PHOTOS),
      );
      if (notice) setStatus({ tone: "error", text: notice });
    } catch {
      setStatus({ tone: "error", text: "Some photos could not be read." });
    } finally {
      setPreparing(false);
    }
  };

  const removePhoto = (index: number) => {
    setDraftPhotos((previous) =>
      previous.filter((_, photoIndex) => photoIndex !== index),
    );
    if (formError) setFormError(null);
  };

  const handleSave = async () => {
    if (saving) return;

    const message = normalizeMessage(draftMessage);
    const sender = normalizeName(draftName) || greeting.sender;

    if (!message) {
      setFormError(MESSAGE_REQUIRED_ERROR);
      return;
    }
    if (message.length > DEFAULT_MESSAGE_LIMIT) {
      setFormError(messageTooLongError(DEFAULT_MESSAGE_LIMIT));
      return;
    }
    if (!sender) {
      setFormError(nameRequiredError());
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      const response = await fetch("/api/greetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender,
          message,
          photos: draftPhotos,
          occasion: "bijoya-dashami",
          id: personal.id ?? undefined,
          ownerKey: ensureOwnerKey(),
        }),
      });

      let data: SaveResponse = {};
      try {
        data = (await response.json()) as SaveResponse;
      } catch {
        data = {};
      }

      if (!response.ok || !data.id) {
        throw new Error(data.error || "save-failed");
      }

      writeLastGreetingId(data.id);

      const url = new URL(window.location.href);
      url.searchParams.set("id", data.id);
      window.history.replaceState(null, "", url.toString());

      // Only now — after the server confirmed — update the card state.
      onSave({
        sender: data.sender?.trim() || sender,
        message: data.message?.trim() || message,
        photos: Array.isArray(data.photos) ? data.photos : draftPhotos,
        id: data.id,
        isCustomized: true,
      });

      setEditing(false);
      setFormError(null);
      setStatus({ tone: "ok", text: greeting.actions.saved });
    } catch (error) {
      const serverMessage =
        error instanceof Error && error.message !== "save-failed"
          ? error.message
          : "Could not save your greeting right now. Please try again.";
      setFormError(serverMessage);
      setStatus({ tone: "error", text: serverMessage });
    } finally {
      setSaving(false);
    }
  };

  const getShareUrl = (): string => {
    if (typeof window === "undefined") return "";
    const url = new URL(window.location.href);
    return url.searchParams.get("id") ? url.toString() : "";
  };

  const handleShare = async () => {
    const shareUrl = getShareUrl();
    const shareText = [
      buildShareText(greeting, personal.sender, personal.message),
      shareUrl ? `\n${shareUrl}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    const payload = {
      title: `${greeting.actions.shareTitle} ${greeting.year}`,
      text: shareText,
    };

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share(payload);
        setStatus({ tone: "ok", text: "Greeting shared." });
        return;
      } catch (error) {
        if (isAbortError(error)) return;
      }
    }

    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      "_blank",
      "noopener,noreferrer",
    );
    setStatus({ tone: "ok", text: "Opening WhatsApp so you can share…" });
  };

  const handleCopy = async () => {
    const shareUrl = getShareUrl();
    const shareText = [
      buildShareText(greeting, personal.sender, personal.message),
      shareUrl ? `\n${shareUrl}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
      } else if (!fallbackCopy(shareText)) {
        throw new Error("copy-unavailable");
      }
      setStatus({ tone: "ok", text: "Greeting text copied." });
    } catch {
      setStatus({
        tone: "error",
        text: "Copying is not available in this browser.",
      });
    }
  };

  const soundPlaying = soundStatus === "playing";
  const sender = personal.sender.trim() || greeting.sender;

  return (
    <section
      id="bijoya-actions"
      aria-labelledby="bijoya-actions-title"
      className="actions-section grain relative px-5 py-16 sm:px-8 sm:py-20"
    >
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <OrnamentDivider className="h-3 w-44 text-burgundy/60" />

        <h2
          id="bijoya-actions-title"
          className="scene-heading font-medium text-wine"
        >
          Share the joy of Bijoya
        </h2>

        <p className="scene-body max-w-xl text-charcoal/75">
          Jodi eta tomar mon ke sporsho koreche, tahele bondhuder saje-o pathie
          dio — subho bijoyar anondo double hok.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button type="button" className="btn-primary" onClick={handleShare}>
            <Share2 className="h-4 w-4" aria-hidden="true" />
            {greeting.actions.share}
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={openEditor}
            aria-haspopup="dialog"
          >
            <PenLine className="h-4 w-4" aria-hidden="true" />
            {greeting.actions.makeItYours}
          </button>

          <button type="button" className="btn-secondary" onClick={handleCopy}>
            <Copy className="h-4 w-4" aria-hidden="true" />
            {greeting.actions.copy}
          </button>

          <button type="button" className="btn-secondary" onClick={onReplay}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {greeting.actions.replay}
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={onToggleSound}
            aria-pressed={soundPlaying}
          >
            {soundPlaying ? (
              <Volume2 className="h-4 w-4" aria-hidden="true" />
            ) : (
              <VolumeX className="h-4 w-4" aria-hidden="true" />
            )}
            {soundPlaying ? greeting.actions.soundOn : greeting.actions.soundOff}
          </button>
        </div>

        <p
          role="status"
          aria-live="polite"
          className={`min-h-5 text-sm ${status?.tone === "error" ? "text-vermilion" : "text-bengali-green"}`}
        >
          {status?.text ?? ""}
        </p>

        <div className="mt-2 flex flex-col items-center gap-2">
          <p className="text-[0.62rem] tracking-[0.3em] text-burgundy/75 uppercase">
            From {sender} — {greeting.year}
          </p>
          <p className="max-w-md text-xs leading-relaxed text-charcoal/55">
            Bijoya — a cinematic Sharodiya greeting. Personalize it with your own
            message and name, then share it with everyone you love.
          </p>
        </div>

        <Link
          href="/admin/login"
          className="admin-login-link"
          aria-label="Admin login"
        >
          {greeting.actions.adminLogin}
        </Link>
      </div>

      {editing ? (
        <div
          className="editor-overlay"
          onClick={closeEditor}
          role="presentation"
        >
          <div
            className="editor-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bijoya-editor-title"
            onClick={(event) => event.stopPropagation()}
          >
            <OrnamentDivider className="mx-auto h-3 w-32 text-burgundy/50" />

            <div className="flex items-start justify-between gap-4">
              <h3 id="bijoya-editor-title" className="editor-title">
                {greeting.actions.dialogTitle}
              </h3>
              <button
                type="button"
                className="editor-close"
                aria-label="Close"
                onClick={closeEditor}
                disabled={saving}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <label className="editor-label" htmlFor="bijoya-message-input">
              {greeting.actions.writeMessage}
            </label>
            <textarea
              id="bijoya-message-input"
              className="editor-field editor-textarea"
              rows={5}
              autoFocus
              disabled={saving}
              placeholder={greeting.actions.messagePlaceholder}
              value={draftMessage}
              onChange={(event) => updateMessage(event.target.value)}
            />
            <p className="editor-count" aria-live="polite">
              {draftMessage.length.toLocaleString()}{" "}
              {greeting.actions.characters}
            </p>

            <label className="editor-label" htmlFor="bijoya-name-input">
              {greeting.actions.yourName}
            </label>
            <div className="editor-field editor-name">
              <User className="h-4 w-4 shrink-0 text-burgundy/60" aria-hidden="true" />
              <input
                id="bijoya-name-input"
                type="text"
                maxLength={MAX_NAME_LENGTH}
                disabled={saving}
                placeholder={greeting.actions.yourName}
                value={draftName}
                onChange={(event) => updateName(event.target.value)}
              />
            </div>

            <p className="editor-label">{greeting.actions.attachPhotos}</p>
            <div className="editor-upload">
              <input
                id="bijoya-photos-input"
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                aria-label={greeting.actions.attachPhotos}
                disabled={saving || preparing}
                onChange={(event) => void handlePhotoFiles(event)}
              />
              <label
                htmlFor="bijoya-photos-input"
                className={`editor-upload-btn${saving || preparing ? " editor-upload-btn--disabled" : ""}`}
              >
                <Images className="h-4 w-4" aria-hidden="true" />
                {draftPhotos.length >= MAX_PHOTOS
                  ? greeting.actions.replacePhoto
                  : greeting.actions.attachPhotos}
              </label>
              <span className="editor-photos-count" aria-hidden="true">
                {draftPhotos.length}/{MAX_PHOTOS}
              </span>
            </div>

            {draftPhotos.length > 0 ? (
              <ul className="editor-thumbs">
                {draftPhotos.map((src, index) => (
                  <li key={`${index}-${src.length}`} className="editor-thumb">
                    <span
                      role="img"
                      aria-label={`${greeting.memories.photoAltPrefix} ${index + 1}`}
                      className="editor-thumb-image"
                      style={{ backgroundImage: `url(${src})` }}
                    />
                    <button
                      type="button"
                      className="editor-thumb-remove"
                      aria-label={`${greeting.actions.removePhoto} ${index + 1}`}
                      disabled={saving}
                      onClick={() => removePhoto(index)}
                    >
                      <X className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            <p
              role="alert"
              className="editor-error"
              aria-live="assertive"
            >
              {formError ?? ""}
            </p>

            <div className="editor-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={closeEditor}
                disabled={saving}
              >
                {greeting.actions.cancel}
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => void handleSave()}
                disabled={saving || preparing}
                aria-busy={saving}
              >
                {saving || preparing ? greeting.actions.saving : greeting.actions.save}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
