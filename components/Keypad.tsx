"use client";

import styles from "./Keypad.module.css";

interface KeypadProps {
  onInput: (value: string) => void;
  showDecimal?: boolean;
}

export default function Keypad({ onInput, showDecimal = false }: KeypadProps) {
  const keys = [
    ["7", "8", "9", "delete"],
    ["4", "5", "6", ""],
    ["1", "2", "3", ""],
    ["0", "", showDecimal ? "." : "", "enter"],
  ];

  const handleKeyPress = (key: string) => {
    onInput(key);
  };

  const getKeyClassName = (key: string) => {
    if (key === "enter") return `${styles.key} ${styles.enterKey}`;
    if (key === "delete") return `${styles.key} ${styles.deleteKey}`;
    return styles.key;
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
              <button
                key={`keypad_key_${key}`}
                className={getKeyClassName(key)}
                onClick={() => handleKeyPress(key)}
              >
                {getKeyLabel(key)}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
