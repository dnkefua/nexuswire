import { NextResponse } from "next/server";
import {
  FIREBASE_PROJECT_ID,
  isFirebaseClientConfigured,
} from "@/lib/firebase-config";
import { shouldUseFirebaseStore } from "@/lib/store-backend";

export async function GET() {
  return NextResponse.json({
    github: "https://github.com/dnkefua",
    firebase: {
      projectId: FIREBASE_PROJECT_ID,
      adminConnected: shouldUseFirebaseStore(),
      clientConfigured: isFirebaseClientConfigured(),
    },
  });
}
