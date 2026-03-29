import React, { useEffect, useState } from 'react';
import { dbHooks } from '../../db/hooks';
import type { TrashItem } from '../../db';
import { useCardStore } from '../../store/useCardStore';

interface SingularityProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Singularity: React.FC<SingularityProps> = ({ isOpen, onClose }) => {
  const [items, setItems] = useState<TrashItem[]>([]);
  const { loadFolds } = useCardStore();

  useEffect(() => {
    if (isOpen) {
      loadTrash();
    }
  }, [isOpen]);

  const loadTrash = async () => {
    const trashItems = await dbHooks.getTrashItems();
    setItems(trashItems);
  };

  const handleRestore = async (id: number) => {
    await dbHooks.restoreFromTrash(id);
    await loadTrash();
    await loadFolds();
  };

  const handlePermanentDelete = async (id: number) => {
    if (window.confirm('确定要永久粉碎这条记忆吗？操作不可逆。')) {
      await dbHooks.permanentlyDelete(id);
      await loadTrash();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-24 left-6 w-80 max-h-96 bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl p-4 flex flex-col z-50">
      <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
        <h3 className="font-medium text-white flex items-center gap-2">
          <span>🕳️</span> 废纸篓奇点
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {items.length === 0 ? (
          <div className="text-center text-gray-500 py-8 text-sm">
            这里存放暂时放下的记忆<br/>(30天后自动蒸发)
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="bg-white/5 border border-white/10 rounded-lg p-3 group">
              <p className="text-sm text-gray-300 line-clamp-2 mb-2">{item.content || '空内容'}</p>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">
                  {new Date(item.deletedAt).toLocaleDateString()}
                </span>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <button 
                    onClick={() => handleRestore(item.id!)}
                    className="text-green-400 hover:text-green-300"
                  >
                    恢复
                  </button>
                  <button 
                    onClick={() => handlePermanentDelete(item.id!)}
                    className="text-red-400 hover:text-red-300"
                  >
                    粉碎
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
