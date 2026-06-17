import { create } from 'zustand';
import { dashboardStats, levelProgress, departmentProgress, timeComparisons, recentNotices, warningItems } from '@/data/dashboard';
import type { DashboardStats, LevelProgress, DepartmentProgress, TimeComparison, Notice } from '@/types';

interface DashboardState {
  stats: DashboardStats;
  levelProgress: LevelProgress[];
  departmentProgress: DepartmentProgress[];
  timeComparisons: TimeComparison[];
  recentNotices: Notice[];
  warningItems: typeof warningItems;
  selectedLevel: string;
  setSelectedLevel: (level: string) => void;
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

  getFilteredDepartmentProgress: () => {
    const { departmentProgress, selectedLevel } = get();
    if (selectedLevel === 'all') return departmentProgress;
    return departmentProgress;
  },
}));
