import { create } from 'zustand';
import { dashboardStats, levelProgress, departmentProgress, timeComparisons, recentNotices, warningItems } from '@/data/dashboard';
import type { DashboardStats, LevelProgress, DepartmentProgress, TimeComparison, Notice } from '@/types';
import { useItemStore } from '@/store/itemStore';

interface DashboardState {
  stats: DashboardStats;
  levelProgress: LevelProgress[];
  departmentProgress: DepartmentProgress[];
  timeComparisons: TimeComparison[];
  recentNotices: Notice[];
  warningItems: typeof warningItems;
  selectedLevel: string;
  setSelectedLevel: (level: string) => void;
  getComputedStats: () => DashboardStats;
  getComputedLevelProgress: () => LevelProgress[];
  getComputedDepartmentProgress: () => DepartmentProgress[];
  getFilteredDepartmentProgress: () => DepartmentProgress[];
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  stats: dashboardStats,
  levelProgress,
  departmentProgress,
  timeComparisons,
  recentNotices,
  warningItems,
  selectedLevel: 'all',

  setSelectedLevel: (level) => set({ selectedLevel: level }),

  getComputedStats: () => {
    const items = useItemStore.getState().items;
    const totalItems = items.length;
    const compilingCount = items.filter(i => i.status === 'draft' || i.status === 'compiling').length;
    const reviewingCount = items.filter(i => i.status === 'reviewing' || i.status === 'pending_release').length;
    const publishedCount = items.filter(i => i.status === 'published').length;
    const rejectedCount = items.filter(i => i.status === 'rejected').length;
    const timeWarningCount = items.filter(i => i.legalTimeLimit - i.promisedTimeLimit <= 5).length;
    const overdueCount = items.filter(i => i.promisedTimeLimit >= i.legalTimeLimit).length;
    const completionRate = totalItems > 0 ? Math.round((publishedCount / totalItems) * 1000) / 10 : 0;

    return {
      totalItems,
      compilingCount,
      reviewingCount,
      publishedCount,
      rejectedCount,
      completionRate,
      timeWarningCount,
      overdueCount,
    };
  },

  getComputedLevelProgress: () => {
    const items = useItemStore.getState().items;
    const levels: Array<'provincial' | 'municipal' | 'county'> = ['provincial', 'municipal', 'county'];
    const levelNames: Record<string, string> = {
      provincial: '省级',
      municipal: '市级',
      county: '县级',
    };

    return levels.map(level => {
      const levelItems = items.filter(i => i.level === level);
      const total = levelItems.length;
      const published = levelItems.filter(i => i.status === 'published').length;
      const rate = total > 0 ? Math.round((published / total) * 1000) / 10 : 0;
      return {
        level,
        levelName: levelNames[level],
        total,
        published,
        rate,
      };
    });
  },

  getComputedDepartmentProgress: () => {
    const items = useItemStore.getState().items;
    const deptMap = new Map<string, { department: string; total: number; completed: number }>();

    items.forEach(item => {
      if (!deptMap.has(item.departmentId)) {
        deptMap.set(item.departmentId, {
          department: item.department,
          total: 0,
          completed: 0,
        });
      }
      const dept = deptMap.get(item.departmentId)!;
      dept.total += 1;
      if (item.status === 'published') {
        dept.completed += 1;
      }
    });

    return Array.from(deptMap.entries()).map(([departmentId, dept]) => ({
      departmentId,
      department: dept.department,
      total: dept.total,
      completed: dept.completed,
      rate: dept.total > 0 ? Math.round((dept.completed / dept.total) * 1000) / 10 : 0,
    })).sort((a, b) => b.rate - a.rate);
  },

  getFilteredDepartmentProgress: () => {
    const { getComputedDepartmentProgress, selectedLevel } = get();
    const allDepts = getComputedDepartmentProgress();
    if (selectedLevel === 'all') return allDepts;

    const items = useItemStore.getState().items;
    const levelDeptIds = new Set(
      items.filter(i => i.level === selectedLevel).map(i => i.departmentId)
    );
    return allDepts.filter(d => levelDeptIds.has(d.departmentId));
  },
}));
