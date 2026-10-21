"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";

type Listener = () => void;

const listeners = new Set<Listener>();
const introListeners = new Set<Listener>();

/** Show the route loader from anywhere in the client tree. */
export function showRouteLoader() {
  listeners.forEach((listener) => listener());
}

export function subscribeRouteLoader(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** The intro curtain started wiping: let the navbar slide in with it. */
export function notifyIntro() {
  introListeners.forEach((listener) => listener());
}

/** Subscribe to the start of the intro animation. */
export function subscribeIntro(listener: Listener) {
  introListeners.add(listener);
  return () => {
    introListeners.delete(listener);
  };
}

/**
 * router.push/replace that show the route loader. Use instead of useRouter()
 * for navigations that should display the loading animation.
 */
export function useNavigate() {
  const router = useRouter();

  return useMemo(
    () => ({
      push: (href: string) => {
        showRouteLoader();
        router.push(href);
      },
      replace: (href: string) => {
        showRouteLoader();
        router.replace(href);
      },
    }),
    [router]
  );
}
