import { create } from 'zustand';
import type { ReviewRecord } from '@/types';
import { reviewRecords, pendingReviews, validationRules, knowledgeArticles } from '@/data/review';

interface ReviewState {
  reviewRecords: ReviewRecord[];
  pendingReviews: typeof pendingReviews;
  validationRules: typeof validationRules;
  knowledgeArticles: typeof knowledgeArticles;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  getReviewRecordsByItem: (itemId: string) => ReviewRecord[];
  getRulesByCategory: (category: string) => typeof validationRules;
  getArticlesByCategory: (category: string) => typeof knowledgeArticles;
  toggleRuleStatus: (ruleId: string) => void;
  addReviewRecord: (record: Omit<ReviewRecord, 'id' | 'sort'>) => void;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  reviewRecords,
  pendingReviews,
  validationRules,
  knowledgeArticles,
  activeTab: 'pending',

  setActiveTab: (tab) => set({ activeTab: tab }),

  getReviewRecordsByItem: (itemId) => {
    return get().reviewRecords.filter(r => r.itemId === itemId).sort((a, b) => a.sort - b.sort);
  },

  getRulesByCategory: (category) => {
    if (category === 'all') return get().validationRules;
    return get().validationRules.filter(r => r.category === category);
  },

  getArticlesByCategory: (category) => {
    if (category === 'all') return get().knowledgeArticles;
    return get().knowledgeArticles.filter(a => a.category === category);
  },

  toggleRuleStatus: (ruleId) => {
    set(state => ({
      validationRules: state.validationRules.map(rule =>
        rule.id === ruleId ? { ...rule, isEnabled: !rule.isEnabled } : rule
      ),
    }));
  },

  addReviewRecord: (record) => {
    const itemRecords = get().reviewRecords.filter(r => r.itemId === record.itemId);
    const newSort = itemRecords.length + 1;
    const newRecord: ReviewRecord = {
      ...record,
      id: `review-${Date.now()}`,
      sort: newSort,
    };
    set(state => ({
      reviewRecords: [...state.reviewRecords, newRecord],
    }));
  },
}));
