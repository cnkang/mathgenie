/**
 * Core type definitions for MathGenie application
 */
import React from 'react';

export type Operation = '+' | '-' | '*' | '/';

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
}

export interface Problem {
  id: number;
  text: string;
}

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
  changeLanguage: (language: string) => void;
}

export interface ErrorInfo {
  componentStack: string;
}

export interface SettingsPreset {
  name: string;
  description: string;
  settings: Partial<Settings>;
}

// React 19 specific types
export interface OptimisticState<T> {
  current: T;
  pending: T | null;
  isPending: boolean;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type LocalStorageValue<T> = T | null;

// Component prop types
export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label: string;
  id: string;
  'aria-label'?: string;
}

export interface ProblemPreviewProps {
  settings: Settings;
  generateSampleProblem: (() => string) | null;
}

export interface SettingsManagerProps {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
}

export interface SettingsPresetsProps {
  onApplyPreset: (settings: Settings) => void;
}

export interface LanguageSelectorProps {
  className?: string;
}

export interface PerformanceMonitorProps {
  children: React.ReactNode;
}