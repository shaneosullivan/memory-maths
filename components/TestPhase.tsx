"use client";

import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Operation } from "@/types";
import Keypad from "@/components/Keypad";
import BackButton from "@/components/BackButton";
import styles from "./TestPhase.module.css";

export default function TestPhase() {
  const { state, submitAnswer, skipQuestion, moveToPhase } = useApp();
  const [currentInput, setCurrentInput] = useState("");

  const currentCalculation = state.calculations[state.currentCalculationIndex];
  const isComplete = state.calculations.every(
    (calc) => calc.userAnswer !== undefined || calc.skipped
  );
  const completedCount = state.calculations.filter(
    (calc) => calc.userAnswer !== undefined || calc.skipped
  ).length;
  const correctCount = state.calculations.filter(
    (calc) => calc.isCorrect && calc.userAnswer !== undefined
  ).length;
  const incorrectCount = completedCount - correctCount;

  const getOperationSymbol = (operation: Operation) => {
    switch (operation) {
      case "addition":
        return "+";
      case "subtraction":
        return "−";
      case "multiplication":
        return "×";
      case "division":
        return "÷";
    }
  };

  const handleKeypadInput = (value: string) => {
    if (value === "delete") {
      setCurrentInput(currentInput.slice(0, -1));
    } else if (value === "enter") {
      if (currentInput) {
        const answer = parseFloat(currentInput);
        submitAnswer(answer);
        setCurrentInput("");
      }
    } else if (value === ".") {
      // Only allow one decimal point
      if (!currentInput.includes(".")) {
        setCurrentInput(currentInput + value);
      }
    } else {
      setCurrentInput(currentInput + value);
    }
  };

  const handleSkip = () => {
    skipQuestion();
    setCurrentInput("");
  };

  const handleBackToLearning = () => {
    moveToPhase("learning");
  };

  if (!currentCalculation && !isComplete) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>No calculations available</h2>
          <p>Please go back to the Learning Phase to generate calculations.</p>
          <BackButton onClick={handleBackToLearning}>
            Back to Learning
          </BackButton>
        </div>
      </div>
    );
  }

  if (isComplete) {
    const correctAnswers = state.calculations.filter(
      (calc) => calc.isCorrect
    ).length;
    const skippedCount = state.calculations.filter(
      (calc) => calc.skipped
    ).length;
    const totalQuestions = state.calculations.length;
    const accuracy = Math.round((correctAnswers / totalQuestions) * 100);

    // Save stats to profile (if not guest)
    if (state.currentProfile && !state.currentProfile.isGuest) {
      const sessionStats = {
        mistakes: state.sessionMistakes,
        totalQuestions,
        operation: state.operation!,
        baseNumber: state.baseNumber,
        rangeMin: state.rangeMin,
        rangeMax: state.rangeMax,
        completedAt: new Date(),
        phase: "test" as const,
      };

      // Update profile stats
      const updatedProfile = {
        ...state.currentProfile,
        stats: [...state.currentProfile.stats, sessionStats],
        lastUsed: new Date(),
      };

      // Save to localStorage
      const profiles = JSON.parse(localStorage.getItem("profiles") || "[]");
      const profileIndex = profiles.findIndex(
        (p: any) => p.id === updatedProfile.id
      );
      if (profileIndex >= 0) {
        profiles[profileIndex] = updatedProfile;
        localStorage.setItem("profiles", JSON.stringify(profiles));
        localStorage.setItem("currentProfile", JSON.stringify(updatedProfile));
      }
    }

    return (
      <div className={styles.container}>
        <div className={styles.summary}>
          <h2>Test Phase Complete!</h2>
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{state.sessionMistakes}</div>
              <div className={styles.statLabel}>Total Mistakes</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{correctAnswers}</div>
              <div className={styles.statLabel}>Correct Answers</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{skippedCount}</div>
              <div className={styles.statLabel}>Skipped</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{accuracy}%</div>
              <div className={styles.statLabel}>Accuracy</div>
            </div>
          </div>

          <div className={styles.breakdown}>
            <h3>Question Breakdown</h3>
            <div className={styles.questionList}>
              {state.calculations.map((calc, index) => (
                <div
                  key={`test_calc_${calc.id}`}
                  className={`${styles.questionItem} ${
                    calc.skipped
                      ? styles.skipped
                      : calc.isCorrect
                      ? styles.correct
                      : styles.incorrect
                  }`}
                >
                  <div className={styles.questionText}>
                    {calc.operand1} {getOperationSymbol(calc.operation)}{" "}
                    {calc.operand2} = {calc.answer}
                  </div>
                  <div className={styles.userResponse}>
                    {calc.skipped
                      ? "Skipped"
                      : `Your answer: ${calc.userAnswer}`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.actions}>
            <button
              className={styles.newTestButton}
              onClick={handleBackToLearning}
            >
              Start New Session
            </button>
            <button
              className={styles.retryButton}
              onClick={() => moveToPhase("test")}
            >
              Retry Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Test Phase</h2>
        <div className={styles.progress}>
          <div className={styles.progressBar}>
            {correctCount <= incorrectCount ? (
              <>
                <div
                  className={`${styles.progressCorrect} ${styles.progressLeft}`}
                  style={{
                    width: `${
                      (correctCount / state.calculations.length) * 100
                    }%`,
                  }}
                />
                <div
                  className={`${styles.progressIncorrect} ${styles.progressRight}`}
                  style={{
                    width: `${
                      (incorrectCount / state.calculations.length) * 100
                    }%`,
                    left: `${
                      (correctCount / state.calculations.length) * 100
                    }%`,
                  }}
                />
              </>
            ) : (
              <>
                <div
                  className={`${styles.progressIncorrect} ${styles.progressLeft}`}
                  style={{
                    width: `${
                      (incorrectCount / state.calculations.length) * 100
                    }%`,
                  }}
                />
                <div
                  className={`${styles.progressCorrect} ${styles.progressRight}`}
                  style={{
                    width: `${
                      (correctCount / state.calculations.length) * 100
                    }%`,
                    left: `${
                      (incorrectCount / state.calculations.length) * 100
                    }%`,
                  }}
                />
              </>
            )}
          </div>
          <div className={styles.progressText}>
            {completedCount} / {state.calculations.length} ({correctCount}{" "}
            correct, {incorrectCount} incorrect)
          </div>
        </div>
        <div className={styles.mistakes}>Mistakes: {state.sessionMistakes}</div>
      </div>

      <div className={styles.content}>
        <div className={styles.questionSection}>
          <BackButton onClick={() => moveToPhase("learning")} />
          <div className={styles.question}>
            <span className={styles.operand}>
              {currentCalculation.operand1}
            </span>
            <span className={styles.operator}>
              {getOperationSymbol(currentCalculation.operation)}
            </span>
            <span className={styles.operand}>
              {currentCalculation.operand2}
            </span>
            <span className={styles.equals}>=</span>
            <span className={styles.answer}>{currentInput || "?"}</span>
          </div>

          <div className={styles.questionActions}>
            <button className={styles.skipButton} onClick={handleSkip}>
              Skip Question
            </button>
          </div>
        </div>

        <div className={styles.keypadSection}>
          <Keypad
            onInput={handleKeypadInput}
            showDecimal={state.operation === "division"}
          />
        </div>
      </div>
    </div>
  );
}
