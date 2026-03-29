import { db } from './index';
import type { Fold, TrashItem } from './index';

export const dbHooks = {
  // 获取所有卡片
  async getAllFolds(): Promise<Fold[]> {
    return await db.folds.toArray();
  },

  // 添加或更新卡片
  async saveFold(fold: Fold): Promise<number> {
    if (fold.id) {
      await db.folds.put(fold);
      return fold.id;
    } else {
      return await db.folds.add(fold);
    }
  },

  // 删除到废纸篓
  async moveToTrash(foldId: number): Promise<void> {
    const fold = await db.folds.get(foldId);
    if (!fold) return;

    const trashItem: Omit<TrashItem, 'id'> = {
      ...fold,
      originalId: foldId,
      deletedAt: Date.now(),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30天后过期
    };
    
    // Remove the id to let Dexie auto-increment for trash
    delete (trashItem as any).id;

    await db.transaction('rw', db.folds, db.trash, async () => {
      await db.trash.add(trashItem as TrashItem);
      await db.folds.delete(foldId);
    });
  },

  // 从废纸篓恢复
  async restoreFromTrash(trashId: number): Promise<void> {
    const item = await db.trash.get(trashId);
    if (!item) throw new Error('该卡片已不存在');

    const { originalId, deletedAt, expiresAt, id, ...foldData } = item;

    await db.transaction('rw', db.folds, db.trash, async () => {
      await db.folds.add({ ...foldData, id: originalId });
      await db.trash.delete(trashId);
    });
  },

  // 获取废纸篓内容
  async getTrashItems(): Promise<TrashItem[]> {
    return await db.trash.toArray();
  },

  // 彻底删除
  async permanentlyDelete(trashId: number): Promise<void> {
    await db.trash.delete(trashId);
  }
};
