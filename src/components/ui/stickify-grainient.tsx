"use client";

import Grainient from "@/components/ui/grainient";

const STICKIFY_GRAINIENT_PROPS = {
  color1: "#593ff8",
  color2: "#854efe",
  color3: "#141414",
  timeSpeed: 0.25,
  colorBalance: 0.0,
  warpStrength: 1.0,
  warpFrequency: 5.0,
  warpSpeed: 2.0,
  warpAmplitude: 50.0,
  blendAngle: 0.0,
  blendSoftness: 0.05,
  rotationAmount: 500.0,
  noiseScale: 2.0,
  grainAmount: 0.08,
  grainScale: 2.0,
  grainAnimated: false,
  contrast: 1.4,
  gamma: 1.0,
  saturation: 1.05,
  centerX: 0.0,
  centerY: -0.05,
  zoom: 0.9,
} as const;

export function StickifyGrainient({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Grainient {...STICKIFY_GRAINIENT_PROPS} />
      {/* Vignette + readability without flattening the gradient */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,transparent_0%,rgba(20,20,20,0.55)_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/70"
        aria-hidden
      />
    </div>
  );
}
