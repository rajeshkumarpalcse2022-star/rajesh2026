"use client";

import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  ImageOff,
  LogOut,
  Search,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cloudinaryThumbUrl } from "@/lib/cloudinary-url";
import {
  formatISTDate,
  formatISTDateTime,
  formatISTTime,
} from "@/lib/format-ist";
import type {
  AdminGreetingItem,
  AdminGreetingListResponse,
  AdminGreetingStats,
} from "@/types/admin";

const PAGE_SIZE = 12;
const PREVIEW_LENGTH = 240;

type AuthState = "checking" | "ready" | "unauthorized";
type PhotoFilter = "all" | "yes" | "no";
type SortOrder = "newest" | "oldest";

interface ApiError {
  error?: string;
}

function initialOf(value: string | null | undefined): string {
  const trimmed = (value ?? "").trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

export default function AdminDashboard() {
  const router = useRouter();

  const [auth, setAuth] = useState<AuthState>("checking");
  const [email, setEmail] = useState<string | null>(null);

  const [items, setItems] = useState<AdminGreetingItem[]>([]);
  const [stats, setStats] = useState<AdminGreetingStats | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [photoFilter, setPhotoFilter] = useState<PhotoFilter>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState<SortOrder>("newest");

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<AdminGreetingItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [brokenPhotos, setBrokenPhotos] = useState<Set<string>>(new Set());

  const listRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  /* ------------------------------- auth gate ------------------------------ */

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/me", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { email?: string } | null) => {
        if (cancelled) return;
        if (!data) {
          setAuth("unauthorized");
          router.replace("/admin/login");
          return;
        }
        setEmail(data.email ?? null);
        setAuth("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setAuth("unauthorized");
        router.replace("/admin/login");
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  /* ------------------------------- search -------------------------------- */

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  /* ------------------------------- data ---------------------------------- */

  const queryKey = useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (photoFilter !== "all") {
      params.set("photos", photoFilter === "yes" ? "true" : "false");
    }
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    params.set("sort", sort);
    params.set("page", String(page));
    params.set("pageSize", String(PAGE_SIZE));
    return params.toString();
  }, [search, photoFilter, from, to, sort, page]);

  const loading = auth === "ready" && loadedKey !== queryKey;

  useEffect(() => {
    if (auth !== "ready") return;

    const controller = new AbortController();

    fetch(`/api/admin/greetings?${queryKey}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (response.status === 401) throw new Error("expired");
        const data = (await response.json()) as
          | AdminGreetingListResponse
          | ApiError;
        if (!response.ok) {
          throw new Error(
            (data as ApiError).error || "Could not load greetings.",
          );
        }
        return data as AdminGreetingListResponse;
      })
      .then((data) => {
        if (controller.signal.aborted) return;
        setItems(data.items);
        setTotal(data.total);
        setStats(data.stats);
        setError(null);
      })
      .catch((caught: unknown) => {
        if (controller.signal.aborted) return;
        if (caught instanceof DOMException && caught.name === "AbortError") {
          return;
        }
        if (caught instanceof Error && caught.message === "expired") {
          router.replace("/admin/login");
          return;
        }
        setError(
          caught instanceof Error
            ? caught.message
            : "Could not load greetings right now.",
        );
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setLoadedKey(queryKey);
      });

    return () => controller.abort();
  }, [auth, queryKey, router]);

  /* ------------------------------- dialogs ------------------------------- */

  useEffect(() => {
    if (!detail && !lightbox) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (lightbox) setLightbox(null);
      else setDetail(null);
    };
    window.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [detail, lightbox]);

  /* ------------------------------- actions ------------------------------- */

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
    }
  }, [router]);

  const changeFilter = (apply: () => void) => {
    apply();
    setPage(1);
  };

  const toggleExpanded = (id: string) => {
    setExpanded((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openDetail = useCallback(async (item: AdminGreetingItem) => {
    setDetail(item);
    setDetailLoading(true);
    setDetailError(null);
    try {
      const response = await fetch(
        `/api/admin/greetings/${encodeURIComponent(item.id)}`,
        { cache: "no-store" },
      );
      const data = (await response.json()) as
        | (AdminGreetingItem & ApiError)
        | ApiError;
      if (!response.ok) {
        setDetailError(
          (data as ApiError).error ||
            "Could not refresh this greeting — showing the loaded copy.",
        );
        return;
      }
      setDetail(data as AdminGreetingItem);
    } catch {
      setDetailError(
        "Could not refresh this greeting — showing the loaded copy.",
      );
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const markBroken = useCallback((url: string) => {
    setBrokenPhotos((previous) => {
      if (previous.has(url)) return previous;
      const next = new Set(previous);
      next.add(url);
      return next;
    });
  }, []);

  const goToPage = (nextPage: number) => {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const renderPhotos = (item: AdminGreetingItem, large = false) => (
    <ul
      className={`thumb-row${large ? " thumb-row--lg" : ""}`}
      aria-label="Uploaded photos"
    >
      {item.photos.map((photo, index) =>
        brokenPhotos.has(photo) ? (
          <li
            key={`${item.id}-broken-${index}`}
            className="thumb thumb--broken"
            aria-label="Photo could not be loaded"
          >
            <ImageOff className="h-4 w-4" aria-hidden="true" />
          </li>
        ) : (
          <li key={`${item.id}-photo-${index}`}>
            <button
              type="button"
              className="thumb"
              aria-label={`Open photo ${index + 1} from ${item.sender}`}
              onClick={() => setLightbox(photo)}
            >
              <img
                src={cloudinaryThumbUrl(photo, large ? 480 : 240)}
                alt={`${item.sender} — Sharodiya photo ${index + 1}`}
                loading="lazy"
                onError={() => markBroken(photo)}
              />
            </button>
          </li>
        ),
      )}
    </ul>
  );

  /* ------------------------------- render -------------------------------- */

  return (
    <div className="admin-app">
      <header className="admin-topbar">
        <div className="admin-topbar__inner">
          <div className="admin-brand">
            <span className="admin-brand__mark" aria-hidden="true" />
            <div>
              <p className="admin-eyebrow">Sharodiya · Administration</p>
              <h1 className="admin-heading">Saved Greetings</h1>
            </div>
          </div>

          <div className="admin-topbar__actions">
            {email ? (
              <span className="admin-userchip">
                <span className="admin-avatar" aria-hidden="true">
                  {initialOf(email)}
                </span>
                <span className="admin-userchip__email">{email}</span>
              </span>
            ) : null}
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              onClick={() => void handleLogout()}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        {auth === "checking" ? (
          <section className="panel">
            <div className="empty">
              <p className="admin-state" role="status">
                Checking your session…
              </p>
            </div>
          </section>
        ) : null}

        {auth === "unauthorized" ? (
          <section className="panel">
            <div className="empty">
              <p className="admin-state">Sign in to view the dashboard.</p>
              <a href="/admin/login" className="admin-link">
                Go to admin login
              </a>
            </div>
          </section>
        ) : null}

        {auth === "ready" ? (
          <>
            <section aria-label="Overview" className="stats-grid">
              <StatCard
                hero
                label="Total greetings"
                value={loading && !stats ? "…" : String(stats?.total ?? 0)}
              />
              <StatCard
                label="Customized"
                value={loading && !stats ? "…" : String(stats?.customized ?? 0)}
              />
              <StatCard
                label="Photos uploaded"
                value={loading && !stats ? "…" : String(stats?.photos ?? 0)}
              />
              <StatCard
                label="Most recent"
                value={
                  loading && !stats
                    ? "…"
                    : stats?.latest
                      ? formatISTDateTime(stats.latest)
                      : "—"
                }
                small
              />
            </section>

            <section aria-label="Filters" className="panel filters">
              <div className="filters__head">
                <Filter className="h-4 w-4" aria-hidden="true" />
                <span className="admin-label">Filters</span>
              </div>

              <div className="filters__grid">
                <div className="admin-field">
                  <label className="admin-label" htmlFor="admin-search">
                    Search
                  </label>
                  <div className="admin-search">
                    <Search
                      className="h-4 w-4 shrink-0 text-burgundy/50"
                      aria-hidden="true"
                    />
                    <input
                      id="admin-search"
                      type="search"
                      placeholder="Sender name or message text"
                      value={searchInput}
                      onChange={(event) => setSearchInput(event.target.value)}
                    />
                  </div>
                </div>

                <div className="admin-field">
                  <label className="admin-label" htmlFor="admin-photos">
                    Photos
                  </label>
                  <select
                    id="admin-photos"
                    className="admin-input"
                    value={photoFilter}
                    onChange={(event) =>
                      changeFilter(() =>
                        setPhotoFilter(event.target.value as PhotoFilter),
                      )
                    }
                  >
                    <option value="all">All greetings</option>
                    <option value="yes">With photos</option>
                    <option value="no">Without photos</option>
                  </select>
                </div>

                <div className="admin-field">
                  <label className="admin-label" htmlFor="admin-from">
                    From date
                  </label>
                  <input
                    id="admin-from"
                    className="admin-input"
                    type="date"
                    value={from}
                    onChange={(event) =>
                      changeFilter(() => setFrom(event.target.value))
                    }
                  />
                </div>

                <div className="admin-field">
                  <label className="admin-label" htmlFor="admin-to">
                    To date
                  </label>
                  <input
                    id="admin-to"
                    className="admin-input"
                    type="date"
                    value={to}
                    onChange={(event) =>
                      changeFilter(() => setTo(event.target.value))
                    }
                  />
                </div>

                <div className="admin-field">
                  <label className="admin-label" htmlFor="admin-sort">
                    Sort
                  </label>
                  <select
                    id="admin-sort"
                    className="admin-input"
                    value={sort}
                    onChange={(event) =>
                      changeFilter(() =>
                        setSort(event.target.value as SortOrder),
                      )
                    }
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                  </select>
                </div>
              </div>
            </section>

            {error ? (
              <p className="admin-error" role="alert">
                {error}
              </p>
            ) : null}

            <section ref={listRef} aria-label="Greeting records" className="records">
              <div className="records__head">
                <h2 className="records__title">Greetings</h2>
                <span className="records__count" aria-live="polite">
                  {loading ? "Loading…" : `${total} found`}
                </span>
              </div>

              {loading && items.length === 0 && !error ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : null}

              {!loading && !error && items.length === 0 ? (
                <div className="panel">
                  <div className="empty">
                    <span className="empty__icon">
                      <ImageOff className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <h3 className="empty__title">No greetings found</h3>
                    <p className="admin-state">
                      Saved “Make It Yours” greetings will appear here.
                    </p>
                    <p className="admin-state">
                      Try different filters, or share the greeting page to
                      collect your first entry.
                    </p>
                  </div>
                </div>
              ) : null}

              {items.map((item) => {
                const isExpanded = expanded.has(item.id);
                const longMessage = item.message.length > PREVIEW_LENGTH;
                const shownMessage =
                  !isExpanded && longMessage
                    ? `${item.message.slice(0, PREVIEW_LENGTH).trimEnd()}…`
                    : item.message;

                return (
                  <article key={item.id} className="gcard">
                    <span className="gcard__avatar" aria-hidden="true">
                      {initialOf(item.sender)}
                    </span>

                    <div className="gcard__body">
                      <div className="gcard__top">
                        <div className="gcard__who">
                          <h3 className="gcard__name">{item.sender}</h3>
                          <p className="gcard__meta">
                            <Clock
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                            {formatISTDate(item.createdAt)} ·{" "}
                            {formatISTTime(item.createdAt)} IST
                          </p>
                        </div>

                        <div className="gcard__pills">
                          <span
                            className={`pill${item.isCustomized ? " pill--gold" : ""}`}
                          >
                            {item.isCustomized ? "Customized" : "Default"}
                          </span>
                          <span
                            className={`pill${item.photoCount > 0 ? " pill--photo" : ""}`}
                          >
                            {item.photoCount > 0
                              ? `${item.photoCount} photo${item.photoCount === 1 ? "" : "s"}`
                              : "No photos"}
                          </span>
                        </div>
                      </div>

                      <p
                        className={`gcard__msg${longMessage && !isExpanded ? " gcard__msg--clamped" : ""}`}
                      >
                        {shownMessage}
                      </p>

                      {longMessage ? (
                        <button
                          type="button"
                          className="admin-link"
                          onClick={() => toggleExpanded(item.id)}
                        >
                          {isExpanded ? "Show less" : "Show full message"}
                        </button>
                      ) : null}

                      {item.photoCount > 0 ? (
                        renderPhotos(item)
                      ) : (
                        <p className="gcard__nophotos">No photos uploaded</p>
                      )}

                      <div className="gcard__foot">
                        <code className="idchip">ID {item.id}</code>
                        <button
                          type="button"
                          className="admin-btn admin-btn--solid admin-btn--sm"
                          onClick={() => void openDetail(item)}
                        >
                          View details
                          <ChevronRight
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>

            {totalPages > 1 || page > 1 ? (
              <nav aria-label="Pagination" className="pager">
                <button
                  type="button"
                  className="admin-btn admin-btn--quiet"
                  disabled={page <= 1 || loading}
                  onClick={() => goToPage(page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  Previous
                </button>
                <span className="pager__status">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  className="admin-btn admin-btn--quiet"
                  disabled={page >= totalPages || loading}
                  onClick={() => goToPage(page + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </nav>
            ) : null}
          </>
        ) : null}
      </main>

      {detail ? (
        <div
          className="editor-overlay"
          role="presentation"
          onClick={() => setDetail(null)}
        >
          <div
            className="editor-panel admin-detail"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-detail__head">
              <div className="admin-brand">
                <span className="gcard__avatar" aria-hidden="true">
                  {initialOf(detail.sender)}
                </span>
                <div>
                  <p className="admin-eyebrow">Greeting detail</p>
                  <h2 id="admin-detail-title" className="editor-title">
                    {detail.sender}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                className="editor-close"
                aria-label="Close"
                onClick={() => setDetail(null)}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="admin-detail__pills">
              <span
                className={`pill${detail.isCustomized ? " pill--gold" : ""}`}
              >
                {detail.isCustomized ? "Customized" : "Default"}
              </span>
              <span className="pill">{detail.occasion}</span>
              <span
                className={`pill${detail.photoCount > 0 ? " pill--photo" : ""}`}
              >
                {detail.photoCount > 0
                  ? `${detail.photoCount} photo${detail.photoCount === 1 ? "" : "s"}`
                  : "No photos"}
              </span>
            </div>

            <div>
              <p className="admin-label">Message</p>
              <div className="admin-detail__message">{detail.message}</div>
            </div>

            <dl className="admin-detail__meta">
              <div>
                <dt className="admin-label">Created</dt>
                <dd className="admin-meta">
                  {formatISTDateTime(detail.createdAt)} IST
                </dd>
              </div>
              <div>
                <dt className="admin-label">Last updated</dt>
                <dd className="admin-meta">
                  {formatISTDateTime(detail.updatedAt)} IST
                </dd>
              </div>
              <div>
                <dt className="admin-label">Greeting ID</dt>
                <dd className="admin-mono">{detail.id}</dd>
              </div>
            </dl>

            <div>
              <p className="admin-label">Photos</p>
              {detail.photoCount > 0 ? (
                renderPhotos(detail, true)
              ) : (
                <p className="gcard__nophotos">No photos uploaded</p>
              )}
            </div>

            <p className="admin-detail__status">
              {detailLoading ? "Refreshing record…" : ""}
              {detailError ? ` ${detailError}` : ""}
            </p>
          </div>
        </div>
      ) : null}

      {lightbox ? (
        <div
          className="editor-overlay"
          role="presentation"
          onClick={() => setLightbox(null)}
        >
          <figure
            className="admin-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label="Photo preview"
            onClick={(event) => event.stopPropagation()}
          >
            <img src={lightbox} alt="Full size greeting photo" />
            <figcaption>Tap outside to close</figcaption>
            <button
              type="button"
              className="editor-close"
              aria-label="Close preview"
              onClick={() => setLightbox(null)}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </figure>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({
  label,
  value,
  hero = false,
  small = false,
}: {
  label: string;
  value: string;
  hero?: boolean;
  small?: boolean;
}) {
  return (
    <div className={`stat${hero ? " stat--hero" : ""}`}>
      <span className="stat__label">{label}</span>
      <span className={`stat__value${small ? " stat__value--sm" : ""}`}>
        {value}
      </span>
      <span className="stat__diamond" aria-hidden="true" />
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <span className="skeleton-line skeleton-line--sm" />
      <span className="skeleton-line skeleton-line--md" />
      <span className="skeleton-line" />
      <span className="skeleton-line skeleton-line--md" />
    </div>
  );
}
