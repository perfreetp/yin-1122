import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReviewStore } from '@/store/reviewStore';
import StatusBadge from '@/components/StatusBadge';
import {
  Clock,
  CheckSquare,
  RotateCcw,
  Users,
  Filter,
  Search,
  ChevronRight,
  UserCheck,
  ArrowRightLeft,
  FileText,
  AlertCircle,
  Calendar,
} from 'lucide-react';

export default function Review() {
  const navigate = useNavigate();
  const { pendingReviews, reviewRecords, activeTab, setActiveTab } = useReviewStore();
  const [searchKeyword, setSearchKeyword] = useState('');

  const tabs = [
    { id: 'pending', label: '待我审校', icon: Clock, count: pendingReviews.length },
    { id: 'reviewed', label: '我已审校', icon: CheckSquare, count: 4 },
    { id: 'countersign', label: '会签流转', icon: Users, count: 2 },
    { id: 'returned', label: '已退回', icon: RotateCcw, count: 3 },
  ];

  const priorityMap: Record<string, { label: string; className: string }> = {
    high: { label: '高', className: 'text-danger-600 bg-danger-50' },
    medium: { label: '中', className: 'text-warning-600 bg-warning-50' },
    low: { label: '低', className: 'text-slate-600 bg-slate-100' },
  };

  const filteredReviews = pendingReviews.filter(
    (r) =>
      r.itemName.includes(searchKeyword) ||
      r.code.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      r.department.includes(searchKeyword)
  );

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">审校中心</h1>
          <p className="text-sm text-slate-500 mt-1">政务服务事项实施清单审校与会签管理</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary">
            <FileText className="w-4 h-4 mr-1.5" />
            批量操作
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <div
              key={tab.id}
              className={`card p-5 cursor-pointer transition-all ${
                isActive ? 'ring-2 ring-primary-500 border-primary-500' : 'hover:shadow-card-hover'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isActive ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">{tab.label}</p>
                    <p
                      className={`text-2xl font-bold mt-0.5 ${
                        isActive ? 'text-primary-600' : 'text-slate-700'
                      }`}
                    >
                      {tab.count}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-primary-500' : 'text-slate-300'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* 筛选和搜索 */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="搜索事项名称、编码..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-64 h-9 pl-9 pr-3 text-sm border border-slate-300 rounded bg-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
              />
            </div>
            <select className="select w-36">
              <option>全部层级</option>
              <option>省级</option>
              <option>市级</option>
              <option>县级</option>
            </select>
            <select className="select w-40">
              <option>全部部门</option>
              <option>省市场监督管理局</option>
              <option>省自然资源厅</option>
              <option>省卫生健康委员会</option>
            </select>
            <button className="btn-ghost">
              <Filter className="w-4 h-4 mr-1.5" />
              更多筛选
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">
              共 <span className="text-slate-800 font-medium">{filteredReviews.length}</span> 条待审校
            </span>
          </div>
        </div>
      </div>

      {/* 待审校列表 */}
      {activeTab === 'pending' && (
        <div className="card overflow-hidden">
          <table className="table">
            <thead>
              <tr>
                <th className="w-10">
                  <input type="checkbox" className="rounded border-slate-300" />
                </th>
                <th className="w-28">事项编码</th>
                <th>事项名称</th>
                <th className="w-32">所属层级</th>
                <th className="w-40">提交部门</th>
                <th className="w-28">提交人</th>
                <th className="w-32">当前环节</th>
                <th className="w-28">优先级</th>
                <th className="w-32">截止日期</th>
                <th className="w-24 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.map((item) => {
                const priority = priorityMap[item.priority];
                return (
                  <tr key={item.id} className="cursor-pointer">
                    <td>
                      <input type="checkbox" className="rounded border-slate-300" />
                    </td>
                    <td>
                      <span className="font-mono text-xs text-slate-500">{item.code}</span>
                    </td>
                    <td
                      onClick={() => navigate(`/review/${item.itemId}`)}
                      className="font-medium text-slate-700 hover:text-primary-600 transition-colors"
                    >
                      {item.itemName}
                    </td>
                    <td>
                      <StatusBadge status={item.level} />
                    </td>
                    <td className="text-slate-600 text-sm">{item.department}</td>
                    <td className="text-slate-600 text-sm">{item.submitter}</td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <ArrowRightLeft className="w-3.5 h-3.5 text-primary-500" />
                        <span className="text-sm text-slate-600">{item.currentStep}</span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-medium ${priority.className}`}
                      >
                        {priority.label}
                      </span>
                    </td>
                    <td className="text-sm text-slate-600">{item.deadline}</td>
                    <td className="text-right">
                      <button
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        onClick={() => navigate(`/review/${item.itemId}`)}
                      >
                        办理
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* 分页 */}
          <div className="h-12 border-t border-slate-200 flex items-center justify-between px-4">
            <span className="text-xs text-slate-500">
              显示 1-{filteredReviews.length} 条，共 {filteredReviews.length} 条
            </span>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 text-sm text-slate-500 border border-slate-300 rounded hover:bg-slate-50">
                上一页
              </button>
              <button className="w-8 h-8 text-sm bg-primary-600 text-white rounded">1</button>
              <button className="w-8 h-8 text-sm text-slate-600 border border-slate-300 rounded hover:bg-slate-50">
                2
              </button>
              <button className="w-8 h-8 text-sm text-slate-600 border border-slate-300 rounded hover:bg-slate-50">
                下一页
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 会签流转 */}
      {activeTab === 'countersign' && (
        <div className="grid grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="card p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-medium text-slate-800">建设工程规划许可证核发</h3>
                  <p className="text-xs text-slate-500 mt-1">XZXK-GC-002 · 省自然资源厅</p>
                </div>
                <StatusBadge status="reviewing" />
              </div>

              <div className="mb-4">
                <p className="text-sm text-slate-600">
                  该事项涉及多部门职责，需要以下部门共同会签确认：
                </p>
              </div>

              {/* 会签流程 */}
              <div className="space-y-3">
                {[
                  { dept: '省自然资源厅', status: 'done', time: '06-12 10:30', opinion: '同意' },
                  { dept: '省住房和城乡建设厅', status: 'done', time: '06-13 15:20', opinion: '同意，需补充施工许可衔接说明' },
                  { dept: '省生态环境厅', status: 'doing', time: '', opinion: '' },
                  { dept: '省政务服务管理局', status: 'pending', time: '', opinion: '' },
                ].map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                        step.status === 'done'
                          ? 'bg-success-500 text-white'
                          : step.status === 'doing'
                          ? 'bg-primary-500 text-white animate-pulse'
                          : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div className="flex-1 pt-0.5">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm ${
                            step.status === 'pending' ? 'text-slate-400' : 'text-slate-700'
                          }`}
                        >
                          {step.dept}
                        </span>
                        {step.time && (
                          <span className="text-xs text-slate-400">{step.time}</span>
                        )}
                      </div>
                      {step.opinion && (
                        <p className="text-xs text-slate-500 mt-0.5">意见：{step.opinion}</p>
                      )}
                      {step.status === 'doing' && (
                        <span className="text-xs text-primary-600 mt-0.5 inline-block">
                          审校中...
                        </span>
                      )}
                      {step.status === 'pending' && (
                        <span className="text-xs text-slate-400 mt-0.5 inline-block">
                          等待会签
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  <Calendar className="w-3.5 h-3.5 inline mr-1" />
                  提交时间：2025-06-12 14:30
                </span>
                <button className="btn-sm btn-primary">
                  办理会签
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 已审校记录 */}
      {(activeTab === 'reviewed' || activeTab === 'returned') && (
        <div className="card overflow-hidden">
          <table className="table">
            <thead>
              <tr>
                <th className="w-28">事项编码</th>
                <th>事项名称</th>
                <th className="w-32">所属层级</th>
                <th className="w-40">提交部门</th>
                <th className="w-24">版本</th>
                <th className="w-20">结果</th>
                <th className="w-32">审校时间</th>
                <th className="w-24 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {reviewRecords
                .filter((r) =>
                  activeTab === 'returned' ? r.result === 'reject' : r.result !== 'reject'
                )
                .map((record) => (
                  <tr key={record.id}>
                    <td>
                      <span className="font-mono text-xs text-slate-500">
                        {record.itemId === 'item-002'
                          ? 'XZXK-GC-002'
                          : record.itemId === 'item-008'
                          ? 'XZJF-SB-008'
                          : 'XZJF-JZ-004'}
                      </span>
                    </td>
                    <td className="font-medium text-slate-700">{record.itemName}</td>
                    <td>
                      <StatusBadge status="provincial" />
                    </td>
                    <td className="text-slate-600 text-sm">{record.department}</td>
                    <td className="text-slate-600 text-sm">V{record.version}</td>
                    <td>
                      <StatusBadge status={record.result} />
                    </td>
                    <td className="text-slate-500 text-sm">{record.reviewTime}</td>
                    <td className="text-right">
                      <button
                        className="text-sm text-primary-600 hover:text-primary-700"
                        onClick={() => navigate(`/review/${record.itemId}`)}
                      >
                        查看
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
