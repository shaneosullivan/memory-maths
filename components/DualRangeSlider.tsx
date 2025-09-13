'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Card } from '@/components/ui';
import styles from './DualRangeSlider.module.css';

interface DualRangeSliderProps {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
}

export default function DualRangeSlider({
  min,
  max,
  valueMin,
  valueMax,
  onMinChange,
  onMaxChange,
}: DualRangeSliderProps) {
  const [isDraggingMin, setIsDraggingMin] = useState(false);
  const [isDraggingMax, setIsDraggingMax] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const getPositionFromValue = (value: number) => {
    return ((value - min) / (max - min)) * 100;
  };

  const getValueFromPosition = (clientX: number) => {
    if (!sliderRef.current) return min;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = (clientX - rect.left) / rect.width;
    const value = min + percentage * (max - min);
    
    return Math.max(min, Math.min(max, Math.round(value)));
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const newValue = getValueFromPosition(e.clientX);
    
    if (isDraggingMin) {
      const constrainedValue = Math.min(newValue, valueMax - 1);
      onMinChange(constrainedValue);
    } else if (isDraggingMax) {
      const constrainedValue = Math.max(newValue, valueMin + 1);
      onMaxChange(constrainedValue);
    }
  }, [isDraggingMin, isDraggingMax, valueMin, valueMax, onMinChange, onMaxChange]);

  const handleMouseUp = useCallback(() => {
    setIsDraggingMin(false);
    setIsDraggingMax(false);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    const newValue = getValueFromPosition(touch.clientX);
    
    if (isDraggingMin) {
      const constrainedValue = Math.min(newValue, valueMax - 1);
      onMinChange(constrainedValue);
    } else if (isDraggingMax) {
      const constrainedValue = Math.max(newValue, valueMin + 1);
      onMaxChange(constrainedValue);
    }
  }, [isDraggingMin, isDraggingMax, valueMin, valueMax, onMinChange, onMaxChange]);

  const handleTouchEnd = useCallback(() => {
    setIsDraggingMin(false);
    setIsDraggingMax(false);
  }, []);

  React.useEffect(() => {
    if (isDraggingMin || isDraggingMax) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDraggingMin, isDraggingMax, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  const minPos = getPositionFromValue(valueMin);
  const maxPos = getPositionFromValue(valueMax);

  return (
    <Card variant="default" padding="lg" className={styles.container}>
      <div className={styles.sliderWrapper}>
        <div className={styles.slider} ref={sliderRef}>
          <div className={styles.track} />
          <div
            className={styles.rangeTrack}
            style={{
              left: `${minPos}%`,
              width: `${maxPos - minPos}%`,
            }}
          />
          <div
            className={styles.handle}
            style={{ left: `${minPos}%` }}
            onMouseDown={() => setIsDraggingMin(true)}
            onTouchStart={() => setIsDraggingMin(true)}
          >
            <div className={styles.handleLabel}>{valueMin}</div>
          </div>
          <div
            className={styles.handle}
            style={{ left: `${maxPos}%` }}
            onMouseDown={() => setIsDraggingMax(true)}
            onTouchStart={() => setIsDraggingMax(true)}
          >
            <div className={styles.handleLabel}>{valueMax}</div>
          </div>
        </div>
      </div>
      <div className={styles.info}>
        Range: {valueMin} to {valueMax} ({valueMax - valueMin + 1} calculations)
      </div>
    </Card>
  );
}