"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { Operation, Profile } from "@/types";
import { useUrlNavigation } from "@/hooks/useUrlNavigation";
import Keypad from "@/components/Keypad";
import BackButton from "@/components/BackButton";
import { GradientHeader, ProgressBar, Button, Card } from "@/components/ui";
import styles from "./TestPhase.module.css";
import {
  LOCAL_STORAGE_CURRENT_PROFILE_KEY,
  LOCAL_STORAGE_PROFILES_KEY,
} from "@/lib/consts";
import { localStorage } from "@/utils/storage";

export default function TestPhase() {
  const {
    state,
    dispatch,
    submitAnswer,
    skipQuestion,
    moveToPhase,
    generateCalculations,
    setOperation,
    setBaseNumber,
    setRangeMin,
    setRangeMax,
    setIsSquareNumbers,
  } = useApp();
  const { navigateToPhase, clearUrlState, getCurrentState, setCurrentIndex } =
    useUrlNavigation();
  const [currentInput, setCurrentInput] = useState("");

  // Sync AppContext with URL state when component mounts
  useEffect(() => {
    const urlState = getCurrentState();

    // If URL has parameters but AppContext doesn't, sync them
    if (urlState.operation && !state.operation) {
      setOperation(urlState.operation);
    }
    if (urlState.baseNumber && urlState.baseNumber !== state.baseNumber) {
      setBaseNumber(urlState.baseNumber);
    }
    if (urlState.rangeMin && urlState.rangeMin !== state.rangeMin) {
      setRangeMin(urlState.rangeMin);
    }
    if (urlState.rangeMax && urlState.rangeMax !== state.rangeMax) {
      setRangeMax(urlState.rangeMax);
    }
    if (
      urlState.isSquareNumbers !== undefined &&
      urlState.isSquareNumbers !== state.isSquareNumbers
    ) {
      setIsSquareNumbers(urlState.isSquareNumbers);
    }

    // If we have all the URL parameters but no calculations, generate them
    if (
      urlState.operation &&
      urlState.rangeMin &&
      urlState.rangeMax &&
      state.calculations.length === 0
    ) {
      generateCalculations({
        operation: urlState.operation,
        baseNumber: urlState.baseNumber || state.baseNumber || 2,
        rangeMin: urlState.rangeMin,
        rangeMax: urlState.rangeMax,
        isSquareNumbers: urlState.isSquareNumbers || false,
      });

      // Shuffle calculations for test phase after generation
      setTimeout(() => {
        if (state.calculations.length > 0) {
          const shuffledCalculations = [...state.calculations]
            .map((calc) => ({
              ...calc,
              showAnswer: false,
              userAnswer: undefined,
              isCorrect: undefined,
              skipped: undefined,
            }))
            .sort(() => Math.random() - 0.5);

          // Update calculations and reset session
          dispatch({ type: "SET_CALCULATIONS", payload: shuffledCalculations });
          dispatch({ type: "RESET_SESSION" });

          // Set current index from URL if available
          if (
            urlState.currentIndex !== undefined &&
            urlState.currentIndex !== state.currentCalculationIndex
          ) {
            dispatch({
              type: "SET_CURRENT_INDEX",
              payload: urlState.currentIndex,
            });
          }
        }
      }, 100);
    }

    // Sync current index from URL
    if (
      urlState.currentIndex !== undefined &&
      urlState.currentIndex !== state.currentCalculationIndex &&
      state.calculations.length > 0
    ) {
      dispatch({ type: "SET_CURRENT_INDEX", payload: urlState.currentIndex });
    }
  }, []); // Only run once on mount

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

  const handleSubmitAnswer = (answer: number) => {
    const oldIndex = state.currentCalculationIndex;
    submitAnswer(answer);

    // Update URL with new index after submission
    setTimeout(() => {
      if (state.currentCalculationIndex !== oldIndex) {
        setCurrentIndex(state.currentCalculationIndex);
      }
    }, 50);
  };

  const handleSkipQuestion = () => {
    const oldIndex = state.currentCalculationIndex;
    skipQuestion();

    // Update URL with new index after skipping
    setTimeout(() => {
      if (state.currentCalculationIndex !== oldIndex) {
        setCurrentIndex(state.currentCalculationIndex);
      }
    }, 50);
  };

  const handleKeypadInput = (value: string) => {
    if (value === "delete") {
      setCurrentInput(currentInput.slice(0, -1));
    } else if (value === "enter") {
      if (currentInput) {
        const answer = parseFloat(currentInput);
        handleSubmitAnswer(answer);
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
    handleSkipQuestion();
    setCurrentInput("");
  };

  const handleBackToLearning = () => {
    moveToPhase("learning");
    // Clear all URL parameters for a fresh start
    clearUrlState();
  };

  if (!currentCalculation && !isComplete) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>No calculations available</h2>
          <p>Please go back to the Learning Phase to generate calculations.</p>
          <BackButton fallbackPath="?phase=learning">
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
      const profiles = localStorage.getJSONItem<Profile[]>(LOCAL_STORAGE_PROFILES_KEY, []);
      const profileIndex = profiles.findIndex(
        (p: any) => p.id === updatedProfile.id
      );
      if (profileIndex >= 0) {
        profiles[profileIndex] = updatedProfile;
        localStorage.setItem(LOCAL_STORAGE_PROFILES_KEY, profiles);
        localStorage.setItem(LOCAL_STORAGE_CURRENT_PROFILE_KEY, updatedProfile);
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
              {state.calculations.map((calc) => (
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
            <Button variant="primary" size="lg" onClick={handleBackToLearning}>
              Start New Session
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                navigateToPhase("test");
                moveToPhase("test");
              }}
            >
              Retry Test
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <GradientHeader variant="test" title="Test Phase">
        <div className={styles.progress}>
          <ProgressBar
            correctCount={correctCount}
            incorrectCount={incorrectCount}
            totalCount={state.calculations.length}
          />
          <div className={styles.progressText}>
            {completedCount} / {state.calculations.length} ({correctCount}{" "}
            correct, {incorrectCount} incorrect)
          </div>
        </div>
        <div className={styles.mistakes}>Mistakes: {state.sessionMistakes}</div>
      </GradientHeader>

      <div className={styles.content}>
        <Card
          variant="elevated"
          padding="lg"
          className={styles.questionSection}
        >
          <BackButton />
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
            <Button variant="danger" size="md" onClick={handleSkip}>
              Skip Question
            </Button>
          </div>
        </Card>

        <Card variant="elevated" padding="md" className={styles.keypadSection}>
          <Keypad
            onInput={handleKeypadInput}
            showDecimal={state.operation === "division"}
          />
        </Card>
      </div>
    </div>
  );
}
