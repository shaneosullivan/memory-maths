"use client";

import { InputHTMLAttributes, ReactNode, forwardRef } from "react";
import styles from "./Input.module.css";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  variant?: "default" | "glass";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  icon?: ReactNode;
  error?: boolean;
  className?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = "default",
      size = "md",
      fullWidth = false,
      icon,
      error = false,
      className = "",
      ...props
    },
    ref
  ) => {
    const inputClass = [
      styles.input,
      styles[variant],
      styles[size],
      fullWidth ? styles.fullWidth : "",
      error ? styles.error : "",
      icon ? styles.withIcon : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={styles.container}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <input ref={ref} className={inputClass} {...props} />
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
