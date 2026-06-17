import { create } from 'zustand';
import type { ReviewRecord } from '@/types';
import { reviewRecords, pendingReviews, validationRules, knowledgeArticles } from '@/data/review';

interface CountersignRecord {
  id: string;
  itemId: string;
  itemName: string;
  code: string;
  department: string;
  level: string;
  submitter: string;
  submitTime: string;
  deadline: string;
  priority: string;
  currentStep: string;
  nextReviewer: string;
  countersignDepts: string[];
  countersignOpinion?: string;
  status: 'pending' | 'countersigning' | 'completed';
  steps?: { dept: string; status: string; time: string; opinion: string }[];
}

interface ReviewState {
  reviewRecords: ReviewRecord[];
  pendingReviews: typeof pendingReviews;
  validationRules: typeof validationRules;
  knowledgeArticles: typeof knowledgeArticles;
  countersignRecords: CountersignRecord[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  getReviewRecordsByItem: (itemId: string) => ReviewRecord[];
  getRulesByCategory: (category: string) => typeof validationRules;
  getArticlesByCategory: (category: string) => typeof knowledgeArticles;
  toggleRuleStatus: (ruleId: string) => void;
  addReviewRecord: (record: Omit<ReviewRecord, 'id' | 'sort'>) => void;
  addCountersignRecord: (record: Omit<CountersignRecord, 'id' | 'status' | 'steps'>) => void;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  reviewRecords,
  pendingReviews,
  validationRules,
  knowledgeArticles,
  countersignRecords: [
    {
      id: 'cs-001',
      itemId: 'item-002',
      itemName: '建设工程规划许可证核发',
      code: 'XZXK-GC-002',
      department: '省自然资源厅',
      level: 'provincial',
      submitter: '李四',
      submitTime: '2025-06-12 14:30',
      deadline: '2025-06-19',
      priority: 'high',
      currentStep: '会签流转',
      nextReviewer: '省住房和城乡建设厅、省生态环境厅',
      countersignDepts: ['dept-002', 'dept-011', 'dept-010', 'dept-gov'],
      status: 'countersigning',
      steps: [
        { dept: '省自然资源厅', status: 'done', time: '06-12 10:30', opinion: '同意' },
        { dept: '省住房和城乡建设厅', status: 'done', time: '06-13 15:20', opinion: '同意，需补充施工许可衔接说明' },
        { dept: '省生态环境厅', status: 'doing', time: '', opinion: '' },
        { dept: '省政务服务管理局', status: 'pending', time: '', opinion: '' },
      ],
    },
  ],
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
      pendingReviews: state.pendingReviews.filter(p => p.itemId !== record.itemId),
    }));
  },

  addCountersignRecord: (record) => {
    const deptNames: Record<string, string> = {
      'dept-001': '省市场监督管理局',
      'dept-002': '省自然资源厅',
      'dept-003': '省卫生健康委员会',
      'dept-006': '省教育厅',
      'dept-007': '省公安厅',
      'dept-008': '省人力资源和社会保障厅',
      'dept-010': '省生态环境厅',
      'dept-011': '省住房和城乡建设厅',
      'dept-gov': '省政务服务管理局',
    };
    
    const steps = record.countersignDepts.map((deptId, idx) => ({
      dept: deptNames[deptId] || deptId,
      status: idx === 0 ? 'doing' : 'pending',
      time: idx === 0 ? new Date().toISOString().slice(5, 16).replace('T', ' ') : '',
      opinion: '',
    }));

    const newRecord: CountersignRecord = {
      ...record,
      id: `cs-${Date.now()}`,
      status: 'countersigning',
      steps,
    };
    
    const countersignRecord: ReviewRecord = {
      id: `review-${Date.now() + 1}`,
      itemId: record.itemId,
      itemName: record.itemName,
      version: 1,
      reviewer: '当前用户',
      reviewerId: 'current-user',
      department: '省政务服务管理局',
      departmentId: 'dept-gov',
      opinion: record.countersignOpinion || '发起跨部门会签',
      result: 'transfer',
      reviewTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
      isCountersign: true,
      sort: 1,
    };

    set(state => ({
      countersignRecords: [...state.countersignRecords, newRecord],
      pendingReviews: state.pendingReviews.filter(p => p.itemId !== record.itemId),
      reviewRecords: [...state.reviewRecords, countersignRecord],
    }));
  },
}));
