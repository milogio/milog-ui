"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onStoreChange: () => void) {
  const query = window.matchMedia?.(reducedMotionQuery);
  query?.addEventListener?.("change", onStoreChange);
  return () => query?.removeEventListener?.("change", onStoreChange);
}

function getReducedMotionSnapshot() {
  return Boolean(window.matchMedia?.(reducedMotionQuery).matches);
}

function subscribeToVisibility(onStoreChange: () => void) {
  document.addEventListener("visibilitychange", onStoreChange);
  return () => document.removeEventListener("visibilitychange", onStoreChange);
}

function getVisibilitySnapshot() {
  return document.visibilityState !== "hidden";
}

export function useSamplePlaybackActivity<T extends HTMLElement>() {
  const containerRef = useRef<T>(null);
  const [inView, setInView] = useState(true);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    () => true,
  );
  const pageVisible = useSyncExternalStore(subscribeToVisibility, getVisibilitySnapshot, () => false);

  useEffect(() => {
    if (!containerRef.current || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.05,
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return { containerRef, inView, pageVisible, prefersReducedMotion };
}
