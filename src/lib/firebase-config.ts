/** Env-only checks — safe to import anywhere (no firebase SDK). */

export function isFirebaseAdminConfigured(): boolean {
  return Boolean(
    (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) ||
      process.env.FIREBASE_APP_HOSTING === "1" ||
      process.env.FIREBASE_CONFIG ||
      process.env.GOOGLE_CLOUD_PROJECT ||
      process.env.GCLOUD_PROJECT ||
      process.env.K_SERVICE
  );
}

export function isFirebaseClientConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "nexuswire-app")
  );
}

export const FIREBASE_PROJECT_ID =
  process.env.FIREBASE_PROJECT_ID ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  "nexuswire-app";
