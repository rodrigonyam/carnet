# Carnet

A Vite + React web app to store and browse your family archive files (photos, scans, Word/PDF documents, videos, and more) using Firebase Storage + Firestore.

## Tech Stack

- React + Vite
- Tailwind CSS
- Firebase Firestore (metadata)
- Firebase Storage (files)

## 1) Install dependencies

```bash
npm install
```

## 2) Configure Firebase

Create a Firebase project and enable:

- Firestore Database
- Storage

Then fill in `.env` with your Firebase web app credentials:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## 3) Run locally

```bash
npm run dev
```

Local development runs at `http://localhost:5173/`.
If port 5173 is busy, Vite may automatically use `http://localhost:5174/` (or another available port).

## 4) Build

```bash
npm run build
npm run preview
```

## GitHub Pages Deploy

- This repo includes a GitHub Actions workflow at `.github/workflows/deploy-pages.yml`.
- In GitHub, open **Settings → Pages** and set **Source** to **GitHub Actions**.
- Push changes to the `main` branch to trigger deployment.
- The site will be available at `https://rodrigonyam.github.io/carnet/`.

## Current Features

- Dashboard with quick stats by category
- Drag-and-drop multi-file upload modal
- Category tagging (`photo`, `scan`, `document`, `video`, `other`)
- Archive page with category filters + search
- Thumbnail preview for images
- File open in new tab
- Delete file (Firestore metadata + Storage object)

## Data Model (`entries` collection)

Each uploaded file stores:

- `title`
- `notes`
- `category`
- `fileName`
- `fileType`
- `fileSize`
- `downloadURL`
- `storagePath`
- `createdAt`

## Suggested Next Improvements

- Firebase Authentication (private archive)
- Pagination / lazy loading for large archives
- Upload progress per file
- Shareable links and metadata editing
