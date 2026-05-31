import { NextResponse } from "next/server";
import { isFirebaseClientConfigured } from "@/lib/firebase-client";
import { useFirebaseStore } from "@/lib/store-backend";

export async function GET() {
  return NextResponse.json({
    github: "https://github.com/dnkefua",
    firebase: {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "nexuswire-app",
      adminConnected: useFirebaseStore(),
      clientConfigured: isFirebaseClientConfigured(),
    },
  });
}
