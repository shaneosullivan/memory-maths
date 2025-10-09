"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import styles from "./Keypad.module.css";

interface KeypadProps {
  onInput: (value: string) => void;
  showDecimal?: boolean;
}

export default function Keypad({ onInput, showDecimal = false }: KeypadProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const keys = [
    ["7", "8", "9", "delete"],
    ["4", "5", "6", ""],
    ["1", "2", "3", ""],
    ["0", "", showDecimal ? "." : "", "enter"],
  ];

  const handleKeyPress = (key: string) => {
    onInput(key);
  };

  const handleTouchStart = (key: string) => {
    setActiveKey(key);
  };

  const handleTouchEnd = (e: React.TouchEvent, key: string) => {
    e.preventDefault();
    setActiveKey(null);
    handleKeyPress(key);
  };

  const handleMouseDown = (key: string) => {
    setActiveKey(key);
  };

  const handleMouseUp = () => {
    setActiveKey(null);
  };

  const getKeyVariant = (key: string) => {
    if (key === "enter") return "primary";
    if (key === "delete") return "danger";
    return "secondary";
  };

  const getKeyClassName = (key: string) => {
    const baseClass = key === "enter" ? styles.enterKey : key === "delete" ? styles.deleteKey : styles.numberKey;
    const activeClass = activeKey === key ? styles.active : "";
    return `${baseClass} ${activeClass}`.trim();
  };

  const getKeyLabel = (key: string) => {
    if (key === "delete") return "⌫";
    if (key === "enter") return "✓";
    return key;
  };

  return (
    <div className={styles.keypad}>
      {keys.map((row, rowIndex) => (
        <div key={`keypad_row_${rowIndex}`} className={styles.row}>
          {row.map((key, keyIndex) => {
            if (key === "") {
              return (
                <div
                  key={`keypad_col_${keyIndex}`}
                  className={styles.emptyCell}
                />
              );
            }
            return (
              <Button
                key={`keypad_key_${key}`}
                variant={getKeyVariant(key) as any}
                onClick={() => handleKeyPress(key)}
                onTouchStart={() => handleTouchStart(key)}
                onTouchEnd={(e) => handleTouchEnd(e, key)}
                onMouseDown={() => handleMouseDown(key)}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className={getKeyClassName(key)}
                data-keypad-enter={key === "enter" ? "true" : undefined}
              >
                {getKeyLabel(key)}
              </Button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
