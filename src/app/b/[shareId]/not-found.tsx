import Link from "next/link";
import { StickifyMark, StickifyWordmark } from "@/components/brand/stickify-logo";

export default function PublicBoardNotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
      <div className="mb-6">
        <StickifyMark size="xl" className="opacity-50" />
      </div>
      <h1 className="mb-2 text-xl font-semibold text-zinc-200">
        Board not found
      </h1>
      <p className="mb-8 max-w-sm text-sm text-zinc-500">
        Board is private, deleted, or the link is wrong.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500"
      >
        Go to <StickifyWordmark className="text-sm text-white" />
      </Link>
    </div>
  );
}
