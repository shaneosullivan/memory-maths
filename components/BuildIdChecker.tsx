"use client";

import { useEffect } from "react";
import { BUILD_ID } from "@/lib/config";

const LAST_REFRESH_KEY = "lastBuildIdRefresh";
const REFRESH_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

export default function BuildIdChecker() {
  useEffect(() => {
    const checkBuildId = async () => {
      try {
        const response = await fetch("/api/buildId");
        if (response.ok) {
          const data = await response.json();
          if (data.buildId && data.buildId !== BUILD_ID) {
            // Check if we've refreshed recently to prevent infinite loops
            const lastRefreshTime = localStorage.getItem(LAST_REFRESH_KEY);
            const now = Date.now();

            if (lastRefreshTime) {
              const timeSinceLastRefresh = now - parseInt(lastRefreshTime);
              if (timeSinceLastRefresh < REFRESH_COOLDOWN_MS) {
                return;
              }
            }

            // Store refresh time before reloading
            localStorage.setItem(LAST_REFRESH_KEY, now.toString());
            window.location.reload();
          }
        }
      } catch (error) {
        // Silently fail - don't disrupt the user experience if API is unavailable
        console.warn("Failed to check build ID:", error);
      }
    };

    const handleFocus = () => {
      checkBuildId();
    };

    // Add focus event listener
    window.addEventListener("focus", handleFocus);

    // Cleanup
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // This component doesn't render anything
  return null;
}
