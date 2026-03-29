import React, { useEffect, useRef, useState } from 'react';
import { useCardStore } from '../../store/useCardStore';
import { useMicrophone } from '../../hooks/useMicrophone';

interface QuickInputProps {
  position: { x: number; y: number };
  onClose: () => void;
  gestureSaveSignal?: number;
  gestureCancelSignal?: number;
}

type RecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

declare global {
  interface Window {
    SpeechRecognition?: new () => RecognitionInstance;
    webkitSpeechRecognition?: new () => RecognitionInstance;
  }
}

export const QuickInput: React.FC<QuickInputProps> = ({
  position,
  onClose,
  gestureSaveSignal = 0,
  gestureCancelSignal = 0,
}) => {
  const [content, setContent] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [emotion, setEmotion] = useState('var(--color-emotion-neutral)');
  const [tags] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [statusText, setStatusText] = useState('正在准备语音输入...');
  const [inputMode, setInputMode] = useState<'voice' | 'keyboard'>('voice');

  const { addFold } = useCardStore();
  const { micPermission, requestPermission, stopMicrophone } = useMicrophone();
  const recognitionRef = useRef<RecognitionInstance | null>(null);
  const finalTranscriptRef = useRef('');
  const isManuallyStoppingRef = useRef(false);
  const isSavingRef = useRef(false);
  const isCancellingRef = useRef(false);

  const stopRecognition = () => {
    if (recognitionRef.current) {
      isManuallyStoppingRef.current = true;
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const closeInput = () => {
    stopRecognition();
    stopMicrophone();
    onClose();
  };

  const handleCancel = () => {
    isCancellingRef.current = true;
    setStatusText('已关闭录音，本次输入已取消');
    closeInput();
  };

  const handleSave = async () => {
    const finalContent = (draftContent || content).trim();

    if (!finalContent) {
      setStatusText('还没有记录内容，请继续说话或切换键盘输入');
      return;
    }

    isSavingRef.current = true;
    stopRecognition();
    stopMicrophone();
    setStatusText('正在保存这张薄片...');

    await addFold({
      content: finalContent,
      emotion,
      tags,
      timestamp: Date.now(),
      position,
      connections: [],
    });

    onClose();
  };

  const startSpeechRecognition = async () => {
    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setInputMode('keyboard');
      setStatusText('当前浏览器不支持语音转写，已切换为键盘输入');
      return;
    }

    if (micPermission === 'denied' || micPermission === 'unavailable') {
      setInputMode('keyboard');
      setStatusText('麦克风不可用，已切换为键盘输入');
      return;
    }

    const success = await requestPermission();
    if (!success) {
      setInputMode('keyboard');
      setStatusText('未获取麦克风权限，已切换为键盘输入');
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = 'zh-CN';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const transcript = event.results[i][0]?.transcript ?? '';
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const mergedContent = `${finalTranscriptRef.current}${interimTranscript}`.trim();
      setDraftContent(mergedContent);
      setContent(mergedContent);
      setStatusText('正在聆听，请继续说话。握拳保存，拇指向下取消');
    };

    recognition.onerror = () => {
      setIsRecording(false);
      setInputMode('keyboard');
      stopMicrophone();
      setStatusText('语音转写失败，已切换为键盘输入');
    };

    recognition.onend = () => {
      setIsRecording(false);

      if (isSavingRef.current) {
        isSavingRef.current = false;
        return;
      }

      if (isCancellingRef.current) {
        isCancellingRef.current = false;
        return;
      }

      if (isManuallyStoppingRef.current) {
        isManuallyStoppingRef.current = false;
        return;
      }

      if (inputMode === 'voice') {
        setStatusText('语音已暂停，你可以继续说话、握拳保存，或拇指向下取消');
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setStatusText('正在聆听，请开始说话。握拳保存，拇指向下取消');
  };

  useEffect(() => {
    startSpeechRecognition();

    return () => {
      stopRecognition();
      stopMicrophone();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (gestureSaveSignal > 0) {
      handleSave();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gestureSaveSignal]);

  useEffect(() => {
    if (gestureCancelSignal > 0) {
      handleCancel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gestureCancelSignal]);

  const handleToggleRecord = async () => {
    if (inputMode === 'keyboard') {
      await startSpeechRecognition();
      return;
    }

    if (isRecording) {
      stopRecognition();
      stopMicrophone();
      setStatusText('录音已暂停。你可以继续录音、直接保存，或取消本次输入');
      return;
    }

    await startSpeechRecognition();
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
          <span>🎙️</span>
          {isRecording ? '正在聆听...' : inputMode === 'voice' ? '继续录音' : '启用语音'}
        </button>
        <button onClick={handleCancel} className="text-gray-400 hover:text-white">
          ✕
        </button>
      </div>

      <div className="mb-3 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-100">
        <div className="font-medium">当前提示</div>
        <div className="mt-1 leading-relaxed">{statusText}</div>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2 text-xs text-gray-300">
        <div className="rounded-lg bg-white/5 px-2 py-2 text-center">张开手掌进入</div>
        <div className="rounded-lg bg-white/5 px-2 py-2 text-center">握拳立即保存</div>
        <div className="rounded-lg bg-white/5 px-2 py-2 text-center">拇指向下取消</div>
      </div>

      <textarea
        autoFocus
        value={content}
        onChange={(e) => {
          setInputMode('keyboard');
          setContent(e.target.value);
          setDraftContent(e.target.value);
          setStatusText('键盘输入中，可直接保存，或关闭本次输入');
        }}
        placeholder="正在等待你的声音，或直接输入文字..."
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
        <div className="text-xs text-gray-500">
          {inputMode === 'voice' ? '握拳保存优先，拇指向下可立即关闭' : '当前为键盘输入模式'}
        </div>
        <div className="flex gap-2">
          <button onClick={handleCancel} className="px-4 py-2 rounded-lg text-sm hover:bg-white/10">
            取消
          </button>
          <button onClick={handleSave} className="px-4 py-2 rounded-lg text-sm bg-white text-black font-medium">
            保存
          </button>
        </div>
      </div>
    </div>
  );
};
