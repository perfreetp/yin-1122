import { create } from 'zustand';
import type { ServiceItem, ItemCategory, ApplyMaterial, AcceptCondition, ProcessStep, ItemVersion, TraceRecord } from '@/types';
import { serviceItems, itemCategories, applyMaterials, acceptConditions, processSteps, itemVersions } from '@/data/items';
import { useReviewStore } from '@/store/reviewStore';
import { useReleaseStore } from '@/store/releaseStore';

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
  departmentFilter: string;
  currentItem: ServiceItem | null;
  setSearchKeyword: (keyword: string) => void;
  setSelectedCategory: (id: string | null) => void;
  setStatusFilter: (status: string) => void;
  setLevelFilter: (level: string) => void;
  setDepartmentFilter: (departmentId: string) => void;
  setCurrentItem: (item: ServiceItem | null) => void;
  getItemById: (id: string) => ServiceItem | undefined;
  getFilteredItems: () => ServiceItem[];
  getMaterials: (itemId: string) => ApplyMaterial[];
  getConditions: (itemId: string) => AcceptCondition[];
  getProcessSteps: (itemId: string) => ProcessStep[];
  getVersions: (itemId: string) => ItemVersion[];
  getTraceRecords: (itemId: string) => TraceRecord[];
  updateItemStatus: (itemId: string, status: ServiceItem['status']) => void;
  setFiltersAndNavigate: (filters: { status?: string; level?: string; categoryId?: string; keyword?: string; departmentId?: string }) => void;
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
  departmentFilter: 'all',
  currentItem: null,

  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),
  setSelectedCategory: (id) => set({ selectedCategoryId: id }),
  setStatusFilter: (status) => set({ statusFilter: status }),
  setLevelFilter: (level) => set({ levelFilter: level }),
  setDepartmentFilter: (departmentId) => set({ departmentFilter: departmentId }),
  setCurrentItem: (item) => set({ currentItem: item }),

  getItemById: (id) => {
    return get().items.find(item => item.id === id);
  },

  getFilteredItems: () => {
    const { items, selectedCategoryId, searchKeyword, statusFilter, levelFilter, departmentFilter, categories } = get();
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

    if (departmentFilter && departmentFilter !== 'all') {
      filtered = filtered.filter(item => item.departmentId === departmentFilter);
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

  getTraceRecords: (itemId) => {
    const item = get().getItemById(itemId);
    if (!item) return [];

    const records: TraceRecord[] = [];

    records.push({
      id: `trace-create-${itemId}`,
      itemId,
      action: 'create',
      actionName: '创建事项',
      operator: item.updatedBy,
      operatorId: 'user-001',
      department: item.department,
      time: item.createdAt,
      remark: '事项创建完成',
      status: 'draft',
    });

    if (item.updatedAt !== item.createdAt) {
      records.push({
        id: `trace-update-${itemId}`,
        itemId,
        action: 'update',
        actionName: '编辑修改',
        operator: item.updatedBy,
        operatorId: 'user-001',
        department: item.department,
        time: item.updatedAt,
        remark: `事项内容编辑修改，完成度 ${item.completionProgress}%`,
        status: item.status,
      });
    }

    const reviewRecords = useReviewStore.getState().reviewRecords.filter(r => r.itemId === itemId);
    reviewRecords.forEach((record) => {
      const action = record.result === 'pass' ? 'review_pass' : record.result === 'reject' ? 'review_reject' : 'countersign';
      const actionName = record.result === 'pass' ? '审校通过' : record.result === 'reject' ? '退回修改' : '转交会签';
      records.push({
        id: `trace-review-${record.id}`,
        itemId,
        action,
        actionName,
        operator: record.reviewer,
        operatorId: record.reviewerId,
        department: record.department,
        time: record.reviewTime,
        remark: record.opinion,
        status: record.result,
      });
    });

    const countersignRecords = useReviewStore.getState().countersignRecords.filter(c => c.itemId === itemId);
    countersignRecords.forEach((record) => {
      records.push({
        id: `trace-cs-${record.id}`,
        itemId,
        action: 'countersign',
        actionName: '发起会签',
        operator: record.submitter,
        operatorId: 'user-001',
        department: record.department,
        time: record.submitTime,
        remark: `发起跨部门会签，涉及 ${record.countersignDepts?.length || 0} 个部门`,
        status: 'countersigning',
      });
    });

    const versions = useReleaseStore.getState().versions.filter(v => v.itemId === itemId && v.status === 'published');
    versions.forEach((version) => {
      records.push({
        id: `trace-publish-${version.id}`,
        itemId,
        action: 'publish',
        actionName: '版本发布',
        operator: version.publisher || '系统',
        operatorId: version.publisherId || 'system',
        department: item.department,
        time: version.publishTime || version.createdAt,
        remark: version.changeLog || `版本 v${version.version} 正式发布`,
        status: 'published',
      });
    });

    records.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    return records;
  },

  updateItemStatus: (itemId, status) => {
    set(state => ({
      items: state.items.map(item =>
        item.id === itemId ? { ...item, status, updatedAt: new Date().toISOString().split('T')[0] } : item
      ),
    }));
  },

  setFiltersAndNavigate: (filters: { status?: string; level?: string; categoryId?: string; keyword?: string; departmentId?: string }) => {
    if (filters.status !== undefined) get().setStatusFilter(filters.status);
    if (filters.level !== undefined) get().setLevelFilter(filters.level);
    if (filters.categoryId !== undefined) get().setSelectedCategory(filters.categoryId);
    if (filters.keyword !== undefined) get().setSearchKeyword(filters.keyword);
    if (filters.departmentId !== undefined) get().setDepartmentFilter(filters.departmentId);
  },
}));
