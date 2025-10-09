"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Operation, Phase } from "@/types";

export type Step = "operation" | "baseNumber" | "range" | "practice";

interface UrlState {
  phase: Phase;
  step?: Step;
  operation?: Operation;
  baseNumber?: number;
  rangeMin?: number;
  rangeMax?: number;
  isSquareNumbers?: boolean;
  currentIndex?: number;
  profileId?: string;
  backUrl?: string;
  rainbow?: boolean;
}

export function useUrlNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const getCurrentState = useCallback((): UrlState => {
    const params = new URLSearchParams(searchParams.toString());

    return {
      phase: (params.get("phase") as Phase) || "learning",
      step: (params.get("step") as Step) || undefined,
      operation: (params.get("operation") as Operation) || undefined,
      baseNumber: params.get("baseNumber") ? parseInt(params.get("baseNumber")!) : undefined,
      rangeMin: params.get("rangeMin") ? parseInt(params.get("rangeMin")!) : undefined,
      rangeMax: params.get("rangeMax") ? parseInt(params.get("rangeMax")!) : undefined,
      isSquareNumbers: params.get("isSquareNumbers") === "true",
      currentIndex: params.get("currentIndex") ? parseInt(params.get("currentIndex")!) : undefined,
      profileId: params.get("profileId") || undefined,
      backUrl: params.get("backUrl") || undefined,
      rainbow: params.get("rainbow") === "true",
    };
  }, [searchParams]);

  const updateUrl = useCallback(
    (updates: Partial<UrlState>, replace = false) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.set(key, String(value));
        } else {
          params.delete(key);
        }
      });

      const url = `?${params.toString()}`;

      if (replace) {
        router.replace(url);
      } else {
        router.push(url);
      }
    },
    [router, searchParams]
  );

  const updateUrlWithBack = useCallback(
    (updates: Partial<UrlState>, replace = false) => {
      const currentUrl = searchParams.toString();
      const encodedBackUrl = encodeURIComponent(currentUrl);

      updateUrl(
        {
          ...updates,
          backUrl: encodedBackUrl,
        },
        replace
      );
    },
    [updateUrl, searchParams]
  );

  const navigateToPhase = useCallback(
    (phase: Phase, additionalParams: Partial<UrlState> = {}) => {
      updateUrlWithBack({
        phase,
        step: undefined, // Clear step when changing phases
        currentIndex: undefined, // Clear current index
        ...additionalParams,
      });
    },
    [updateUrlWithBack]
  );

  const navigateToStep = useCallback(
    (step: Step, additionalParams: Partial<UrlState> = {}) => {
      updateUrlWithBack({ step, ...additionalParams });
    },
    [updateUrlWithBack]
  );

  const setOperation = useCallback(
    (operation: Operation) => {
      updateUrlWithBack({ operation, step: "baseNumber" });
    },
    [updateUrlWithBack]
  );

  const setBaseNumber = useCallback(
    (baseNumber: number) => {
      updateUrlWithBack({ baseNumber, step: "range" });
    },
    [updateUrlWithBack]
  );

  const setRange = useCallback(
    (rangeMin: number, rangeMax: number) => {
      updateUrl({ rangeMin, rangeMax });
    },
    [updateUrl]
  );

  const setIsSquareNumbers = useCallback(
    (isSquareNumbers: boolean) => {
      updateUrl({ isSquareNumbers });
    },
    [updateUrl]
  );

  const setCurrentIndex = useCallback(
    (currentIndex: number) => {
      updateUrl({ currentIndex }, true); // Replace URL for index changes
    },
    [updateUrl]
  );

  const setProfileId = useCallback(
    (profileId: string) => {
      updateUrl({ profileId });
    },
    [updateUrl]
  );

  const goBack = useCallback(() => {
    if (typeof window !== "undefined") {
      window.history.back();
    }
  }, []);

  const clearUrlState = useCallback(() => {
    router.push("/");
  }, [router]);

  const getBackUrl = useCallback(() => {
    const currentState = getCurrentState();
    return currentState.backUrl
      ? `?${decodeURIComponent(currentState.backUrl)}`
      : "/?phase=learning";
  }, [getCurrentState]);

  return {
    getCurrentState,
    navigateToPhase,
    navigateToStep,
    setOperation,
    setBaseNumber,
    setRange,
    setIsSquareNumbers,
    setCurrentIndex,
    setProfileId,
    goBack,
    updateUrl,
    clearUrlState,
    getBackUrl,
  };
}
