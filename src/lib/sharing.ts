import { getSiteOrigin } from "@/lib/site";
import type { BoardVisibility, Category } from "@/lib/types/database";

export function generateShareId(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

export function getBoardShareUrl(shareId: string): string {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : getSiteOrigin();
  return `${origin}/b/${shareId}`;
}

export function isBoardPublic(visibility: BoardVisibility | null | undefined): boolean {
  return visibility === "public";
}

/** Treat missing visibility as private (pre-migration rows or rollout window). */
export function getBoardVisibility(
  category: Pick<Category, "visibility"> | { visibility?: BoardVisibility | null }
): BoardVisibility {
  return category.visibility === "public" ? "public" : "private";
}
