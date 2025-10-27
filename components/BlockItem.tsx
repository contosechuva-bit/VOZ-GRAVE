import React from 'react';
import type { TextBlock } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface BlockItemProps {
  block: TextBlock;
  onRetry: (blockId: string) => void;
}

export const BlockItem: React.FC<BlockItemProps> = ({ block, onRetry }) => {
  const getBorderColor = () => {
    switch (block.status) {
      case 'success':
        return 'border-green-500';
      case 'error':
        return 'border-red-500';
      case 'processing':
        return 'border-cyan-500';
      default:
        return 'border-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (block.status) {
      case 'success':
        return <i className="fa-solid fa-check text-green-500"></i>;
      case 'error':
        return <i className="fa-solid fa-exclamation-triangle text-red-500"></i>;
      case 'processing':
        return <LoadingSpinner />;
      default:
        return <i className="fa-solid fa-clock text-gray-500"></i>;
    }
  };

  return (
    <div className={`p-4 bg-gray-900/70 border-l-4 ${getBorderColor()} rounded-md transition-colors duration-300`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 flex items-center justify-center">{getStatusIcon()}</div>
          <span className="font-mono text-sm text-gray-300">
            Capítulo {block.chapter} - Bloco {block.blockInChapter}
          </span>
        </div>
        {block.status === 'error' && (
          <button
            onClick={() => onRetry(block.id)}
            className="text-xs bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-1 px-2 rounded-md transition-colors"
          >
            <i className="fa-solid fa-sync-alt mr-1"></i>
            Tentar Novamente
          </button>
        )}
      </div>
      {block.status === 'error' && (
        <div className="mt-3 p-3 bg-red-900/30 rounded-md">
          <p className="text-xs text-red-300 font-mono break-words">
            <strong>Erro ao processar:</strong> "{block.text.substring(0, 150)}..."
          </p>
        </div>
      )}
    </div>
  );
};
