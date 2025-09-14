"use client";

import { useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { Operation } from "@/types";
import { useUrlNavigation, Step } from "@/hooks/useUrlNavigation";
import DualRangeSlider from "@/components/DualRangeSlider";
import BackButton from "@/components/BackButton";
import { GradientHeader, NumberGrid, Button, Card } from "@/components/ui";
import styles from "./LearningPhase.module.css";

export default function LearningPhase() {
  const {
    state,
    dispatch,
    setBaseNumber: setBaseNumberInState,
    setRangeMin,
    setRangeMax,
    setIsSquareNumbers: setIsSquareNumbersInState,
    generateCalculations,
    moveToPhase,
  } = useApp();
  const {
    getCurrentState,
    navigateToPhase,
    navigateToStep,
    setOperation,
    setBaseNumber,
    setRange,
    setIsSquareNumbers,
  } = useUrlNavigation();

  const urlState = getCurrentState();
  const currentStep = urlState.step || "operation";

  // Auto-generate calculations when component mounts with complete URL parameters
  useEffect(() => {
    const hasAllParameters =
      urlState.operation && (urlState.baseNumber || urlState.isSquareNumbers);

    if (hasAllParameters) {
      // Use default range values if not provided in URL
      const rangeMin = urlState.rangeMin || 2;
      const rangeMax = urlState.rangeMax || 10;

      // Sync AppContext state first
      setBaseNumberInState(urlState.baseNumber || 2);
      setRangeMin(rangeMin);
      setRangeMax(rangeMax);
      setIsSquareNumbersInState(urlState.isSquareNumbers || false);

      // Always generate calculations when we have the required parameters
      // (don't check if calculations already exist, always regenerate for consistency)
      generateCalculations({
        operation: urlState.operation,
        baseNumber: urlState.baseNumber || 2,
        rangeMin: rangeMin,
        rangeMax: rangeMax,
        isSquareNumbers: urlState.isSquareNumbers || false,
      });
    }
  }, [
    urlState.operation,
    urlState.baseNumber,
    urlState.rangeMin,
    urlState.rangeMax,
    urlState.isSquareNumbers,
  ]); // Re-run when URL parameters change

  const operations: { value: Operation; label: string; symbol: string }[] = [
    { value: "addition", label: "Addition", symbol: "+" },
    { value: "subtraction", label: "Subtraction", symbol: "−" },
    { value: "multiplication", label: "Multiplication", symbol: "×" },
    { value: "division", label: "Division", symbol: "÷" },
  ];

  const handleOperationSelect = (operation: Operation) => {
    setOperation(operation);
  };

  const handleBaseNumberChange = (base: number) => {
    setBaseNumber(base);
    setBaseNumberInState(base);
  };

  const handleRangeChange = (min: number, max: number) => {
    setRange(min, max);
    setRangeMin(min);
    setRangeMax(max);
  };

  const handleSquareNumbersToggle = (isSquare: boolean) => {
    setIsSquareNumbers(isSquare);
    setIsSquareNumbersInState(isSquare);
  };

  const handleRangeConfirm = () => {
    const currentUrlState = getCurrentState();
    if (currentUrlState.operation) {
      // Generate calculations using URL state parameters directly
      generateCalculations({
        operation: currentUrlState.operation,
        baseNumber: currentUrlState.baseNumber || state.baseNumber,
        rangeMin: currentUrlState.rangeMin || state.rangeMin,
        rangeMax: currentUrlState.rangeMax || state.rangeMax,
        isSquareNumbers: currentUrlState.isSquareNumbers || false,
      });
      navigateToStep("practice");
    }
  };

  const handleMoveToPractice = () => {
    navigateToPhase("practice");
    moveToPhase("practice");
  };

  const handleShowAll = () => {
    state.calculations.forEach((_, index) => {
      dispatch({
        type: "UPDATE_CALCULATION",
        payload: {
          index,
          calculation: { showAnswer: true },
        },
      });
    });
  };

  const handleHideAll = () => {
    state.calculations.forEach((_, index) => {
      dispatch({
        type: "UPDATE_CALCULATION",
        payload: {
          index,
          calculation: { showAnswer: false },
        },
      });
    });
  };

  // Check if all answers are visible or hidden
  const allAnswersVisible =
    state.calculations.length > 0 &&
    state.calculations.every((calc) => calc.showAnswer);
  const allAnswersHidden =
    state.calculations.length > 0 &&
    state.calculations.every((calc) => !calc.showAnswer);

  const getStepTitle = () => {
    switch (currentStep) {
      case "operation":
        return "Choose Operation";
      case "baseNumber":
        return "Select A Number";
      case "range":
        return "Set Number Range";
      case "practice":
        return "Memorise Sums";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case "operation":
        return "Select the type of maths you want to practice";
      case "baseNumber":
        return "Choose the number you want to use";
      case "range":
        return "Set the range of numbers to practice with";
      case "practice":
        return "Click on any sum to hide/show the answer";
    }
  };

  return (
    <div className={styles.container}>
      <GradientHeader
        variant="learning"
        title={getStepTitle()}
        subtitle={getStepDescription()}
      />

      <div className={styles.stepContainer}>
        {currentStep === "operation" && (
          <div className={styles.stepContent}>
            <div className={styles.operationGrid}>
              {operations.map((op) => (
                <button
                  key={`op_value_${op.value}`}
                  className={`${styles.operationButton} ${
                    state.operation === op.value ? styles.selected : ""
                  }`}
                  onClick={() => handleOperationSelect(op.value)}
                >
                  <div className={styles.operationSymbol}>{op.symbol}</div>
                  <div className={styles.operationLabel}>{op.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStep === "baseNumber" && (
          <div className={styles.stepContent}>
            <BackButton />

            {urlState.operation === "multiplication" && (
              <div className={styles.squareOption}>
                <h3>Practice Type</h3>
                <div className={styles.practiceTypeButtons}>
                  <button
                    onClick={() => handleSquareNumbersToggle(false)}
                    className={`${styles.practiceTypeButton} ${
                      !urlState.isSquareNumbers ? styles.selected : ""
                    }`}
                  >
                    Simple
                  </button>
                  <button
                    onClick={() => handleSquareNumbersToggle(true)}
                    className={`${styles.practiceTypeButton} ${
                      urlState.isSquareNumbers ? styles.selected : ""
                    }`}
                  >
                    Square Numbers
                  </button>
                </div>
                <p className={styles.practiceTypeDescription}>
                  {urlState.isSquareNumbers
                    ? "Practice square numbers like 2×2=4, 3×3=9, 4×4=16"
                    : "Practice multiplying a chosen number by other numbers"}
                </p>
              </div>
            )}

            {!urlState.isSquareNumbers && (
              <NumberGrid
                numbers={Array.from({ length: 19 }, (_, i) => i + 2)}
                selectedValue={urlState.baseNumber || state.baseNumber}
                onSelect={(num) => handleBaseNumberChange(num as number)}
                columns={8}
                className={styles.numberButtons}
              />
            )}

            {urlState.isSquareNumbers && (
              <div className={styles.stepActions}>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigateToStep("range")}
                >
                  Continue
                </Button>
              </div>
            )}
          </div>
        )}

        {currentStep === "range" && (
          <div className={styles.stepContent}>
            <BackButton />
            <DualRangeSlider
              min={2}
              max={20}
              valueMin={urlState.rangeMin || state.rangeMin}
              valueMax={urlState.rangeMax || state.rangeMax}
              onMinChange={(min) =>
                handleRangeChange(min, urlState.rangeMax || state.rangeMax)
              }
              onMaxChange={(max) =>
                handleRangeChange(urlState.rangeMin || state.rangeMin, max)
              }
            />
            <div className={styles.stepActions}>
              <Button variant="primary" size="lg" onClick={handleRangeConfirm}>
                Generate Calculations
              </Button>
            </div>
          </div>
        )}

        {currentStep === "practice" && (
          <div className={styles.stepContent}>
            <div className={styles.practiceHeader}>
              <BackButton />
              <div className={styles.showHideButtons}>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleShowAll}
                  disabled={allAnswersVisible}
                >
                  Show All
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleHideAll}
                  disabled={allAnswersHidden}
                >
                  Hide All
                </Button>
              </div>
            </div>
            <div className={styles.calculationsGrid}>
              {state.calculations.map((calc, index) => (
                <CalculationCard
                  key={`calc_${calc.id}`}
                  calculation={calc}
                  index={index}
                />
              ))}
            </div>

            <div className={styles.stepActions}>
              <p className={styles.practiceInstructions}>
                When you are happy that you know all these answers well, click
                the button below
              </p>
              <Button
                variant="primary"
                size="xl"
                onClick={handleMoveToPractice}
              >
                Go Practice!
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CalculationCard({
  calculation,
  index,
}: {
  calculation: any;
  index: number;
}) {
  const { dispatch } = useApp();

  const toggleAnswer = () => {
    dispatch({
      type: "UPDATE_CALCULATION",
      payload: {
        index,
        calculation: { showAnswer: !calculation.showAnswer },
      },
    });
  };

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

  return (
    <Card
      variant="elevated"
      padding="md"
      className={styles.calculationCard}
      onClick={toggleAnswer}
    >
      <div className={styles.calculation}>
        {calculation.operand1} {getOperationSymbol(calculation.operation)}{" "}
        {calculation.operand2}
      </div>
      <div className={styles.equals}>=</div>
      <div className={styles.answer}>
        {calculation.showAnswer ? calculation.answer : "?"}
      </div>
    </Card>
  );
}
