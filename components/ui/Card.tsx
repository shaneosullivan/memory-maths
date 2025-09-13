"use client";

import { ReactNode, HTMLAttributes } from 'react';
import styles from './Card.module.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass' | 'gradient';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  children: ReactNode;
  className?: string;
}

export default function Card({ 
  variant = 'default', 
  padding = 'md', 
  children, 
  className = '',
  ...props 
}: CardProps) {
  const cardClass = `${styles.card} ${styles[variant]} ${styles[`padding-${padding}`]} ${className}`.trim();
  
  return (
    <div className={cardClass} {...props}>
      {children}
    </div>
  );
}