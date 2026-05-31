# NexusWire

Premium futuristic news platform — journalist desks, live feeds, reviews, and community engagement.

- **GitHub:** [github.com/dnkefua](https://github.com/dnkefua)
- **Firebase project:** `nexuswire-app`

## Quick start (local)

```bash
npm install
cp .env.example .env.local
# Fill .env.local with Firebase keys (see below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Firebase setup (`nexuswire-app`)

1. Open [Firebase Console — nexuswire-app](https://console.firebase.google.com/project/nexuswire-app)
2. **Web app config** → Project settings → Your apps → Add web app  
   Copy values into `.env.local` as `NEXT_PUBLIC_FIREBASE_*`
3. **Admin / Firestore** → Project settings → Service accounts → **Generate new private key**  
   Set in `.env.local`:
   - `FIREBASE_PROJECT_ID=nexuswire-app`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY` (paste key; keep `\n` line breaks or use real newlines in quotes)
4. Enable **Firestore** in the Firebase console (production mode is fine; API uses Admin SDK).
5. Deploy rules: `npx firebase deploy --only firestore:rules`

When Firebase Admin env vars are set, all journalist posts, reviews, comments, and likes sync to Firestore document `nexuswire/store`. Without them, data is stored in `data/store.json` locally.

## GitHub

```bash
git remote add origin https://github.com/dnkefua/nexuswire.git
git branch -M main
git push -u origin main
```

Create the repo first on GitHub if it does not exist: [github.com/new](https://github.com/new) → name `nexuswire`.

### CI deploy (optional)

In GitHub repo **Settings → Secrets**, add:

- `FIREBASE_SERVICE_ACCOUNT` — full JSON from Firebase service account
- `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` — for build-time env (workflow)

Push to `main` runs `.github/workflows/firebase-hosting.yml`.

## Deploy to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase use nexuswire-app
npm run build
firebase deploy
```

## Scripts

| Command        | Description        |
|----------------|--------------------|
| `npm run dev`  | Development server |
| `npm run build`| Production build   |
| `npm run start`| Run production     |

## License

Private — NDN Analytics / Desmond N ([@dnkefua](https://github.com/dnkefua)).
