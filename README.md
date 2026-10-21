# Bijoya — A Cinematic Sharodiya Greeting

A personal, scroll-driven Bijoya Dashami greeting: open a 3D greeting card, feel
the dhak, and scroll through Sindoor Khela, Dhunuchi Naach, mishti, pranam and a
final greeting card you can download or share.

Built with Next.js 16 (App Router), Tailwind CSS 4, GSAP ScrollTrigger and
`html-to-image`.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Other scripts:

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```

## Personalize the greeting

All copy lives in [`src/lib/greeting-config.ts`](src/lib/greeting-config.ts):

- `sender` — your name (shown on the final card and share text)
- `year` — greeting year
- cover / interior / festival / mishti / pranam / finalCard — every heading and
  message, in Bengali and romanized Bengali
- `actions` — button labels

The share text is generated from `finalCard` + `sender` + `year`, so updating the
config updates WhatsApp share, copy and the download file name automatically.

## Add real festival media (optional)

The experience ships with illustrated SVG/CSS fallbacks, so it works with zero
assets. To use real footage and photos, drop licensed files into `public/`:

| Asset | Path | Notes |
| --- | --- | --- |
| Sindoor Khela video | `public/videos/sindoor-khela.mp4` | H.264 MP4, muted loop clip, 1080p or lower |
| Sindoor poster | `public/videos/posters/sindoor-khela.jpg` | optional |
| Dhunuchi Naach video | `public/videos/dhunuchi-naach.mp4` | same specs |
| Dhunuchi poster | `public/videos/posters/dhunuchi-naach.jpg` | optional |
| Dhak audio | `public/audio/dhak.mp3` (or `.m4a` / `.ogg`) | authentic, properly licensed dhak recording |
| Mishti photo | `public/images/mishti.jpg` (or `.webp` / `.png`) | roshogolla / sandesh |
| Pranam photo | `public/images/pranam.jpg` (or `.webp` / `.png`) | Bijoya pranam imagery |

No local video files? Set these env vars to embed the official YouTube player
instead (11-character video IDs):

```bash
BIJOYA_YOUTUBE_SINDOOR_ID=XXXXXXXXXXX
BIJOYA_YOUTUBE_DHUNUCHI_ID=XXXXXXXXXXX
```

Resolution order (see [`src/lib/resolve-media.ts`](src/lib/resolve-media.ts)):
local file → YouTube env var → illustrated fallback. Missing assets are listed
in `media.missing` and the festival scene shows a subtle fallback note.

> Only use media you own or that is licensed for this use.

## How it works

1. **Opening card** (`OpeningCard`) — click to open; the cover flips in 3D and
   the dhak audio starts (when bundled).
2. **Scroll story** (`ScrollStory`) — a GSAP ScrollTrigger timeline pinned to
   the viewport, scrubbing through four scenes:
   - Festival montage (Sindoor Khela → Dhunuchi Naach)
   - Mishti (roshogolla & sandesh)
   - Bijoya pranam
   - Final greeting card with gold shimmer
3. **Actions** (`ExperienceActions`) — Web Share / WhatsApp fallback, copy the
   greeting text, replay, toggle sound, and **Make It Yours**: write your own
   Bijoya message and name — your message appears in the pranam scene and your
   name signs the final card and the share text.

### Project map

```
src/
  app/                  layout (fonts, metadata), page
  components/bijoya/    experience, card, scenes, actions, decor
  components/ui/        IconButton
  hooks/useDhakAudio.ts audio element controller with blocked/unavailable states
  lib/                  greeting copy, media resolution, animation & color config
  types/bijoya.ts       shared types
```

### Accessibility & performance

- `prefers-reduced-motion` disables pinning/scrubbing; scenes stack vertically
- keyboard-reachable controls, skip link, `aria-live` status messages
- videos are muted, looped, `playsInline`, and only play while their scene is
  active and on screen
- GSAP and `html-to-image` are code-split via dynamic import

## Tech stack

- [Next.js](https://nextjs.org) 16 (App Router, Turbopack, Cache Components)
- [Tailwind CSS](https://tailwindcss.com) 4
- [GSAP](https://gsap.com) + ScrollTrigger
- `html-to-image`, `lucide-react`, `next/font` (Geist, Great Vibes, Noto Serif Bengali)
