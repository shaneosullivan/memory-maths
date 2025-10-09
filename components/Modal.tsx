"use client";

import { useEffect, ReactNode } from "react";
import styles from "./Modal.module.css";

/**
 * Modal component that provides a reusable dialog with backdrop overlay.
 *
 * Features:
 * - Backdrop with blur effect that darkens the background
 * - Click outside the modal to close
 * - Press ESC key to close
 * - Customizable width (sm: 400px, md: 500px, lg: 600px)
 * - Smooth fade-in and slide-up animations
 * - Optional close button (× icon) in the header
 *
 * @example
 * ```tsx
 * <Modal title="Confirm Action" onClose={() => setShowModal(false)} maxWidth="sm">
 *   <div>Are you sure you want to continue?</div>
 *   <button onClick={handleConfirm}>Confirm</button>
 * </Modal>
 * ```
 */
interface ModalProps {
  /** The title displayed in the modal header */
  title: string;
  /** Callback function invoked when the modal should close (ESC key, backdrop click, or close button) */
  onClose: () => void;
  /** The content to display inside the modal */
  children: ReactNode;
  /** Maximum width of the modal. Defaults to "md" (500px) */
  maxWidth?: "sm" | "md" | "lg";
  /** Whether to show the close button (×) in the header. Defaults to true */
  showCloseButton?: boolean;
}

const Modal = (props: ModalProps) => {
  const { title, onClose, children, maxWidth = "md", showCloseButton = true } = props;

  // Handle ESC key press to close the modal
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

  // Handle clicks on the backdrop (outside the modal) to close it
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={`${styles.modal} ${styles[maxWidth]}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          {showCloseButton && (
            <button className={styles.closeButton} onClick={onClose} aria-label="Close modal">
              ×
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
