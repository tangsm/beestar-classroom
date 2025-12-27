
export enum GameState {
  START = 'START',
  PLAYING = 'PLAYING',
  END = 'END'
}

export interface WordStatus {
  word: string;
  isCorrect: boolean | null;
  userAttempt?: string;
}

export interface Encouragement {
  text: string;
  type: 'success' | 'encourage';
}
