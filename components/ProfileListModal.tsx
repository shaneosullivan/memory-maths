"use client";

import { useEffect } from "react";
import { Profile } from "@/types";
import { Button } from "@/components/ui";
import styles from "./ProfileListModal.module.css";

interface ProfileListModalProps {
  profiles: Profile[];
  onSelectProfile: (profile: Profile) => void;
  onDeleteProfile: (profileId: string) => void;
  onClose: () => void;
}

const ProfileListModal = (props: ProfileListModalProps) => {
  const { profiles, onSelectProfile, onDeleteProfile, onClose } = props;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, profileId: string, profileName: string) => {
    e.stopPropagation();

    if (
      window.confirm(
        `Are you sure you want to delete the profile "${profileName}"? This action cannot be undone.`
      )
    ) {
      onDeleteProfile(profileId);
    }
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Select a Profile</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>

        <div className={styles.profileList}>
          {profiles.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No profiles yet</p>
              <p className={styles.emptyHint}>Create your first profile to get started!</p>
            </div>
          ) : (
            profiles.map((profile) => (
              <div key={profile.id} className={styles.profileItem}>
                <button className={styles.profileButton} onClick={() => onSelectProfile(profile)}>
                  <div className={styles.profileInfo}>
                    <div className={styles.profileName}>{profile.name}</div>
                    <div className={styles.profileStats}>
                      {profile.stats.length} session
                      {profile.stats.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </button>
                {!profile.isGuest && (
                  <button
                    className={styles.deleteButton}
                    onClick={(e) => handleDeleteClick(e, profile.id, profile.name)}
                    aria-label={`Delete ${profile.name}`}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileListModal;
