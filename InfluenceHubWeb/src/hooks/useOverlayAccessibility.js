import { useEffect } from "react";

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

const getFocusableElements = (container) => {
  if (!container) {
    return [];
  }

  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true",
  );
};

export const useOverlayAccessibility = ({
  containerRef,
  initialFocusRef,
  isOpen,
  lockBodyScroll = false,
  onClose,
  triggerRef,
}) => {
  useEffect(() => {
    if (!isOpen || typeof document === "undefined") {
      return undefined;
    }

    const container = containerRef?.current;
    const previousActiveElement = document.activeElement;
    const restoreTrigger = triggerRef?.current;
    const originalOverflow = document.body.style.overflow;
    const focusTarget = initialFocusRef?.current || getFocusableElements(container)[0] || container;

    if (lockBodyScroll) {
      document.body.style.overflow = "hidden";
    }

    focusTarget?.focus?.();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose?.();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = getFocusableElements(container);

      if (focusableElements.length === 0) {
        event.preventDefault();
        container?.focus?.();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }

      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      if (lockBodyScroll) {
        document.body.style.overflow = originalOverflow;
      }

      const restoreTarget = restoreTrigger || previousActiveElement;
      restoreTarget?.focus?.();
    };
  }, [containerRef, initialFocusRef, isOpen, lockBodyScroll, onClose, triggerRef]);
};
