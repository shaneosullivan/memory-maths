import React, { useState, useEffect } from "react";
import styles from "./Toaster.module.css";

interface ToasterProps {
  category: "correct" | "wrong";
  x: number;
  y: number;
  onComplete: () => void;
}

const Toaster: React.FC<ToasterProps> = ({ category, x, y, onComplete }) => {
  const [animationType, setAnimationType] = useState<number>(0);

  useEffect(() => {
    // Randomly select one of 3 animation variations
    setAnimationType(Math.floor(Math.random() * 3));

    // Auto complete after animation duration
    const timer = setTimeout(() => {
      onComplete();
    }, 2000); // 2 seconds total animation

    return () => clearTimeout(timer);
  }, [onComplete]);

  const imageSrc = category === "correct" ? "/correct.png" : "/wrong.png";
  const animationClass = `${styles.float} ${styles[`animation${animationType}`]}`;

  return (
    <div
      className={`${styles.toaster} ${animationClass}`}
      style={{
        left: x - 50, // Center the 100px image on the x position
        top: y - 50, // Start 50px above the y position
      }}
    >
      <img src={imageSrc} alt={category} className={styles.image} />
    </div>
  );
};

export default Toaster;
