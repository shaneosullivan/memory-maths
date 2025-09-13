"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { Operation } from "@/types";
import { useUrlNavigation } from "@/hooks/useUrlNavigation";
import Keypad from "@/components/Keypad";
import BackButton from "@/components/BackButton";
import { GradientHeader, ProgressBar, Button, Card } from "@/components/ui";
import styles from "./PracticePhase.module.css";

export default function PracticePhase() {
  const {
    state,
    dispatch,
    submitAnswer,
    moveToPhase,
    generateCalculations,
    setOperation,
    setBaseNumber,
    setRangeMin,
    setRangeMax,
    setIsSquareNumbers,
  } = useApp();
  const { navigateToPhase, getCurrentState, setCurrentIndex } =
    useUrlNavigation();
  const [currentInput, setCurrentInput] = useState("");
  const [showMultipleChoice, setShowMultipleChoice] = useState(false);
  const [multipleChoiceOptions, setMultipleChoiceOptions] = useState<number[]>(
    []
  );

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

      // Shuffle calculations for practice phase after generation
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

  const handleKeypadInput = (value: string) => {
    if (value === "delete") {
      setCurrentInput(currentInput.slice(0, -1));
    } else if (value === "enter") {
      if (currentInput) {
        const answer = parseFloat(currentInput);
        handleSubmitAnswer(answer);
        setCurrentInput("");
        setShowMultipleChoice(false);
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

  const generateMultipleChoiceOptions = () => {
    if (!currentCalculation) return [];

    const correctAnswer = currentCalculation.answer;
    const options = new Set([correctAnswer]);
    const isDivision = currentCalculation.operation === "division";

    // Generate similar numbers
    const range = Math.max(5, Math.abs(correctAnswer * 0.2));

    while (options.size < 4) {
      const variation = Math.floor(Math.random() * range * 2) - range;
      let option = correctAnswer + variation;

      // For non-division operations, ensure options are whole numbers
      if (!isDivision) {
        option = Math.round(option);
      }

      if (option > 0 && option !== correctAnswer) {
        options.add(option);
      }
    }

    return Array.from(options).sort(() => Math.random() - 0.5);
  };

  const handleShowAnswer = () => {
    const options = generateMultipleChoiceOptions();
    setMultipleChoiceOptions(options);
    setShowMultipleChoice(true);
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

  const handleMultipleChoiceSelect = (answer: number) => {
    handleSubmitAnswer(answer);
    setShowMultipleChoice(false);
    setCurrentInput("");
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
    const totalQuestions = state.calculations.length;
    const accuracy = Math.round((correctAnswers / totalQuestions) * 100);

    return (
      <div className={styles.container}>
        <div className={styles.summary}>
          <h2>Practice Phase Complete!</h2>
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{state.sessionMistakes}</div>
              <div className={styles.statLabel}>Mistakes</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>
                {correctAnswers}/{totalQuestions}
              </div>
              <div className={styles.statLabel}>Correct</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{accuracy}%</div>
              <div className={styles.statLabel}>Accuracy</div>
            </div>
          </div>
          <div className={styles.actions}>
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                navigateToPhase("test");
                moveToPhase("test");
              }}
            >
              Go Test Myself!
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                navigateToPhase("practice");
                moveToPhase("practice");
              }}
            >
              Practice Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <GradientHeader variant="practice" title="Practice Phase">
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

          {!showMultipleChoice && (
            <div className={styles.questionActions}>
              <Button variant="secondary" size="md" onClick={handleShowAnswer}>
                Show Hints
              </Button>
            </div>
          )}

          {showMultipleChoice && (
            <div className={styles.multipleChoice}>
              <p>Hint:</p>
              <div className={styles.choiceButtons}>
                {multipleChoiceOptions.map((option, index) => (
                  <Button
                    key={`multi_choice_${index}`}
                    variant="secondary"
                    size="lg"
                    onClick={() => handleMultipleChoiceSelect(option)}
                    className={styles.choiceButton}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          )}
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
