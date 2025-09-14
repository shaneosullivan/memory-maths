"use client";

import { Suspense, useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { useUrlNavigation } from "@/hooks/useUrlNavigation";
import ProfileSelector from "@/components/ProfileSelector";
import Header from "@/components/Header";
import LearningPhase from "@/components/LearningPhase";
import PracticePhase from "@/components/PracticePhase";
import TestPhase from "@/components/TestPhase";
import styles from "./page.module.css";

function AppContent() {
  const { state, createProfile } = useApp();
  const { getCurrentState, setProfileId } = useUrlNavigation();
  const urlState = getCurrentState();

  // Check if we should auto-create guest profile (synchronously to prevent flash)
  // Only create guest profile if:
  // 1. No current profile loaded
  // 2. Not currently loading a profile 
  // 3. Either explicitly requesting guest OR no profile ID but has active session data
  const shouldAutoCreateGuest =
    !state.currentProfile &&
    !state.isProfileLoading &&
    (urlState.profileId === "guest" ||
      (!urlState.profileId && (
        urlState.operation ||
        urlState.baseNumber ||
        urlState.rangeMin ||
        urlState.phase !== "learning"
      )));

  // Auto-create guest profile when needed
  useEffect(() => {
    if (shouldAutoCreateGuest) {
      createProfile("Guest", true);
      if (urlState.profileId !== "guest") {
        setProfileId("guest");
      }
    }
  }, [shouldAutoCreateGuest, createProfile, setProfileId, urlState.profileId]);

  // Show loading while profile is being loaded
  if (state.isProfileLoading) {
    return <div></div>;
  }

  // Show loading instead of ProfileSelector when we should auto-create guest
  if (!state.currentProfile && shouldAutoCreateGuest) {
    return <div></div>;
  }

  if (!state.currentProfile) {
    return <ProfileSelector />;
  }

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        {(!urlState.phase || urlState.phase === "learning") && (
          <LearningPhase />
        )}
        {urlState.phase === "practice" && <PracticePhase />}
        {urlState.phase === "test" && <TestPhase />}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div></div>}>
      <AppContent />
    </Suspense>
  );
}
