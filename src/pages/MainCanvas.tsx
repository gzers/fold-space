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
  const { folds, loadFolds, updateFoldPosition, selectedFoldId, setSelectedFoldId, removeFold, addConnection } = useCardStore();
  const { cameraPermission } = useAppStore();
  const { stream, requestPermission } = useCamera();

  const [inputPosition, setInputPosition] = useState<{ x: number; y: number } | null>(null);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [gestureStatus, setGestureStatus] = useState<string>('准备就绪：张开手掌开始记录');
  const [gestureSaveSignal, setGestureSaveSignal] = useState(0);
  const [gestureCancelSignal, setGestureCancelSignal] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastGestureRef = useRef<{ type: GestureType; time: number }>({ type: 'None', time: 0 });

  useEffect(() => {
    loadFolds();
  }, [loadFolds]);

  useEffect(() => {
    if (cameraPermission === 'idle') {
      requestPermission();
    }
  }, [cameraPermission, requestPermission]);

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

  useEffect(() => {
    if (!inputPosition) {
      setGestureStatus('准备就绪：张开手掌开始记录');
    } else {
      setGestureStatus('录音中：请直接说话。握拳保存，拇指向下取消');
    }
  }, [inputPosition]);

  const detectFrame = () => {
    if (videoRef.current && videoRef.current.readyState >= 2) {
      const result = gestureService.detectGesture(videoRef.current, performance.now());
      if (result) {
        handleGesture(result.gesture);
      } else if (!inputPosition) {
        setGestureStatus('准备就绪：张开手掌开始记录');
      }
    }
    animationRef.current = requestAnimationFrame(detectFrame);
  };

  const handleGesture = (gesture: GestureType) => {
    const now = performance.now();

    if (gesture === lastGestureRef.current.type && now - lastGestureRef.current.time < 1000) {
      return;
    }

    if (inputPosition && gesture === 'Closed_Fist') {
      setGestureStatus('高优先级动作：立即保存并结束录音');
      setGestureSaveSignal((value) => value + 1);
      lastGestureRef.current = { type: gesture, time: now };
      return;
    }

    if (inputPosition && gesture === 'Thumb_Down') {
      setGestureStatus('高优先级动作：立即关闭录音并取消本次输入');
      setGestureCancelSignal((value) => value + 1);
      lastGestureRef.current = { type: gesture, time: now };
      return;
    }

    if (gesture === 'Open_Palm') {
      if (!inputPosition) {
        setInputPosition({ x: window.innerWidth / 2 - 160, y: window.innerHeight / 2 - 100 });
        setGestureStatus('已展开手掌，正在自动开启语音输入');
      } else {
        setGestureStatus('输入中：请继续说话。握拳保存，拇指向下取消');
      }
      lastGestureRef.current = { type: gesture, time: now };
      return;
    }

    if (!inputPosition && gesture === 'Closed_Fist') {
      if (selectedFoldId) {
        removeFold(selectedFoldId);
        setGestureStatus('已通过手势将当前卡片移入废纸篓');
      } else {
        setGestureStatus('请先选中一张卡片，再握拳移入废纸篓');
      }
      lastGestureRef.current = { type: gesture, time: now };
      return;
    }

    if (!inputPosition && gesture === 'Thumb_Down') {
      setGestureStatus('当前没有可关闭的输入。先张开手掌开始记录');
      lastGestureRef.current = { type: gesture, time: now };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingId !== null && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - 140;
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
        y: e.clientY - rect.top,
      });
      setGestureStatus('已打开输入层：请直接说话。握拳保存，拇指向下取消');
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
      className="relative w-full h-full overflow-hidden bg-[var(--color-void-bg)] text-white select-none bg-[url('/backgrounds/canvas-bg.png')] bg-cover bg-center bg-no-repeat"
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
      onDoubleClick={handleCanvasDoubleClick}
    >
      <SearchWormhole />
      <GhostLayer />

      <div className="absolute top-0 left-0 right-0 h-12 bg-black/20 backdrop-blur-md border-b border-white/10 flex items-center px-4 justify-between z-50">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            本地模式
          </span>
          {gestureStatus && <span className="text-xs text-cyan-300 ml-4">{gestureStatus}</span>}
        </div>
        <div className="flex items-center gap-4 text-sm">
          <button className="hover:text-white text-gray-400 transition-colors">视图</button>
          <button className="hover:text-white text-gray-400 transition-colors">帮助</button>
          <button className="hover:text-white text-gray-400 transition-colors">更多</button>
        </div>
      </div>

      <div className="absolute top-16 left-4 z-50 w-72 rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur-md">
        <div className="text-sm font-semibold text-white">操作总览</div>
        <div className="mt-3 space-y-2 text-xs text-gray-300">
          <div className="rounded-lg bg-white/5 px-3 py-2">张开手掌：新建薄片并自动开始录音</div>
          <div className="rounded-lg bg-emerald-500/10 px-3 py-2 text-emerald-200">握拳：高优先级立即保存，直接截断录音</div>
          <div className="rounded-lg bg-rose-500/10 px-3 py-2 text-rose-200">拇指向下：高优先级关闭录音并取消本次输入</div>
          <div className="rounded-lg bg-white/5 px-3 py-2">双击空白处：手动打开输入层</div>
          <div className="rounded-lg bg-white/5 px-3 py-2">拖拽卡片到另一张卡片上：建立连接</div>
          <div className="rounded-lg bg-white/5 px-3 py-2">选中卡片后握拳：移入废纸篓</div>
          <div className="rounded-lg bg-white/5 px-3 py-2">右键卡片：仅作为鼠标兜底删除方式</div>
        </div>
      </div>

      <ConnectionLines />

      {folds.length === 0 && !inputPosition && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-gray-500 flex flex-col items-center">
            <p className="mb-2">张开手掌自动开始录音，或双击空白处开始第一张薄片</p>
            <p className="text-sm text-gray-600">录音中握拳保存；选中卡片后握拳可移入废纸篓；拇指向下关闭输入</p>
          </div>
        </div>
      )}

      {folds.map((fold) => (
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
          gestureSaveSignal={gestureSaveSignal}
          gestureCancelSignal={gestureCancelSignal}
          onClose={() => {
            setInputPosition(null);
            setGestureStatus('本次输入已结束。张开手掌可继续新建');
          }}
        />
      )}

      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white text-black flex items-center justify-center text-2xl font-light cursor-pointer hover:scale-110 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)] z-40"
        onClick={() => {
          setInputPosition({ x: window.innerWidth / 2 - 160, y: window.innerHeight / 2 - 100 });
          setGestureStatus('已打开输入层：请直接说话。握拳保存，拇指向下取消');
        }}
      >
        +
      </div>

      <div
        className="absolute bottom-6 left-6 w-16 h-16 rounded-full bg-black/40 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-black/60 hover:scale-105 transition-all z-50 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
        onClick={() => setIsTrashOpen(!isTrashOpen)}
      >
        <span className="text-2xl">🕳️</span>
      </div>

      <Singularity isOpen={isTrashOpen} onClose={() => setIsTrashOpen(false)} />

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
            📷 <br /> {cameraPermission === 'denied' ? '权限受限' : '预览关闭'}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainCanvas;
