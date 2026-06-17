import { useState, useEffect } from 'react';
import {
  BookOpen,
  Clock,
  FileText,
  Search,
  Filter,
  ChevronRight,
  Calendar,
  User,
  Tag,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  History,
  Bell,
  Megaphone,
  RefreshCw,
  Layers,
  CheckSquare,
  Square,
  X,
} from 'lucide-react';
import { useReleaseStore } from '@/store/releaseStore';
import { useItemStore } from '@/store/itemStore';
import StatusBadge from '@/components/StatusBadge';

const levelMap: Record<string, string> = {
  provincial: '省级',
  municipal: '市级',
  county: '县级',
};

const typeMap: Record<string, { label: string; color: string }> = {
  release: { label: '发布公告', color: 'bg-primary-100 text-primary-700' },
  change: { label: '变更通知', color: 'bg-warning-100 text-warning-700' },
  notice: { label: '工作通知', color: 'bg-slate-100 text-slate-700' },
};

export default function VersionRelease() {
  const {
    stats,
    activeTab,
    setActiveTab,
    levelFilter,
    setLevelFilter,
    searchKeyword,
    setSearchKeyword,
    getPublishedVersions,
    getFilteredNotices,
    getBatches,
    getBatchById,
    getVersionsByBatch,
    pendingItems,
    selectedItemIds,
    showBatchModal,
    batchNo,
    batchName,
    noticeTitle,
    noticeContent,
    setShowBatchModal,
    setBatchNo,
    setBatchName,
    setNoticeTitle,
    setNoticeContent,
    toggleSelectedItem,
    setSelectedItemIds,
    publishBatch,
    generateBatchNo,
  } = useReleaseStore();

  const items = useItemStore((state) => state.items);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishItemId, setPublishItemId] = useState<string | null>(null);
  const [changeLog, setChangeLog] = useState('');

  const publishedVersions = getPublishedVersions();
  const notices = getFilteredNotices();
  const batches = getBatches();
  const passedItems = pendingItems.filter(p => p.reviewStatus === 'passed' || p.reviewStatus === 'reviewing');
  const reviewableItems = passedItems;

  useEffect(() => {
    if (showBatchModal && !batchNo) {
      setBatchNo(generateBatchNo());
    }
  }, [showBatchModal, batchNo, generateBatchNo, setBatchNo]);

  const getItemInfo = (itemId: string) => {
    return items.find((i) => i.id === itemId);
  };

  const handlePublish = (itemId: string) => {
    setPublishItemId(itemId);
    setChangeLog('');
    setShowPublishModal(true);
  };

  const confirmPublish = () => {
    if (publishItemId && changeLog.trim()) {
      useReleaseStore.getState().publishItem(publishItemId, changeLog);
      setShowPublishModal(false);
      setPublishItemId(null);
      setChangeLog('');
    }
  };

  const openBatchModal = () => {
    if (selectedItemIds.length === 0) {
      alert('请先选择要发布的事项');
      return;
    }
    setShowBatchModal(true);
  };

  const handleBatchPublish = () => {
    if (!batchName.trim() || !noticeTitle.trim() || !noticeContent.trim()) {
      alert('请填写完整的批次信息');
      return;
    }
    publishBatch();
    setSelectedItemIds([]);
  };

  const toggleSelectAll = () => {
    if (selectedItemIds.length === passedItems.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(passedItems.map(p => p.itemId));
    }
  };

  const tabs = [
    { key: 'published', label: '已发布版本', icon: CheckCircle2 },
    { key: 'batches', label: '发布批次', icon: Layers },
    { key: 'pending', label: '待发布列表', icon: Clock },
    { key: 'notices', label: '发布公告', icon: Megaphone },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">版本发布</h1>
          <p className="mt-1 text-sm text-slate-500">管理事项版本的发布、批次、公告和历史回溯</p>
        </div>
        {activeTab === 'pending' && (
          <button 
            onClick={openBatchModal}
            disabled={selectedItemIds.length === 0}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className="w-4 h-4" />
            批量发布 ({selectedItemIds.length})
          </button>
        )}
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">已发布事项</p>
              <p className="mt-2 text-3xl font-semibold text-primary-600">{stats.totalPublished}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <p className="mt-3 text-xs text-success-600 flex items-center gap-1">
            <ArrowRight className="w-3 h-3" />
            本月新增 {stats.thisMonthPublished} 项
          </p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">待发布</p>
              <p className="mt-2 text-3xl font-semibold text-warning-600">{stats.pendingRelease}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-warning-50 flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning-600" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            需及时审核发布
          </p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">发布批次</p>
              <p className="mt-2 text-3xl font-semibold text-info-600">{stats.totalBatches}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-info-50 flex items-center justify-center">
              <Layers className="w-6 h-6 text-info-600" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500 flex items-center gap-1">
            <FileText className="w-3 h-3" />
            支持批量追溯
          </p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">历史版本总数</p>
              <p className="mt-2 text-3xl font-semibold text-slate-700">{stats.totalVersions}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
              <History className="w-6 h-6 text-slate-600" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500 flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            支持版本回溯查看
          </p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">本月公告数</p>
              <p className="mt-2 text-3xl font-semibold text-info-600">{notices.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-info-50 flex items-center justify-center">
              <Bell className="w-6 h-6 text-info-600" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500 flex items-center gap-1">
            <Megaphone className="w-3 h-3" />
            发布通知与变更公告
          </p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜索..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="input pl-9 w-64"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="input w-28"
              >
                <option value="all">全部层级</option>
                <option value="provincial">省级</option>
                <option value="municipal">市级</option>
                <option value="county">县级</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4">
          {activeTab === 'published' && (
            <div className="space-y-3">
              {publishedVersions.map((version) => {
                const itemInfo = getItemInfo(version.itemId);
                const batch = version.batchId ? getBatchById(version.batchId) : null;
                return (
                  <div
                    key={version.id}
                    className="p-4 border border-slate-200 rounded-lg hover:border-primary-300 hover:bg-primary-50/30 transition-all cursor-pointer"
                    onClick={() => setSelectedVersion(selectedVersion === version.id ? null : version.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-slate-900">{version.itemName}</h3>
                            <StatusBadge status="published" />
                            <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                              v{version.version}
                            </span>
                            {batch && (
                              <span className="text-xs px-2 py-0.5 bg-info-100 text-info-700 rounded flex items-center gap-1">
                                <Layers className="w-3 h-3" />
                                {batch.batchNo}
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {version.publisher}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {version.publishTime}
                            </span>
                            {itemInfo && (
                              <span className="flex items-center gap-1">
                                <Tag className="w-3 h-3" />
                                {levelMap[itemInfo.level]}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-5 h-5 text-slate-400 transition-transform ${
                          selectedVersion === version.id ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                    {selectedVersion === version.id && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <h4 className="text-sm font-medium text-slate-700 mb-2">变更说明</h4>
                        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                          {version.changeLog}
                        </p>
                        {batch && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-slate-700 mb-2">所属批次</h4>
                            <div className="bg-info-50 border border-info-200 rounded-lg p-3">
                              <p className="text-sm text-info-800 font-medium">{batch.name}</p>
                              <p className="text-xs text-info-600 mt-1">批次号：{batch.batchNo}</p>
                              <p className="text-xs text-info-600 mt-1">发布时间：{batch.publishTime}</p>
                            </div>
                          </div>
                        )}
                        <div className="mt-4 flex items-center gap-3">
                          <button className="btn-secondary text-sm flex items-center gap-1">
                            <History className="w-4 h-4" />
                            查看历史版本
                          </button>
                          <button className="btn-secondary text-sm flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            查看详情
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {publishedVersions.length === 0 && (
                <div className="py-12 text-center text-slate-500">
                  <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p>暂无已发布版本</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'batches' && (
            <div className="space-y-3">
              {batches.map((batch) => {
                const batchVersions = getVersionsByBatch(batch.id);
                return (
                  <div
                    key={batch.id}
                    className="p-4 border border-slate-200 rounded-lg hover:border-primary-300 hover:bg-primary-50/30 transition-all cursor-pointer"
                    onClick={() => setSelectedBatchId(selectedBatchId === batch.id ? null : batch.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-info-100 flex items-center justify-center">
                          <Layers className="w-5 h-5 text-info-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-slate-900">{batch.name}</h3>
                            <span className="text-xs px-2 py-0.5 bg-info-100 text-info-700 rounded">
                              {batch.batchNo}
                            </span>
                            <StatusBadge status={batch.level as any} />
                            <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                              {batch.itemCount} 项
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {batch.publisher}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {batch.publishTime}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-5 h-5 text-slate-400 transition-transform ${
                          selectedBatchId === batch.id ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                    {selectedBatchId === batch.id && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <h4 className="text-sm font-medium text-slate-700 mb-2">发布公告</h4>
                        <div className="bg-slate-50 p-3 rounded-lg mb-4">
                          <p className="text-sm font-medium text-slate-800">{batch.noticeTitle}</p>
                          <p className="text-sm text-slate-600 mt-1">{batch.noticeContent}</p>
                        </div>
                        <h4 className="text-sm font-medium text-slate-700 mb-2">包含事项</h4>
                        <div className="space-y-2">
                          {batchVersions.map((v) => (
                            <div key={v.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                              <span className="text-sm text-slate-700">{v.itemName}</span>
                              <span className="text-xs text-slate-500">v{v.version}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {batches.length === 0 && (
                <div className="py-12 text-center text-slate-500">
                  <Layers className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p>暂无发布批次</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'pending' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="w-12 py-3 px-4">
                      {passedItems.length > 0 && (
                        <button onClick={toggleSelectAll} className="text-slate-400 hover:text-primary-600">
                          {selectedItemIds.length === passedItems.length ? (
                            <CheckSquare className="w-5 h-5 text-primary-600" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                      )}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">事项名称</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">事项编码</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">层级</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">部门</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">版本</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">状态</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">预计发布时间</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {passedItems.map((item) => {
                    const itemInfo = getItemInfo(item.itemId);
                    const isSelected = selectedItemIds.includes(item.itemId);
                    const canSelect = item.reviewStatus === 'passed' || item.reviewStatus === 'reviewing';
                    return (
                      <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          {canSelect && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleSelectedItem(item.itemId); }}
                              className="text-slate-400 hover:text-primary-600"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-5 h-5 text-primary-600" />
                              ) : (
                                <Square className="w-5 h-5" />
                              )}
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-900">{item.itemName}</span>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">{item.code}</td>
                        <td className="py-3 px-4">
                          <span className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded">
                            {levelMap[item.level]}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">{item.department}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">v{item.version}</td>
                        <td className="py-3 px-4">
                          <StatusBadge status={item.reviewStatus === 'passed' ? 'pending_release' : item.reviewStatus as any} />
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">{item.expectedPublishTime}</td>
                        <td className="py-3 px-4">
                          {canSelect ? (
                            <button
                              onClick={() => handlePublish(item.itemId)}
                              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                            >
                              发布
                            </button>
                          ) : (
                            <span className="text-slate-400 text-sm">待审校</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {passedItems.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-500">
                        <Clock className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                        <p>暂无待发布事项</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'notices' && (
            <div className="space-y-4">
              {notices.map((notice) => {
                const batch = (notice as any).batchId ? getBatchById((notice as any).batchId) : null;
                return (
                  <div
                    key={notice.id}
                    className="p-4 border border-slate-200 rounded-lg hover:border-primary-300 hover:bg-primary-50/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {notice.isImportant && (
                            <span className="text-xs px-2 py-0.5 bg-danger-100 text-danger-700 rounded font-medium">
                              重要
                            </span>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded ${typeMap[notice.type]?.color}`}>
                            {typeMap[notice.type]?.label}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                            {levelMap[notice.level]}
                          </span>
                          {batch && (
                            <span className="text-xs px-2 py-0.5 bg-info-100 text-info-700 rounded flex items-center gap-1">
                              <Layers className="w-3 h-3" />
                              {batch.batchNo}
                            </span>
                          )}
                        </div>
                        <h3 className="mt-2 font-medium text-slate-900">{notice.title}</h3>
                        <p className="mt-2 text-sm text-slate-600 line-clamp-2">{notice.content}</p>
                        <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {notice.publisher}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {notice.publishTime}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showPublishModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[500px] max-h-[80vh] overflow-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">发布确认</h2>
              <p className="mt-1 text-sm text-slate-500">请填写版本变更说明</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">变更说明</label>
                <textarea
                  value={changeLog}
                  onChange={(e) => setChangeLog(e.target.value)}
                  rows={4}
                  placeholder="请详细描述本次版本的主要变更内容..."
                  className="input w-full resize-none"
                />
              </div>
              <div className="bg-warning-50 border border-warning-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-warning-800">发布提示</p>
                    <p className="mt-1 text-xs text-warning-700">
                      发布后事项将正式生效，各级部门均可查看使用。请确保事项内容准确无误。
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowPublishModal(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={confirmPublish}
                disabled={!changeLog.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认发布
              </button>
            </div>
          </div>
        </div>
      )}

      {showBatchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[600px] max-h-[85vh] overflow-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">批量发布</h2>
                <p className="mt-1 text-sm text-slate-500">将选中的 {selectedItemIds.length} 个事项作为一个批次发布</p>
              </div>
              <button 
                onClick={() => setShowBatchModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">批次号</label>
                  <input
                    type="text"
                    value={batchNo}
                    onChange={(e) => setBatchNo(e.target.value)}
                    className="input w-full"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">批次名称</label>
                  <input
                    type="text"
                    value={batchName}
                    onChange={(e) => setBatchName(e.target.value)}
                    placeholder="如：2025年6月第一批事项发布"
                    className="input w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">公告标题</label>
                <input
                  type="text"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="请输入发布公告标题"
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">公告内容</label>
                <textarea
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  rows={4}
                  placeholder="请详细描述本次批次发布的内容、目的和注意事项..."
                  className="input w-full resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  已选事项 ({selectedItemIds.length})
                </label>
                <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
                  {passedItems
                    .filter(p => selectedItemIds.includes(p.itemId))
                    .map(item => (
                      <div key={item.itemId} className="flex items-center justify-between p-2 text-sm">
                        <span className="text-slate-700">{item.itemName}</span>
                        <span className="text-slate-500 text-xs">{levelMap[item.level]}</span>
                      </div>
                    ))}
                </div>
              </div>
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-primary-800">批量发布提示</p>
                    <p className="mt-1 text-xs text-primary-700">
                      发布后所有选中事项将正式生效，并自动生成对应的发布公告。请确保所有事项内容准确无误。
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowBatchModal(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleBatchPublish}
                disabled={!batchName.trim() || !noticeTitle.trim() || !noticeContent.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认批次发布
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
