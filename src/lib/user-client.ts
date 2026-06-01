const USER_KEY = "nexuswire-user-name";
const ACTIVE_JOURNALIST_KEY = "nexuswire-active-journalist";
const CURRENT_USER_KEY = "nexuswire-current-user";

export function getUserDisplayName(): string {
  if (typeof window === "undefined") return "Guest";
  try {
    const userJson = localStorage.getItem(CURRENT_USER_KEY);
    if (userJson) {
      const user = JSON.parse(userJson);
      return user.username || "Guest";
    }
    return localStorage.getItem(USER_KEY) || "Guest";
  } catch {
    return "Guest";
  }
}

export function setUserDisplayName(name: string): void {
  try {
    localStorage.setItem(USER_KEY, name.trim());
    const userJson = localStorage.getItem(CURRENT_USER_KEY);
    if (userJson) {
      const user = JSON.parse(userJson);
      user.username = name.trim();
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    }
  } catch {
    /* ignore */
  }
}

export function getUserKey(): string {
  const name = getUserDisplayName();
  return `user:${name.toLowerCase().replace(/\s+/g, "-")}`;
}

/**
 * Returns the current Firebase ID token if a Firebase session is active,
 * or null otherwise (dev/mock mode). Used to authenticate API requests.
 */
export async function getIdToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const { getFirebaseClientApp } = await import("./firebase-client");
    const app = getFirebaseClientApp();
    if (!app) return null;
    const { getAuth } = await import("firebase/auth");
    const user = getAuth(app).currentUser;
    if (!user) return null;
    return await user.getIdToken();
  } catch {
    return null;
  }
}

/** Builds fetch headers including the Authorization bearer token when available. */
export async function authHeaders(): Promise<HeadersInit> {
  const token = await getIdToken();
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
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
