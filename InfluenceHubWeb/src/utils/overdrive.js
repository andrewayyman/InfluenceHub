import { flushSync } from "react-dom";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export const prefersReducedMotion = () => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
};

export const canUseViewTransitions = () => {
  if (typeof document === "undefined") {
    return false;
  }

  return typeof document.startViewTransition === "function";
};

export const shouldHandleTransitionClick = (event, target) => {
  if (event.defaultPrevented) {
    return false;
  }

  if (event.button !== 0) {
    return false;
  }

  if (event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) {
    return false;
  }

  return !target || target === "_self";
};

export const withOverdriveTransition = (update) => {
  if (!canUseViewTransitions() || prefersReducedMotion()) {
    update();
    return Promise.resolve();
  }

  const transition = document.startViewTransition(() => {
    flushSync(() => {
      update();
    });
  });

  return transition.finished.catch(() => undefined);
};

export const navigateWithOverdrive = (navigate, to, options) =>
  withOverdriveTransition(() => {
    navigate(to, options);
  });
