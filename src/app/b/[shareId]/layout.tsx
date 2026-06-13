import type { Metadata } from "next";
import Link from "next/link";
import { Layers } from "lucide-react";
import { CreatorCredit } from "@/components/ui/creator-credit";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function PublicBoardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 shadow-md shadow-violet-500/20">
              <Layers className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight">
              Stickify <CreatorCredit className="text-[11px] font-normal text-zinc-500" />
            </span>
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-violet-600 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-violet-500"
          >
            Sign up
          </Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
