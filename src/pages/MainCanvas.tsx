import React, { useEffect, useState, useRef } from 'react';
import { useCardStore } from '../store/useCardStore';
import { useAppStore } from '../store/useAppStore';
import { ChronoFold } from '../components/Card/ChronoFold';
import { QuickInput } from '../components/Input/QuickInput';
import { Singularity } from '../components/Trash/Singularity';
import { ConnectionLines } from '../components/Canvas/ConnectionLines';
import { useCamera } from '../hooks/useCamera';
import { gestureService } from '../services/mediapipe';
import type { GestureType } from '../services/mediapipe';

import { SearchWormhole } from '../components/Overlay/SearchWormhole';
import { GhostLayer } from '../components/Overlay/GhostLayer';

const MainCanvas: React.FC = () => {
  const { folds, loadFolds, updateFoldPosition, setSelectedFoldId, removeFold, addConnection } = useCardStore();
  const { cameraPermission } = useAppStore();
  const { stream, requestPermission } = useCamera();

  const [inputPosition, setInputPosition] = useState<{ x: number; y: number } | null>(null);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [gestureStatus, setGestureStatus] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastGestureRef = useRef<{ type: GestureType; time: number }>({ type: 'None', time: 0 });

  useEffect(() => {
    loadFolds();
    if (cameraPermission === 'idle') {
      requestPermission();
    }
  }, []);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      gestureService.initialize().then(() => {
        detectFrame();
      });
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [stream]);

  const detectFrame = () => {
    if (videoRef.current && videoRef.current.readyState >= 2) {
      const result = gestureService.detectGesture(videoRef.current, performance.now());
      if (result) {
        handleGesture(result.gesture, result.landmarks);
      } else {
        setGestureStatus('');
      }
    }
    animationRef.current = requestAnimationFrame(detectFrame);
  };

  const handleGesture = (gesture: GestureType, _landmarks: any[]) => {
    const now = performance.now();
    setGestureStatus(`检测到手势: ${gesture}`);

    // 简单防抖
    if (gesture === lastGestureRef.current.type && now - lastGestureRef.current.time < 1000) {
      return;
    }

    if (gesture === 'Open_Palm') {
      // 触发新建
      if (!inputPosition) {
        setInputPosition({ x: window.innerWidth / 2 - 160, y: window.innerHeight / 2 - 100 });
      }
      lastGestureRef.current = { type: gesture, time: now };
    } else if (gesture === 'Closed_Fist') {
      // 暂不处理复杂的拖拽/删除，简单触发提示或执行兜底
      lastGestureRef.current = { type: gesture, time: now };
    }
  };

  // Handle Drag
  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingId !== null && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - 140; // center offset
      const y = e.clientY - rect.top - 75;
      updateFoldPosition(draggingId, { x, y });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (draggingId !== null) {
      const dropTarget = document.elementFromPoint(e.clientX, e.clientY);
      const targetCard = dropTarget?.closest('.chrono-fold');
      if (targetCard) {
        const targetId = Number(targetCard.getAttribute('data-id'));
        if (targetId && targetId !== draggingId) {
          addConnection(draggingId, targetId);
        }
      }
      setDraggingId(null);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelectedFoldId(null);
    }
  };

  const handleCanvasDoubleClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setInputPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleContextMenu = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    if (window.confirm('移入废纸篓？')) {
      removeFold(id);
    }
  };

  return (
    <div 
      className="relative w-full h-full overflow-hidden bg-[var(--color-void-bg)] text-white select-none"
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
      onDoubleClick={handleCanvasDoubleClick}
    >
      <SearchWormhole />
      <GhostLayer />
      {/* 顶部状态栏 */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-black/20 backdrop-blur-md border-b border-white/10 flex items-center px-4 justify-between z-50">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            本地模式
          </span>
          {gestureStatus && <span className="text-xs text-yellow-400 ml-4">{gestureStatus}</span>}
        </div>
        <div className="flex items-center gap-4 text-sm">
          <button className="hover:text-white text-gray-400 transition-colors">视图</button>
          <button className="hover:text-white text-gray-400 transition-colors">帮助</button>
          <button className="hover:text-white text-gray-400 transition-colors">更多</button>
        </div>
      </div>

      <ConnectionLines />

      {folds.length === 0 && !inputPosition && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-gray-500 flex flex-col items-center">
            <p className="mb-2">张开手掌，或双击空白处，从这里开始第一张薄片</p>
          </div>
        </div>
      )}

      {folds.map(fold => (
        <div key={fold.id} className="chrono-fold" data-id={fold.id} onContextMenu={(e) => handleContextMenu(e, fold.id!)}>
          <ChronoFold 
            fold={fold} 
            isDragging={draggingId === fold.id}
            onDragStart={(e, id) => {
              e.stopPropagation();
              setDraggingId(id);
              setSelectedFoldId(id);
            }}
          />
        </div>
      ))}

      {inputPosition && (
        <QuickInput 
          position={inputPosition} 
          onClose={() => setInputPosition(null)} 
        />
      )}

      {/* 底部悬浮新建按钮 (兜底) */}
      <div 
        className="absolute bottom-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white text-black flex items-center justify-center text-2xl font-light cursor-pointer hover:scale-110 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)] z-40"
        onClick={() => setInputPosition({ x: window.innerWidth / 2 - 160, y: window.innerHeight / 2 - 100 })}
      >
        +
      </div>

      {/* 废纸篓奇点 */}
      <div 
        className="absolute bottom-6 left-6 w-16 h-16 rounded-full bg-black/40 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-black/60 hover:scale-105 transition-all z-50 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
        onClick={() => setIsTrashOpen(!isTrashOpen)}
      >
        <span className="text-2xl">🕳️</span>
      </div>
      
      <Singularity isOpen={isTrashOpen} onClose={() => setIsTrashOpen(false)} />

      {/* 摄像头预览窗口 */}
      <div className="absolute bottom-6 right-6 w-[160px] h-[120px] bg-black/50 border border-white/20 rounded-xl overflow-hidden flex items-center justify-center backdrop-blur-sm z-50">
        {stream ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover transform -scale-x-100" 
          />
        ) : (
          <div className="text-xs text-gray-400 text-center px-2">
            📷 <br/> {cameraPermission === 'denied' ? '权限受限' : '预览关闭'}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainCanvas;
