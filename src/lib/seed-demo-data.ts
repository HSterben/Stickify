import { slugify } from "@/lib/utils";
import type { BoardColorId, BoardIconId } from "@/lib/board-appearance";

type DemoBoard = {
  name: string;
  icon: BoardIconId;
  color: BoardColorId;
  posts: DemoPost[];
};

type DemoPost = {
  title: string;
  html: string;
  color?: string | null;
  pinned?: boolean;
  tags?: string[];
  url?: string;
  preview?: {
    title?: string;
    description?: string;
    domain?: string;
  };
};

const DEMO_BOARDS: DemoBoard[] = [
  {
    name: "Projects",
    icon: "folder",
    color: "blue",
    posts: [
      {
        title: "Launch checklist",
        pinned: true,
        color: "#bae6fd",
        tags: ["shipping", "web"],
        html: `<h2>Before launch</h2><ul data-type="taskList"><li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked><span></span></label><div><p>Finalize landing copy</p></div></li><li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked><span></span></label><div><p>Connect analytics</p></div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Record product walkthrough</p></div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Send waitlist email</p></div></li></ul>`,
      },
      {
        title: "API auth notes",
        tags: ["backend"],
        html: `<p>Use short-lived tokens and rotate refresh tokens weekly.</p><pre><code class="language-typescript">const session = await auth.getSession()\nif (!session) redirect('/login')</code></pre>`,
      },
      {
        title: "Design system refs",
        tags: ["design"],
        html: `<p>Keep cards at <strong>16px</strong> padding. Accent violet only for primary actions.</p><ul><li>Sidebar icons: soft tinted squares</li><li>Body text: zinc-400</li><li>Titles: zinc-100</li></ul>`,
      },
    ],
  },
  {
    name: "Inspiration",
    icon: "lightbulb",
    color: "pink",
    posts: [
      {
        title: "Homepage mood",
        tags: ["marketing"],
        html: `<p>Quiet product demo. One headline. One screenshot. No feature grid in the hero.</p><p>Look at tools people actually open daily, calm, dense, useful.</p>`,
      },
      {
        title: "Vercel blog",
        tags: ["reading"],
        url: "https://vercel.com/blog",
        preview: {
          title: "Vercel Blog",
          description: "News and product updates from the Vercel team.",
          domain: "vercel.com",
        },
        html: `<p>Use this for OffState’s next landing page structure.</p>`,
      },
      {
        title: "Typography pairing",
        html: `<p>Display: something with character. Body: readable sans. Avoid Inter on marketing pages.</p>`,
      },
    ],
  },
  {
    name: "Study",
    icon: "graduation-cap",
    color: "emerald",
    posts: [
      {
        title: "Week 4 reading",
        pinned: true,
        tags: ["school"],
        html: `<h2>Distributed systems</h2><ul data-type="taskList"><li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked><span></span></label><div><p>Chapter 8, consistency models</p></div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Chapter 9, consensus</p></div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Practice quiz</p></div></li></ul>`,
      },
      {
        title: "SQL join cheatsheet",
        tags: ["sql"],
        html: `<pre><code class="language-sql">SELECT u.name, o.total\nFROM users u\nLEFT JOIN orders o ON o.user_id = u.id;</code></pre><p>Prefer LEFT JOIN when you still want users with no orders.</p>`,
      },
    ],
  },
  {
    name: "Recipes",
    icon: "utensils",
    color: "orange",
    posts: [
      {
        title: "Weeknight pasta",
        tags: ["cooking"],
        color: "#fed7aa",
        html: `<p>Garlic, chili, olive oil, lemon. Done in 20 minutes.</p><ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Boil water</p></div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Toast garlic in oil</p></div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Toss pasta + lemon zest</p></div></li></ul>`,
      },
      {
        title: "Grocery list",
        html: `<ul data-type="taskList"><li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked><span></span></label><div><p>Eggs</p></div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Spinach</p></div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Oat milk</p></div></li></ul>`,
      },
    ],
  },
  {
    name: "Ideas",
    icon: "rocket",
    color: "amber",
    posts: [
      {
        title: "Quick-capture inbox",
        tags: ["product"],
        html: `<p>People should dump a thought without naming a board first.</p><p>Later: route to the right board with a light suggestion.</p>`,
      },
      {
        title: "Screenshot annotations",
        html: `<p>Paste an image, draw one arrow, write one sentence. That’s enough for most bug notes.</p>`,
      },
    ],
  },
  {
    name: "Bookmarks",
    icon: "bookmark",
    color: "sky",
    posts: [
      {
        title: "MDN Flexbox",
        tags: ["docs"],
        url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout",
        preview: {
          title: "CSS flexible box layout",
          description: "A CSS module for laying out elements in one dimension.",
          domain: "developer.mozilla.org",
        },
        html: `<p>Keep this handy for sidebar and card layouts.</p>`,
      },
      {
        title: "TipTap task lists",
        url: "https://tiptap.dev/docs/editor/extensions/nodes/task-list",
        preview: {
          title: "TaskList extension",
          description: "Create task lists with TipTap.",
          domain: "tiptap.dev",
        },
        html: ``,
      },
      {
        title: "Cool repos to revisit",
        html: `<ul><li>shadcn/ui patterns</li><li>raycast extensions for inspiration</li><li>linear-style keyboard shortcuts</li></ul>`,
      },
    ],
  },
  {
    name: "Goals",
    icon: "target",
    color: "violet",
    posts: [
      {
        title: "This month",
        pinned: true,
        tags: ["focus"],
        html: `<ul data-type="taskList"><li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked><span></span></label><div><p>Ship visual editor</p></div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Homepage product screenshot</p></div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Invite 5 friends to try Stickify</p></div></li></ul>`,
      },
    ],
  },
  {
    name: "Workspace",
    icon: "layout-grid",
    color: "indigo",
    posts: [
      {
        title: "Meeting notes, Fri",
        tags: ["work"],
        html: `<p><strong>Attendees:</strong> Alex, Jordan, Sam</p><ul><li>Ship checklist feature this week</li><li>Keep capture flow under 3 clicks</li><li>Follow up on share links</li></ul>`,
      },
      {
        title: "Snippet, debounce",
        html: `<pre><code class="language-javascript">function debounce(fn, ms) {\n  let t\n  return (...args) => {\n    clearTimeout(t)\n    t = setTimeout(() => fn(...args), ms)\n  }\n}</code></pre>`,
      },
    ],
  },
];

export type SeedDemoResult = {
  boards: number;
  posts: number;
};

/**
 * Temporary helper for screenshot/demo accounts.
 * Creates sample boards + posts for the signed-in user.
 */
export async function seedDemoData(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string
): Promise<SeedDemoResult> {
  const { count } = await supabase
    .from("categories")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  const startPosition = count ?? 0;
  let boardsCreated = 0;
  let postsCreated = 0;

  for (let i = 0; i < DEMO_BOARDS.length; i++) {
    const board = DEMO_BOARDS[i];
    const baseSlug = slugify(board.name);
    const slug = `${baseSlug}-demo-${Date.now().toString(36).slice(-4)}${i}`;

    const insertBoard = async (withColor: boolean) =>
      supabase
        .from("categories")
        .insert(
          withColor
            ? {
                user_id: userId,
                name: board.name,
                slug,
                position: startPosition + i,
                icon: board.icon,
                color: board.color,
              }
            : {
                user_id: userId,
                name: board.name,
                slug,
                position: startPosition + i,
                icon: board.icon,
              }
        )
        .select()
        .single();

    let { data: category, error } = await insertBoard(true);
    if (error && /color|schema cache|column/i.test(error.message ?? "")) {
      ({ data: category, error } = await insertBoard(false));
    }
    if (error || !category) {
      throw new Error(error?.message || `Failed to create board "${board.name}"`);
    }

    boardsCreated += 1;

    for (let p = 0; p < board.posts.length; p++) {
      const post = board.posts[p];
      const { data: created, error: postError } = await supabase
        .from("posts")
        .insert({
          user_id: userId,
          category_id: category.id,
          type: "text",
          title: post.title,
          content_text: post.html || null,
          url: post.url ?? null,
          preview_title: post.preview?.title ?? null,
          preview_description: post.preview?.description ?? null,
          preview_domain: post.preview?.domain ?? null,
          color: post.color ?? null,
          is_pinned: !!post.pinned,
          position: p,
        })
        .select("id")
        .single();

      if (postError || !created) {
        throw new Error(postError?.message || `Failed to create post "${post.title}"`);
      }

      postsCreated += 1;

      if (post.tags?.length) {
        for (const tagName of post.tags) {
          const name = tagName.toLowerCase();
          const { data: existing } = await supabase
            .from("tags")
            .select("id")
            .eq("user_id", userId)
            .eq("name", name)
            .maybeSingle();

          let tagId = existing?.id as string | undefined;
          if (!tagId) {
            const { data: made } = await supabase
              .from("tags")
              .insert({ user_id: userId, name })
              .select("id")
              .single();
            tagId = made?.id;
          }
          if (tagId) {
            await supabase
              .from("post_tags")
              .insert({ post_id: created.id, tag_id: tagId });
          }
        }
      }
    }
  }

  return { boards: boardsCreated, posts: postsCreated };
}
