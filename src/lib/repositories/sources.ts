import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { isFirebaseConfigured, getFirestoreDb } from "../firebase-admin";
import type { SourceHealth } from "../types";

const DATA_DIR = path.join(process.cwd(), "data");
const SOURCES_FILE = path.join(DATA_DIR, "sources.json");
const COLLECTION = "sources";

/** Persist a snapshot of source-health records (one document per source). */
export async function saveSourceHealth(records: SourceHealth[]): Promise<void> {
  if (isFirebaseConfigured()) {
    const db = getFirestoreDb();
    const batch = db.batch();
    for (const r of records) {
      batch.set(db.collection(COLLECTION).doc(r.id), r, { merge: true });
    }
    await batch.commit();
    return;
  }

  await fs.mkdir(DATA_DIR, { recursive: true });
  const map: Record<string, SourceHealth> = {};
  for (const r of records) map[r.id] = r;
  await fs.writeFile(SOURCES_FILE, JSON.stringify(map, null, 2), "utf-8");
}

/** Read persisted source-health records. */
export async function listSourceHealth(): Promise<SourceHealth[]> {
  if (isFirebaseConfigured()) {
    const db = getFirestoreDb();
    const snap = await db.collection(COLLECTION).get();
    return snap.docs.map((d) => d.data() as SourceHealth);
  }
  try {
    const raw = await fs.readFile(SOURCES_FILE, "utf-8");
    return Object.values(JSON.parse(raw) as Record<string, SourceHealth>);
  } catch {
    return [];
  }
}
