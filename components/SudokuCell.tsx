import React from 'react';
import { Cell } from '../types';

interface SudokuCellProps {
  cell: Cell;
  isSelected: boolean;
  isActive: boolean; // Same number as selected
  onClick: () => void;
}

const SudokuCell: React.FC<SudokuCellProps> = ({ cell, isSelected, isActive, onClick }) => {
  const { value, isFixed, isError, row, col } = cell;

  // Grid styling logic
  const borderRight = (col + 1) % 3 === 0 && col !== 8 ? 'border-r-2 border-cyber-cyan' : 'border-r border-cyber-cyan/30';
  const borderBottom = (row + 1) % 3 === 0 && row !== 8 ? 'border-b-2 border-cyber-cyan' : 'border-b border-cyber-cyan/30';

  // State styling
  let bgColor = 'bg-transparent';
  let textColor = 'text-cyber-cyan';

  if (isError) {
    bgColor = 'bg-red-900/40';
    textColor = 'text-red-500 animate-pulse';
  } else if (isSelected) {
    bgColor = 'bg-cyber-cyan/30';
    textColor = 'text-white';
  } else if (isActive && value !== 0) {
    bgColor = 'bg-cyber-purple/30';
    textColor = 'text-cyber-purple';
  } else if (isFixed) {
    textColor = 'text-gray-400';
    bgColor = 'bg-black/20';
  }

  return (
    <div
      onClick={onClick}
      className={`
        ${borderRight} ${borderBottom}
        ${bgColor}
        w-full h-full
        flex items-center justify-center
        text-xl md:text-2xl font-mono font-bold cursor-pointer
        transition-all duration-200 select-none
        hover:bg-cyber-cyan/10
      `}
    >
      {value !== 0 ? value : ''}
    </div>
  );
};

export default SudokuCell;
