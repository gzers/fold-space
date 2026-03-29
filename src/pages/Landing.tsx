import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCamera } from '../hooks/useCamera';
import { useMicrophone } from '../hooks/useMicrophone';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { requestPermission: reqCam } = useCamera();
  const { requestPermission: reqMic } = useMicrophone();

  const handleStart = async () => {
    // 依次请求权限，即使拒绝也不阻塞进入画布
    await reqCam();
    await reqMic();
    navigate('/canvas');
  };

  const handleSkip = () => {
    navigate('/canvas');
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen text-center p-6 relative text-white overflow-hidden bg-[var(--color-void-bg)] bg-[url('/backgrounds/landing-bg.png')] bg-cover bg-center bg-no-repeat"
    >
      <div className="z-10 max-w-2xl">
        <h1 className="text-5xl font-bold mb-6 tracking-tight">褶宇宙 Fold-Space</h1>
        <p className="text-xl text-gray-300 mb-12">把你的生命时刻折叠进可触摸的时空褶皱里。</p>
        
        <div className="space-y-6 bg-black/45 p-8 rounded-2xl border border-white/12 backdrop-blur-md mb-12 text-left shadow-[0_0_40px_rgba(0,0,0,0.28)]">
          <h2 className="text-2xl font-semibold mb-4">需要以下权限以获得完整体验</h2>
          <div className="flex flex-col space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-xl">📷</div>
              <div>
                <h3 className="font-medium text-lg mb-1">摄像头权限</h3>
                <p className="text-gray-400 text-sm leading-relaxed">用于捕捉手势动作，让你能在空气中张开手掌新建日记、捏合拖拽卡片。我们承诺视频流仅在本地处理，零上传。</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-xl">🎙️</div>
              <div>
                <h3 className="font-medium text-lg mb-1">麦克风权限</h3>
                <p className="text-gray-400 text-sm leading-relaxed">用于语音速记，帮助你快速录入想法。录音转写后立即丢弃原音频流，绝不保存。</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-xl">💾</div>
              <div>
                <h3 className="font-medium text-lg mb-1">本地存储</h3>
                <p className="text-gray-400 text-sm leading-relaxed">你的数据将被安全地存储在浏览器本地，不依赖任何服务器。</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6">
          <button 
            onClick={handleStart}
            className="px-8 py-4 bg-white text-black rounded-full font-semibold text-lg hover:scale-105 transition-transform cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.3)]"
          >
            开始进入我的宇宙
          </button>
          
          <button 
            onClick={handleSkip}
            className="text-sm text-gray-400 hover:text-white transition-colors underline underline-offset-4 cursor-pointer"
          >
            跳过手势，使用鼠标/触控进入
          </button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
