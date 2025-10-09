"use client";

import { ReactNode } from "react";
import styles from "./NumberGrid.module.css";

interface NumberGridProps {
  numbers: (number | string)[];
  selectedValue?: number | string;
  onSelect: (value: number | string) => void;
  columns?: 4 | 6 | 8;
  variant?: "default" | "keypad";
  disabled?: boolean;
  className?: string;
  renderNumber?: (value: number | string) => ReactNode;
}

export default function NumberGrid({
  numbers,
  selectedValue,
  onSelect,
  columns = 8,
  variant = "default",
  disabled = false,
  className = "",
  renderNumber,
}: NumberGridProps) {
  const containerClass = [
    styles.container,
    styles[`columns-${columns}`],
    styles[variant],
    disabled ? styles.disabled : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClass}>
      {numbers.map((number, index) => (
        <button
          key={`number-${index}`}
          className={`${styles.numberButton} ${selectedValue === number ? styles.selected : ""}`}
          onClick={() => onSelect(number)}
          disabled={disabled}
        >
          {renderNumber ? renderNumber(number) : <span>{number}</span>}
        </button>
      ))}
    </div>
  );
}
