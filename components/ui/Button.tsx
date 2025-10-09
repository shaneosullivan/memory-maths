"use client";

import { ReactNode, ButtonHTMLAttributes } from "react";
import baseStyles from "./button-base.module.css";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "glass";
  size?: "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  icon,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const buttonClass = [
    baseStyles.buttonBase,
    baseStyles[variant],
    baseStyles[size],
    fullWidth ? baseStyles.fullWidth : "",
    disabled ? baseStyles.disabled : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={buttonClass} disabled={disabled} {...props}>
      {icon && <span className={baseStyles.icon}>{icon}</span>}
      {children}
    </button>
  );
}
