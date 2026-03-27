import { useEffect, useState } from "react";
import { prefersReducedMotion } from "../utils/overdrive";

const easeOutQuint = (value) => 1 - ((1 - value) ** 5);

export const useCountUp = (target, options = {}) => {
  const { duration = 1100, enabled = true } = options;
  const [value, setValue] = useState(() => (enabled ? 0 : target));

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      setValue(target);
      return undefined;
    }

    if (prefersReducedMotion()) {
      setValue(target);
      return undefined;
    }

    let frameId = 0;
    let startTime = 0;

    const step = (timestamp) => {
      if (!startTime) {
        startTime = timestamp;
      }

      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = easeOutQuint(progress);

      setValue(target * easedProgress);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(step);
      }
    };

    setValue(0);
    frameId = window.requestAnimationFrame(step);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [duration, enabled, target]);

  return value;
};
