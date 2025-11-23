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

    // Simply go back one step in history
    window.history.back();
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
