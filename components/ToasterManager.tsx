import React, { useState, useCallback } from "react";
import Toaster from "./Toaster";

interface ToasterItem {
  id: number;
  category: "correct" | "wrong";
  x: number;
  y: number;
}

const ToasterManager = React.forwardRef<
  {
    showToaster: (category: "correct" | "wrong", x: number, y: number) => void;
  },
  {}
>((props, ref) => {
  const [toasters, setToasters] = useState<ToasterItem[]>([]);

  const showToaster = useCallback((category: "correct" | "wrong", x: number, y: number) => {
    const newToaster: ToasterItem = {
      id: Date.now() + Math.random(), // Use timestamp + random to ensure uniqueness
      category,
      x,
      y,
    };

    // Clear all existing toasters and show only the new one
    setToasters([newToaster]);
  }, []);

  const removeToaster = useCallback((id: number) => {
    setToasters((prev) => prev.filter((toaster) => toaster.id !== id));
  }, []);

  React.useImperativeHandle(
    ref,
    () => ({
      showToaster,
    }),
    [showToaster]
  );

  return (
    <>
      {toasters.map((toaster) => (
        <Toaster
          key={toaster.id}
          category={toaster.category}
          x={toaster.x}
          y={toaster.y}
          onComplete={() => removeToaster(toaster.id)}
        />
      ))}
    </>
  );
});

ToasterManager.displayName = "ToasterManager";

export default ToasterManager;
