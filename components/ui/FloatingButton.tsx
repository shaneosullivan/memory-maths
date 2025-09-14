import { ReactNode } from 'react';
import { Button } from '.';
import styles from './FloatingButton.module.css';

interface FloatingButtonProps {
  onClick: () => void;
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
}

export function FloatingButton({
  onClick,
  children,
  variant = 'primary',
  size = 'lg',
  disabled = false
}: FloatingButtonProps) {
  return (
    <div className={styles.floatingContainer}>
      <Button
        variant={variant}
        size={size}
        onClick={onClick}
        disabled={disabled}
        className={styles.floatingButton}
      >
        {children}
      </Button>
    </div>
  );
}