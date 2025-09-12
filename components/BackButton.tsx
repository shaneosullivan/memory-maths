"use client";

import styles from "./BackButton.module.css";

interface BackButtonProps {
  onClick: () => void;
  children?: React.ReactNode;
}

export default function BackButton({ onClick, children = "← Back" }: BackButtonProps) {
  return (
    <button className={styles.backButton} onClick={onClick}>
      {children}
    </button>
  );
}