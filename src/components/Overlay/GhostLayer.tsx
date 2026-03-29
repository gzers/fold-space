import React, { useEffect, useState } from 'react';

export const GhostLayer: React.FC = () => {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 模拟检测到用户首次进入后的简单引导
    const timer = setTimeout(() => {
      setStep(1);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-40 flex items-center justify-center">
      {step === 1 && (
        <div className="bg-black/60 text-white px-6 py-4 rounded-2xl backdrop-blur-md border border-white/20 text-center animate-fade-in">
          <div className="text-4xl mb-2">🖐️</div>
          <p className="text-lg font-medium">张开手掌，保持 1 秒</p>
          <p className="text-sm text-gray-400 mt-1">创建新的时空薄片</p>
          <button 
            className="mt-4 px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-sm pointer-events-auto"
            onClick={() => setStep(2)}
          >
            下一步
          </button>
        </div>
      )}
      {step === 2 && (
        <div className="bg-black/60 text-white px-6 py-4 rounded-2xl backdrop-blur-md border border-white/20 text-center animate-fade-in">
          <div className="text-4xl mb-2">🤏</div>
          <p className="text-lg font-medium">捏合卡片并拖拽</p>
          <p className="text-sm text-gray-400 mt-1">移动位置或建立连接</p>
          <button 
            className="mt-4 px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-sm pointer-events-auto"
            onClick={() => setIsVisible(false)}
          >
            完成
          </button>
        </div>
      )}
    </div>
  );
};
