"use client";

import { useEffect, useState } from "react";

interface Status {
  github: string;
  firebase: {
    projectId: string;
    adminConnected: boolean;
    clientConfigured: boolean;
  };
}

export function ConnectStatus() {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => null);
  }, []);

  if (!status) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-4">
      <div className="flex flex-wrap items-center justify-center gap-3 rounded-xl border border-[var(--border)] bg-black/20 px-4 py-2 text-[10px] text-[var(--text-muted)]">
        <a
          href={status.github}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold tracking-wider text-[var(--accent)] uppercase hover:underline"
        >
          GitHub · dnkefua
        </a>
        <span>·</span>
        <span>
          Firebase{" "}
          <span className="text-[var(--gold)]">{status.firebase.projectId}</span>
          {status.firebase.adminConnected ? (
            <span className="ml-1 text-[var(--success)]">● cloud</span>
          ) : (
            <span className="ml-1">● local</span>
          )}
        </span>
      </div>
    </div>
  );
}
