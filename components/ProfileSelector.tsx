"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { useUrlNavigation } from "@/hooks/useUrlNavigation";
import { Profile } from "@/types";
import { Card, Button } from "@/components/ui";
import ProfileListModal from "./ProfileListModal";
import CreateProfileModal from "./CreateProfileModal";
import styles from "./ProfileSelector.module.css";
import { LOCAL_STORAGE_PROFILES_KEY } from "@/lib/consts";
import { localStorage } from "@/utils/storage";

export default function ProfileSelector() {
  const { createProfile, switchProfile, deleteProfile } = useApp();
  const { setProfileId } = useUrlNavigation();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProfileListModal, setShowProfileListModal] = useState(false);

  useEffect(() => {
    const savedProfiles = localStorage.getJSONItem<Profile[]>(LOCAL_STORAGE_PROFILES_KEY, []);
    setProfiles(savedProfiles);
  }, []);

  const handleCreateProfile = (name: string) => {
    createProfile(name);
    setProfileId(Date.now().toString()); // Use timestamp as simple ID
    setShowCreateModal(false);
  };

  const handleUseGuest = () => {
    createProfile("Guest", true);
    setProfileId("guest");
  };

  const handleSwitchProfile = (profile: Profile) => {
    switchProfile(profile);
    setProfileId(profile.id);
    setShowProfileListModal(false);
  };

  const handleDeleteProfile = (profileId: string) => {
    const updatedProfiles = profiles.filter((p) => p.id !== profileId);
    setProfiles(updatedProfiles);
    deleteProfile(profileId);
  };

  return (
    <div className={styles.container}>
      <Card variant="gradient" padding="xl" className={styles.card}>
        <div className={styles.hero}>
          <div className={styles.mathIcon}>∑</div>
          <h1 className={styles.title}>Memory Maths</h1>
          <p className={styles.subtitle}>
            Master arithmetic through memory training and unlock your mathematical potential
          </p>
        </div>

        {profiles.length > 0 && (
          <div className={styles.section}>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => setShowProfileListModal(true)}
              icon="👤"
              className={styles.useExistingButton}
            >
              Use Existing Profile
            </Button>
          </div>
        )}

        <div className={styles.section}>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => setShowCreateModal(true)}
            icon="✨"
          >
            Create New Profile
          </Button>
        </div>

        <div className={styles.section}>
          <Button variant="glass" size="lg" fullWidth onClick={handleUseGuest} icon="🎯">
            Continue as Guest
          </Button>
          <p className={styles.guestNote}>💡 Guest progress won't be saved</p>
        </div>
      </Card>

      {showProfileListModal && (
        <ProfileListModal
          profiles={profiles}
          onSelectProfile={handleSwitchProfile}
          onDeleteProfile={handleDeleteProfile}
          onClose={() => setShowProfileListModal(false)}
        />
      )}

      {showCreateModal && (
        <CreateProfileModal
          existingProfiles={profiles}
          onCreateProfile={handleCreateProfile}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}
