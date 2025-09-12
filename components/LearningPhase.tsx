"use client";

import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Operation } from "@/types";
import DualRangeSlider from "@/components/DualRangeSlider";
import BackButton from "@/components/BackButton";
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
        return "Select Base Number";
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
      <div className={styles.header}>
        <h2>{getStepTitle()}</h2>
        <p>{getStepDescription()}</p>
      </div>

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
            
            {state.operation === 'multiplication' && (
              <div className={styles.squareOption}>
                <h3>Practice Type</h3>
                <div className={styles.practiceTypeButtons}>
                  <button
                    className={`${styles.practiceTypeButton} ${
                      !state.isSquareNumbers ? styles.selected : ""
                    }`}
                    onClick={() => setIsSquareNumbers(false)}
                  >
                    Regular Multiplication
                  </button>
                  <button
                    className={`${styles.practiceTypeButton} ${
                      state.isSquareNumbers ? styles.selected : ""
                    }`}
                    onClick={() => setIsSquareNumbers(true)}
                  >
                    Square Numbers
                  </button>
                </div>
                <p className={styles.practiceTypeDescription}>
                  {state.isSquareNumbers 
                    ? "Practice square numbers like 2×2=4, 3×3=9, 4×4=16"
                    : "Practice multiplication with a base number"}
                </p>
              </div>
            )}
            
            {!state.isSquareNumbers && (
              <div className={styles.numberButtons}>
                {Array.from({ length: 19 }, (_, i) => i + 2).map((num) => (
                  <button
                    key={`base_num_${num}`}
                    className={`${styles.numberButton} ${
                      state.baseNumber === num ? styles.selected : ""
                    }`}
                    onClick={() => handleBaseNumberChange(num)}
                  >
                    <span>{num}</span>
                  </button>
                ))}
              </div>
            )}
            
            {state.isSquareNumbers && (
              <div className={styles.stepActions}>
                <button
                  className={styles.continueButton}
                  onClick={() => setCurrentStep("range")}
                >
                  Continue to Range Selection
                </button>
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
              <button
                className={styles.continueButton}
                onClick={handleRangeConfirm}
              >
                Generate Calculations
              </button>
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
              <button
                className={styles.practiceButton}
                onClick={() => moveToPhase("practice")}
              >
                Move to Practice Phase
              </button>
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
    <div className={styles.calculationCard} onClick={toggleAnswer}>
      <div className={styles.calculation}>
        {calculation.operand1} {getOperationSymbol(calculation.operation)}{" "}
        {calculation.operand2}
      </div>
      <div className={styles.equals}>=</div>
      <div className={styles.answer}>
        {calculation.showAnswer ? calculation.answer : "?"}
      </div>
    </div>
  );
}
