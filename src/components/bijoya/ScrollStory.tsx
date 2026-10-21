import { useEffect, useRef, useState } from "react";
import { ANIMATION, COLORS, SCENE_BREAKPOINTS } from "@/lib/animation-config";
import type { GreetingConfig, MediaConfig, Personalization } from "@/types/bijoya";
import FestivalVideoScene from "./FestivalVideoScene";
import FinalGreetingCard from "./FinalGreetingCard";
import MemoriesScene from "./MemoriesScene";
import MishtiScene from "./MishtiScene";
import PranamScene from "./PranamScene";

interface ScrollStoryProps {
  media: MediaConfig;
  greeting: GreetingConfig;
  personal: Personalization;
}

interface Revertible {
  revert: () => void;
}

export default function ScrollStory({
  media,
  greeting,
  personal,
}: ScrollStoryProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [activeScene, setActiveScene] = useState(0);
  const hasPhotos = personal.photos.length > 0;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;    let killed = false;
    let matchMedia: Revertible | null = null;
    let refreshTimer: number | null = null;

    const sceneIndexRef = { current: 0 };

    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([gsapModule, scrollTriggerModule]) => {
        if (killed) return;

        const gsap = gsapModule.default;
        const { ScrollTrigger } = scrollTriggerModule;
        gsap.registerPlugin(ScrollTrigger);

        const q = gsap.utils.selector(stage);
        const el = (name: string) => q(`[data-anim="${name}"]`);
        const one = (name: string) => el(name)[0];

        const sceneIndexForProgress = (progress: number) => {
          if (progress < SCENE_BREAKPOINTS.festivalEnd) return 0;
          if (progress < SCENE_BREAKPOINTS.mishtiEnd) return 1;
          if (progress < SCENE_BREAKPOINTS.pranamEnd) return 2;
          return 3;
        };

        const syncScene = (self: { isActive: boolean; progress: number }) => {
          const next = self.isActive
            ? sceneIndexForProgress(self.progress)
            : -1;
          if (next !== sceneIndexRef.current) {
            sceneIndexRef.current = next;
            setActiveScene(next);
          }
        };

        const buildTimeline = (travel: number) => {
          const t = travel;
          const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

          const festEyebrow = one("fest-eyebrow");
          const festTitle = one("fest-title");
          const festCaption = one("fest-caption");
          const shotA = one("shot-a");
          const shotB = one("shot-b");
          const labelA = one("label-a");
          const labelB = one("label-b");

          const sceneMishti = one("scene-mishti");
          const mishtiVisual = one("mishti-visual");
          const mishtiEyebrow = one("mishti-eyebrow");
          const mishtiHeading = one("mishti-heading");
          const mishtiRule = one("mishti-rule");
          const mishtiBody = one("mishti-body");

          const scenePranam = one("scene-pranam");
          const pranamVisual = one("pranam-visual");
          const pranamHeading = one("pranam-heading");
          const pranamRule = one("pranam-rule");
          const pranamMsg = one("pranam-msg");
          const pranamMsg2 = one("pranam-msg2");
          const pranamUser = one("pranam-user");
          const pranamUserLines = el("pranam-user-line");
          const pranamUserSig = one("pranam-user-sig");

          const sceneFinal = one("scene-final");
          const finalCard = one("final-card");
          const finalFrame = one("final-frame");
          const finalTexts = el("final-text");
          const finalSignature = one("final-signature");
          const shimmer = one("shimmer");
          const actionsCue = one("actions-cue");

          const sceneMemories = one("scene-memories");
          const memEyebrow = one("mem-eyebrow");
          const memTitle = one("mem-title");
          const memSubtitle = one("mem-subtitle");
          const memRule = one("mem-rule");
          const memGrid = one("mem-grid");
          const memItems = el("mem-item");
          const memDivider = one("mem-divider");

          const finalStart = hasPhotos ? 17 : 13.9;

          // Scene 3 — cinematic festival montage
          tl.set(stage, { backgroundColor: COLORS.midnight }, 0)
            .fromTo(
              shotB,
              { opacity: 0, scale: 1.07 },
              { opacity: 1, scale: 1, duration: 1.5, ease: "none" },
              2.2,
            )
            .fromTo(
              [festEyebrow, festTitle, festCaption],
              { opacity: 0, y: (index: number) => (34 + index * 14) * t },
              { opacity: 1, y: 0, duration: 1.1, stagger: 0.18 },
              0.25,
            )
            .to(labelA, { opacity: 0, duration: 0.5 }, 2.1)
            .to(shotA, { opacity: 0, duration: 1, ease: "none" }, 2.4)
            .fromTo(
              labelB,
              { opacity: 0, y: 14 * t },
              { opacity: 1, y: 0, duration: 0.7 },
              2.9,
            )
            .to(
              [festEyebrow, festTitle, festCaption],
              { opacity: 0, y: -26 * t, duration: 0.8, stagger: 0.1 },
              3.5,
            )
            .to(labelB, { opacity: 0, duration: 0.5 }, 4.2)
            .to(shotB, { opacity: 0, duration: 0.9, ease: "none" }, 4.4)
            .to(
              stage,
              { backgroundColor: COLORS.cream, duration: 1.3, ease: "sine.inOut" },
              4.4,
            );

          // Scene 4 — roshogolla & mishti
          tl.fromTo(
            sceneMishti,
            { opacity: 0 },
            { opacity: 1, duration: 0.8 },
            5.1,
          )
            .fromTo(
              mishtiVisual,
              {
                clipPath: "inset(14% 7% 14% 7% round 26px)",
                y: 54 * t,
                scale: 0.96,
              },
              {
                clipPath: "inset(0% 0% 0% 0% round 26px)",
                y: 0,
                scale: 1,
                duration: 1.6,
                ease: "power3.out",
              },
              5.1,
            )
            .fromTo(
              mishtiEyebrow,
              { opacity: 0, y: 18 * t },
              { opacity: 1, y: 0, duration: 0.8 },
              5.6,
            )
            .fromTo(
              mishtiHeading,
              { opacity: 0, y: 30 * t },
              { opacity: 1, y: 0, duration: 1 },
              5.8,
            )
            .fromTo(
              mishtiRule,
              { opacity: 0, scaleX: 0 },
              { opacity: 1, scaleX: 1, duration: 0.9 },
              6.2,
            )
            .fromTo(
              mishtiBody,
              { opacity: 0, y: 24 * t },
              { opacity: 1, y: 0, duration: 1 },
              6.4,
            )
            .to(sceneMishti, { opacity: 0, duration: 0.9 }, 8.6);

          // Scene 5 — Bijoya pranam
          tl.fromTo(
            scenePranam,
            { opacity: 0 },
            { opacity: 1, duration: 0.8 },
            9.2,
          )
            .fromTo(
              pranamVisual,
              { opacity: 0, scale: 0.94, y: 26 * t },
              { opacity: 1, scale: 1, y: 0, duration: 1.3 },
              9.3,
            )
            .fromTo(
              pranamHeading,
              { opacity: 0, y: 34 * t },
              { opacity: 1, y: 0, duration: 1 },
              9.7,
            )
            .fromTo(
              pranamRule,
              { opacity: 0, scaleX: 0 },
              { opacity: 1, scaleX: 1, duration: 0.9 },
              10.1,
            )
            .fromTo(
              pranamMsg,
              { opacity: 0, y: 24 * t },
              { opacity: 1, y: 0, duration: 1 },
              10.75,
            )
            .fromTo(
              pranamMsg2,
              { opacity: 0, y: 22 * t },
              { opacity: 1, y: 0, duration: 1 },
              11.2,
            )
            .to(
              scenePranam,
              { opacity: 0, duration: 0.9 },
              hasPhotos ? 12.4 : 13.2,
            );

          if (pranamUser) {
            tl.fromTo(
              pranamUser,
              { opacity: 0, y: 26 * t },
              { opacity: 1, y: 0, duration: 1 },
              10.35,
            );

            if (pranamUserLines.length > 0) {
              tl.fromTo(
                pranamUserLines,
                { opacity: 0 },
                { opacity: 1, duration: 0.8, stagger: 0.18 },
                10.5,
              );
            }

            if (pranamUserSig) {
              tl.fromTo(
                pranamUserSig,
                { opacity: 0 },
                { opacity: 1, duration: 0.7 },
                10.5 + pranamUserLines.length * 0.18,
              );
            }
          }

          // Scene 6 — memorable Sharodiya days gallery
          if (hasPhotos && sceneMemories) {
            tl.fromTo(
              sceneMemories,
              { opacity: 0 },
              { opacity: 1, duration: 0.8 },
              13,
            )
              .fromTo(
                memEyebrow,
                { opacity: 0, y: 20 * t },
                { opacity: 1, y: 0, duration: 0.8 },
                13.25,
              )
              .fromTo(
                memTitle,
                { opacity: 0, y: 32 * t },
                { opacity: 1, y: 0, duration: 1 },
                13.45,
              )
              .fromTo(
                memSubtitle,
                { opacity: 0, y: 18 * t },
                { opacity: 1, y: 0, duration: 0.8 },
                13.8,
              )
              .fromTo(
                memRule,
                { opacity: 0, scaleX: 0 },
                { opacity: 1, scaleX: 1, duration: 0.9 },
                14,
              )
              .fromTo(
                memGrid,
                { opacity: 0, y: 40 * t, scale: 0.96 },
                { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: "power3.out" },
                14.15,
              )
              .fromTo(
                memItems,
                { opacity: 0 },
                { opacity: 1, duration: 0.85, stagger: 0.14 },
                14.35,
              )
              .fromTo(
                memDivider,
                { opacity: 0 },
                { opacity: 1, duration: 0.8 },
                15.4,
              )
              .to(sceneMemories, { opacity: 0, duration: 0.9 }, 16.4);
          }

          // Scene 7 — final greeting card reveal
          tl.fromTo(
            sceneFinal,
            { opacity: 0 },
            { opacity: 1, duration: 0.8 },
            finalStart,
          )
            .fromTo(
              finalCard,
              {
                opacity: 0,
                rotateX: -62,
                y: 80 * t,
                transformPerspective: 1500,
                transformOrigin: "50% 100%",
              },
              {
                opacity: 1,
                rotateX: 0,
                y: 0,
                duration: 1.8,
                ease: "power3.out",
              },
              finalStart,
            )
            .fromTo(
              finalFrame,
              { opacity: 0, scale: 1.06 },
              { opacity: 1, scale: 1, duration: 1.4 },
              finalStart + 0.6,
            )
            .fromTo(
              finalTexts,
              { opacity: 0, y: 20 * t },
              { opacity: 1, y: 0, duration: 0.85, stagger: 0.22 },
              finalStart + 1,
            )
            .fromTo(
              finalSignature,
              { opacity: 0, y: 14 * t },
              { opacity: 1, y: 0, duration: 0.8 },
              finalStart + 2.6,
            )
            .fromTo(
              shimmer,
              { xPercent: -170, skewX: -14 },
              { xPercent: 360, skewX: -14, duration: 2.4, ease: "sine.inOut" },
              finalStart + 2.4,
            )
            .fromTo(
              actionsCue,
              { opacity: 0, y: 16 * t },
              { opacity: 1, y: 0, duration: 0.8 },
              finalStart + 3.4,
            );

          return tl;
        };

        const mm = gsap.matchMedia();
        matchMedia = mm;

        mm.add(
          {
            desktop: `(min-width: 768px) and (prefers-reduced-motion: no-preference)`,
            mobile: `(max-width: 767px) and (prefers-reduced-motion: no-preference)`,
          },
          (context) => {
            const conditions = context.conditions ?? {};
            const isDesktop = Boolean(conditions.desktop);
            const timeline = buildTimeline(
              isDesktop ? ANIMATION.travelDesktop : ANIMATION.travelMobile,
            );

            const trigger = ScrollTrigger.create({
              trigger: stage,
              animation: timeline,
              start: ANIMATION.pinStart,
              end: () =>
                `+=${
                  (hasPhotos
                    ? isDesktop
                      ? 6.6
                      : 4.8
                    : isDesktop
                      ? 5.6
                      : 4) * window.innerHeight
                }`,
              pin: true,
              scrub: isDesktop ? ANIMATION.scrubDesktop : ANIMATION.scrubMobile,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: syncScene,
              onToggle: syncScene,
            });

            return () => {
              trigger.kill();
              timeline.kill();
            };
          },
        );

        ScrollTrigger.refresh();
        refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 500);

        if (document.fonts?.ready) {
          void document.fonts.ready.then(() => {
            if (!killed) ScrollTrigger.refresh();
          });
        }
      },
    );

    return () => {
      killed = true;
      if (refreshTimer !== null) window.clearTimeout(refreshTimer);
      matchMedia?.revert();
    };
  }, [hasPhotos]);

  /**
   * A longer saved message (or newly attached photos) can change how tall the
   * final card and scenes are. Recalculate ScrollTrigger measurements once,
   * shortly after the greeting settles — debounced so it can never loop.
   */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void import("gsap/ScrollTrigger").then((module) => {
        module.ScrollTrigger.refresh();
      });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [personal.message, personal.sender, personal.photos.length]);

  return (
    <section aria-label="Bijoya celebration story" className="relative">
      <p className="sr-only">
        A scroll-driven Bijoya Dashami story: festival footage, Bengali sweets,
        pranam and a final greeting card.
      </p>
      <div ref={stageRef} data-anim="stage" className="story-stage">
        <FestivalVideoScene
          media={media}
          greeting={greeting}
          active={activeScene === 0}
        />
        <MishtiScene media={media} greeting={greeting} />
        <PranamScene media={media} greeting={greeting} personal={personal} />
        {hasPhotos ? (
          <MemoriesScene greeting={greeting} personal={personal} />
        ) : null}
        <FinalGreetingCard greeting={greeting} />
      </div>
    </section>
  );
}
