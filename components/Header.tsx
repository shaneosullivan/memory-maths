"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { Profile } from "@/types";
import { Button, Input } from "@/components/ui";
import styles from "./Header.module.css";

export default function Header() {
  const { state, switchProfile, deleteProfile } = useApp();
  const [showDropdown, setShowDropdown] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");

  useEffect(() => {
    const savedProfiles = JSON.parse(localStorage.getItem("profiles") || "[]");
    setProfiles(savedProfiles);
  }, []);

  const handleCreateProfile = () => {
    if (newProfileName.trim()) {
      const profile: Profile = {
        id: Date.now().toString(),
        name: newProfileName.trim(),
        isGuest: false,
        stats: [],
        createdAt: new Date(),
        lastUsed: new Date(),
      };

      const updatedProfiles = [...profiles, profile];
      setProfiles(updatedProfiles);
      localStorage.setItem("profiles", JSON.stringify(updatedProfiles));

      switchProfile(profile);
      setNewProfileName("");
      setShowCreateForm(false);
      setShowDropdown(false);
    }
  };

  const handleDeleteProfile = (profileId: string) => {
    const updatedProfiles = profiles.filter((p) => p.id !== profileId);
    setProfiles(updatedProfiles);
    deleteProfile(profileId);
  };

  const handleSwitchProfile = (profile: Profile) => {
    switchProfile(profile);
    setShowDropdown(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.left}>
          <h1 className={styles.title}>Memory Maths</h1>
          <div className={styles.phaseIndicator}>
            {state.phase.charAt(0).toUpperCase() + state.phase.slice(1)} Phase
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.profileDropdown}>
            <button
              className={styles.profileButton}
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {state.currentProfile?.name}
              <span className={styles.arrow}>▼</span>
            </button>

            {showDropdown && (
              <div className={styles.dropdown}>
                {profiles.map((profile) => (
                  <div key={profile.id} className={styles.profileItem}>
                    <Button
                      variant="ghost"
                      className={styles.profileOption}
                      onClick={() => handleSwitchProfile(profile)}
                    >
                      <div>
                        <div className={styles.profileName}>{profile.name}</div>
                        <div className={styles.profileStats}>
                          {profile.stats.length} sessions
                        </div>
                      </div>
                    </Button>
                    {!profile.isGuest && (
                      <Button
                        variant="danger"
                        size="sm"
                        className={styles.deleteButton}
                        onClick={() => handleDeleteProfile(profile.id)}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}

                {/* <div className={styles.dropdownSeparator} /> */}

                {!showCreateForm ? (
                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    onClick={() => setShowCreateForm(true)}
                    icon="+"
                    className={styles.createButton}
                  >
                    Create New Profile
                  </Button>
                ) : (
                  <div className={styles.createForm}>
                    <Input
                      size="md"
                      fullWidth
                      placeholder="Enter your name..."
                      value={newProfileName}
                      onChange={(e) => setNewProfileName(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleCreateProfile()
                      }
                      autoFocus
                    />
                    <div className={styles.formButtons}>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleCreateProfile}
                        disabled={!newProfileName.trim()}
                      >
                        Create
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
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
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
