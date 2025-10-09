"use client";

import { useState, useEffect, useCallback } from "react";
import { useApp } from "@/contexts/AppContext";
import { Operation, Profile, Achievement } from "@/types";
import { useUrlNavigation } from "@/hooks/useUrlNavigation";
import Keypad from "@/components/Keypad";
import BackButton from "@/components/BackButton";
import { GradientHeader, ProgressBar, Button, Card, FloatingButton } from "@/components/ui";
import RainbowTimer from "@/components/RainbowTimer";
import Modal from "@/components/Modal";
import styles from "./TestPhase.module.css";
import { checkForNewAchievements } from "@/utils/achievements";

interface TestPhaseProps {
  toasterRef: React.RefObject<{
    showToaster: (category: "correct" | "wrong", x: number, y: number) => void;
  } | null>;
}

export default function TestPhase({ toasterRef }: TestPhaseProps) {
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
    updateProfile,
  } = useApp();
  const { navigateToPhase, clearUrlState, getCurrentState, setCurrentIndex } = useUrlNavigation();
  const [currentInput, setCurrentInput] = useState("");
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [hasProcessedCompletion, setHasProcessedCompletion] = useState(false);
  const [showRainbowTimer, setShowRainbowTimer] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [totalTimerDuration, setTotalTimerDuration] = useState(0);
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null);

  // Sync AppContext with URL state when component mounts
  useEffect(() => {
    const urlState = getCurrentState();

    // Always sync URL parameters with AppContext when URL has values
    if (urlState.operation && urlState.operation !== state.operation) {
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

    // If we have operation but no calculations, generate them (use defaults for missing ranges)
    if (urlState.operation && state.calculations.length === 0) {
      generateCalculations({
        operation: urlState.operation,
        baseNumber: urlState.baseNumber || state.baseNumber || 2,
        rangeMin: urlState.rangeMin || 2,
        rangeMax: urlState.rangeMax || 10,
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

          // Ensure no adjacent calculations differ by only 1 in their answers
          // Single pass: swap with next item if current violates rule
          for (let i = 0; i < shuffledCalculations.length - 1; i++) {
            const current = shuffledCalculations[i];
            const next = shuffledCalculations[i + 1];
            const diff = Math.abs(current.answer - next.answer);

            if (diff === 1) {
              // Try to swap with item at i+2 if it exists and doesn't violate rule
              if (i + 2 < shuffledCalculations.length) {
                const afterNext = shuffledCalculations[i + 2];
                const diffWithAfterNext = Math.abs(current.answer - afterNext.answer);

                // Only swap if it doesn't create another adjacent-by-1 issue
                if (diffWithAfterNext !== 1) {
                  // Swap i+1 and i+2
                  shuffledCalculations[i + 1] = afterNext;
                  shuffledCalculations[i + 2] = next;
                }
              }
            }
          }

          // Update calculations and reset session
          dispatch({ type: "SET_CALCULATIONS", payload: shuffledCalculations });
          dispatch({ type: "RESET_SESSION" });

          // Reset completion processing flag for new test
          setHasProcessedCompletion(false);
          setNewAchievements([]);

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

    console.log("test mounted");
  }, []); // Only run once on mount

  // Handle test completion and profile updates
  useEffect(() => {
    const isComplete =
      state.calculations.length > 0 &&
      state.calculations.every((calc) => calc.userAnswer !== undefined || calc.skipped);

    console.log("TestPhase state.operation:", state.operation);

    if (
      isComplete &&
      !hasProcessedCompletion &&
      state.currentProfile &&
      !state.currentProfile.isGuest
    ) {
      const totalQuestions = state.calculations.length;

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

      // Check for new achievements
      const achievements = checkForNewAchievements(state.currentProfile, sessionStats);
      if (achievements.length > 0) {
        setNewAchievements(achievements);
      }

      // Update profile stats and achievements
      const updatedProfile = {
        ...state.currentProfile,
        stats: [...state.currentProfile.stats, sessionStats],
        achievements: [...state.currentProfile.achievements, ...achievements],
        lastUsed: new Date(),
      };

      console.log("Updating profile with new stats and achievements:", updatedProfile);

      // Use the updateProfile method to update both localStorage and in-memory state
      updateProfile(updatedProfile);
      setHasProcessedCompletion(true);
    }
  }, [
    state.calculations,
    state.sessionMistakes,
    state.currentProfile,
    hasProcessedCompletion,
    state.operation,
    state.baseNumber,
    state.rangeMin,
    state.rangeMax,
    updateProfile,
  ]);

  const currentCalculation = state.calculations[state.currentCalculationIndex];

  // Check if rainbow timer should be shown based on URL parameter and calculate total time
  useEffect(() => {
    const urlState = getCurrentState();
    const shouldShow = urlState.rainbow || false;
    setShowRainbowTimer(shouldShow);

    if (shouldShow && state.calculations.length > 0 && timerStartTime === null) {
      // Calculate total time: (2 seconds per question) + (3 seconds * total digits across all answers)
      const totalDigits = state.calculations.reduce((sum, calc) => {
        const answerStr = Math.abs(Math.floor(calc.answer)).toString();
        return sum + answerStr.length;
      }, 0);
      const totalTime = state.calculations.length * 2 + totalDigits * 3;
      setTotalTimerDuration(totalTime);
      setTimerStartTime(Date.now());
    }
  }, [getCurrentState, state.calculations, timerStartTime]);

  // Handle timer timeout - show modal
  const handleTimeout = useCallback(() => {
    setShowTimeoutModal(true);
  }, []);
  const isComplete =
    state.calculations.length > 0 &&
    state.calculations.every((calc) => calc.userAnswer !== undefined || calc.skipped);
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
    submitAnswer(answer, toasterRef.current?.showToaster);

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
          <BackButton fallbackPath="?phase=learning">Back to Learning</BackButton>
        </div>
      </div>
    );
  }

  if (isComplete) {
    const correctAnswers = state.calculations.filter((calc) => calc.isCorrect).length;
    const skippedCount = state.calculations.filter((calc) => calc.skipped).length;
    const totalQuestions = state.calculations.length;
    const accuracy = Math.round((correctAnswers / totalQuestions) * 100);

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

          {newAchievements.length > 0 && (
            <div className={styles.achievements}>
              <h3>🎉 New Achievements Unlocked!</h3>
              <div className={styles.achievementCards}>
                {newAchievements.map((achievement) => (
                  <div key={achievement.id} className={styles.achievementCard}>
                    <img
                      src={`/images/${achievement.type}_medal_small.png`}
                      alt={`${achievement.type} medal`}
                      className={styles.achievementImage}
                    />
                    <div className={styles.achievementText}>
                      <div className={styles.achievementType}>
                        {achievement.type.charAt(0).toUpperCase() + achievement.type.slice(1)} Medal
                      </div>
                      <div className={styles.achievementDetail}>
                        {achievement.operation === "all"
                          ? `Master of ${achievement.baseNumber}`
                          : `${
                              achievement.operation.charAt(0).toUpperCase() +
                              achievement.operation.slice(1)
                            } ${achievement.baseNumber}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.breakdown}>
            <div className={styles.breakdownHeader}>
              <h3>Question Breakdown</h3>
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  setHasProcessedCompletion(false);
                  navigateToPhase("test");
                  moveToPhase("test");
                }}
              >
                Retry Test
              </Button>
            </div>
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
                    {calc.operand1} {getOperationSymbol(calc.operation)} {calc.operand2} ={" "}
                    {calc.answer}
                  </div>
                  <div className={styles.userResponse}>
                    {calc.skipped ? "Skipped" : `Your answer: ${calc.userAnswer}`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <FloatingButton onClick={handleBackToLearning}>Start New Session</FloatingButton>
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
            {completedCount} / {state.calculations.length} ({correctCount} correct, {incorrectCount}{" "}
            incorrect)
          </div>
        </div>
        <div className={styles.mistakes}>Mistakes: {state.sessionMistakes}</div>
      </GradientHeader>

      <div className={styles.content}>
        <Card variant="elevated" padding="lg" className={styles.questionSection}>
          <BackButton />

          <div className={styles.question}>
            <span className={styles.operand}>{currentCalculation.operand1}</span>
            <span className={styles.operator}>
              {getOperationSymbol(currentCalculation.operation)}
            </span>
            <span className={styles.operand}>{currentCalculation.operand2}</span>
            <span className={styles.equals}>=</span>
            <span className={styles.answer}>{currentInput || "?"}</span>
          </div>

          <div className={styles.questionActions}>
            {showRainbowTimer && totalTimerDuration > 0 && (
              <RainbowTimer duration={totalTimerDuration} onTimeout={handleTimeout} />
            )}
            <Button variant="danger" size="md" onClick={handleSkip}>
              Skip Question
            </Button>
          </div>
        </Card>

        <Card variant="elevated" padding="md" className={styles.keypadSection}>
          <Keypad onInput={handleKeypadInput} showDecimal={state.operation === "division"} />
        </Card>
      </div>

      {showTimeoutModal && (
        <Modal title="Time's Up! ⏰" onClose={() => {}} showCloseButton={false}>
          <div className={styles.modalContent}>
            <p className={styles.modalMessage}>
              Your time has run out! Better luck next time.
            </p>
            <div className={styles.modalActions}>
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  setShowTimeoutModal(false);
                  navigateToPhase("test", { rainbow: true });
                  // Reset the test
                  window.location.reload();
                }}
              >
                Try Again
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  setShowTimeoutModal(false);
                  handleBackToLearning();
                }}
              >
                Start New Session
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
