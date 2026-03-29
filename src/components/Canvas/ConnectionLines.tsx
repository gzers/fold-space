import React from 'react';
import { useCardStore } from '../../store/useCardStore';

export const ConnectionLines: React.FC = () => {
  const { folds, selectedFoldId } = useCardStore();

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
      {folds.map(fold => {
        return fold.connections.map(targetId => {
          const targetFold = folds.find(f => f.id === targetId);
          if (!targetFold) return null;

          // 计算连线起点和终点（卡片中心点，假设卡片宽280，高约150）
          const startX = fold.position.x + 140;
          const startY = fold.position.y + 75;
          const endX = targetFold.position.x + 140;
          const endY = targetFold.position.y + 75;

          const isHighlighted = selectedFoldId === fold.id || selectedFoldId === targetFold.id;

          return (
            <g key={`${fold.id}-${targetId}`}>
              {/* 发光外层 */}
              {isHighlighted && (
                <line
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              )}
              {/* 核心内线 */}
              <line
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke={isHighlighted ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.15)"}
                strokeWidth="2"
                strokeDasharray={isHighlighted ? "none" : "5,5"}
              />
            </g>
          );
        });
      })}
    </svg>
  );
};
