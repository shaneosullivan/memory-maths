"use client";

import { useRouter } from "next/navigation";
import { ButtonLink } from "@/components/ui";
import { useUrlNavigation } from "@/hooks/useUrlNavigation";

interface BackButtonProps {
  children?: React.ReactNode;
  variant?: "secondary" | "ghost";
  size?: "sm" | "md";
  fallbackPath?: string; // Optional fallback if no backUrl
}

export default function BackButton({
  children = "Back",
  variant = "secondary",
  size = "md",
  fallbackPath,
}: BackButtonProps) {
  const { getBackUrl } = useUrlNavigation();
  const router = useRouter();

  const backUrl = getBackUrl();
  const targetUrl = backUrl !== "/?phase=learning" ? backUrl : fallbackPath || "/";

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    if (typeof window === "undefined") {
      router.push(targetUrl);
      return;
    }

    const targetPath = targetUrl.startsWith("?") ? targetUrl : `?${targetUrl}`;
    const maxSteps = 20; // Safety limit
    let attempts = 0;

    const popUntilMatch = () => {
      attempts++;

      // Safety check to prevent infinite loops
      if (attempts > maxSteps || window.history.length <= 1) {
        router.push(targetUrl);
        return;
      }

      const handlePopState = () => {
        window.removeEventListener("popstate", handlePopState);
        const currentUrl = window.location.search || "/";

        if (currentUrl === targetPath) {
          // Found the target URL, we're done
          return;
        } else {
          // Not the target, keep going back
          popUntilMatch();
        }
      };

      window.addEventListener("popstate", handlePopState);
      window.history.back();
    };

    popUntilMatch();
  };

  return (
    <ButtonLink
      variant={variant}
      size={size}
      href={targetUrl}
      onClick={handleClick}
      icon="←"
      style={{ alignSelf: "flex-start", marginBottom: "16px" }}
    >
      {children}
    </ButtonLink>
  );
}
