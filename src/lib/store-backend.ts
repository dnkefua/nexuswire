import { promises as fs } from "fs";
import path from "path";
import { getFirestoreDb, isFirebaseConfigured } from "./firebase-admin";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_DOC = "nexuswire/store";

export interface DataStore {
  journalists: import("./types").Journalist[];
  broadcasts: import("./types").Broadcast[];
  connectedSources: import("./types").ConnectedSource[];
  posts: import("./types").JournalistPost[];
  reviews: import("./types").Review[];
  comments: import("./types").Comment[];
  likes: import("./types").Like[];
}

function storePath(): string {
  return path.join(DATA_DIR, "store.json");
}

export function useFirebaseStore(): boolean {
  return isFirebaseConfigured();
}

export async function readDataStore(): Promise<DataStore | null> {
  if (useFirebaseStore()) {
    try {
      const db = getFirestoreDb();
      const snap = await db.doc(STORE_DOC).get();
      if (!snap.exists) return null;
      return snap.data() as DataStore;
    } catch (e) {
      console.error("Firestore read failed:", e);
      return null;
    }
  }

  try {
    const raw = await fs.readFile(storePath(), "utf-8");
    return JSON.parse(raw) as DataStore;
  } catch {
    return null;
  }
}

export async function writeDataStore(data: DataStore): Promise<void> {
  if (useFirebaseStore()) {
    const db = getFirestoreDb();
    await db.doc(STORE_DOC).set(
      {
        ...data,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return;
  }

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(storePath(), JSON.stringify(data, null, 2), "utf-8");
}
