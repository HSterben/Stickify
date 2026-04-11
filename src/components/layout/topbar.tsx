"use client";

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { Profile } from "@/lib/types/database";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Search, LogOut, ChevronDown } from "lucide-react";
import { SearchModal } from "@/components/search/search-modal";
import Image from "next/image";

interface TopbarProps {
  user: User;
  profile: Profile | null;
}

export function Topbar({ user, profile }: TopbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const displayName =
    profile?.full_name ??
    user.user_metadata?.full_name ??
    user.email?.split("@")[0] ??
    "User";

  const avatarUrl =
    profile?.avatar_url ??
    user.user_metadata?.avatar_url ??
    user.user_metadata?.picture;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <header className="relative z-30 flex h-14 shrink-0 items-center gap-3 border-b border-zinc-800/50 bg-background/80 px-4 backdrop-blur-sm lg:gap-4 lg:px-6">
        <div className="flex min-w-0 flex-1 items-center pl-12 lg:pl-0">
          <button
            type="button"
            aria-label="Search posts"
            onClick={() => setSearchOpen(true)}
            className="flex h-10 w-full max-w-none items-center gap-3 rounded-xl border border-zinc-800/50 bg-zinc-900/50 px-4 py-2 text-left text-sm text-zinc-500 transition-colors hover:border-zinc-700 hover:text-zinc-400"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="min-w-0 flex-1 truncate hidden sm:block">Search posts...</span>
            <kbd className="ml-auto hidden shrink-0 rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-500 sm:inline">
              ⌘K
            </kbd>
          </button>
        </div>

        <div className="relative shrink-0">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-zinc-800/50"
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={displayName}
                width={28}
                height={28}
                className="rounded-full"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/20 text-xs font-medium text-violet-300">
                {displayName[0]?.toUpperCase()}
              </div>
            )}
            <span className="hidden text-sm font-medium sm:inline">{displayName}</span>
            <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl">
                <div className="border-b border-zinc-800 px-4 py-3">
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-zinc-500">{user.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
