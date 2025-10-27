import React from 'react';
import type { TextBlock } from '../types';
import { BlockItem } from './BlockItem';

interface BlocksDisplayProps {
  blocks: TextBlock[];
  onRetry: (blockId: string) => void;
}

export const BlocksDisplay: React.FC<BlocksDisplayProps> = ({ blocks, onRetry }) => {
  if (blocks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Aguardando arquivo para processar...</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
      {blocks.map((block) => (
        <BlockItem key={block.id} block={block} onRetry={onRetry} />
      ))}
    </div>
  );
};
