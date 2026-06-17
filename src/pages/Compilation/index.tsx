import { useNavigate } from 'react-router-dom';
import { useItemStore } from '@/store/itemStore';
import StatusBadge from '@/components/StatusBadge';
import {
  Plus,
  Search,
  Clock,
  AlertTriangle,
  FileText,
  CheckCircle2,
  ArrowRight,
  Filter,
  ListTodo,
  Zap,
} from 'lucide-react';

export default function Compilation() {
  const navigate = useNavigate();
  const { items } = useItemStore();

  const compilingItems = items.filter((item) => item.status === 'compiling' || item.status === 'draft');
  const needSubmitItems = items.filter((item) => item.status === 'compiling' && item.completionProgress >= 80);
  const rejectedItems = items.filter((item) => item.status === 'rejected');

  const statCards = [
    {
      label: '待编制事项',
      value: compilingItems.length,
      icon: ListTodo,
      color: 'primary',
      desc: '需要继续完善',
    },
    {
      label: '可提交审校',
      value: needSubmitItems.length,
      icon: Zap,
      color: 'success',
      desc: '完成度≥80%',
    },
    {
      label: '待修改事项',
      value: rejectedItems.length,
      icon: AlertTriangle,
      color: 'danger',
      desc: '审校退回待修改',
    },
  ];

  const quickActions = [
    { label: '新建事项', icon: Plus, desc: '从空白开始创建', type: 'primary' },
    { label: '引用模板', icon: FileText, desc: '基于标准模板创建', type: 'secondary' },
    { label: '引用上级', icon: ArrowRight, desc: '继承上级清单修改', type: 'secondary' },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">编制台</h1>
          <p className="text-sm text-slate-500 mt-1">政务服务事项实施清单编制工作台</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => navigate('/compilation/new')}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          新建事项
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const colorMap: Record<string, { bg: string; iconBg: string; text: string }> = {
            primary: {
              bg: 'bg-primary-50 border-primary-200',
              iconBg: 'bg-primary-600',
              text: 'text-primary-700',
            },
            success: {
              bg: 'bg-success-50 border-success-200',
              iconBg: 'bg-success-600',
              text: 'text-success-700',
            },
            danger: {
              bg: 'bg-danger-50 border-danger-200',
              iconBg: 'bg-danger-600',
              text: 'text-danger-700',
            },
          };
          const colors = colorMap[card.color] || colorMap.primary;
          return (
            <div key={card.label} className={`card p-5 border ${colors.bg}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600">{card.label}</p>
                  <p className={`text-3xl font-bold mt-2 ${colors.text}`}>{card.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{card.desc}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${colors.iconBg} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 快捷操作 */}
      <div className="card p-5">
        <h3 className="text-base font-semibold text-slate-800 mb-4">快捷操作</h3>
        <div className="grid grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                className={`p-5 rounded border-2 border-dashed text-left transition-all hover:shadow-card-hover ${
                  action.type === 'primary'
                    ? 'border-primary-300 bg-primary-50/50 hover:border-primary-500 hover:bg-primary-50'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-400 hover:bg-slate-100'
                }`}
                onClick={() => action.label === '新建事项' && navigate('/compilation/new')}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                    action.type === 'primary' ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h4
                  className={`font-medium ${
                    action.type === 'primary' ? 'text-primary-700' : 'text-slate-700'
                  }`}
                >
                  {action.label}
                </h4>
                <p className="text-xs text-slate-500 mt-1">{action.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 待办列表 */}
      <div className="grid grid-cols-2 gap-6">
        {/* 编制中的事项 */}
        <div className="card">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-800">编制中的事项</h3>
            <button className="text-xs text-primary-600 hover:text-primary-700">查看全部</button>
          </div>
          <div className="divide-y divide-slate-100">
            {items
              .filter((i) => i.status === 'compiling' || i.status === 'draft')
              .slice(0, 5)
              .map((item) => (
                <div
                  key={item.id}
                  className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/compilation/edit/${item.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-slate-700 truncate">{item.name}</h4>
                        <StatusBadge status={item.status} />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{item.code} · {item.department}</p>
                    </div>
                    <span className="text-xs text-slate-500 flex-shrink-0 ml-2">
                      {item.completionProgress}%
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="progress-bar h-1.5">
                      <div
                        className={`progress-fill ${
                          item.completionProgress >= 80
                            ? '!bg-success-500'
                            : item.completionProgress >= 50
                            ? '!bg-primary-500'
                            : '!bg-warning-500'
                        }`}
                        style={{ width: `${item.completionProgress}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      更新于 {item.updatedAt}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* 待提交审校 */}
        <div className="card">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-800">待提交审校</h3>
            <span className="badge-success">{needSubmitItems.length} 项可提交</span>
          </div>
          <div className="divide-y divide-slate-100">
            {items
              .filter((i) => i.completionProgress >= 80 && i.status !== 'published' && i.status !== 'reviewing')
              .slice(0, 5)
              .map((item) => (
                <div
                  key={item.id}
                  className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/compilation/edit/${item.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-slate-700 truncate">{item.name}</h4>
                        <CheckCircle2 className="w-4 h-4 text-success-500 flex-shrink-0" />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{item.code} · {item.department}</p>
                    </div>
                    <button
                      className="btn-sm btn-primary flex-shrink-0 ml-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`已提交 ${item.name} 到审校中心`);
                      }}
                    >
                      提交审校
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-success-600">
                      完成度 {item.completionProgress}%，可提交
                    </span>
                    <span className="text-slate-400">{item.updatedAt}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* 最近退回 */}
      <div className="card">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold text-slate-800">最近退回</h3>
            <span className="badge-danger">{rejectedItems.length} 项</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-xs text-slate-500 hover:text-slate-700">
              <Filter className="w-3.5 h-3.5 inline mr-1" />
              筛选
            </button>
            <button className="text-xs text-primary-600 hover:text-primary-700">查看全部</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>事项名称</th>
                <th className="w-24">事项编码</th>
                <th className="w-28">所属部门</th>
                <th className="w-24">退回时间</th>
                <th className="w-32">退回原因</th>
                <th className="w-24 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {rejectedItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="font-medium text-slate-700">{item.name}</div>
                  </td>
                  <td>
                    <span className="font-mono text-xs text-slate-500">{item.code}</span>
                  </td>
                  <td className="text-slate-600 text-sm">{item.department}</td>
                  <td className="text-slate-500 text-sm">{item.updatedAt}</td>
                  <td>
                    <span className="text-sm text-danger-600">材料不完整</span>
                  </td>
                  <td className="text-right">
                    <button
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      onClick={() => navigate(`/compilation/edit/${item.id}`)}
                    >
                      立即修改
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
