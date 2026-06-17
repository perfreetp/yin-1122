import type { ItemStatus } from '@/types';

interface StatusBadgeProps {
  status: ItemStatus | string;
}

const statusMap: Record<string, { label: string; className: string }> = {
  draft: { label: '草稿', className: 'badge-slate' },
  compiling: { label: '编制中', className: 'badge-primary' },
  reviewing: { label: '审校中', className: 'badge-warning' },
  rejected: { label: '已退回', className: 'badge-danger' },
  published: { label: '已发布', className: 'badge-success' },
  archived: { label: '已归档', className: 'badge-slate' },
  pass: { label: '通过', className: 'badge-success' },
  reject: { label: '退回', className: 'badge-danger' },
  transfer: { label: '转送', className: 'badge-warning' },
  provincial: { label: '省级', className: 'badge-primary' },
  municipal: { label: '市级', className: 'badge-success' },
  county: { label: '县级', className: 'badge-warning' },
  release: { label: '发布公告', className: 'badge-success' },
  change: { label: '变更通知', className: 'badge-warning' },
  notice: { label: '工作通知', className: 'badge-primary' },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const info = statusMap[status] || { label: status, className: 'badge-slate' };
  return <span className={info.className}>{info.label}</span>;
}
