"use client";

import { Profile } from "@/types";
import Modal from "./Modal";
import styles from "./ProfileListModal.module.css";

/**
 * Modal for displaying and managing user profiles.
 *
 * Features:
 * - Scrollable list of all profiles
 * - Each profile shows name and session count
 * - Click profile to select it
 * - Delete button for non-guest profiles (with confirmation dialog)
 * - Empty state when no profiles exist
 * - Hover effects on profile items
 * - Animated delete icon with scale effect
 *
 * @example
 * ```tsx
 * <ProfileListModal
 *   profiles={allProfiles}
 *   onSelectProfile={(profile) => switchTo(profile)}
 *   onDeleteProfile={(id) => remove(id)}
 *   onClose={() => setShowModal(false)}
 * />
 * ```
 */
interface ProfileListModalProps {
  /** Array of profiles to display in the list */
  profiles: Profile[];
  /** Callback invoked when user clicks a profile to select it */
  onSelectProfile: (profile: Profile) => void;
  /** Callback invoked when user confirms deletion of a profile */
  onDeleteProfile: (profileId: string) => void;
  /** Callback invoked when modal is closed */
  onClose: () => void;
}

const ProfileListModal = (props: ProfileListModalProps) => {
  const { profiles, onSelectProfile, onDeleteProfile, onClose } = props;

  /**
   * Handle delete button click with confirmation dialog.
   * Stops event propagation to prevent profile selection.
   */
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
    <Modal title="Select a Profile" onClose={onClose}>
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
    </Modal>
  );
};

export default ProfileListModal;
