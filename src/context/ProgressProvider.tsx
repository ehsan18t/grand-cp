"use client";

import { ProgressProvider as Provider } from "@bprogress/next/app";
import { useEffect, useState } from "react";

const ProgressProvider = ({ children }: { children: React.ReactNode }) => {
  const [height, setHeight] = useState("3px");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const updateHeight = () => setHeight(mediaQuery.matches ? "3px" : "4px");

    updateHeight();
    mediaQuery.addEventListener("change", updateHeight);

    return () => {
      mediaQuery.removeEventListener("change", updateHeight);
    };
  }, []);

  return (
    <Provider
      height={height}
      color="var(--progress-color)"
      options={{ showSpinner: false }}
      shallowRouting
    >
      {children}
    </Provider>
  );
};

export default ProgressProvider;
