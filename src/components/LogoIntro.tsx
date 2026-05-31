"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

const INTRO_KEY = "nexuswire-intro-seen";
const INTRO_VIDEO = "/brand/nexuswire-intro.mp4";
const INTRO_EVENT = "nexuswire-intro-update";

function subscribe(callback: () => void) {
  window.addEventListener(INTRO_EVENT, callback);
  return () => window.removeEventListener(INTRO_EVENT, callback);
}

function getIntroSnapshot() {
  try {
    return sessionStorage.getItem(INTRO_KEY) !== "1";
  } catch {
    return true;
  }
}

function getServerIntroSnapshot() {
  return false;
}

export function LogoIntro() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const showIntro = useSyncExternalStore(
    subscribe,
    getIntroSnapshot,
    getServerIntroSnapshot
  );
  const [fadeOut, setFadeOut] = useState(false);
  const [hidden, setHidden] = useState(false);

  const dismiss = useCallback(() => {
    setFadeOut(true);
    window.setTimeout(() => {
      setHidden(true);
      try {
        sessionStorage.setItem(INTRO_KEY, "1");
        window.dispatchEvent(new Event(INTRO_EVENT));
      } catch {
        /* ignore */
      }
    }, 500);
  }, []);

  useEffect(() => {
    if (!showIntro || hidden) return;
    const video = videoRef.current;
    if (!video) return;

    document.body.style.overflow = "hidden";

    const play = async () => {
      try {
        video.muted = true;
        await video.play();
      } catch {
        dismiss();
      }
    };

    void play();

    return () => {
      document.body.style.overflow = "";
    };
  }, [showIntro, hidden, dismiss]);

  if (!showIntro || hidden) return null;

  return (
    <div
      className={`logo-intro fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[var(--bg-deep)] transition-opacity duration-500 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      role="dialog"
      aria-label="NexusWire intro"
    >
      <div className="logo-intro-vignette absolute inset-0 pointer-events-none" />

      <video
        ref={videoRef}
        className="relative z-10 max-h-[72vh] w-full max-w-2xl object-contain px-6"
        playsInline
        muted
        preload="auto"
        onEnded={dismiss}
      >
        <source src={INTRO_VIDEO} type="video/mp4" />
      </video>

      <button
        type="button"
        onClick={dismiss}
        className="relative z-20 mt-8 btn-ghost border-[var(--gold)]/40 text-[var(--gold)]"
      >
        Skip Intro
      </button>
    </div>
  );
}
