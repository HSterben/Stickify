import type { Metadata } from "next";
import Link from "next/link";
import { Layers, ArrowLeft } from "lucide-react";
import { CreatorCredit } from "@/components/ui/creator-credit";

export const metadata: Metadata = {
  title: "Privacy Policy | Stickify",
  description: "How Stickify handles your data, sign-in cookies, and analytics.",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-zinc-800/80">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-violet-400" />
            <span className="text-sm font-semibold">Stickify</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-zinc-500">Last updated: June 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-zinc-300">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">What we collect</h2>
            <p>
              When you sign in with Google, we store your account info (email, name,
              profile picture) so you can use Stickify. Your boards and posts are
              stored in our database and tied to your account.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">Cookies</h2>
            <p>
              Stickify does <strong className="text-white">not</strong> use marketing
              or tracking cookies. We do not show a cookie consent banner because
              there are no optional cookies to accept or decline.
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-zinc-400">
              <li>
                <strong className="text-zinc-300">Sign-in cookies</strong> — When you
                log in, Supabase sets session cookies so you stay signed in. These are
                required for the app to work. They are not used for ads or tracking.
              </li>
              <li>
                <strong className="text-zinc-300">Analytics</strong> — We use Vercel
                Web Analytics on the site. It is cookieless and does not collect
                personal data.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">Sharing boards</h2>
            <p>
              Boards are private by default. If you turn a board public, anyone with
              the link can view it. You can switch it back to private anytime.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">Third parties</h2>
            <p>
              Sign-in is handled by Google (OAuth) and Supabase (hosting and database).
              Link previews may fetch metadata from URLs you save. AI tag suggestions
              are optional and only run when you create a post.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">Your data</h2>
            <p>
              You can delete boards and posts from the app. To delete your account and
              all associated data, contact us and we will remove it.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">Contact</h2>
            <p>
              Questions about privacy? Reach out through the same channel you use to
              contact Stickify support.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-zinc-800/80 py-8 text-center text-xs text-zinc-500">
        <CreatorCredit />
      </footer>
    </div>
  );
}
