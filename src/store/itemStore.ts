import { create } from 'zustand';
import type { ServiceItem, ItemCategory, ApplyMaterial, AcceptCondition, ProcessStep, ItemVersion } from '@/types';
import { serviceItems, itemCategories, applyMaterials, acceptConditions, processSteps, itemVersions } from '@/data/items';

interface ItemState {
  items: ServiceItem[];
  categories: ItemCategory[];
  materials: Record<string, ApplyMaterial[]>;
  conditions: Record<string, AcceptCondition[]>;
  steps: Record<string, ProcessStep[]>;
  versions: ItemVersion[];
  selectedCategoryId: string | null;
  searchKeyword: string;
  statusFilter: string;
  levelFilter: string;
  currentItem: ServiceItem | null;
  setSearchKeyword: (keyword: string) => void;
  setSelectedCategory: (id: string | null) => void;
  setStatusFilter: (status: string) => void;
  setLevelFilter: (level: string) => void;
  setCurrentItem: (item: ServiceItem | null) => void;
  getItemById: (id: string) => ServiceItem | undefined;
  getFilteredItems: () => ServiceItem[];
  getMaterials: (itemId: string) => ApplyMaterial[];
  getConditions: (itemId: string) => AcceptCondition[];
  getProcessSteps: (itemId: string) => ProcessStep[];
  getVersions: (itemId: string) => ItemVersion[];
  updateItemStatus: (itemId: string, status: ServiceItem['status']) => void;
}

export const useItemStore = create<ItemState>((set, get) => ({
  items: serviceItems,
  categories: itemCategories,
  materials: applyMaterials,
  conditions: acceptConditions,
  steps: processSteps,
  versions: itemVersions,
  selectedCategoryId: null,
  searchKeyword: '',
  statusFilter: 'all',
  levelFilter: 'all',
  currentItem: null,

  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),
  setSelectedCategory: (id) => set({ selectedCategoryId: id }),
  setStatusFilter: (status) => set({ statusFilter: status }),
  setLevelFilter: (level) => set({ levelFilter: level }),
  setCurrentItem: (item) => set({ currentItem: item }),

  getItemById: (id) => {
    return get().items.find(item => item.id === id);
  },

  getFilteredItems: () => {
    const { items, selectedCategoryId, searchKeyword, statusFilter, levelFilter, categories } = get();
    let filtered = [...items];

    if (selectedCategoryId) {
      const category = categories.find(c => c.id === selectedCategoryId);
      if (category?.children && category.children.length > 0) {
        const childIds = category.children.map(c => c.id);
        filtered = filtered.filter(item => childIds.includes(item.categoryId));
      } else {
        filtered = filtered.filter(item => item.categoryId === selectedCategoryId);
      }
    }

    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        item => item.name.toLowerCase().includes(kw) || item.code.toLowerCase().includes(kw) || item.department.toLowerCase().includes(kw)
      );
    }

    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    if (levelFilter && levelFilter !== 'all') {
      filtered = filtered.filter(item => item.level === levelFilter);
    }

    return filtered;
  },

  getMaterials: (itemId) => {
    return get().materials[itemId] || [];
  },

  getConditions: (itemId) => {
    return get().conditions[itemId] || [];
  },

  getProcessSteps: (itemId) => {
    return get().steps[itemId] || [];
  },

  getVersions: (itemId) => {
    return get().versions.filter(v => v.itemId === itemId).sort((a, b) => b.version - a.version);
  },

  updateItemStatus: (itemId, status) => {
    set(state => ({
      items: state.items.map(item =>
        item.id === itemId ? { ...item, status, updatedAt: new Date().toISOString().split('T')[0] } : item
      ),
    }));
  },
}));
