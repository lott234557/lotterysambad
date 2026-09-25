"use client";
import { useEffect, useState } from "react";

/** Current epoch ms, ticking every `interval` ms. null during SSR / before mount. */
export function useNow(interval = 1000) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(id);
  }, [interval]);
  return now;
}
