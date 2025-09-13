"use client";

import { Button } from "@/components/ui";

interface BackButtonProps {
  onClick: () => void;
  children?: React.ReactNode;
  variant?: 'secondary' | 'ghost';
  size?: 'sm' | 'md';
}

export default function BackButton({ 
  onClick, 
  children = "Back", 
  variant = "secondary",
  size = "md"
}: BackButtonProps) {
  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={onClick}
      icon="←"
      style={{ alignSelf: 'flex-start', marginBottom: '16px' }}
    >
      {children}
    </Button>
  );
}