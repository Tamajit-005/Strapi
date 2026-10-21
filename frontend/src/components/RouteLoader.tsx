"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import LoadingAnimation from "@/components/LoadingAnimation";
import { showRouteLoader, subscribeRouteLoader } from "@/lib/loaderBus";

const MIN_VISIBLE_MS = 450;
const FAILSAFE_MS = 2500;

export default function RouteLoader() {
  const pathname = usePathname();
  // The first paint is covered by the intro curtain; this overlay is only
  // for client-side navigation.
  const [visible, setVisible] = useState(false);
  const startedAt = useRef(0);
  const lastPath = useRef(pathname);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback((delay: number) => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setVisible(false), delay);
  }, []);

  const show = useCallback(() => {
    startedAt.current = Date.now();
    setVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    // If the route never commits (cancelled nav, error), do not trap the user.
    hideTimer.current = setTimeout(() => setVisible(false), FAILSAFE_MS);
  }, []);

  // Explicit navigations (router.push) announce themselves through the bus.
  useEffect(() => subscribeRouteLoader(show), [show]);

  // Show the loader when an internal link is clicked, so it covers the route
  // transition instead of flashing after it.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }

      // Next's <Link> calls preventDefault() for client-side navigation, but
      // only once the event has bubbled past the anchor. Decide after the
      // event finished dispatching: prevented = client-side nav (show the
      // loader), untouched = plain <a> doing a full page load.
      setTimeout(() => {
        if (event.defaultPrevented) showRouteLoader();
      }, 0);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // Browser back/forward is a page switch too.
  useEffect(() => {
    const onPopState = () => showRouteLoader();
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Route committed: keep the loader up for the minimum time, then fade out.
  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;
    if (!visible) return;

    const elapsed = Date.now() - startedAt.current;
    hide(Math.max(0, MIN_VISIBLE_MS - elapsed));

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
    // `visible` is read from the render that committed the new route.
  }, [pathname]);

  useEffect(
    () => () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    },
    []
  );

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="status"
          aria-live="polite"
          aria-label="Loading page"
        >
          <LoadingAnimation className="w-56 h-56" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
