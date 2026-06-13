import { cn } from "@/lib/utils";

interface CreatorCreditProps {
  className?: string;
}

export function CreatorCredit({ className }: CreatorCreditProps) {
  return (
    <span className={cn("text-zinc-500", className)}>
      <span className="text-zinc-600" aria-hidden>
        ·
      </span>{" "}
      by sterben
    </span>
  );
}
