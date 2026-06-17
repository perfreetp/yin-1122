import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useItemStore } from '@/store/itemStore';
import StatusBadge from '@/components/StatusBadge';
import type { TraceRecord } from '@/types';
import {
  Plus,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  FileText,
  Eye,
  Edit3,
  MoreHorizontal,
  Download,
  Upload,
  Layers,
  GitBranch,
  X,
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Send,
  Rocket,
} from 'lucide-react';

export default function ItemLibrary() {
  const navigate = useNavigate();
  const {
    categories,
    items,
    getFilteredItems,
    getTraceRecords,
    selectedCategoryId,
    setSelectedCategory,
    setSearchKeyword,
    searchKeyword,
    setStatusFilter,
    setLevelFilter,
    setDepartmentFilter,
    statusFilter,
    levelFilter,
    departmentFilter,
  } = useItemStore();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['cat-1', 'cat-2', 'cat-3']));
  const [showTraceModal, setShowTraceModal] = useState(false);
  const [traceItemId, setTraceItemId] = useState<string | null>(null);

  const filteredItems = getFilteredItems();
  const traceRecords = traceItemId ? getTraceRecords(traceItemId) : [];
  
  const allDepartments = Array.from(new Map(items.map(i => [i.departmentId, { id: i.departmentId, name: i.department }])).values());

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCategoryClick = (id: string) => {
    if (selectedCategoryId === id) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(id);
    }
  };

  const handleViewTrace = (itemId: string) => {
    setTraceItemId(itemId);
    setShowTraceModal(true);
  };

  const getTraceIcon = (action: TraceRecord['action']) => {
    switch (action) {
      case 'create': return <FileText className="w-4 h-4" />;
      case 'update': return <Edit3 className="w-4 h-4" />;
      case 'submit': return <Send className="w-4 h-4" />;
      case 'review_pass': return <CheckCircle2 className="w-4 h-4" />;
      case 'review_reject': return <XCircle className="w-4 h-4" />;
      case 'countersign': return <RefreshCw className="w-4 h-4" />;
      case 'publish': return <Rocket className="w-4 h-4" />;
      default: return <GitBranch className="w-4 h-4" />;
    }
  };

  const getTraceColor = (action: TraceRecord['action']) => {
    switch (action) {
      case 'create': return 'bg-slate-100 text-slate-600';
      case 'update': return 'bg-info-100 text-info-600';
      case 'submit': return 'bg-primary-100 text-primary-600';
      case 'review_pass': return 'bg-success-100 text-success-600';
      case 'review_reject': return 'bg-danger-100 text-danger-600';
      case 'countersign': return 'bg-warning-100 text-warning-600';
      case 'publish': return 'bg-success-100 text-success-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const renderCategoryTree = (cats: typeof categories, level = 0) => {
    return cats.map((cat) => {
      const hasChildren = cat.children && cat.children.length > 0;
      const isExpanded = expandedCategories.has(cat.id);
      const isSelected = selectedCategoryId === cat.id;

      return (
        <div key={cat.id}>
          <div
            className={`flex items-center gap-2 px-3 py-2 cursor-pointer rounded transition-colors ${
              isSelected ? 'bg-primary-50 text-primary-700' : 'hover:bg-slate-100 text-slate-700'
            }`}
            style={{ paddingLeft: `${level * 16 + 12}px` }}
            onClick={() => handleCategoryClick(cat.id)}
          >
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCategory(cat.id);
                }}
                className="p-0.5 -ml-1 text-slate-400 hover:text-slate-600"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            ) : (
              <span className="w-4" />
            )}
            {hasChildren ? (
              isExpanded ? (
                <FolderOpen className="w-4 h-4 text-primary-500" />
              ) : (
                <Folder className="w-4 h-4 text-slate-400" />
              )
            ) : (
              <FileText className="w-4 h-4 text-slate-400" />
            )}
            <span className="flex-1 text-sm truncate">{cat.name}</span>
            <span className="text-xs text-slate-400">{cat.count}</span>
          </div>
          {hasChildren && isExpanded && (
            <div className="mt-0.5">{renderCategoryTree(cat.children!, level + 1)}</div>
          )}
        </div>
      );
    });
  };

  const traceItem = traceItemId ? items.find(i => i.id === traceItemId) : null;

  return (
    <div className="h-full flex gap-6 -m-6 p-6">
      <div className="w-64 flex-shrink-0">
        <div className="card h-full flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-800">事项分类</h3>
          </div>
          <div className="flex-1 overflow-auto p-2">
            {renderCategoryTree(categories)}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="card p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索事项名称、编码..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-72 h-9 pl-9 pr-3 text-sm border border-slate-300 rounded bg-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                />
              </div>
              <select
                className="select w-32"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">全部状态</option>
                <option value="draft">草稿</option>
                <option value="compiling">编制中</option>
                <option value="reviewing">审校中</option>
                <option value="rejected">已退回</option>
                <option value="pending_release">待发布</option>
                <option value="published">已发布</option>
              </select>
              <select
                className="select w-28"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
              >
                <option value="all">全部层级</option>
                <option value="provincial">省级</option>
                <option value="municipal">市级</option>
                <option value="county">县级</option>
              </select>
              <select
                className="select w-44"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="all">全部部门</option>
                {allDepartments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
              <button className="btn-ghost">
                <Filter className="w-4 h-4 mr-1.5" />
                更多筛选
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn-secondary">
                <Upload className="w-4 h-4 mr-1.5" />
                导入
              </button>
              <button className="btn-secondary">
                <Download className="w-4 h-4 mr-1.5" />
                导出
              </button>
              <button className="btn-primary" onClick={() => navigate('/compilation/new')}>
                <Plus className="w-4 h-4 mr-1.5" />
                新建事项
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm text-slate-500">
            共 <span className="text-slate-800 font-medium">{filteredItems.length}</span> 条事项
          </span>
          <div className="flex items-center gap-1">
            <button className="text-xs px-2 py-1 rounded bg-primary-50 text-primary-700 border border-primary-200">
              全部
            </button>
            <button className="text-xs px-2 py-1 rounded text-slate-500 hover:bg-slate-100">
              我编制的
            </button>
            <button className="text-xs px-2 py-1 rounded text-slate-500 hover:bg-slate-100">
              待处理
            </button>
            <button className="text-xs px-2 py-1 rounded text-slate-500 hover:bg-slate-100">
              已发布
            </button>
          </div>
        </div>

        <div className="card flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto">
            <table className="table">
              <thead className="sticky top-0 z-10">
                <tr>
                  <th className="w-12">
                    <input type="checkbox" className="rounded border-slate-300" />
                  </th>
                  <th className="w-24">事项编码</th>
                  <th>事项名称</th>
                  <th className="w-28">所属层级</th>
                  <th className="w-36">实施部门</th>
                  <th className="w-24">状态</th>
                  <th className="w-28">法定时限</th>
                  <th className="w-28">承诺时限</th>
                  <th className="w-32">更新时间</th>
                  <th className="w-32 text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="cursor-pointer">
                    <td>
                      <input type="checkbox" className="rounded border-slate-300" />
                    </td>
                    <td>
                      <span className="font-mono text-xs text-slate-500">{item.code}</span>
                    </td>
                    <td>
                      <div
                        className="font-medium text-slate-800 hover:text-primary-600 transition-colors"
                        onClick={() => navigate(`/compilation/edit/${item.id}`)}
                      >
                        {item.name}
                      </div>
                      {item.templateName && (
                        <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          {item.templateName}
                        </div>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={item.level} />
                    </td>
                    <td className="text-slate-600">{item.department}</td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="text-slate-600">{item.legalTimeLimit} 工作日</td>
                    <td>
                      <span className="text-success-600 font-medium">
                        {item.promisedTimeLimit} 工作日
                      </span>
                    </td>
                    <td className="text-slate-500 text-sm">{item.updatedAt}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                          title="查看"
                          onClick={() => navigate(`/compilation/edit/${item.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                          title="编辑"
                          onClick={() => navigate(`/compilation/edit/${item.id}`)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 text-slate-400 hover:text-info-600 hover:bg-info-50 rounded transition-colors"
                          title="流转轨迹"
                          onClick={() => handleViewTrace(item.id)}
                        >
                          <GitBranch className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                          title="更多"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="h-12 border-t border-slate-200 flex items-center justify-between px-4">
            <span className="text-xs text-slate-500">
              显示 1-{items.length} 条，共 {items.length} 条
            </span>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 text-sm text-slate-500 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50">
                上一页
              </button>
              <button className="w-8 h-8 text-sm bg-primary-600 text-white rounded">
                1
              </button>
              <button className="w-8 h-8 text-sm text-slate-600 border border-slate-300 rounded hover:bg-slate-50">
                2
              </button>
              <button className="w-8 h-8 text-sm text-slate-600 border border-slate-300 rounded hover:bg-slate-50">
                3
              </button>
              <span className="text-slate-400 px-1">...</span>
              <button className="w-8 h-8 text-sm text-slate-600 border border-slate-300 rounded hover:bg-slate-50">
                10
              </button>
              <button className="w-8 h-8 text-sm text-slate-600 border border-slate-300 rounded hover:bg-slate-50">
                下一页
              </button>
            </div>
          </div>
        </div>
      </div>

      {showTraceModal && traceItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[600px] max-h-[80vh] overflow-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">流转轨迹</h2>
                <p className="mt-1 text-sm text-slate-500">{traceItem.name}</p>
              </div>
              <button 
                onClick={() => {
                  setShowTraceModal(false);
                  setTraceItemId(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {traceRecords.length > 0 ? (
                <div className="relative">
                  <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-200" />
                  {traceRecords.map((record, index) => (
                    <div key={record.id} className="relative flex gap-4 pb-6 last:pb-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${getTraceColor(record.action)}`}>
                        {getTraceIcon(record.action)}
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-900">{record.actionName}</span>
                          <span className="text-xs text-slate-400">{record.time}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {record.operator}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span>{record.department}</span>
                        </div>
                        {record.remark && (
                          <div className="mt-2 p-3 bg-slate-50 rounded-lg text-sm text-slate-600">
                            {record.remark}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500">
                  <GitBranch className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p>暂无流转记录</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => {
                  setShowTraceModal(false);
                  setTraceItemId(null);
                }}
                className="btn-secondary"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
