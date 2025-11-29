export interface DetectedDigit {
  value: string;
  confidence: string;
}

export interface AnalysisResult {
  classification: 'single' | 'multiple' | 'unknown';
  identifiedNumber: string; // The full string (e.g., "42")
  digits: DetectedDigit[];
  rawResponse: string;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}