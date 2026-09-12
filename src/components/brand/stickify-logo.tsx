import Image from "next/image";
import { cn } from "@/lib/utils";

const markSizes = {
  xs: 20,
  sm: 24,
  md: 36,
  lg: 44,
  xl: 64,
} as const;

export type StickifyLogoSize = keyof typeof markSizes;

type StickifyLogoProps = {
  size?: StickifyLogoSize;
  showWordmark?: boolean;
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
  priority?: boolean;
};

export function StickifyWordmark({
  className,
}: {
  className?: string;
}) {
  return (
    <span className={cn("font-bold tracking-tight", className)}>
      Stickify
    </span>
  );
}

export function StickifyMark({
  size = "md",
  className,
  priority = false,
}: {
  size?: StickifyLogoSize;
  className?: string;
  priority?: boolean;
}) {
  const px = markSizes[size];
  return (
    <Image
      src="/logo.png"
      alt=""
      width={px}
      height={px}
      priority={priority}
      className={cn("shrink-0 object-contain", className)}
      aria-hidden
    />
  );
}

export function StickifyLogo({
  size = "md",
  showWordmark = true,
  className,
  markClassName,
  wordmarkClassName,
  priority = false,
}: StickifyLogoProps) {
  const wordSize =
    size === "xs" || size === "sm"
      ? "text-sm"
      : size === "lg" || size === "xl"
        ? "text-xl"
        : "text-lg";

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <StickifyMark size={size} className={markClassName} priority={priority} />
      {showWordmark ? (
        <StickifyWordmark className={cn(wordSize, wordmarkClassName)} />
      ) : null}
    </span>
  );
}
