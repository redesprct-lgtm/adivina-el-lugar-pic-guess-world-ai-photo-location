
export interface GeoResult {
  city: string;
  country: string;
  confidence: number;
  reasoning: string;
}

export type AppState = 'IDLE' | 'ANALYZING' | 'RESULT' | 'ERROR';
