export type CellValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface Cell {
  row: number;
  col: number;
  value: CellValue;
  isFixed: boolean; // Was part of the initial puzzle
  isError: boolean; // User entered an incorrect value (optional feature for ease)
  notes: number[];
}

export type Grid = Cell[][];

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  INSANE = 'INSANE'
}

export interface GameStats {
  remainingCounts: number[]; // Index 0 is unused, 1-9 stores count of remaining numbers needed
}