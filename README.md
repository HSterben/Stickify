# Stickify

A personal knowledge board where you save, organize, and revisit everything that matters, notes, code snippets, and bookmarks, all in one place.

## Tech Stack

- **Frontend:** Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- **Backend:** Supabase (Postgres, Auth, Row-Level Security)
- **Animations:** Framer Motion
- **AI:** Vercel AI SDK + OpenRouter (optional, any model)
- **Deployment:** Vercel + Supabase

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/HSterben/Stickify.git
cd Stickify
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration in `supabase/migrations/001_initial.sql`
3. Go to **Authentication > Providers** and enable **Google** (add your OAuth credentials)
4. Go to **Authentication > URL Configuration** and add `http://localhost:3000/auth/callback` as a redirect URL

### 3. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in your Supabase project URL and anon key from **Settings > API**. For AI suggestions, add your [OpenRouter](https://openrouter.ai) API key and optionally set `AI_MODEL` to any model available on OpenRouter (defaults to `google/gemini-2.0-flash-001`).

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

- **Google Auth**, sign in with your Google account
- **Category Boards**, organize saved content into visual boards
- **Three Post Types**, text notes, code snippets with syntax highlighting, and link cards with auto-fetched metadata
- **Tags & Search**, tag anything, filter by type, search across all boards
- **Pin & Archive**, pin important posts, archive old ones
- **AI Suggestions**, optional tag suggestions and content type detection
- **Smooth Animations**, board transitions, modal animations, and card effects
- **Responsive**, works on desktop, tablet, and mobile

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── login/page.tsx        # Google auth
│   ├── auth/callback/        # OAuth callback
│   ├── dashboard/
│   │   ├── layout.tsx        # Dashboard shell (sidebar + topbar)
│   │   ├── page.tsx          # Redirect to first board
│   │   └── [slug]/page.tsx   # Board view
│   └── api/
│       ├── metadata/         # URL metadata fetching
│       └── ai/suggest/       # AI tag/type suggestions
├── components/
│   ├── layout/               # Sidebar, Topbar, DashboardShell
│   ├── board/                # BoardView, PostCard, WelcomeView
│   ├── posts/                # CreatePostModal, EditPostModal, TagInput
│   └── search/               # SearchModal
├── lib/
│   ├── supabase/             # Client, Server, Middleware helpers
│   ├── types/                # Database types
│   └── utils.ts              # Utilities
└── middleware.ts              # Auth middleware
```
