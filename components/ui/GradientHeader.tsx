"use client";

import { ReactNode } from 'react';
import styles from './GradientHeader.module.css';

interface GradientHeaderProps {
  title: string;
  subtitle?: string;
  variant?: 'learning' | 'practice' | 'test' | 'custom';
  customGradient?: string;
  children?: ReactNode;
  className?: string;
}

export default function GradientHeader({ 
  title,
  subtitle,
  variant = 'learning',
  customGradient,
  children,
  className = ''
}: GradientHeaderProps) {
  const headerClass = [
    styles.header,
    styles[variant],
    className
  ].filter(Boolean).join(' ');
  
  const headerStyle = customGradient ? { background: customGradient } : {};
  
  return (
    <div className={headerClass} style={headerStyle}>
      <div className={styles.pattern} />
      <div className={styles.content}>
        <h2 className={styles.title}>{title}</h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}