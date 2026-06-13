import Link from "next/link";
import { Layers } from "lucide-react";

export default function PublicBoardNotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800/50">
        <Layers className="h-8 w-8 text-zinc-600" />
      </div>
      <h1 className="mb-2 text-xl font-semibold text-zinc-200">
        Board not found
      </h1>
      <p className="mb-8 max-w-sm text-sm text-zinc-500">
        This board may be private, deleted, or the link may be incorrect.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500"
      >
        Go to Stickify
      </Link>
    </div>
  );
}
