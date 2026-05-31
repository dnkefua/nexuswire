const USER_KEY = "nexuswire-user-name";
const ACTIVE_JOURNALIST_KEY = "nexuswire-active-journalist";

export function getUserDisplayName(): string {
  if (typeof window === "undefined") return "Guest";
  try {
    return localStorage.getItem(USER_KEY) || "Guest";
  } catch {
    return "Guest";
  }
}

export function setUserDisplayName(name: string): void {
  try {
    localStorage.setItem(USER_KEY, name.trim());
  } catch {
    /* ignore */
  }
}

export function getUserKey(): string {
  const name = getUserDisplayName();
  return `user:${name.toLowerCase().replace(/\s+/g, "-")}`;
}

export function getActiveJournalistId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(ACTIVE_JOURNALIST_KEY);
  } catch {
    return null;
  }
}

export function setActiveJournalistId(id: string | null): void {
  try {
    if (id) localStorage.setItem(ACTIVE_JOURNALIST_KEY, id);
    else localStorage.removeItem(ACTIVE_JOURNALIST_KEY);
  } catch {
    /* ignore */
  }
}
