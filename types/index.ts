export type Operation = 'addition' | 'subtraction' | 'multiplication' | 'division';

export type Phase = 'learning' | 'practice' | 'test';

export interface Calculation {
  id: string;
  operation: Operation;
  operand1: number;
  operand2: number;
  answer: number;
  userAnswer?: number;
  isCorrect?: boolean;
  showAnswer?: boolean;
  skipped?: boolean;
}

export interface SessionStats {
  mistakes: number;
  totalQuestions: number;
  operation: Operation;
  baseNumber: number;
  rangeMin: number;
  rangeMax: number;
  completedAt: Date;
  phase: Phase;
}

export interface Profile {
  id: string;
  name: string;
  isGuest: boolean;
  stats: SessionStats[];
  createdAt: Date;
  lastUsed: Date;
}

export interface AppState {
  currentProfile: Profile | null;
  phase: Phase;
  operation: Operation | null;
  baseNumber: number;
  rangeMin: number;
  rangeMax: number;
  calculations: Calculation[];
  currentCalculationIndex: number;
  sessionMistakes: number;
  isSquareNumbers: boolean;
}