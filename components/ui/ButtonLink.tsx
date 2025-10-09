"use client";

import { ReactNode, AnchorHTMLAttributes } from "react";
import baseStyles from "./button-base.module.css";

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "glass";
  size?: "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

export default function ButtonLink({
  variant = "primary",
  size = "md",
  fullWidth = false,
  icon,
  children,
  className = "",
  disabled,
  ...props
}: ButtonLinkProps) {
  const linkClass = [
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
    <a className={linkClass} {...props}>
      {icon && <span className={baseStyles.icon}>{icon}</span>}
      {children}
    </a>
  );
}
