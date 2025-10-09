"use client";

import { useEffect, useState } from "react";
import styles from "./RainbowTimer.module.css";

interface RainbowTimerProps {
  /** Duration in seconds */
  duration: number;
  /** Callback when timer expires */
  onTimeout: () => void;
  /** Reset key to restart timer (optional) */
  resetKey?: number;
}

/**
 * A circular SVG pie timer with rainbow gradient that counts down.
 * The pie starts full and shrinks as time runs out.
 */
const RainbowTimer = (props: RainbowTimerProps) => {
  const { duration, onTimeout, resetKey } = props;
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // Reset timer when resetKey changes
    setTimeLeft(duration);
    setIsExpired(false);
  }, [resetKey, duration]);

  useEffect(() => {
    if (timeLeft <= 0 && !isExpired) {
      setIsExpired(true);
      onTimeout();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 0.01));
    }, 10);

    return () => {
      clearInterval(interval);
    };
  }, [timeLeft, isExpired, onTimeout]);

  // Calculate the percentage of time remaining
  const percentage = (timeLeft / duration) * 100;

  // Calculate angle for the remaining time (360 = full circle, 0 = empty)
  const angle = (percentage / 100) * 360;

  // Convert angle to radians for trigonometry
  const radius = 45;
  const centerX = 50;
  const centerY = 50;

  // Calculate the end point of the pie slice
  const angleRadians = ((angle - 90) * Math.PI) / 180;
  const x = centerX + radius * Math.cos(angleRadians);
  const y = centerY + radius * Math.sin(angleRadians);

  // Determine if we need large arc flag (for angles > 180)
  const largeArcFlag = angle > 180 ? 1 : 0;

  // Create the path for the pie slice (showing remaining time)
  const pathData =
    angle === 0
      ? "" // Empty path when time is up
      : angle >= 360
        ? `M ${centerX},${centerY} m 0,-${radius} a ${radius},${radius} 0 1,1 0,${radius * 2} a ${radius},${radius} 0 1,1 0,-${radius * 2}` // Full circle at start
        : `M ${centerX},${centerY} L ${centerX},${centerY - radius} A ${radius},${radius} 0 ${largeArcFlag},1 ${x},${y} Z`;

  return (
    <div className={styles.container}>
      <svg className={styles.timer} viewBox="0 0 100 100">
        <defs>
          <radialGradient id="rainbowGradient">
            <stop offset="0%" stopColor="#ff0000" />
            <stop offset="20%" stopColor="#ff7f00" />
            <stop offset="40%" stopColor="#ffff00" />
            <stop offset="60%" stopColor="#00ff00" />
            <stop offset="80%" stopColor="#00bfff" />
            <stop offset="100%" stopColor="#ff69b4" />
          </radialGradient>
          <mask id="pieMask">
            <rect width="100" height="100" fill="black" />
            <path d={pathData} fill="white" />
          </mask>
        </defs>

        {/* Background circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="rgba(0, 0, 0, 0.1)"
          strokeWidth="2"
        />

        {/* Full rainbow circle with pie mask applied */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="url(#rainbowGradient)"
          opacity="0.9"
          mask="url(#pieMask)"
        />
      </svg>
      <div className={styles.label}>🌈 Rainbow Challenge</div>
    </div>
  );
};

export default RainbowTimer;
