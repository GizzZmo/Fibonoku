import React from 'react';
import { CellValue } from '../types';

interface NumpadProps {
  onNumberClick: (num: CellValue) => void;
  onDelete: () => void;
}

const Numpad: React.FC<NumpadProps> = ({ onNumberClick, onDelete }) => {
  return (
    <div className="grid grid-cols-3 gap-2 w-full mt-4">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <button
          key={num}
          onClick={() => onNumberClick(num as CellValue)}
          className="
            h-12 
            bg-cyber-panel border border-cyber-cyan/50 text-cyber-cyan 
            font-mono text-xl font-bold 
            hover:bg-cyber-cyan hover:text-black hover:shadow-neon 
            transition-all rounded
          "
        >
          {num}
        </button>
      ))}
      <button
        onClick={onDelete}
        className="
          col-span-3 h-10 mt-1
          bg-red-900/20 border border-red-500/50 text-red-400
          font-mono font-bold
          hover:bg-red-500 hover:text-black
          transition-all rounded uppercase tracking-widest
        "
      >
        Clear Cell
      </button>
    </div>
  );
};

export default Numpad;
