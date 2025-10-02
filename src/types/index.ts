import { ReactNode } from 'react';

// Global build-time constants
declare global {
  const __BUILD_TIME__: string;
  const __BUILD_HASH__: string;
}

// Application types
export type Operation = '+' | '-' | '*' | '/' | '×' | '÷';
export type PaperSize = 'a4' | 'letter' | 'legal';

export interface Settings {
  operations: Operation[];
  numProblems: number;
  numRange: [number, number];
  resultRange: [number, number];
  numOperandsRange: [number, number];
  allowNegative: boolean;
  showAnswers: boolean;
  fontSize: number;
  lineSpacing: number;
  paperSize: PaperSize;
  // 分组设置
  enableGrouping: boolean;
  problemsPerGroup: number;
  totalGroups: number;
}

export interface Problem {
  id: number;
  text: string;
  correctAnswer?: number;
  userAnswer?: number;
  isCorrect?: boolean;
  isAnswered?: boolean;
}

// Component Props interfaces
export interface NumberInputProps {
  id: string;
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  required?: boolean;
  className?: string;
  'data-testid'?: string;
}

export interface ProblemPreviewProps {
  settings: Settings;
  generateSampleProblem?: () => string;
}

export interface SettingsPresetsProps {
  onApplyPreset: (settings: Settings) => void;
}

export interface SettingsPreset {
  name: string;
  description: string;
  settings: Settings;
}

export interface QuizResult {
  totalProblems: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number;
  grade: string;
  feedback: string;
}

export type PaperSizeOptions = {
  [K in Settings['paperSize']]: K;
};

// Language and i18n types
export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface Translations {
  [key: string]: string | Translations;
}

export interface I18nContextType {
  currentLanguage: string;
  languages: Record<string, Language>;
  translations: Translations;
  isLoading: boolean;
  t: (key: string, params?: Record<string, string | number>) => string;
  changeLanguage: (lang: string) => void;
}

// Message system types for dynamic translation
export interface MessageState {
  key: string; // Translation key (e.g., 'messages.success.problemsGenerated')
  params?: Record<string, string | number>; // Parameters for interpolation (e.g., { count: 20 })
}

export type MessageValue = string | MessageState; // Support both legacy strings and new MessageState objects

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Error Boundary types
export interface ErrorInfo {
  componentStack: string;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export interface OptimisticState<T> {
  current: T;
  pending: T | null;
  isPending: boolean;
}
