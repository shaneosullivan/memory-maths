import React, { useState } from "react";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";
import { Card } from "@/components/ui";
import styles from "./RangeSliderWrapper.module.css";

interface RangeSliderWrapperProps {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onRangeChange: (min: number, max: number) => void; // Optional callback for range change
}

const RangeSliderWrapper = (props: RangeSliderWrapperProps) => {
  const { min, max, valueMin, valueMax, onRangeChange } = props;

  const [valueRange, setValueRange] = useState([valueMin, valueMax] as [number, number]);

  const handleRangeChange = (value: number[]) => {
    const [newMin, newMax] = value;

    if (newMin !== valueRange[0] || newMax !== valueRange[1]) {
      setValueRange([newMin, newMax]);
    }
  };

  return (
    <Card variant="default" padding="lg" className={styles.container}>
      <div className={styles.sliderWrapper}>
        <RangeSlider
          min={min}
          max={max}
          step={1}
          value={valueRange}
          onThumbDragEnd={() => {
            if (valueRange[0] !== valueMin || valueRange[1] !== valueMax) {
              onRangeChange(valueRange[0], valueRange[1]);
            }
          }}
          onInput={handleRangeChange}
        />
      </div>
      <div className={styles.info}>
        Range: {valueRange[0]} to {valueRange[1]} ({valueRange[1] - valueRange[0] + 1} calculations)
      </div>
    </Card>
  );
};

export default RangeSliderWrapper;
