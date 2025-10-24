"use client";

import { Button } from "@/components/ui";
import styles from "./SubmitButton.module.css";

interface SubmitButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const SubmitButton = (props: SubmitButtonProps) => {
  const { onClick, disabled } = props;

  return (
    <Button
      variant="primary"
      size="lg"
      onClick={onClick}
      className={styles.submitButton}
      disabled={disabled}
    >
      ✓
    </Button>
  );
};

export default SubmitButton;
