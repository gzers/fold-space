import Dexie from 'dexie';
import type { Table } from 'dexie';

// 时空薄片（卡片）的数据结构
export interface Fold {
  id?: number;
  content: string;
  timestamp: number;
  emotion: string; // 存储颜色或情绪标识
  position: { x: number; y: number; z?: number };
  tags: string[];
  connections: number[]; // 关联的其它 Fold 的 ID
}

// 废纸篓中的数据结构（软删除）
export interface TrashItem extends Fold {
  originalId: number;
  deletedAt: number;
  expiresAt: number;
}

export class FoldSpaceDB extends Dexie {
  folds!: Table<Fold, number>;
  trash!: Table<TrashItem, number>;
  settings!: Table<{ key: string; value: any }, string>;

  constructor() {
    super('FoldSpaceDB');
    
    this.version(1).stores({
      folds: '++id, timestamp, emotion, *tags',
      trash: '++id, originalId, deletedAt, expiresAt',
      settings: 'key'
    });
  }
}

export const db = new FoldSpaceDB();

// 废纸篓自动清理（启动时执行）
export async function cleanTrash() {
  const now = Date.now();
  await db.trash.where('expiresAt').below(now).delete();
}
