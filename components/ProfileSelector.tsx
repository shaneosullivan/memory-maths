"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { Profile } from "@/types";
import styles from "./ProfileSelector.module.css";

export default function ProfileSelector() {
  const { createProfile, switchProfile } = useApp();
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
      setNewProfileName("");
      setShowCreateForm(false);
    }
  };

  const handleUseGuest = () => {
    createProfile("Guest", true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Memory Maths</h1>
        <p className={styles.subtitle}>
          Choose or create a profile to track your progress
        </p>

        {profiles.length > 0 && (
          <div className={styles.section}>
            <h2>Existing Profiles</h2>
            <div className={styles.profileList}>
              {profiles.map((profile) => (
                <button
                  key={`profile_${profile.id}`}
                  className={styles.profileButton}
                  onClick={() => switchProfile(profile)}
                >
                  <div className={styles.profileName}>{profile.name}</div>
                  <div className={styles.profileStats}>
                    {profile.stats.length} sessions
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={styles.section}>
          {!showCreateForm ? (
            <button
              className={styles.primaryButton}
              onClick={() => setShowCreateForm(true)}
            >
              Create New Profile
            </button>
          ) : (
            <div className={styles.createForm}>
              <input
                type="text"
                placeholder="Enter your name"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                className={styles.nameInput}
                onKeyPress={(e) => e.key === "Enter" && handleCreateProfile()}
              />
              <div className={styles.formButtons}>
                <button
                  className={styles.primaryButton}
                  onClick={handleCreateProfile}
                  disabled={!newProfileName.trim()}
                >
                  Create
                </button>
                <button
                  className={styles.secondaryButton}
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewProfileName("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={styles.section}>
          <button className={styles.guestButton} onClick={handleUseGuest}>
            Continue as Guest
          </button>
          <p className={styles.guestNote}>Guest progress won't be saved</p>
        </div>
      </div>
    </div>
  );
}
