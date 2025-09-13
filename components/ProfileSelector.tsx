"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { useUrlNavigation } from "@/hooks/useUrlNavigation";
import { Profile } from "@/types";
import { Card, Button, Input } from "@/components/ui";
import styles from "./ProfileSelector.module.css";

export default function ProfileSelector() {
  const { createProfile, switchProfile } = useApp();
  const { setProfileId } = useUrlNavigation();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");

  useEffect(() => {
    const savedProfiles = JSON.parse(localStorage.getItem("profiles") || "[]");
    setProfiles(savedProfiles);
  }, []);

  const handleCreateProfile = () => {
    if (newProfileName.trim()) {
      createProfile(newProfileName.trim());
      setProfileId(Date.now().toString()); // Use timestamp as simple ID
      setNewProfileName("");
      setShowCreateForm(false);
    }
  };

  const handleUseGuest = () => {
    createProfile("Guest", true);
    setProfileId("guest");
  };

  const handleSwitchProfile = (profile: Profile) => {
    switchProfile(profile);
    setProfileId(profile.id);
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
            <h2>✨ Your Profiles</h2>
            <div className={styles.profileList}>
              {profiles.map((profile) => (
                <button
                  key={`profile_${profile.id}`}
                  className={styles.profileButton}
                  onClick={() => handleSwitchProfile(profile)}
                >
                  <div>
                    <div className={styles.profileName}>{profile.name}</div>
                    <div className={styles.profileStats}>
                      📊 {profile.stats.length} sessions completed
                    </div>
                  </div>
                  <div className={styles.profileArrow}>→</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={styles.section}>
          {!showCreateForm ? (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => setShowCreateForm(true)}
              icon="✨"
            >
              Create New Profile
            </Button>
          ) : (
            <div className={styles.createForm}>
              <Input
                variant="glass"
                size="lg"
                fullWidth
                placeholder="Enter your name"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateProfile()}
              />
              <div className={styles.formButtons}>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleCreateProfile}
                  disabled={!newProfileName.trim()}
                >
                  Create
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewProfileName("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className={styles.section}>
          <Button
            variant="glass"
            size="lg"
            fullWidth
            onClick={handleUseGuest}
            icon="🎯"
          >
            Continue as Guest
          </Button>
          <p className={styles.guestNote}>💡 Guest progress won't be saved</p>
        </div>
      </Card>
    </div>
  );
}
