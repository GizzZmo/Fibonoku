import React from 'react';
import { Difficulty } from '../types';
import { RotateCcw, Play, ShieldAlert, Cpu } from 'lucide-react';

interface ControlsProps {
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  onNewGame: () => void;
  onReset: () => void;
}

const Controls: React.FC<ControlsProps> = ({ difficulty, setDifficulty, onNewGame, onReset }) => {
  return (
    <div className="flex flex-col gap-4 w-full p-4 bg-cyber-panel/50 border border-cyber-pink/30 rounded-xl backdrop-blur-md">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-cyber-pink font-mono text-lg flex items-center gap-2">
          <Cpu className="w-5 h-5" /> SYSTEM.CTRL
        </h2>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-4">
         {(Object.keys(Difficulty) as Array<keyof typeof Difficulty>).map((diff) => (
           <button
             key={diff}
             onClick={() => setDifficulty(Difficulty[diff])}
             className={`
               px-3 py-2 text-xs font-mono font-bold border
               transition-all duration-300
               ${difficulty === Difficulty[diff] 
                 ? 'bg-cyber-pink text-black border-cyber-pink shadow-neon_pink' 
                 : 'bg-transparent text-cyber-pink border-cyber-pink/50 hover:bg-cyber-pink/20'}
             `}
           >
             {diff}
           </button>
         ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onNewGame}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-cyber-cyan text-black font-bold font-mono border border-cyber-cyan shadow-neon hover:bg-white transition-all"
        >
          <Play className="w-4 h-4" /> NEW_RUN
        </button>
        <button
          onClick={onReset}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-transparent text-cyber-cyan border border-cyber-cyan font-bold font-mono hover:bg-cyber-cyan/10 transition-all"
        >
          <RotateCcw className="w-4 h-4" /> REBOOT
        </button>
      </div>
    </div>
  );
};

export default Controls;
