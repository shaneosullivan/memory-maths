import React, { useState, useCallback } from 'react';
import Toaster from './Toaster';

interface ToasterItem {
  id: number;
  category: 'correct' | 'wrong';
  x: number;
  y: number;
}

const ToasterManager = React.forwardRef<
  { showToaster: (category: 'correct' | 'wrong', x: number, y: number) => void },
  {}
>((props, ref) => {
  const [toasters, setToasters] = useState<ToasterItem[]>([]);
  const [nextId, setNextId] = useState(0);

  const showToaster = useCallback((category: 'correct' | 'wrong', x: number, y: number) => {
    const newToaster: ToasterItem = {
      id: nextId,
      category,
      x,
      y,
    };
    
    setToasters(prev => [...prev, newToaster]);
    setNextId(prev => prev + 1);
  }, [nextId]);

  const removeToaster = useCallback((id: number) => {
    setToasters(prev => prev.filter(toaster => toaster.id !== id));
  }, []);

  React.useImperativeHandle(ref, () => ({
    showToaster,
  }), [showToaster]);

  return (
    <>
      {toasters.map(toaster => (
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

ToasterManager.displayName = 'ToasterManager';

export default ToasterManager;