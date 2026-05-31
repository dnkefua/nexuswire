"use client";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
}

export function StarRating({ value, onChange, readonly }: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`text-lg transition-transform ${
            readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
          } ${star <= value ? "text-[var(--gold)]" : "text-[var(--text-muted)] opacity-40"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
