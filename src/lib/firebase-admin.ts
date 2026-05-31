import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "nexuswire-app";

export function isFirebaseConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY &&
      process.env.FIREBASE_PROJECT_ID
  );
}

export function getFirebaseAdmin(): App {
  const existing = getApps()[0];
  if (existing) return existing;

  if (!isFirebaseConfigured()) {
    throw new Error("Firebase Admin is not configured. Set FIREBASE_* env variables.");
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  return initializeApp({
    credential: cert({
      projectId: PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: privateKey!,
    }),
    projectId: PROJECT_ID,
  });
}

export function getFirestoreDb(): Firestore {
  return getFirestore(getFirebaseAdmin());
}
