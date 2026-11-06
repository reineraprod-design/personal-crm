"use client";

import { useEffect } from "react";

export function ScrollIntoView({ elementId }: { elementId: string }) {
  useEffect(() => {
    document.getElementById(elementId)?.scrollIntoView({ block: "center" });
  }, [elementId]);

  return null;
}
