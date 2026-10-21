"use client";

import dynamic from "next/dynamic";

// The player is ~160 KB of JS plus a wasm module: load it only when a loader
// is actually on screen, not on every page.
const DotLottie = dynamic(
  async () => {
    const mod = await import("@lottiefiles/dotlottie-react");
    // Self-hosted player (the library defaults to jsDelivr); the wasm route
    // serves it brotli compressed.
    mod.setWasmUrl("/dotlottie/player-wasm");
    mod.setWorkerUrl("/dotlottie/dotlottie.worker.js");
    return mod.DotLottieWorkerReact;
  },
  { ssr: false, loading: () => null }
);

export default function LoadingAnimation({
  className = "w-56 h-56",
}: {
  className?: string;
}) {
  return (
    <DotLottie
      src="/loaders/wPh57FXrXa.lottie"
      autoplay
      loop
      speed={1}
      backgroundColor="transparent"
      className={className}
    />
  );
}
