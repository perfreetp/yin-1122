import { create } from 'zustand';
import type { ItemVersion, Notice } from '@/types';
import { releaseVersions, pendingReleaseItems, releaseNotices, releaseStats } from '@/data/release';
import { useItemStore } from '@/store/itemStore';
import { useDashboardStore } from '@/store/dashboardStore';

interface ReleaseState {
  versions: ItemVersion[];
  pendingItems: typeof pendingReleaseItems;
  notices: Notice[];
  stats: typeof releaseStats;
  activeTab: string;
  levelFilter: string;
  searchKeyword: string;
  selectedItemId: string | null;
  setActiveTab: (tab: string) => void;
  setLevelFilter: (level: string) => void;
  setSearchKeyword: (keyword: string) => void;
  setSelectedItemId: (id: string | null) => void;
  getPublishedVersions: () => ItemVersion[];
  getVersionsByItem: (itemId: string) => ItemVersion[];
  getFilteredNotices: () => Notice[];
  publishItem: (itemId: string, changeLog: string) => void;
}

export const useReleaseStore = create<ReleaseState>((set, get) => ({
  versions: releaseVersions,
  pendingItems: pendingReleaseItems,
  notices: releaseNotices,
  stats: releaseStats,
  activeTab: 'published',
  levelFilter: 'all',
  searchKeyword: '',
  selectedItemId: null,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setLevelFilter: (level) => set({ levelFilter: level }),
  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),
  setSelectedItemId: (id) => set({ selectedItemId: id }),

  getPublishedVersions: () => {
    const { versions, searchKeyword, levelFilter } = get();
    let filtered = versions.filter(v => v.status === 'published');
    
    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase();
      filtered = filtered.filter(v => v.itemName.toLowerCase().includes(kw) || v.changeLog?.toLowerCase().includes(kw));
    }
    
    return filtered.sort((a, b) => {
      const timeA = a.publishTime ? new Date(a.publishTime).getTime() : 0;
      const timeB = b.publishTime ? new Date(b.publishTime).getTime() : 0;
      return timeB - timeA;
    });
  },

  getVersionsByItem: (itemId) => {
    return get().versions.filter(v => v.itemId === itemId).sort((a, b) => b.version - a.version);
  },

  getFilteredNotices: () => {
    const { notices, searchKeyword, levelFilter } = get();
    let filtered = [...notices];
    
    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase();
      filtered = filtered.filter(n => n.title.toLowerCase().includes(kw) || n.content.toLowerCase().includes(kw));
    }
    
    if (levelFilter && levelFilter !== 'all') {
      filtered = filtered.filter(n => n.level === levelFilter);
    }
    
    return filtered.sort((a, b) => new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime());
  },

  publishItem: (itemId, changeLog) => {
    const item = get().pendingItems.find(p => p.itemId === itemId);
    if (!item) return;
    
    const newVersion: ItemVersion = {
      id: `ver-${Date.now()}`,
      itemId: item.itemId,
      itemName: item.itemName,
      version: item.version,
      status: 'published',
      publishTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
      publisher: '当前用户',
      publisherId: 'current-user',
      changeLog,
      createdAt: new Date().toISOString().split('T')[0],
    };
    
    // 更新事项状态为已发布
    useItemStore.getState().updateItemStatus(itemId, 'published');
    
    // 更新看板统计
    useDashboardStore.setState((state) => ({
      stats: {
        ...state.stats,
        publishedCount: state.stats.publishedCount + 1,
        reviewingCount: Math.max(0, state.stats.reviewingCount - 1),
        completionRate: Math.round(((state.stats.publishedCount + 1) / state.stats.totalItems) * 1000) / 10,
      },
    }));
    
    set(state => ({
      versions: [newVersion, ...state.versions],
      pendingItems: state.pendingItems.filter(p => p.itemId !== itemId),
      stats: {
        ...state.stats,
        totalPublished: state.stats.totalPublished + 1,
        thisMonthPublished: state.stats.thisMonthPublished + 1,
        pendingRelease: Math.max(0, state.stats.pendingRelease - 1),
        totalVersions: state.stats.totalVersions + 1,
      },
    }));
  },
}));
