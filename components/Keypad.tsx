"use client";

import { PressableButton } from "@/components/ui";
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
    ["0", "", showDecimal ? "." : "", ""],
  ];

  const handleKeyPress = (key: string) => {
    onInput(key);
  };

  const getKeyVariant = (key: string) => {
    if (key === "enter") {
      return "primary";
    }
    if (key === "delete") {
      return "danger";
    }
    return "secondary";
  };

  const getKeyClassName = (key: string) => {
    if (key === "enter") {
      return styles.enterKey;
    }
    if (key === "delete") {
      return styles.deleteKey;
    }
    return styles.numberKey;
  };

  const getKeyLabel = (key: string) => {
    if (key === "delete") {
      return "⌫";
    }
    if (key === "enter") {
      return "✓";
    }
    return key;
  };

  return (
    <div className={styles.keypad}>
      {keys.map((row, rowIndex) => (
        <div key={`keypad_row_${rowIndex}`} className={styles.row}>
          {row.map((key, keyIndex) => {
            if (key === "") {
              return <div key={`keypad_col_${keyIndex}`} className={styles.emptyCell} />;
            }
            return (
              <PressableButton
                key={`keypad_key_${key}`}
                variant={getKeyVariant(key) as any}
                onPress={() => handleKeyPress(key)}
                className={getKeyClassName(key)}
                data-keypad-enter={key === "enter" ? "true" : undefined}
              >
                {getKeyLabel(key)}
              </PressableButton>
            );
          })}
        </div>
      ))}
    </div>
  );
}
