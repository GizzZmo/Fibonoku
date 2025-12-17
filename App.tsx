import React, { useState, useEffect, useCallback } from 'react';
import { generateSudoku, validateBoard } from './utils/sudokuLogic';
import { Grid, Difficulty, CellValue, Cell } from './types';
import SudokuCell from './components/SudokuCell';
import Controls from './components/Controls';
import FibonacciVisualizer from './components/FibonacciVisualizer';
import Numpad from './components/Numpad';
import { Zap, Activity } from 'lucide-react';

const App: React.FC = () => {
  const [grid, setGrid] = useState<Grid>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);
  const [remainingCounts, setRemainingCounts] = useState<number[]>(Array(10).fill(0));
  const [isWon, setIsWon] = useState(false);

  // Initialize Game
  const startNewGame = useCallback(() => {
    const { initialGrid } = generateSudoku(difficulty);
    setGrid(initialGrid);
    setSelectedCell(null);
    setIsWon(false);
  }, [difficulty]);

  // Initial mount
  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  // Calculate remaining counts whenever grid changes
  useEffect(() => {
    if (grid.length === 0) return;

    const counts = Array(10).fill(0);
    let filledCount = 0;

    grid.forEach(row => {
      row.forEach(cell => {
        if (cell.value !== 0) {
          counts[cell.value]++;
          filledCount++;
        }
      });
    });

    // Valid Sudoku has 9 of each number
    const remaining = counts.map(c => Math.max(0, 9 - c));
    setRemainingCounts(remaining);

    if (filledCount === 81) {
       // Check win condition (simple check: no errors and full)
       const hasErrors = grid.some(r => r.some(c => c.isError));
       if (!hasErrors) {
         setIsWon(true);
       }
    }
  }, [grid]);

  // Handlers
  const handleCellClick = (r: number, c: number) => {
    setSelectedCell({ r, c });
  };

  const handleNumberInput = (num: CellValue) => {
    if (!selectedCell || isWon) return;
    const { r, c } = selectedCell;
    const cell = grid[r][c];

    if (cell.isFixed) return;

    const newGrid = [...grid];
    newGrid[r] = [...newGrid[r]];
    newGrid[r][c] = { ...cell, value: num, isError: false }; // Reset error on change, validation runs after

    // Validate entire board to update error states
    const validatedGrid = validateBoard(newGrid);
    setGrid(validatedGrid);
  };

  const handleDelete = () => {
    handleNumberInput(0);
  };

  const handleReset = () => {
    // Reset all non-fixed cells
    const newGrid = grid.map(row => 
      row.map(cell => 
        cell.isFixed ? cell : { ...cell, value: 0 as CellValue, isError: false }
      )
    );
    setGrid(newGrid);
    setIsWon(false);
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell) return;
      
      const num = parseInt(e.key);
      if (!isNaN(num) && num >= 1 && num <= 9) {
        handleNumberInput(num as CellValue);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleDelete();
      } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          e.preventDefault();
          setSelectedCell(prev => {
              if(!prev) return {r:0, c:0};
              let {r, c} = prev;
              if (e.key === 'ArrowUp') r = Math.max(0, r - 1);
              if (e.key === 'ArrowDown') r = Math.min(8, r + 1);
              if (e.key === 'ArrowLeft') c = Math.max(0, c - 1);
              if (e.key === 'ArrowRight') c = Math.min(8, c + 1);
              return {r, c};
          });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, grid, isWon]);

  // Loading state
  if (grid.length === 0) return <div className="text-cyber-cyan flex h-screen items-center justify-center">INITIALIZING NEURAL NET...</div>;

  const selectedValue = selectedCell ? grid[selectedCell.r][selectedCell.c].value : null;

  return (
    <div className="min-h-screen bg-cyber-dark text-gray-200 flex flex-col items-center py-8 font-mono selection:bg-cyber-pink selection:text-black">
      
      {/* Header */}
      <header className="w-full max-w-5xl px-4 flex justify-between items-center mb-8 border-b border-cyber-cyan/30 pb-4">
        <h1 className="text-3xl md:text-5xl font-bold text-cyber-cyan tracking-tighter drop-shadow-[0_0_10px_rgba(0,243,255,0.5)] flex items-center gap-3">
          <Zap className="w-8 h-8 md:w-10 md:h-10 text-cyber-yellow" />
          FIBONOKU
        </h1>
        <div className="flex flex-col items-end">
          <span className="text-xs text-cyber-pink tracking-[0.2em]">SYSTEM STATUS</span>
          <span className="text-cyber-green text-sm flex items-center gap-1">
             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> ONLINE
          </span>
        </div>
      </header>

      <main className="w-full max-w-5xl px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Game Board */}
        <section className="lg:col-span-7 flex flex-col items-center">
            
            {/* Board Container */}
            <div className="relative p-1 bg-gradient-to-br from-cyber-cyan via-cyber-purple to-cyber-pink rounded-lg shadow-neon">
                <div className="bg-black p-1 rounded-md">
                    <div className="grid grid-cols-9 w-[340px] h-[340px] md:w-[500px] md:h-[500px] border-2 border-cyber-cyan">
                        {grid.map((row, rIndex) => (
                            row.map((cell, cIndex) => (
                                <SudokuCell 
                                    key={`${rIndex}-${cIndex}`} 
                                    cell={cell} 
                                    isSelected={selectedCell?.r === rIndex && selectedCell?.c === cIndex}
                                    isActive={selectedValue !== 0 && selectedValue === cell.value}
                                    onClick={() => handleCellClick(rIndex, cIndex)}
                                />
                            ))
                        ))}
                    </div>
                </div>
                
                {/* Win Overlay */}
                {isWon && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg z-10 backdrop-blur-sm">
                        <h2 className="text-5xl font-bold text-cyber-yellow animate-bounce shadow-black drop-shadow-lg mb-4">SEQUENCE COMPLETE</h2>
                        <button onClick={startNewGame} className="px-6 py-2 bg-cyber-cyan text-black font-bold hover:bg-white transition-all shadow-neon">
                            NEXT LEVEL
                        </button>
                    </div>
                )}
            </div>

            <div className="w-full max-w-[500px] mt-6 lg:hidden">
              <Numpad onNumberClick={handleNumberInput} onDelete={handleDelete} />
            </div>

        </section>

        {/* Right Column: Visualizer & Controls */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Visualizer Panel */}
          <div className="w-full bg-cyber-panel border border-cyber-cyan/30 rounded-xl p-4 flex flex-col h-[400px]">
             <div className="flex justify-between items-center mb-2 border-b border-cyber-cyan/20 pb-2">
                 <h3 className="text-cyber-cyan font-bold flex items-center gap-2">
                    <Activity className="w-4 h-4" /> FIBONACCI.RESONANCE
                 </h3>
                 <span className="text-[10px] text-gray-500">REALTIME DATA VIZ</span>
             </div>
             <div className="flex-grow">
                 <FibonacciVisualizer remainingCounts={remainingCounts} />
             </div>
             <p className="text-[10px] text-center text-gray-500 mt-2">
                Radial length corresponds to Fib(RemainingCount). <br/>
                Larger arcs = More numbers needed.
             </p>
          </div>

          {/* Controls Panel */}
          <Controls 
            difficulty={difficulty} 
            setDifficulty={setDifficulty} 
            onNewGame={startNewGame}
            onReset={handleReset}
          />

          <div className="hidden lg:block">
            <Numpad onNumberClick={handleNumberInput} onDelete={handleDelete} />
          </div>

        </section>

      </main>

      <footer className="mt-12 text-center text-gray-600 text-xs">
          NEON FIBONOKU SYSTEM v1.0 // DEVELOPED BY AI
      </footer>
    </div>
  );
};

export default App;
