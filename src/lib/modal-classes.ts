/** Shared layout classes for full-screen modals (portaled to document.body). */

export const MODAL_ROOT =
  "fixed inset-0 z-50 flex items-start justify-center p-4 pt-[max(1rem,env(safe-area-inset-top,0px))] pb-[max(1rem,env(safe-area-inset-bottom,0px))] sm:items-center";

export const MODAL_BACKDROP = "absolute inset-0 bg-black/60 backdrop-blur-sm";

export const MODAL_MAX_HEIGHT =
  "max-h-[min(85vh,calc(100dvh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)-2rem))]";

export const MODAL_MAX_HEIGHT_LG =
  "max-h-[min(90vh,calc(100dvh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)-2rem))]";
