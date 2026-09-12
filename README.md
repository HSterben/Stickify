# Stickify

Stickify is a notes app built around boards. You save notes, code, and links as posts, group them on boards, and keep those boards private until you share one.

Sign in with Google. Create a board. Add posts. Tag, search, or share when you need to.

## Why it exists

Useful material ends up spread across browser tabs, chat threads, and drafts you never reopen. Stickify gives that material a fixed home on a board you name, so you can open Projects, Study, or whatever you set up and see what you actually saved.

## What you get

**Boards.** Separate spaces for different topics. Each board can have an icon and color.

**Posts.** One post can hold rich text, checklists, images, tags, and code blocks. Paste a URL for a link preview, or keep a plain link. You don’t choose a post “type” first; you write or paste, then organize.

**Code blocks.** Put code inside a note and copy it with one click.

**Tags and search.** Tag posts on a board, filter by tag, or search across every board at once.

**Pinned posts and layout.** Pin important posts. Switch a board between cards, compact, and list views.

**Sharing.** Boards start private. Publish a board when you want a public link. Turn sharing off later if you change your mind.

**Improve with AI.** While you edit a post, you can ask Stickify to rewrite the draft. It only runs when you use that action. You need an OpenRouter API key for it in self-hosted setups.

## Typical flow

1. Sign in with Google.
2. Create a board from the sidebar.
3. Open the board and add a post (note, checklist, code, link, or a mix).
4. Add tags if you want them.
5. Later, search from the dashboard, filter by tag, or open a shared board URL.

## Privacy

- Boards are private until you publish one.
- Authentication is Google OAuth through Supabase.
- AI rewrite is optional and user-triggered.
- Full details are on the in-app Privacy Policy page.

Stack: Next.js, Supabase, TipTap.
