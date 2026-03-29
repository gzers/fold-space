import React, { useState } from 'react';
import { useCardStore } from '../../store/useCardStore';

export const SearchWormhole: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const { folds, setSelectedFoldId } = useCardStore();

  const results = keyword ? folds.filter(f => 
    f.content.includes(keyword) || f.tags.some(t => t.includes(keyword))
  ) : [];

  const handleSelect = (id: number) => {
    setSelectedFoldId(id);
    setIsOpen(false);
    setKeyword('');
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="px-4 py-1.5 bg-black/40 border border-white/20 rounded-full text-sm text-gray-300 hover:text-white hover:bg-black/60 backdrop-blur-md transition-colors"
        >
          🔍 搜索虫洞
        </button>
      ) : (
        <div className="w-80 bg-black/80 border border-white/20 rounded-xl backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="flex items-center px-4 py-2 border-b border-white/10">
            <span className="text-gray-400 mr-2">🔍</span>
            <input 
              autoFocus
              type="text" 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索记忆内容或标签..."
              className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder-gray-500"
            />
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white text-sm ml-2">✕</button>
          </div>
          
          {keyword && (
            <div className="max-h-64 overflow-y-auto custom-scrollbar p-2">
              {results.length > 0 ? (
                results.map(f => (
                  <div 
                    key={f.id} 
                    onClick={() => handleSelect(f.id!)}
                    className="p-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
                  >
                    <p className="text-sm text-gray-200 line-clamp-1">{f.content}</p>
                    <div className="flex gap-2 mt-1">
                      {f.tags.map(t => (
                        <span key={t} className="text-xs text-gray-400">#{t}</span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-sm text-gray-500">
                  没有找到对应记忆，试试其他关键词
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
