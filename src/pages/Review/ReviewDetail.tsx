import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useItemStore } from '@/store/itemStore';
import { useReviewStore } from '@/store/reviewStore';
import StatusBadge from '@/components/StatusBadge';
import {
  ChevronLeft,
  FileText,
  Layers,
  ListChecks,
  GitBranch,
  Send,
  RotateCcw,
  MessageSquare,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Users,
  AlertCircle,
  X,
} from 'lucide-react';

const sections = [
  { id: 'basic', label: '基本信息', icon: FileText },
  { id: 'materials', label: '申请材料', icon: Layers },
  { id: 'conditions', label: '受理条件', icon: ListChecks },
  { id: 'process', label: '办理流程', icon: GitBranch },
];

const countersignDepartments = [
  { id: 'dept-001', name: '省市场监督管理局', checked: false },
  { id: 'dept-002', name: '省自然资源厅', checked: false },
  { id: 'dept-003', name: '省卫生健康委员会', checked: false },
  { id: 'dept-006', name: '省教育厅', checked: false },
  { id: 'dept-007', name: '省公安厅', checked: false },
  { id: 'dept-008', name: '省人力资源和社会保障厅', checked: false },
  { id: 'dept-010', name: '省生态环境厅', checked: false },
  { id: 'dept-011', name: '省住房和城乡建设厅', checked: false },
];

export default function ReviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getItemById, getMaterials, getConditions, getProcessSteps, updateItemStatus } = useItemStore();
  const { getReviewRecordsByItem, addReviewRecord, pendingReviews, addCountersignRecord } = useReviewStore();
  const [activeSection, setActiveSection] = useState('basic');
  const [reviewOpinion, setReviewOpinion] = useState('');
  const [showCountersign, setShowCountersign] = useState(false);
  const [countersignModal, setCountersignModal] = useState(false);
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [countersignOpinion, setCountersignOpinion] = useState('');

  const item = getItemById(id || 'item-002');
  const materials = getMaterials(id || 'item-001');
  const conditions = getConditions(id || 'item-001');
  const processSteps = getProcessSteps(id || 'item-001');
  const reviewRecords = getReviewRecordsByItem(id || 'item-002');

  if (!item) {
    return <div className="text-center py-20 text-slate-500">事项不存在</div>;
  }

  const handleReviewPass = () => {
    if (!reviewOpinion.trim()) {
      alert('请填写审校意见');
      return;
    }
    addReviewRecord({
      itemId: item.id,
      itemName: item.name,
      version: item.version,
      reviewer: '省政务服务管理局 审核员',
      reviewerId: 'user-current',
      department: '省政务服务管理局',
      departmentId: 'dept-gov',
      opinion: reviewOpinion,
      result: 'pass',
      reviewTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
    });
    updateItemStatus(item.id, 'published');
    alert('审校通过，事项状态已更新为已发布');
    setReviewOpinion('');
    navigate('/review');
  };

  const handleReviewReject = () => {
    if (!reviewOpinion.trim()) {
      alert('请填写退审意见');
      return;
    }
    addReviewRecord({
      itemId: item.id,
      itemName: item.name,
      version: item.version,
      reviewer: '省政务服务管理局 审核员',
      reviewerId: 'user-current',
      department: '省政务服务管理局',
      departmentId: 'dept-gov',
      opinion: reviewOpinion,
      result: 'reject',
      reviewTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
    });
    updateItemStatus(item.id, 'rejected');
    alert('已退回修改，事项状态已更新为已退回');
    setReviewOpinion('');
    navigate('/review');
  };

  const handleInitiateCountersign = () => {
    setCountersignModal(true);
    setSelectedDepts([]);
    setCountersignOpinion('');
  };

  const toggleDept = (deptId: string) => {
    setSelectedDepts((prev) =>
      prev.includes(deptId) ? prev.filter((d) => d !== deptId) : [...prev, deptId]
    );
  };

  const confirmCountersign = () => {
    if (selectedDepts.length === 0) {
      alert('请选择会签部门');
      return;
    }
    const deptNames = countersignDepartments
      .filter((d) => selectedDepts.includes(d.id))
      .map((d) => d.name)
      .join('、');
    
    addCountersignRecord({
      itemId: item.id,
      itemName: item.name,
      code: item.code,
      department: item.department,
      level: item.level,
      submitter: item.updatedBy,
      submitTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: 'high',
      currentStep: '会签流转',
      nextReviewer: deptNames,
      countersignDepts: selectedDepts,
      countersignOpinion: countersignOpinion,
    });

    addReviewRecord({
      itemId: item.id,
      itemName: item.name,
      version: item.version,
      reviewer: '省政务服务管理局 审核员',
      reviewerId: 'user-current',
      department: '省政务服务管理局',
      departmentId: 'dept-gov',
      opinion: countersignOpinion || `发起会签，涉及部门：${deptNames}`,
      result: 'transfer',
      reviewTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
      isCountersign: true,
    });

    setCountersignModal(false);
    setShowCountersign(true);
    alert(`已发起会签，涉及 ${selectedDepts.length} 个部门：${deptNames}`);
  };

  const getSectionContent = () => {
    switch (activeSection) {
      case 'basic':
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-y-4">
              <div>
                <label className="text-xs text-slate-500">事项名称</label>
                <p className="text-sm text-slate-800 font-medium mt-0.5">{item.name}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500">事项编码</label>
                <p className="text-sm font-mono text-slate-700 mt-0.5">{item.code}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500">事项分类</label>
                <p className="text-sm text-slate-700 mt-0.5">{item.category}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500">所属层级</label>
                <p className="text-sm mt-0.5">
                  <StatusBadge status={item.level} />
                </p>
              </div>
              <div>
                <label className="text-xs text-slate-500">实施部门</label>
                <p className="text-sm text-slate-700 mt-0.5">{item.department}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500">设定依据</label>
                <p className="text-sm text-slate-700 mt-0.5">
                  {item.standardSource || '《行政许可法》'}
                </p>
              </div>
              <div>
                <label className="text-xs text-slate-500">法定期限</label>
                <p className="text-sm text-slate-700 mt-0.5">{item.legalTimeLimit} 工作日</p>
              </div>
              <div>
                <label className="text-xs text-slate-500">承诺期限</label>
                <p className="text-sm text-success-600 font-medium mt-0.5">
                  {item.promisedTimeLimit} 工作日
                </p>
              </div>
            </div>

            {item.templateName && (
              <div className="p-3 bg-primary-50 rounded border border-primary-200">
                <p className="text-xs text-primary-700">
                  引用模板：{item.templateName}
                  {item.standardSource && ` · 标准来源：${item.standardSource}`}
                </p>
              </div>
            )}
          </div>
        );

      case 'materials':
        return (
          <div className="space-y-2">
            {materials.map((material, index) => (
              <div
                key={material.id}
                className="p-3 border border-slate-200 rounded bg-slate-50/50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500 w-5">{index + 1}.</span>
                  <span className="text-sm font-medium text-slate-700">{material.name}</span>
                  {material.isNecessary && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-danger-100 text-danger-700 rounded">
                      必要
                    </span>
                  )}
                  <span className="ml-auto text-xs text-slate-500">
                    {material.format === 'original' ? '原件' : '复印件'} · {material.quantity}份
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1.5 ml-7">
                  要求：{material.requirement}
                </p>
                {material.remark && (
                  <p className="text-xs text-slate-400 mt-0.5 ml-7">备注：{material.remark}</p>
                )}
                {material.subMaterials && material.subMaterials.length > 0 && (
                  <div className="ml-7 mt-2 space-y-1.5">
                    {material.subMaterials.map((subMat, subIdx) => (
                      <div key={subMat.id} className="flex items-center gap-2 text-xs">
                        <span className="text-slate-400">
                          {index + 1}.{subIdx + 1}
                        </span>
                        <span className="text-slate-600">{subMat.name}</span>
                        <span className="text-slate-400 ml-auto">
                          {subMat.format === 'original' ? '原件' : '复印件'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case 'conditions':
        return (
          <div className="space-y-2">
            {conditions.map((cond, index) => (
              <div
                key={cond.id}
                className="flex items-start gap-3 p-3 border border-slate-200 rounded"
              >
                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-medium flex items-center justify-center flex-shrink-0">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm text-slate-700">{cond.content}</p>
                  <p className="text-xs text-slate-400 mt-1">适用场景：{cond.scene}</p>
                </div>
              </div>
            ))}
          </div>
        );

      case 'process':
        return (
          <div className="relative pl-6">
            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-slate-200"></div>
            {processSteps.map((step, index) => (
              <div key={step.id} className="relative mb-5 last:mb-0">
                <div
                  className={`absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center ${
                    index === 0
                      ? 'bg-primary-600 text-white'
                      : 'bg-white border-2 border-slate-300 text-slate-500'
                  }`}
                >
                  <span className="text-xs font-medium">{step.stepNo}</span>
                </div>
                <div className="ml-4 p-3 border border-slate-200 rounded bg-white">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-slate-800">{step.name}</h4>
                    <span className="text-xs text-primary-600 font-medium">
                      {step.timeLimit > 0 ? `${step.timeLimit} 工作日` : '即时办理'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">办理人：{step.handler}</p>
                  <p className="text-xs text-slate-600 mt-2">{step.description}</p>
                  {step.conditions && step.conditions.length > 0 && (
                    <p className="text-xs text-primary-600 mt-2">
                      关联受理条件 {step.conditions.length} 条
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col -m-6">
      {/* 顶部栏 */}
      <div className="h-14 bg-white border-b border-slate-200 flex items-center px-6 gap-4 flex-shrink-0">
        <button
          onClick={() => navigate('/review')}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          返回
        </button>
        <div className="h-5 w-px bg-slate-200"></div>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-slate-800 truncate">{item.name}</h1>
        </div>
        <StatusBadge status={item.status} />
        <span className="text-xs text-slate-400">
          V{item.version} · {item.updatedAt}
        </span>
        <div className="flex items-center gap-2">
          <button
            className="btn-secondary btn-sm"
            onClick={handleInitiateCountersign}
          >
            <Users className="w-3.5 h-3.5 mr-1" />
            发起会签
          </button>
          <button
            className="btn-sm"
            style={{ borderColor: '#dc2626', color: '#dc2626', background: '#fff' }}
            onClick={handleReviewReject}
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            退回修改
          </button>
          <button className="btn-success btn-sm" onClick={handleReviewPass}>
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            审校通过
          </button>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex min-h-0">
        {/* 左侧目录 */}
        <div className="w-48 bg-white border-r border-slate-200 flex-shrink-0 py-4">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600 font-medium'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{section.label}</span>
              </button>
            );
          })}

          <div className="mt-4 pt-4 border-t border-slate-100 px-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-warning-500" />
              <span className="text-xs font-medium text-slate-700">校验提醒</span>
            </div>
            <p className="text-xs text-slate-500">
              共 3 项待确认，其中错误 1 项，警告 2 项
            </p>
          </div>
        </div>

        {/* 中间内容区 */}
        <div className="flex-1 overflow-auto p-6 bg-slate-50">
          <div className="max-w-4xl mx-auto">
            <div className="card p-5">{getSectionContent()}</div>

            {/* 历史审校意见 */}
            {reviewRecords.length > 0 && (
              <div className="card p-5 mt-6">
                <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  历史审校意见
                </h3>
                <div className="space-y-4">
                  {reviewRecords.map((record) => (
                    <div key={record.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-700">
                            {record.reviewer}
                          </span>
                          <span className="text-xs text-slate-400">{record.department}</span>
                          <StatusBadge status={record.result} />
                          {record.isCountersign && (
                            <span className="text-xs text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded">
                              会签
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mt-1.5 p-3 bg-slate-50 rounded">
                          {record.opinion}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {record.reviewTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 填写审校意见 */}
            <div className="card p-5 mt-6">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">填写审校意见</h3>
              <textarea
                className="textarea h-28"
                placeholder="请输入审校意见..."
                value={reviewOpinion}
                onChange={(e) => setReviewOpinion(e.target.value)}
              ></textarea>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <button className="text-xs text-slate-500 hover:text-slate-700">
                    引用常用意见
                  </button>
                  <span className="text-slate-300">|</span>
                  <button className="text-xs text-slate-500 hover:text-slate-700">
                    上传附件
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-secondary btn-sm" onClick={handleReviewReject}>
                    <RotateCcw className="w-3.5 h-3.5 mr-1" />
                    退回修改
                  </button>
                  <button className="btn-success btn-sm" onClick={handleReviewPass}>
                    <Send className="w-3.5 h-3.5 mr-1" />
                    通过提交
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧审校信息 */}
        <div className="w-72 bg-white border-l border-slate-200 flex-shrink-0 flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-800">审校信息</h3>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-4">
            <div>
              <p className="text-xs text-slate-500">提交部门</p>
              <p className="text-sm text-slate-700 mt-1">{item.department}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">提交人</p>
              <p className="text-sm text-slate-700 mt-1">{item.updatedBy}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">提交时间</p>
              <p className="text-sm text-slate-700 mt-1">2025-06-12 14:30</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">截止日期</p>
              <p className="text-sm text-danger-600 mt-1 font-medium">2025-06-19</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">审校进度</p>
              <div className="mt-2 space-y-2">
                {[
                  { label: '部门初审', status: 'done' },
                  { label: '法制审核', status: 'done' },
                  { label: '分管领导审签', status: 'doing' },
                  { label: '发布准备', status: 'pending' },
                ].map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        step.status === 'done'
                          ? 'bg-success-500'
                          : step.status === 'doing'
                          ? 'bg-primary-500 animate-pulse'
                          : 'bg-slate-200'
                      }`}
                    >
                      {step.status === 'done' && (
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span
                      className={`text-xs ${
                        step.status === 'pending' ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-500 mb-2">编制完整度</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 progress-bar h-2">
                  <div
                    className="progress-fill"
                    style={{ width: `${item.completionProgress}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-primary-600">
                  {item.completionProgress}%
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-200">
            <button
              className="w-full btn-secondary text-sm"
              onClick={() => navigate(`/compilation/edit/${item.id}`)}
            >
              <ArrowRight className="w-4 h-4 mr-1.5" />
              查看编制页
            </button>
          </div>
        </div>
      </div>

      {/* 会签部门选择弹窗 */}
      {countersignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[500px] max-h-[80vh] overflow-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">发起会签</h2>
                <p className="mt-1 text-sm text-slate-500">请选择会签部门</p>
              </div>
              <button
                onClick={() => setCountersignModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">选择会签部门</label>
                <div className="space-y-2 max-h-60 overflow-auto border border-slate-200 rounded-lg p-2">
                  {countersignDepartments.map((dept) => (
                    <label
                      key={dept.id}
                      className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedDepts.includes(dept.id)}
                        onChange={() => toggleDept(dept.id)}
                        className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-slate-700">{dept.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">会签说明（可选）</label>
                <textarea
                  value={countersignOpinion}
                  onChange={(e) => setCountersignOpinion(e.target.value)}
                  rows={3}
                  placeholder="请输入会签说明..."
                  className="input w-full resize-none"
                />
              </div>
              <div className="bg-info-50 border border-info-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-info-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-info-800">会签提示</p>
                    <p className="mt-1 text-xs text-info-700">
                      已选择 {selectedDepts.length} 个部门，会签部门需在5个工作日内反馈意见。
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setCountersignModal(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={confirmCountersign}
                disabled={selectedDepts.length === 0}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认发起
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
