import type { Metadata } from "next";
import Link from "next/link";
import { StickifyLogo, StickifyWordmark } from "@/components/brand/stickify-logo";
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
            <StickifyLogo size="sm" showWordmark={false} />
            <span className="text-sm">
              <StickifyWordmark className="text-sm" />{" "}
              <CreatorCredit className="text-[11px] font-normal text-zinc-500" />
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
