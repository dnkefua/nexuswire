"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

const INTRO_KEY = "nexuswire-intro-seen";
const INTRO_VIDEO = "/brand/nexuswire-intro.mp4";
const INTRO_AUDIO = "/brand/nexuswire-ident.wav";
const INTRO_EVENT = "nexuswire-intro-update";
const FORCE_INTRO_KEY = "nexuswire-force-intro";

function subscribe(callback: () => void) {
  window.addEventListener(INTRO_EVENT, callback);
  return () => window.removeEventListener(INTRO_EVENT, callback);
}

function getIntroSnapshot() {
  try {
    const forceIntro = sessionStorage.getItem(FORCE_INTRO_KEY) === "1";
    const connection = navigator as Navigator & {
      connection?: { saveData?: boolean };
    };
    const reduceIntro =
      !forceIntro &&
      (window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        connection.connection?.saveData === true);

    if (reduceIntro) return false;
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
  const audioRef = useRef<HTMLAudioElement>(null);
  const showIntro = useSyncExternalStore(
    subscribe,
    getIntroSnapshot,
    getServerIntroSnapshot
  );
  const [fadeOut, setFadeOut] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);

  const playAudio = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      audio.currentTime = 0;
      audio.volume = 0.86;
      await audio.play();
      setAudioBlocked(false);
    } catch {
      setAudioBlocked(true);
    }
  }, []);

  const dismiss = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    setFadeOut(true);
    window.setTimeout(() => {
      setHidden(true);
      try {
        sessionStorage.setItem(INTRO_KEY, "1");
        sessionStorage.removeItem(FORCE_INTRO_KEY);
        window.dispatchEvent(new Event(INTRO_EVENT));
      } catch {
        /* ignore */
      }
    }, 500);
  }, []);

  useEffect(() => {
    const resetIntro = () => {
      setFadeOut(false);
      setHidden(false);
      setAudioBlocked(false);
    };

    window.addEventListener(INTRO_EVENT, resetIntro);
    return () => window.removeEventListener(INTRO_EVENT, resetIntro);
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
        void playAudio();
      } catch {
        dismiss();
      }
    };

    void play();

    return () => {
      document.body.style.overflow = "";
    };
  }, [showIntro, hidden, dismiss, playAudio]);

  if (!showIntro || hidden) return null;

  return (
    <div
      className={`logo-intro fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[var(--bg-deep)] transition-opacity duration-500 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      role="dialog"
      aria-label="NexusWire intro"
      onPointerDown={() => {
        if (audioBlocked) void playAudio();
      }}
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

      <audio ref={audioRef} preload="auto">
        <source src={INTRO_AUDIO} type="audio/wav" />
      </audio>

      <div className="relative z-20 mt-8 flex flex-wrap items-center justify-center gap-3">
        {audioBlocked && (
          <button
            type="button"
            onClick={playAudio}
            className="btn-ghost border-[var(--accent)]/40 text-[var(--accent)]"
            aria-label="Enable intro audio"
          >
            Audio On
          </button>
        )}
        <button
          type="button"
          onClick={dismiss}
          className="btn-ghost border-[var(--gold)]/40 text-[var(--gold)]"
        >
          Skip Intro
        </button>
      </div>
    </div>
  );
}
