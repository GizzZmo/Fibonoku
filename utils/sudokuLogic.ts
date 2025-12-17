import { CellValue, Grid, Difficulty } from '../types';

const BLANK: CellValue = 0;

const shuffleArray = (array: number[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// Helper to check if it's safe to put a number in a cell
const isSafe = (grid: number[][], row: number, col: number, num: number): boolean => {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (grid[row][x] === num) return false;
  }

  // Check column
  for (let x = 0; x < 9; x++) {
    if (grid[x][col] === num) return false;
  }

  // Check 3x3 box
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[i + startRow][j + startCol] === num) return false;
    }
  }

  return true;
};

// Backtracking solver
const solveSudoku = (grid: number[][]): boolean => {
  let row = -1;
  let col = -1;
  let isEmpty = false;

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (grid[i][j] === BLANK) {
        row = i;
        col = j;
        isEmpty = true;
        break;
      }
    }
    if (isEmpty) break;
  }

  if (!isEmpty) return true; // No empty space left

  // Try digits 1-9 in random order
  const digits = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);

  for (const num of digits) {
    if (isSafe(grid, row, col, num)) {
      grid[row][col] = num;
      if (solveSudoku(grid)) return true;
      grid[row][col] = BLANK;
    }
  }
  return false;
};

const fillBox = (grid: number[][], rowStart: number, colStart: number) => {
  const nums = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  let k = 0;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      grid[rowStart + i][colStart + j] = nums[k++];
    }
  }
};

export const generateSudoku = (difficulty: Difficulty): { initialGrid: Grid; solvedGrid: number[][] } => {
  let rawGrid: number[][] = [];
  let success = false;

  // Retry generation until a valid board is created
  while (!success) {
    rawGrid = Array.from({ length: 9 }, () => Array(9).fill(BLANK));
    
    // Fill diagonal 3x3 matrices (independent)
    for (let i = 0; i < 9; i = i + 3) {
      fillBox(rawGrid, i, i);
    }

    // Solve the rest
    success = solveSudoku(rawGrid);
  }

  // Clone solved grid for validation/solutions
  const solvedGrid = rawGrid.map(row => [...row]);

  // Determine number of cells to remove
  let attempts = 30; // Default EASY
  switch (difficulty) {
    case Difficulty.EASY: attempts = 30; break; 
    case Difficulty.MEDIUM: attempts = 40; break;
    case Difficulty.HARD: attempts = 50; break;
    case Difficulty.INSANE: attempts = 60; break;
  }

  // Remove random cells
  // We remove cells while checking simply. 
  // For a perfect generator, we should check uniqueness of solution here.
  // Given constraints, we'll proceed with random removal which is standard for simple games.
  while (attempts > 0) {
    let row = Math.floor(Math.random() * 9);
    let col = Math.floor(Math.random() * 9);
    
    if (rawGrid[row][col] !== BLANK) {
      rawGrid[row][col] = BLANK;
      attempts--;
    }
  }

  // Convert to Cell objects
  const initialGrid: Grid = rawGrid.map((rowArr, rIndex) =>
    rowArr.map((val, cIndex) => ({
      row: rIndex,
      col: cIndex,
      value: val as CellValue,
      isFixed: val !== 0,
      isError: false,
      notes: [],
    }))
  );

  return { initialGrid, solvedGrid };
};

// Check invalid cells
export const validateBoard = (currentGrid: Grid): Grid => {
    const newGrid = currentGrid.map(row => row.map(cell => ({...cell, isError: false})));

    // Helper to add error
    const markError = (r: number, c: number) => {
        // We only mark errors on non-fixed cells usually, 
        // but distinguishing between "I put 5 here" and "Game put 5 here" is useful.
        // Actually, if a user puts a number that conflicts with a Fixed number, the user number is the error.
        // If two user numbers conflict, both are errors.
        if (!newGrid[r][c].isFixed) {
             newGrid[r][c].isError = true;
        }
    };

    // Rows
    for(let r=0; r<9; r++) {
        const seen = new Map<number, number[]>(); // value -> [col indices]
        for(let c=0; c<9; c++) {
            const val = newGrid[r][c].value;
            if (val !== 0) {
                if (!seen.has(val)) seen.set(val, []);
                seen.get(val)?.push(c);
            }
        }
        seen.forEach((cols) => {
            if (cols.length > 1) cols.forEach(c => markError(r, c));
        });
    }

    // Cols
    for(let c=0; c<9; c++) {
        const seen = new Map<number, number[]>(); // value -> [row indices]
        for(let r=0; r<9; r++) {
            const val = newGrid[r][c].value;
            if (val !== 0) {
                if (!seen.has(val)) seen.set(val, []);
                seen.get(val)?.push(r);
            }
        }
        seen.forEach((rows) => {
            if (rows.length > 1) rows.forEach(r => markError(r, c));
        });
    }

    // Boxes
    for (let boxRow = 0; boxRow < 9; boxRow += 3) {
        for (let boxCol = 0; boxCol < 9; boxCol += 3) {
            const seen = new Map<number, {r:number, c:number}[]>();
            for(let i=0; i<3; i++) {
                for(let j=0; j<3; j++) {
                   const r = boxRow + i;
                   const c = boxCol + j;
                   const val = newGrid[r][c].value;
                   if (val !== 0) {
                       if (!seen.has(val)) seen.set(val, []);
                       seen.get(val)?.push({r, c});
                   }
                }
            }
            seen.forEach((cells) => {
                if (cells.length > 1) cells.forEach(pos => markError(pos.r, pos.c));
            });
        }
    }

    return newGrid;
};
