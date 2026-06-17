import { create } from 'zustand';
import type { ItemVersion, Notice, ReleaseBatch } from '@/types';
import { releaseVersions, pendingReleaseItems, releaseNotices, releaseStats, releaseBatches } from '@/data/release';
import { useItemStore } from '@/store/itemStore';
import { useDashboardStore } from '@/store/dashboardStore';

interface ReleaseState {
  versions: ItemVersion[];
  batches: ReleaseBatch[];
  pendingItems: typeof pendingReleaseItems;
  notices: Notice[];
  stats: typeof releaseStats;
  activeTab: string;
  levelFilter: string;
  searchKeyword: string;
  selectedItemId: string | null;
  selectedItemIds: string[];
  showBatchModal: boolean;
  batchNo: string;
  batchName: string;
  noticeTitle: string;
  noticeContent: string;
  setActiveTab: (tab: string) => void;
  setLevelFilter: (level: string) => void;
  setSearchKeyword: (keyword: string) => void;
  setSelectedItemId: (id: string | null) => void;
  setSelectedItemIds: (ids: string[]) => void;
  setShowBatchModal: (show: boolean) => void;
  setBatchNo: (no: string) => void;
  setBatchName: (name: string) => void;
  setNoticeTitle: (title: string) => void;
  setNoticeContent: (content: string) => void;
  toggleSelectedItem: (itemId: string) => void;
  getPublishedVersions: () => ItemVersion[];
  getVersionsByItem: (itemId: string) => ItemVersion[];
  getFilteredNotices: () => Notice[];
  getBatches: () => ReleaseBatch[];
  getBatchById: (batchId: string) => ReleaseBatch | undefined;
  getVersionsByBatch: (batchId: string) => ItemVersion[];
  getNoticeById: (noticeId: string) => Notice | undefined;
  addPendingItem: (item: typeof pendingReleaseItems[0]) => void;
  publishItem: (itemId: string, changeLog: string) => void;
  publishBatch: () => void;
  generateBatchNo: () => string;
}

export const useReleaseStore = create<ReleaseState>((set, get) => ({
  versions: releaseVersions,
  batches: releaseBatches,
  pendingItems: pendingReleaseItems,
  notices: releaseNotices,
  stats: releaseStats,
  activeTab: 'published',
  levelFilter: 'all',
  searchKeyword: '',
  selectedItemId: null,
  selectedItemIds: [],
  showBatchModal: false,
  batchNo: '',
  batchName: '',
  noticeTitle: '',
  noticeContent: '',

  setActiveTab: (tab) => set({ activeTab: tab }),
  setLevelFilter: (level) => set({ levelFilter: level }),
  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),
  setSelectedItemId: (id) => set({ selectedItemId: id }),
  setSelectedItemIds: (ids) => set({ selectedItemIds: ids }),
  setShowBatchModal: (show) => set({ showBatchModal: show }),
  setBatchNo: (no) => set({ batchNo: no }),
  setBatchName: (name) => set({ batchName: name }),
  setNoticeTitle: (title) => set({ noticeTitle: title }),
  setNoticeContent: (content) => set({ noticeContent: content }),

  toggleSelectedItem: (itemId) => {
    set(state => {
      const isSelected = state.selectedItemIds.includes(itemId);
      return {
        selectedItemIds: isSelected
          ? state.selectedItemIds.filter(id => id !== itemId)
          : [...state.selectedItemIds, itemId]
      };
    });
  },

  addPendingItem: (item) => {
    set(state => {
      if (state.pendingItems.some(p => p.itemId === item.itemId)) {
        return state;
      }
      return {
        pendingItems: [...state.pendingItems, item],
        stats: {
          ...state.stats,
          pendingRelease: state.stats.pendingRelease + 1,
        },
      };
    });
  },

  getNoticeById: (noticeId) => {
    return get().notices.find(n => n.id === noticeId);
  },

  generateBatchNo: () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const batchNum = String(get().batches.filter(b => 
      b.publishTime.startsWith(`${year}-${month}`)
    ).length + 1).padStart(3, '0');
    return `ZF-${year}-${month}-${batchNum}`;
  },

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

  getBatches: () => {
    const { batches, searchKeyword, levelFilter } = get();
    let filtered = [...batches];
    
    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase();
      filtered = filtered.filter(b => b.name.toLowerCase().includes(kw) || b.noticeTitle.toLowerCase().includes(kw));
    }
    
    if (levelFilter && levelFilter !== 'all') {
      filtered = filtered.filter(b => b.level === levelFilter);
    }
    
    return filtered.sort((a, b) => new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime());
  },

  getBatchById: (batchId) => {
    return get().batches.find(b => b.id === batchId);
  },

  getVersionsByBatch: (batchId) => {
    return get().versions.filter(v => v.batchId === batchId);
  },

  publishItem: (itemId, changeLog) => {
    const item = get().pendingItems.find(p => p.itemId === itemId && p.reviewStatus === 'passed');
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
    
    useItemStore.getState().updateItemStatus(itemId, 'published');
    
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
      selectedItemIds: state.selectedItemIds.filter(id => id !== itemId),
      stats: {
        ...state.stats,
        totalPublished: state.stats.totalPublished + 1,
        thisMonthPublished: state.stats.thisMonthPublished + 1,
        pendingRelease: Math.max(0, state.stats.pendingRelease - 1),
        totalVersions: state.stats.totalVersions + 1,
      },
    }));
  },

  publishBatch: () => {
    const { selectedItemIds, batchNo, batchName, noticeTitle, noticeContent, pendingItems } = get();
    if (selectedItemIds.length === 0 || !batchNo || !batchName || !noticeTitle || !noticeContent) return;
    
    const itemsToPublish = pendingItems.filter(p => 
      selectedItemIds.includes(p.itemId) && p.reviewStatus === 'passed'
    );
    if (itemsToPublish.length === 0) return;
    
    const publishTime = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const batchId = `batch-${Date.now()}`;
    
    const newBatch: ReleaseBatch = {
      id: batchId,
      batchNo,
      name: batchName,
      level: itemsToPublish[0].level as 'provincial' | 'municipal' | 'county',
      itemIds: itemsToPublish.map(i => i.itemId),
      itemCount: itemsToPublish.length,
      noticeTitle,
      noticeContent,
      publisher: '当前用户',
      publisherId: 'current-user',
      publishTime,
      status: 'published',
    };
    
    const newNotice: Notice = {
      id: `notice-${Date.now()}`,
      title: noticeTitle,
      content: noticeContent,
      type: 'release',
      level: newBatch.level,
      publisher: '省政务服务管理局',
      publishTime: publishTime.split(' ')[0],
      isImportant: true,
      batchId: batchId,
    };
    
    const newVersions: ItemVersion[] = itemsToPublish.map(item => ({
      id: `ver-${Date.now()}-${item.itemId}`,
      itemId: item.itemId,
      itemName: item.itemName,
      version: item.version,
      status: 'published',
      publishTime,
      publisher: '当前用户',
      publisherId: 'current-user',
      changeLog: `批次发布：${batchName}（${batchNo}）`,
      batchId: batchId,
      createdAt: new Date().toISOString().split('T')[0],
    }));
    
    itemsToPublish.forEach(item => {
      useItemStore.getState().updateItemStatus(item.itemId, 'published');
    });
    
    useDashboardStore.setState((state) => ({
      stats: {
        ...state.stats,
        publishedCount: state.stats.publishedCount + itemsToPublish.length,
        completionRate: Math.round(((state.stats.publishedCount + itemsToPublish.length) / state.stats.totalItems) * 1000) / 10,
      },
    }));
    
    const publishedItemIds = itemsToPublish.map(i => i.itemId);
    
    set(state => ({
      batches: [newBatch, ...state.batches],
      versions: [...newVersions, ...state.versions],
      notices: [newNotice, ...state.notices],
      pendingItems: state.pendingItems.filter(p => !publishedItemIds.includes(p.itemId)),
      selectedItemIds: [],
      showBatchModal: false,
      batchNo: '',
      batchName: '',
      noticeTitle: '',
      noticeContent: '',
      stats: {
        ...state.stats,
        totalPublished: state.stats.totalPublished + itemsToPublish.length,
        thisMonthPublished: state.stats.thisMonthPublished + itemsToPublish.length,
        pendingRelease: Math.max(0, state.stats.pendingRelease - itemsToPublish.length),
        totalVersions: state.stats.totalVersions + itemsToPublish.length,
        totalBatches: state.stats.totalBatches + 1,
      },
    }));
  },
}));
