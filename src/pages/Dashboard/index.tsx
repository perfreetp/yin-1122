import { useNavigate } from 'react-router-dom';
import { useDashboardStore } from '@/store/dashboardStore';
import { useItemStore } from '@/store/itemStore';
import StatusBadge from '@/components/StatusBadge';
import {
  TrendingUp,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle,
  Edit3,
  ChevronRight,
  Bell,
  AlertCircle,
  BarChart3,
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { setFiltersAndNavigate } = useItemStore();
  const { stats, levelProgress, departmentProgress, timeComparisons, recentNotices, warningItems } =
    useDashboardStore();

  const handleDrillDown = (filters: { status?: string; level?: string; departmentId?: string }) => {
    setFiltersAndNavigate({
      status: filters.status,
      level: filters.level,
    });
    navigate('/item-library');
  };

  const statCards = [
    {
      label: '事项总数',
      value: stats.totalItems,
      icon: FileText,
      color: 'primary',
      change: '+12',
      filter: { status: 'all' },
    },
    {
      label: '编制中',
      value: stats.compilingCount,
      icon: Edit3,
      color: 'primary',
      change: '+5',
      filter: { status: 'compiling' },
    },
    {
      label: '审校中',
      value: stats.reviewingCount,
      icon: Clock,
      color: 'warning',
      change: '-2',
      filter: { status: 'reviewing' },
    },
    {
      label: '已发布',
      value: stats.publishedCount,
      icon: CheckCircle,
      color: 'success',
      change: '+8',
      filter: { status: 'published' },
    },
    {
      label: '已退回',
      value: stats.rejectedCount,
      icon: AlertTriangle,
      color: 'danger',
      change: '+3',
      filter: { status: 'rejected' },
    },
    {
      label: '时限预警',
      value: stats.timeWarningCount,
      icon: AlertCircle,
      color: 'warning',
      change: '+2',
      filter: { status: 'all' },
    },
  ];

  const getColorClass = (color: string) => {
    const colors: Record<string, { bg: string; text: string; icon: string }> = {
      primary: { bg: 'bg-primary-50', text: 'text-primary-700', icon: 'bg-primary-600' },
      success: { bg: 'bg-success-50', text: 'text-success-700', icon: 'bg-success-600' },
      warning: { bg: 'bg-warning-50', text: 'text-warning-700', icon: 'bg-warning-600' },
      danger: { bg: 'bg-danger-50', text: 'text-danger-700', icon: 'bg-danger-600' },
    };
    return colors[color] || colors.primary;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">督办看板</h1>
          <p className="text-sm text-slate-500 mt-1">全省政务服务事项实施清单编制进度总览</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="select w-32">
            <option value="all">全部层级</option>
            <option value="provincial">省级</option>
            <option value="municipal">市级</option>
            <option value="county">县级</option>
          </select>
          <button className="btn-secondary">
            <BarChart3 className="w-4 h-4 mr-1.5" />
            导出报表
          </button>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const colorClass = getColorClass(card.color);
          const isPositive = card.change.startsWith('+');
          return (
            <div
              key={card.label}
              className="card p-5 cursor-pointer hover:shadow-card-hover transition-all"
              onClick={() => handleDrillDown(card.filter)}
            >
              <div className="flex items-start justify-between">
                <div
                  className={`w-10 h-10 rounded ${colorClass.icon} flex items-center justify-center`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span
                  className={`text-xs font-medium ${
                    isPositive ? 'text-success-600' : 'text-danger-600'
                  }`}
                >
                  {card.change}
                </span>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-semibold text-slate-800">{card.value}</div>
                <div className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                  {card.label}
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-slate-800">层级进度</h3>
            <span className="text-xs text-slate-500">完成率</span>
          </div>
          <div className="space-y-5">
            {levelProgress.map((level) => (
              <div
                key={level.level}
                className="cursor-pointer hover:bg-slate-50 -mx-2 px-2 py-1 rounded transition-colors"
                onClick={() => handleDrillDown({ level: level.level })}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={level.level} />
                    <span className="text-sm text-slate-600">{level.levelName}</span>
                  </div>
                  <span className="text-sm font-medium text-slate-700">{level.rate}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${level.rate}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1 text-xs text-slate-400">
                  <span>已发布 {level.published} 项</span>
                  <span>共 {level.total} 项</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-slate-800">时限对比提醒</h3>
            <button
              className="text-xs text-primary-600 hover:text-primary-700"
              onClick={() => handleDrillDown({ status: 'all' })}
            >
              查看全部
            </button>
          </div>
          <div className="space-y-3">
            {timeComparisons.slice(0, 5).map((item) => {
              const diffPercent = Math.round((item.difference / item.legalTimeLimit) * 100);
              const barColor =
                item.level === 'danger'
                  ? 'bg-danger-500'
                  : item.level === 'warning'
                  ? 'bg-warning-500'
                  : 'bg-success-500';
              return (
                <div
                  key={item.itemId}
                  className="p-3 bg-slate-50 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                  onClick={() => handleDrillDown({ status: 'all' })}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700 truncate flex-1">
                      {item.itemName}
                    </span>
                    <StatusBadge status={item.level === 'normal' ? 'published' : item.level} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>法定 {item.legalTimeLimit}天</span>
                    <span>→</span>
                    <span>承诺 {item.promisedTimeLimit}天</span>
                    <span className="text-success-600 font-medium ml-auto">
                      压缩{diffPercent}%
                    </span>
                  </div>
                  <div className="progress-bar mt-2 h-1.5">
                    <div
                      className={`${barColor} h-full rounded-full`}
                      style={{ width: `${(item.promisedTimeLimit / item.legalTimeLimit) * 100}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-slate-800">最新公告</h3>
            <button
              className="text-xs text-primary-600 hover:text-primary-700"
              onClick={() => navigate('/version-release')}
            >
              查看全部
            </button>
          </div>
          <div className="space-y-4">
            {recentNotices.map((notice) => (
              <div
                key={notice.id}
                className="flex gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0 cursor-pointer group"
                onClick={() => navigate('/version-release')}
              >
                <div className="flex-shrink-0">
                  <Bell className="w-5 h-5 text-primary-500 mt-0.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={notice.type} />
                    {notice.isImportant && (
                      <span className="text-[10px] text-danger-600 font-medium">重要</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-700 mt-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {notice.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {notice.publisher} · {notice.publishTime}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="card p-5 col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-slate-800">部门编制进度</h3>
            <div className="flex items-center gap-2">
              <button className="text-xs text-primary-600 font-medium">完成率排序</button>
              <span className="text-slate-300">|</span>
              <button className="text-xs text-slate-500">事项数排序</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left text-xs font-medium text-slate-500 pb-3">部门</th>
                  <th className="text-left text-xs font-medium text-slate-500 pb-3 w-48">
                    完成率
                  </th>
                  <th className="text-right text-xs font-medium text-slate-500 pb-3 w-24">
                    已完成/总数
                  </th>
                  <th className="text-center text-xs font-medium text-slate-500 pb-3 w-20">
                    状态
                  </th>
                </tr>
              </thead>
              <tbody>
                {departmentProgress.map((dept, index) => {
                  const status =
                    dept.rate >= 80 ? 'success' : dept.rate >= 60 ? 'warning' : 'danger';
                  return (
                    <tr
                      key={dept.departmentId}
                      className="border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => handleDrillDown({ status: 'all' })}
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 w-5">{index + 1}</span>
                          <span className="text-sm text-slate-700">{dept.department}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 progress-bar">
                            <div
                              className={`progress-fill ${
                                status === 'success'
                                  ? '!bg-success-500'
                                  : status === 'warning'
                                  ? '!bg-warning-500'
                                  : '!bg-danger-500'
                              }`}
                              style={{ width: `${dept.rate}%` }}
                            ></div>
                          </div>
                          <span
                            className={`text-sm font-medium w-12 text-right ${
                              status === 'success'
                                ? 'text-success-600'
                                : status === 'warning'
                                ? 'text-warning-600'
                                : 'text-danger-600'
                            }`}
                          >
                            {dept.rate}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-right text-sm text-slate-600">
                        {dept.completed}/{dept.total}
                      </td>
                      <td className="py-3 text-center">
                        <StatusBadge status={status === 'success' ? 'published' : status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-slate-800">预警事项</h3>
            <span className="badge-danger">{warningItems.length}项</span>
          </div>
          <div className="space-y-3">
            {warningItems.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded border-l-4 cursor-pointer hover:shadow-sm transition-all ${
                  item.level === 'danger'
                    ? 'bg-danger-50 border-danger-500'
                    : 'bg-warning-50 border-warning-500'
                }`}
                onClick={() => handleDrillDown({ status: 'all' })}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-slate-700 truncate">
                      {item.itemName}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{item.department}</p>
                  </div>
                  <StatusBadge status={item.level === 'danger' ? 'rejected' : 'reviewing'} />
                </div>
                <p className="text-xs text-slate-600 mt-2">{item.description}</p>
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-slate-500">{item.type}</span>
                  <span
                    className={item.level === 'danger' ? 'text-danger-600' : 'text-warning-600'}
                  >
                    截止 {item.deadline}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
