import React from 'react';
import type { Fold } from '../../db';
import clsx from 'clsx';
import { useCardStore } from '../../store/useCardStore';

interface ChronoFoldProps {
  fold: Fold;
  isDragging?: boolean;
  onDragStart?: (e: React.MouseEvent, id: number) => void;
}

export const ChronoFold: React.FC<ChronoFoldProps> = ({ fold, isDragging, onDragStart }) => {
  const { selectedFoldId, setSelectedFoldId } = useCardStore();
  const isSelected = selectedFoldId === fold.id;

  return (
    <div
      className={clsx(
        "absolute rounded-2xl p-4 cursor-pointer transition-all duration-200 select-none",
        "border border-[var(--color-fold-border)] backdrop-blur-md",
        isSelected ? "shadow-[0_0_20px_var(--color-fold-glow)] scale-105 z-20" : "hover:scale-[1.03] z-10 hover:border-white/40",
        isDragging ? "opacity-80 scale-105" : ""
      )}
      style={{
        left: fold.position.x,
        top: fold.position.y,
        width: 280,
        backgroundColor: fold.emotion || 'var(--color-emotion-neutral)',
        color: fold.emotion === 'var(--color-emotion-neutral)' ? 'black' : 'white',
      }}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedFoldId(fold.id!);
      }}
      onMouseDown={(e) => onDragStart?.(e, fold.id!)}
    >
      <div className="flex items-center justify-between mb-3 opacity-70">
        <span className="text-xs font-mono">
          {new Date(fold.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        <span className="text-xs">
          {fold.emotion === 'var(--color-emotion-calm)' ? '🌌' : 
           fold.emotion === 'var(--color-emotion-warm)' ? '🌅' : 
           fold.emotion === 'var(--color-emotion-low)' ? '🌧️' : '☀️'}
        </span>
      </div>
      
      <p className="text-base leading-relaxed mb-4 line-clamp-5">
        {fold.content || '空空如也...'}
      </p>
      
      <div className="flex flex-wrap gap-2">
        {fold.tags.map(tag => (
          <span key={tag} className="text-xs px-2 py-1 rounded-full bg-black/20">
            #{tag}
          </span>
        ))}
      </div>

      {/* Selected anchors */}
      {isSelected && (
        <>
          <div className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-white border-2 border-black/50" />
          <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-white border-2 border-black/50" />
          <div className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-white border-2 border-black/50" />
          <div className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-white border-2 border-black/50" />
        </>
      )}
    </div>
  );
};
