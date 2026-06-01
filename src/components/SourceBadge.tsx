import type { NewsSourceType } from "@/lib/types";

interface Props {
  type: NewsSourceType;
  trusted?: boolean;
  preview?: boolean;
}

export function SourceBadge({ type, trusted, preview }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {type === "rss" && (
        <span className="chip chip-rss">RSS</span>
      )}
      {type === "blog" && (
        <span className="chip chip-blog">Blog</span>
      )}
      {type === "youtube" && (
        <span className="chip chip-youtube">YouTube</span>
      )}
      {trusted && (
        <span className="chip" style={{ background: "rgba(0,230,118,0.1)", color: "var(--success)", borderColor: "rgba(0,230,118,0.3)" }}>
          ✓ Verified
        </span>
      )}
      {preview && (
        <span className="chip" style={{ background: "rgba(212,168,83,0.12)", color: "var(--gold)", borderColor: "rgba(212,168,83,0.35)" }}>
          Preview Only
        </span>
      )}
    </div>
  );
}
