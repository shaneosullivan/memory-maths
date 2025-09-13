"use client";

import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Operation } from "@/types";
import DualRangeSlider from "@/components/DualRangeSlider";
import BackButton from "@/components/BackButton";
import { GradientHeader, NumberGrid, Button, Card } from "@/components/ui";
import styles from "./LearningPhase.module.css";

type Step = "operation" | "baseNumber" | "range" | "practice";

export default function LearningPhase() {
  const {
    state,
    setOperation,
    setBaseNumber,
    setRangeMin,
    setRangeMax,
    setIsSquareNumbers,
    generateCalculations,
    moveToPhase,
  } = useApp();
  const [currentStep, setCurrentStep] = useState<Step>("operation");

  const operations: { value: Operation; label: string; symbol: string }[] = [
    { value: "addition", label: "Addition", symbol: "+" },
    { value: "subtraction", label: "Subtraction", symbol: "−" },
    { value: "multiplication", label: "Multiplication", symbol: "×" },
    { value: "division", label: "Division", symbol: "÷" },
  ];

  const handleOperationSelect = (operation: Operation) => {
    setOperation(operation);
    setCurrentStep("baseNumber");
  };

  const handleBaseNumberChange = (base: number) => {
    setBaseNumber(base);
    setCurrentStep("range");
  };

  const handleRangeConfirm = () => {
    if (state.operation) {
      generateCalculations();
      setCurrentStep("practice");
    }
  };

  const handleBackClick = () => {
    switch (currentStep) {
      case "baseNumber":
        setCurrentStep("operation");
        break;
      case "range":
        setCurrentStep("baseNumber");
        break;
      case "practice":
        setCurrentStep("range");
        break;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case "operation":
        return "Choose Operation";
      case "baseNumber":
        return "Select A Number";
      case "range":
        return "Set Number Range";
      case "practice":
        return "Memorise Calculations";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case "operation":
        return "Select the type of arithmetic you want to practice";
      case "baseNumber":
        return "Choose the base number for your calculations";
      case "range":
        return "Set the range of numbers to practice with";
      case "practice":
        return "Click on any calculation to hide/show the answer";
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
            <BackButton onClick={handleBackClick} />

            {state.operation === "multiplication" && (
              <div className={styles.squareOption}>
                <h3>Practice Type</h3>
                <div className={styles.practiceTypeButtons}>
                  <Button
                    variant={!state.isSquareNumbers ? "primary" : "secondary"}
                    size="md"
                    onClick={() => setIsSquareNumbers(false)}
                    className={styles.practiceTypeButton}
                  >
                    Regular Multiplication
                  </Button>
                  <Button
                    variant={state.isSquareNumbers ? "primary" : "secondary"}
                    size="md"
                    onClick={() => setIsSquareNumbers(true)}
                    className={styles.practiceTypeButton}
                  >
                    Square Numbers
                  </Button>
                </div>
                <p className={styles.practiceTypeDescription}>
                  {state.isSquareNumbers
                    ? "Practice square numbers like 2×2=4, 3×3=9, 4×4=16"
                    : "Practice multiplying a chosen number by other numbers"}
                </p>
              </div>
            )}

            {!state.isSquareNumbers && (
              <NumberGrid
                numbers={Array.from({ length: 19 }, (_, i) => i + 2)}
                selectedValue={state.baseNumber}
                onSelect={(num) => handleBaseNumberChange(num as number)}
                columns={8}
                className={styles.numberButtons}
              />
            )}

            {state.isSquareNumbers && (
              <div className={styles.stepActions}>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setCurrentStep("range")}
                >
                  Continue to Range Selection
                </Button>
              </div>
            )}
          </div>
        )}

        {currentStep === "range" && (
          <div className={styles.stepContent}>
            <BackButton onClick={handleBackClick} />
            <DualRangeSlider
              min={2}
              max={20}
              valueMin={state.rangeMin}
              valueMax={state.rangeMax}
              onMinChange={setRangeMin}
              onMaxChange={setRangeMax}
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
            <BackButton onClick={handleBackClick} />
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
                onClick={() => moveToPhase("practice")}
              >
                Move to Practice Phase
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
