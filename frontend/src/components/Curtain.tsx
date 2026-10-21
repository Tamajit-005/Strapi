"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { wordmark } from "@/lib/fonts";
import { notifyIntro } from "@/lib/loaderBus";

// Ease in and out: no jerk when the hold turns into the flight, and a long
// soft landing.
const EASE = [0.45, 0, 0.2, 1] as const;
const FLY_SECONDS = 0.85;
const HOLD_MS = 250;
const FONT_CAP_MS = 1000;
// The real wordmark fades in underneath the flying one, so it is fully
// opaque before the flying one is removed.
const HANDOVER_MS = 220;
const FADE_SECONDS = 0.5;

type Flight = { x: number; y: number; scale: number };

/**
 * First load of a session only: the wordmark fills the screen, then flies up
 * and lands exactly on the navbar's wordmark while the navbar rises, so the
 * whole thing reads as one gesture — the navbar sliding up.
 */
export default function Curtain() {
  const [shown, setShown] = useState(false);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [marker, setMarker] = useState(true);
  const [backdrop, setBackdrop] = useState(true);
  const flyer = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains("intro")) {
      setMarker(false);
      setBackdrop(false);
      return;
    }
    document
      .querySelector(".curtain-fallback")
      ?.classList.remove("curtain-fallback");
    try {
      sessionStorage.setItem("intro-seen", "1");
    } catch {}

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      html.classList.add("intro-done");
      setMarker(false);
      setBackdrop(false);
      return;
    }

    let cancelled = false;
    const ready = () => {
      if (!cancelled) setShown(true);
    };
    // The flight is measured in Anton; never measure a fallback face.
    const cap = setTimeout(ready, FONT_CAP_MS);
    (document.fonts?.ready ?? Promise.resolve()).then(ready);
    return () => {
      cancelled = true;
      clearTimeout(cap);
    };
  }, []);

  useEffect(() => {
    if (!shown) return;
    const timer = setTimeout(() => {
      const target = measure(flyer.current);
      if (!target) {
        document.documentElement.classList.add("intro-done");
        // Nothing to fly to: still start the navbar so it does not sit below
        // the fold for the parked animation's 2.6s delay.
        notifyIntro();
        setMarker(false);
        setBackdrop(false);
        return;
      }
      setFlight(target);
      notifyIntro();
    }, HOLD_MS);
    return () => clearTimeout(timer);
  }, [shown]);

  useEffect(() => {
    if (!flight) return;
    let handover: ReturnType<typeof setTimeout> | undefined;
    const landed = setTimeout(() => {
      // The wordmark lands where the header's own wordmark lives: reveal it
      // there, lift the black, then retire the flying copy.
      document.documentElement.classList.add("intro-done");
      setBackdrop(false);
      handover = setTimeout(() => setMarker(false), HANDOVER_MS);
    }, FLY_SECONDS * 1000);
    return () => {
      clearTimeout(landed);
      if (handover) clearTimeout(handover);
    };
  }, [flight]);

  return (
    <>
      {/* Above the header (z-50) so the landing is pixel-identical and the
          handover cannot be seen. Below the route loader (z-60). */}
      <AnimatePresence>
        {marker && (
          <motion.div
            key="mark"
            className="pointer-events-none fixed inset-0 z-55 flex items-center justify-center"
            aria-hidden="true"
          >
            <motion.span
              ref={flyer}
              className={`${wordmark.className} origin-top-left text-6xl uppercase leading-none tracking-wide whitespace-nowrap will-change-transform transition-opacity duration-200 md:text-8xl ${
                shown ? "" : "opacity-0"
              }`}
              initial={false}
              animate={flight ?? { x: 0, y: 0, scale: 1 }}
              transition={{ duration: FLY_SECONDS, ease: EASE }}
            >
              Post Palette
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {backdrop && (
          <motion.div
            key="backdrop"
            className="curtain curtain-fallback fixed inset-0 z-40 bg-black"
            exit={{ opacity: 0 }}
            transition={{ duration: FADE_SECONDS, ease: "easeOut" }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Where the big wordmark must travel to sit on the navbar's wordmark. The
 * header is parked below the fold, so its transform is dropped for one
 * layout read and restored in the same frame — nothing paints in between.
 */
function measure(from: HTMLElement | null): Flight | null {
  const nav = document.querySelector<HTMLElement>(".navbar-intro");
  const mark = document.querySelector<HTMLElement>(".navbar-wordmark");
  if (!from || !nav || !mark) return null;

  const transform = nav.style.transform;
  const animation = nav.style.animation;
  nav.style.transform = "none";
  nav.style.animation = "none";
  const to = mark.getBoundingClientRect();
  nav.style.transform = transform;
  nav.style.animation = animation;

  const box = from.getBoundingClientRect();
  if (!box.height) return null;
  const scale = to.height / box.height;
  return {
    x: to.left - box.left + (to.width - box.width * scale) / 2,
    y: to.top - box.top,
    scale,
  };
}
