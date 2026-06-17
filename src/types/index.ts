export type ItemLevel = 'provincial' | 'municipal' | 'county';

export type ItemStatus = 'draft' | 'compiling' | 'reviewing' | 'rejected' | 'published';

export type ReviewResult = 'pass' | 'reject' | 'transfer';

export type MaterialFormat = 'original' | 'copy' | 'electronic';

export interface ServiceItem {
  id: string;
  name: string;
  code: string;
  category: string;
  categoryId: string;
  level: ItemLevel;
  department: string;
  departmentId: string;
  status: ItemStatus;
  legalTimeLimit: number;
  promisedTimeLimit: number;
  templateId?: string;
  templateName?: string;
  standardSource?: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
  version: number;
  completionProgress: number;
}

export interface ItemCategory {
  id: string;
  name: string;
  code: string;
  children?: ItemCategory[];
  count?: number;
}

export interface ApplyMaterial {
  id: string;
  itemId: string;
  name: string;
  requirement: string;
  format: MaterialFormat;
  isNecessary: boolean;
  quantity: number;
  remark?: string;
  subMaterials?: ApplyMaterial[];
}

export interface AcceptCondition {
  id: string;
  itemId: string;
  content: string;
  scene: string;
  sort: number;
}

export interface ProcessStep {
  id: string;
  itemId: string;
  stepNo: number;
  name: string;
  handler: string;
  timeLimit: number;
  description: string;
  conditions?: string[];
  linkSteps?: string[];
}

export interface ReviewRecord {
  id: string;
  itemId: string;
  itemName: string;
  version: number;
  reviewer: string;
  reviewerId: string;
  department: string;
  departmentId: string;
  opinion: string;
  result: ReviewResult;
  reviewTime: string;
  isCountersign?: boolean;
  sort: number;
}

export interface ItemVersion {
  id: string;
  itemId: string;
  itemName: string;
  version: number;
  status: 'draft' | 'published' | 'archived';
  publishTime?: string;
  publisher?: string;
  publisherId?: string;
  changeLog?: string;
  batchId?: string;
  createdAt: string;
}

export interface ReleaseBatch {
  id: string;
  batchNo: string;
  name: string;
  level: ItemLevel;
  itemIds: string[];
  itemCount: number;
  noticeTitle: string;
  noticeContent: string;
  publisher: string;
  publisherId: string;
  publishTime: string;
  status: 'publishing' | 'published';
}

export interface DashboardStats {
  totalItems: number;
  compilingCount: number;
  reviewingCount: number;
  publishedCount: number;
  rejectedCount: number;
  completionRate: number;
  timeWarningCount: number;
  overdueCount: number;
}

export interface LevelProgress {
  level: ItemLevel;
  levelName: string;
  total: number;
  published: number;
  rate: number;
}

export interface DepartmentProgress {
  department: string;
  departmentId: string;
  total: number;
  completed: number;
  rate: number;
}

export interface TimeComparison {
  itemName: string;
  itemId: string;
  legalTimeLimit: number;
  promisedTimeLimit: number;
  difference: number;
  level: 'normal' | 'warning' | 'danger';
}

export interface ValidationRule {
  id: string;
  name: string;
  category: string;
  description: string;
  level: 'info' | 'warning' | 'error';
  ruleExpression: string;
  isEnabled: boolean;
  errorExample?: string;
  correctExample?: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  author: string;
  createdAt: string;
  viewCount: number;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  type: 'release' | 'change' | 'notice';
  level: ItemLevel;
  publisher: string;
  publishTime: string;
  isImportant: boolean;
  batchId?: string;
}

export type TraceActionType = 'create' | 'update' | 'submit' | 'review_pass' | 'review_reject' | 'countersign' | 'publish';

export interface TraceRecord {
  id: string;
  itemId: string;
  action: TraceActionType;
  actionName: string;
  operator: string;
  operatorId: string;
  department: string;
  time: string;
  remark?: string;
  status?: string;
}
