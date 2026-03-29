import React, { useState } from 'react';
import { useCardStore } from '../../store/useCardStore';
import { useMicrophone } from '../../hooks/useMicrophone';

interface QuickInputProps {
  position: { x: number; y: number };
  onClose: () => void;
}

export const QuickInput: React.FC<QuickInputProps> = ({ position, onClose }) => {
  const [content, setContent] = useState('');
  const [emotion, setEmotion] = useState('var(--color-emotion-neutral)');
  const [tags] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  
  const { addFold } = useCardStore();
  const { micPermission } = useMicrophone();

  const handleSave = async () => {
    if (!content.trim()) {
      onClose();
      return;
    }
    await addFold({
      content,
      emotion,
      tags,
      timestamp: Date.now(),
      position,
      connections: []
    });
    onClose();
  };

  const handleToggleRecord = () => {
    if (micPermission !== 'granted') {
      alert('未获取麦克风权限，已切换为键盘输入');
      return;
    }
    setIsRecording(!isRecording);
    // 这里可接入真实录音逻辑
  };

  return (
    <div 
      className="absolute z-50 w-80 bg-[#1e1e24] border border-white/20 rounded-2xl p-4 shadow-2xl backdrop-blur-xl"
      style={{ left: position.x, top: position.y }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={handleToggleRecord}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
            isRecording ? 'bg-red-500/20 text-red-400' : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          <span>🎙️</span> {isRecording ? '正在聆听...' : '语音速记'}
        </button>
        <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
      </div>

      <textarea
        autoFocus
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="记录此刻的想法..."
        className="w-full h-24 bg-transparent border-none outline-none resize-none text-white text-base placeholder-gray-500 mb-4"
      />

      <div className="flex gap-2 mb-4">
        <button 
          onClick={() => setEmotion('var(--color-emotion-calm)')}
          className={`w-6 h-6 rounded-full bg-[var(--color-emotion-calm)] border-2 ${emotion === 'var(--color-emotion-calm)' ? 'border-white' : 'border-transparent'}`}
        />
        <button 
          onClick={() => setEmotion('var(--color-emotion-warm)')}
          className={`w-6 h-6 rounded-full bg-[var(--color-emotion-warm)] border-2 ${emotion === 'var(--color-emotion-warm)' ? 'border-white' : 'border-transparent'}`}
        />
        <button 
          onClick={() => setEmotion('var(--color-emotion-neutral)')}
          className={`w-6 h-6 rounded-full bg-[var(--color-emotion-neutral)] border-2 ${emotion === 'var(--color-emotion-neutral)' ? 'border-black' : 'border-transparent'}`}
        />
        <button 
          onClick={() => setEmotion('var(--color-emotion-low)')}
          className={`w-6 h-6 rounded-full bg-[var(--color-emotion-low)] border-2 ${emotion === 'var(--color-emotion-low)' ? 'border-white' : 'border-transparent'}`}
        />
      </div>

      <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
        <div className="text-xs text-gray-500">按 Esc 取消, Enter 保存</div>
        <div className="flex gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm hover:bg-white/10">取消</button>
          <button onClick={handleSave} className="px-4 py-2 rounded-lg text-sm bg-white text-black font-medium">保存</button>
        </div>
      </div>
    </div>
  );
};
