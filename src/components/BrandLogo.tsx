"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const LOGO_SRC = "/brand/nexuswire-logo.png";

interface BrandLogoProps {
  variant?: "icon" | "lockup" | "hero";
  showTagline?: boolean;
  href?: string | null;
  className?: string;
}

export function BrandLogo({
  variant = "icon",
  showTagline = false,
  href = "/",
  className,
}: BrandLogoProps) {
  const sizes = {
    icon: { box: "h-10 w-10", img: 40 },
    lockup: { box: "h-12 w-12 sm:h-14 sm:w-14", img: 56 },
    hero: { box: "h-28 w-28 sm:h-36 sm:w-36 md:h-44 md:w-44", img: 176 },
  }[variant];

  const content = (
    <div
      className={cn(
        "flex items-center gap-3",
        variant === "hero" && "flex-col text-center gap-4",
        className
      )}
    >
      <div
        className={cn(
          "relative flex-shrink-0 overflow-hidden rounded-2xl",
          sizes.box,
          variant === "hero" && "brand-logo-glow rounded-3xl"
        )}
      >
        <Image
          src={LOGO_SRC}
          alt="NexusWire"
          width={sizes.img}
          height={sizes.img}
          className="h-full w-full object-contain"
          priority={variant !== "icon"}
          sizes={variant === "hero" ? "176px" : "56px"}
          quality={82}
        />
      </div>

      {(variant === "lockup" || variant === "hero") && (
        <div className={cn(variant === "hero" && "flex flex-col items-center")}>
          <p
            className={cn(
              "brand-wordmark font-display font-bold tracking-tight",
              variant === "hero"
                ? "text-2xl sm:text-3xl md:text-4xl"
                : "text-sm sm:text-base"
            )}
          >
            <span className="brand-nexus">Nexus</span>
            <span className="brand-wire">Wire</span>
          </p>
          {showTagline && (
            <p
              className={cn(
                "brand-tagline mt-1 font-semibold tracking-[0.28em] text-[var(--gold)] uppercase",
                variant === "hero" ? "text-[11px] sm:text-xs" : "text-[9px]"
              )}
            >
              Premium News Network
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (href === null) return content;

  return (
    <Link href={href || "/"} className="group outline-none">
      {content}
    </Link>
  );
}
