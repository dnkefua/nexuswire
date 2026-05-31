import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { FIREBASE_PROJECT_ID, isFirebaseAdminConfigured } from "./firebase-config";

export function isFirebaseConfigured(): boolean {
  return isFirebaseAdminConfigured();
}

export function getFirebaseAdmin(): App {
  const existing = getApps()[0];
  if (existing) return existing;

  if (!isFirebaseAdminConfigured()) {
    throw new Error("Firebase Admin is not configured. Set FIREBASE_* env variables.");
  }

  if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");
    return initializeApp({
      credential: cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
      projectId: FIREBASE_PROJECT_ID,
    });
  }

  // Fallback to Application Default Credentials when running on Google Cloud Platform (e.g. Firebase App Hosting)
  return initializeApp({
    projectId: FIREBASE_PROJECT_ID,
  });
}

export function getFirestoreDb(): Firestore {
  return getFirestore(getFirebaseAdmin());
}
