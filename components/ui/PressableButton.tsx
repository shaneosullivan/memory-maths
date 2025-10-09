"use client";

import { useState } from "react";
import Button, { ButtonProps } from "./Button";

/**
 * A button component that handles touch and mouse press interactions with proper gesture detection.
 *
 * Features:
 * - Distance-based touch validation: only triggers onPress if finger hasn't moved more than threshold
 * - Visual feedback: automatically applies 'active' class during press
 * - Prevents accidental activation during scrolling or sliding gestures
 * - Handles edge cases: touch cancellation, disabled state, non-cancelable events
 *
 * @example
 * ```tsx
 * <PressableButton
 *   variant="primary"
 *   onPress={() => console.log('Pressed!')}
 *   moveThreshold={15}
 * >
 *   Click me
 * </PressableButton>
 * ```
 */
interface PressableButtonProps extends Omit<ButtonProps, "onClick"> {
  /** Callback fired when button is successfully pressed (touch didn't move beyond threshold) */
  onPress: () => void;
  /** Maximum distance in pixels finger can move before press is cancelled. Default: 10px */
  moveThreshold?: number;
}

/**
 * A button component with enhanced touch handling for mobile devices.
 * Wraps the standard Button component with gesture detection logic.
 */
export default function PressableButton(props: PressableButtonProps) {
  const {
    onPress,
    moveThreshold = 10,
    disabled,
    className,
    ...rest
  } = props;

  const [isActive, setIsActive] = useState(false);
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null);

  const handlePress = () => {
    if (!disabled) {
      onPress();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) {
      return;
    }
    const touch = e.touches[0];
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });
    setIsActive(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (disabled) {
      return;
    }

    // Only prevent default if the event is cancelable
    if (e.cancelable) {
      e.preventDefault();
    }

    if (!touchStartPos) {
      setIsActive(false);
      setTouchStartPos(null);
      return;
    }

    // Calculate distance moved
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartPos.x;
    const dy = touch.clientY - touchStartPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Only register the press if the touch didn't move too much
    if (distance <= moveThreshold) {
      handlePress();
    }

    setIsActive(false);
    setTouchStartPos(null);
  };

  const handleTouchCancel = () => {
    setIsActive(false);
    setTouchStartPos(null);
  };

  const handleMouseDown = () => {
    if (!disabled) {
      setIsActive(true);
    }
  };

  const handleMouseUp = () => {
    setIsActive(false);
  };

  const handleClick = () => {
    handlePress();
  };

  const buttonClassName = [className, isActive ? "active" : ""].filter(Boolean).join(" ");

  return (
    <Button
      className={buttonClassName}
      disabled={disabled}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      {...rest}
    />
  );
}
