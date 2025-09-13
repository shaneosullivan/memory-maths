"use client";

import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  correctCount: number;
  incorrectCount: number;
  totalCount: number;
  className?: string;
}

export default function ProgressBar({ 
  correctCount, 
  incorrectCount, 
  totalCount,
  className = ''
}: ProgressBarProps) {
  const correctPercentage = (correctCount / totalCount) * 100;
  const incorrectPercentage = (incorrectCount / totalCount) * 100;
  
  return (
    <div className={`${styles.progressBar} ${className}`}>
      {correctCount <= incorrectCount ? (
        <>
          <div
            className={`${styles.progressCorrect} ${styles.progressLeft}`}
            style={{ width: `${correctPercentage}%` }}
          />
          <div
            className={`${styles.progressIncorrect} ${styles.progressRight}`}
            style={{
              width: `${incorrectPercentage}%`,
              left: `${correctPercentage}%`
            }}
          />
        </>
      ) : (
        <>
          <div
            className={`${styles.progressIncorrect} ${styles.progressLeft}`}
            style={{ width: `${incorrectPercentage}%` }}
          />
          <div
            className={`${styles.progressCorrect} ${styles.progressRight}`}
            style={{
              width: `${correctPercentage}%`,
              left: `${incorrectPercentage}%`
            }}
          />
        </>
      )}
    </div>
  );
}