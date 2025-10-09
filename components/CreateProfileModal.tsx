"use client";

import { useState, useMemo } from "react";
import { Button, Input } from "@/components/ui";
import { Profile } from "@/types";
import Modal from "./Modal";
import styles from "./CreateProfileModal.module.css";

/**
 * Modal for creating a new user profile.
 *
 * Features:
 * - Text input for profile name entry
 * - Case-insensitive duplicate name validation
 * - Red error message displayed when duplicate name is entered
 * - Create button disabled when name is empty or duplicate
 * - Enter key submits form when valid
 * - Trims whitespace from entered names
 *
 * @example
 * ```tsx
 * <CreateProfileModal
 *   existingProfiles={profiles}
 *   onCreateProfile={(name) => handleCreate(name)}
 *   onClose={() => setShowModal(false)}
 * />
 * ```
 */
interface CreateProfileModalProps {
  /** Array of existing profiles to check for duplicate names */
  existingProfiles: Profile[];
  /** Callback invoked when user submits a valid profile name */
  onCreateProfile: (name: string) => void;
  /** Callback invoked when modal is closed */
  onClose: () => void;
}

const CreateProfileModal = (props: CreateProfileModalProps) => {
  const { existingProfiles, onCreateProfile, onClose } = props;
  const [profileName, setProfileName] = useState("");

  // Check if the entered name already exists (case-insensitive)
  const isDuplicate = useMemo(() => {
    const trimmedName = profileName.trim().toLowerCase();
    if (!trimmedName) {
      return false;
    }
    return existingProfiles.some((profile) => profile.name.toLowerCase() === trimmedName);
  }, [profileName, existingProfiles]);

  // Name is valid if it's not empty and not a duplicate
  const isValid = profileName.trim() && !isDuplicate;

  const handleCreate = () => {
    if (isValid) {
      onCreateProfile(profileName.trim());
    }
  };

  // Allow Enter key to submit when form is valid
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isValid) {
      handleCreate();
    }
  };

  return (
    <Modal title="Create New Profile" onClose={onClose} maxWidth="sm">
      <div className={styles.content}>
        <Input
          variant="glass"
          size="lg"
          fullWidth
          placeholder="Enter your name"
          value={profileName}
          onChange={(e) => setProfileName(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        {isDuplicate && (
          <div className={styles.error}>A profile with this name already exists</div>
        )}
      </div>

      <div className={styles.footer}>
        <Button variant="secondary" size="md" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" size="md" onClick={handleCreate} disabled={!isValid}>
          Create
        </Button>
      </div>
    </Modal>
  );
};

export default CreateProfileModal;
