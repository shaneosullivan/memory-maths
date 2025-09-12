"use client";

import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Operation } from "@/types";
import Keypad from "@/components/Keypad";
import BackButton from "@/components/BackButton";
import styles from "./PracticePhase.module.css";

export default function PracticePhase() {
  const { state, submitAnswer, moveToPhase } = useApp();
  const [currentInput, setCurrentInput] = useState("");
  const [showMultipleChoice, setShowMultipleChoice] = useState(false);
  const [multipleChoiceOptions, setMultipleChoiceOptions] = useState<number[]>(
    []
  );

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

    // Generate similar numbers
    const range = Math.max(5, Math.abs(correctAnswer * 0.2));

    while (options.size < 4) {
      const variation = Math.floor(Math.random() * range * 2) - range;
      const option = correctAnswer + variation;
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

  const handleMultipleChoiceSelect = (answer: number) => {
    submitAnswer(answer);
    setShowMultipleChoice(false);
    setCurrentInput("");
  };

  const handleMoveToTest = () => {
    moveToPhase("test");
  };

  if (!currentCalculation && !isComplete) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>No calculations available</h2>
          <p>Please go back to the Learning Phase to generate calculations.</p>
          <BackButton onClick={() => moveToPhase("learning")}>
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
            <button className={styles.testButton} onClick={handleMoveToTest}>
              Move to Test Phase
            </button>
            <button
              className={styles.retryButton}
              onClick={() => moveToPhase("practice")}
            >
              Practice Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Practice Phase</h2>
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

          {!showMultipleChoice && (
            <div className={styles.questionActions}>
              <button
                className={styles.showAnswerButton}
                onClick={handleShowAnswer}
              >
                Show Answer Options
              </button>
            </div>
          )}

          {showMultipleChoice && (
            <div className={styles.multipleChoice}>
              <p>Choose the correct answer:</p>
              <div className={styles.choiceButtons}>
                {multipleChoiceOptions.map((option, index) => (
                  <button
                    key={`multi_choice_${index}`}
                    className={styles.choiceButton}
                    onClick={() => handleMultipleChoiceSelect(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}
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
