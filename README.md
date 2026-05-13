# OscarsCompanion 🎬

![OscarsCompanion Header](screenshots/header.png)

A companion app for tracking the 2026 Oscar nominations. Browse all nominated films, mark what you've seen, build a watchlist, and track your progress across every category.

**[Live Demo](https://www.oscarscompanion.com)**

![OscarsCompanion App](screenshots/app.png)

---

## Features

- **All 15 categories** — Browse every 2026 Oscar nomination with poster, rating, and nominee
- **Mark as seen** — Track which films you've watched, synced across categories
- **Watchlist** — Save films you want to see
- **Progress tracking** — Sidebar with per-category progress bars
- **Filter view** — Switch between All, Seen, and Watchlist
- **Google Auth** — Sign in to sync your progress across devices
- **Category anchors** — Click a category in the sidebar to jump directly to it

---

## Tech Stack

- **React** — Frontend framework
- **Vite** — Build tool
- **Tailwind CSS** — Styling
- **TMDB API** — Movie data and posters
- **Supabase** — Authentication (Google OAuth) and database (seen/watchlist sync)
- **Vercel** — Deployment

---

## Getting Started

### Prerequisites

- Node.js
- A [TMDB API key](https://www.themoviedb.org/settings/api)
- A [Supabase](https://supabase.com) project with Google OAuth enabled

### Installation

git clone https://github.com/NikolaiVFredriksen/OscarsCompanion
cd OscarsCompanion
npm install

### Environment Variables

Create a `.env` file in the root:

```
VITE_TMDB_API_KEY=your_tmdb_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_REDIRECT_URL=http://localhost:5173
```

### Run Locally

```bash
npm run dev
```

---

## Project Structure

```
src/
├── components/
│   ├── Nominations.jsx
│   ├── Sidebar.jsx
│   ├── StickyProgress.jsx
│   ├── MovieCard.jsx
│   ├── Footer.jsx
│   └── BackToTop.jsx
├── data/
│   └── nominations.json
├── lib/
│   └── supabase.js
└── App.jsx
```

## Author

Nikolai Villanueva Fredriksen
[GitHub](https://github.com/NikolaiVFredriksen)
