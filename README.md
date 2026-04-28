# Frontend Project Tracker

React + TypeScript project tracker with:

- Shared single in-memory dataset (540 generated tasks)
- Kanban, List (custom virtual scrolling), and Timeline views
- Custom drag-and-drop (mouse + touch via Pointer Events)
- Zustand state management
- Live collaboration simulation
- URL-synced filters

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Deploy (example: Vercel)

1. Push this folder to a Git repository.
2. Import the repository in Vercel.
3. Framework preset: `Vite`.
4. Build command: `npm run build`
5. Output directory: `dist`

After deploy, run Lighthouse in Chrome DevTools and verify a performance score >= 85.

## State Management Choice (Why Zustand)

This app uses **Zustand** because:

- We keep a **single shared in-memory dataset** (tasks + presence) and need to render it across multiple views without re-fetching.
- Zustand provides a simple centralized store with fine-grained subscriptions, which keeps view code clean.
- Filtering, sorting, and drag/drop updates all flow through one store, so Kanban/List/Timeline stay consistent.

## Lighthouse Verification

1. Open the deployed app in Chrome.
2. Run **Lighthouse** (Performance) from Chrome DevTools.
3. Confirm the score is **>= 85**.
4. Save the screenshot as `lighthouse-performance.png` and include it in this README.
