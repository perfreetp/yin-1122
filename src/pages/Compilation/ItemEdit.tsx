import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useItemStore } from '@/store/itemStore';
import StatusBadge from '@/components/StatusBadge';
import {
  ChevronLeft,
  Save,
  Send,
  FileText,
  Layers,
  ListChecks,
  GitBranch,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
} from 'lucide-react';

const steps = [
  { id: 'basic', label: '基本信息', icon: FileText },
  { id: 'materials', label: '申请材料', icon: Layers },
  { id: 'conditions', label: '受理条件', icon: ListChecks },
  { id: 'process', label: '办理流程', icon: GitBranch },
  { id: 'preview', label: '预览校验', icon: CheckCircle2 },
];

const validationItems = [
  { id: 1, type: 'error', message: '承诺时限不得超过法定时限', field: '时限设置' },
  { id: 2, type: 'warning', message: '第3项申请材料缺少具体要求说明', field: '申请材料' },
  { id: 3, type: 'warning', message: '受理条件未在流程中引用', field: '受理条件' },
  { id: 4, type: 'success', message: '事项编码格式正确', field: '基本信息' },
  { id: 5, type: 'info', message: '建议补充电子证照共享说明', field: '申请材料' },
];

export default function ItemEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getItemById, getMaterials, getConditions, getProcessSteps, items } = useItemStore();
  const [activeStep, setActiveStep] = useState('basic');
  const [expandedMaterials, setExpandedMaterials] = useState<Set<string>>(new Set(['mat-003']));

  const isNewItem = id === 'new';

  const defaultItem = {
    id: 'new',
    name: '',
    code: '',
    category: '市场准入',
    categoryId: 'cat-1-1',
    level: 'provincial' as const,
    department: '',
    departmentId: '',
    status: 'draft' as const,
    legalTimeLimit: 20,
    promisedTimeLimit: 10,
    templateName: '',
    standardSource: '',
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
    updatedBy: '当前用户',
    version: 1,
    completionProgress: 0,
  };

  const item = isNewItem ? defaultItem : getItemById(id || 'item-001');
  const materials = isNewItem ? [] : getMaterials(id || 'item-001');
  const conditions = isNewItem ? [] : getConditions(id || 'item-001');
  const processSteps = isNewItem ? [] : getProcessSteps(id || 'item-001');

  if (!item) {
    return <div className="text-center py-20 text-slate-500">事项不存在</div>;
  }

  const toggleMaterial = (matId: string) => {
    setExpandedMaterials((prev) => {
      const next = new Set(prev);
      if (next.has(matId)) {
        next.delete(matId);
      } else {
        next.add(matId);
      }
      return next;
    });
  };

  const getStepContent = () => {
    switch (activeStep) {
      case 'basic':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  事项名称 <span className="text-danger-500">*</span>
                </label>
                <input type="text" className="input" defaultValue={item.name} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  事项编码 <span className="text-danger-500">*</span>
                </label>
                <input type="text" className="input font-mono" defaultValue={item.code} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  事项分类 <span className="text-danger-500">*</span>
                </label>
                <select className="select">
                  <option>{item.category}</option>
                  <option>市场准入</option>
                  <option>工程建设</option>
                  <option>资质认定</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  所属层级 <span className="text-danger-500">*</span>
                </label>
                <select className="select">
                  <option value="provincial">省级</option>
                  <option value="municipal">市级</option>
                  <option value="county">县级</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  实施部门 <span className="text-danger-500">*</span>
                </label>
                <input type="text" className="input" defaultValue={item.department} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  设定依据
                </label>
                <input type="text" className="input" placeholder="请输入法律法规依据" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  法定期限（工作日） <span className="text-danger-500">*</span>
                </label>
                <input type="number" className="input" defaultValue={item.legalTimeLimit} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  承诺期限（工作日） <span className="text-danger-500">*</span>
                </label>
                <input type="number" className="input" defaultValue={item.promisedTimeLimit} />
              </div>
              <div className="flex items-end">
                <div className="text-sm">
                  <span className="text-success-600 font-medium">压缩 85%</span>
                  <span className="text-slate-400 ml-2">优于法定</span>
                </div>
              </div>
            </div>

            {item.templateName && (
              <div className="p-4 bg-primary-50 rounded border border-primary-200">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-primary-700 font-medium">引用标准模板</p>
                    <p className="text-sm text-primary-600 mt-0.5">{item.templateName}</p>
                    {item.standardSource && (
                      <p className="text-xs text-primary-500 mt-1">
                        标准来源：{item.standardSource}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'materials':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-slate-500">
                共 {materials.length} 项材料，其中必要材料{' '}
                {materials.filter((m) => m.isNecessary).length} 项
              </div>
              <button className="btn-primary btn-sm">
                <Plus className="w-3.5 h-3.5 mr-1" />
                添加材料
              </button>
            </div>

            {materials.map((material, index) => {
              const isExpanded = expandedMaterials.has(material.id);
              const hasChildren = material.subMaterials && material.subMaterials.length > 0;
              return (
                <div
                  key={material.id}
                  className="border border-slate-200 rounded overflow-hidden"
                >
                  <div
                    className="flex items-center gap-3 p-3 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => hasChildren && toggleMaterial(material.id)}
                  >
                    <GripVertical className="w-4 h-4 text-slate-400 cursor-move" />
                    <span className="text-sm font-medium text-slate-500 w-6">
                      {index + 1}.
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-700">
                          {material.name}
                        </span>
                        {material.isNecessary && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-danger-100 text-danger-700 rounded">
                            必要
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-slate-500">
                      {material.format === 'original'
                        ? '原件'
                        : material.format === 'copy'
                        ? '复印件'
                        : '电子件'}
                      · {material.quantity}份
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                        title="编辑"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1.5 text-slate-400 hover:text-danger-600 hover:bg-danger-50 rounded"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {hasChildren && (
                      <button className="p-1 text-slate-400 hover:text-slate-600">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                  <div className="px-4 py-3 bg-white text-sm text-slate-600 border-t border-slate-100">
                    <p>
                      <span className="text-slate-500">材料要求：</span>
                      {material.requirement}
                    </p>
                    {material.remark && (
                      <p className="mt-1">
                        <span className="text-slate-500">备注：</span>
                        {material.remark}
                      </p>
                    )}
                  </div>
                  {hasChildren && isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/50">
                      {material.subMaterials?.map((subMat, subIndex) => (
                        <div
                          key={subMat.id}
                          className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-100 last:border-0 ml-6"
                        >
                          <span className="text-xs text-slate-400">
                            {index + 1}.{subIndex + 1}
                          </span>
                          <span className="text-sm text-slate-700 flex-1">{subMat.name}</span>
                          <span className="text-xs text-slate-500">
                            {subMat.format === 'original'
                              ? '原件'
                              : subMat.format === 'copy'
                              ? '复印件'
                              : '电子件'}
                          </span>
                          {subMat.isNecessary && (
                            <span className="text-[10px] px-1 py-0.5 bg-danger-100 text-danger-700 rounded">
                              必要
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );

      case 'conditions':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-slate-500">
                适用场景：设立登记 · 共 {conditions.length} 条受理条件
              </div>
              <button className="btn-primary btn-sm">
                <Plus className="w-3.5 h-3.5 mr-1" />
                添加条件
              </button>
            </div>

            <div className="space-y-2">
              {conditions.map((cond, index) => (
                <div
                  key={cond.id}
                  className="flex items-start gap-3 p-4 border border-slate-200 rounded hover:border-slate-300 transition-colors"
                >
                  <GripVertical className="w-4 h-4 text-slate-400 mt-0.5 cursor-move flex-shrink-0" />
                  <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-medium flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-slate-700">{cond.content}</p>
                    <p className="text-xs text-slate-400 mt-1">适用场景：{cond.scene}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded">
                      <FileText className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-danger-600 hover:bg-danger-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-warning-50 rounded border border-warning-200 mt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-warning-800">校验提示</p>
                  <p className="text-sm text-warning-700 mt-1">
                    受理条件需与办理流程的受理环节联动，请确保流程中引用了全部受理条件。
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'process':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-slate-500">
                共 {processSteps.length} 个环节，预计总时限{' '}
                {processSteps.reduce((sum, s) => sum + s.timeLimit, 0)} 工作日
              </div>
              <button className="btn-primary btn-sm">
                <Plus className="w-3.5 h-3.5 mr-1" />
                添加环节
              </button>
            </div>

            <div className="relative">
              <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-slate-200"></div>
              {processSteps.map((step, index) => (
                <div key={step.id} className="relative flex gap-4 pb-6 last:pb-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                      index === 0
                        ? 'bg-primary-600 text-white'
                        : 'bg-white border-2 border-slate-300 text-slate-500'
                    }`}
                  >
                    <span className="text-sm font-medium">{step.stepNo}</span>
                  </div>
                  <div className="flex-1 border border-slate-200 rounded p-4 hover:border-slate-300 transition-colors bg-white">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-base font-medium text-slate-800">{step.name}</h4>
                        <p className="text-sm text-slate-500 mt-0.5">办理人：{step.handler}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-primary-600 font-medium">
                          {step.timeLimit > 0 ? `${step.timeLimit} 工作日` : '即时办理'}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mt-3">{step.description}</p>
                    {step.conditions && step.conditions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <span className="text-xs text-slate-500">关联受理条件：</span>
                        <span className="text-xs text-primary-600 ml-1">
                          {step.conditions.length} 条
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      <button className="text-xs text-primary-600 hover:text-primary-700">
                        编辑
                      </button>
                      <span className="text-slate-200">|</span>
                      <button className="text-xs text-slate-500 hover:text-slate-700">
                        插入环节
                      </button>
                      <span className="text-slate-200">|</span>
                      <button className="text-xs text-danger-600 hover:text-danger-700">
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-success-50 rounded border border-success-200 mt-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-success-800">时限校验通过</p>
                  <p className="text-sm text-success-700 mt-1">
                    各环节时限合计 {processSteps.reduce((sum, s) => sum + s.timeLimit, 0)} 工作日，
                    小于承诺时限 {item.promisedTimeLimit} 工作日，符合要求。
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-6">
            <div className="p-5 bg-slate-50 rounded border border-slate-200">
              <h4 className="font-medium text-slate-800 mb-4">事项信息概览</h4>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <div>
                  <span className="text-slate-500">事项名称：</span>
                  <span className="text-slate-700">{item.name}</span>
                </div>
                <div>
                  <span className="text-slate-500">事项编码：</span>
                  <span className="text-slate-700 font-mono">{item.code}</span>
                </div>
                <div>
                  <span className="text-slate-500">事项分类：</span>
                  <span className="text-slate-700">{item.category}</span>
                </div>
                <div>
                  <span className="text-slate-500">实施部门：</span>
                  <span className="text-slate-700">{item.department}</span>
                </div>
                <div>
                  <span className="text-slate-500">法定期限：</span>
                  <span className="text-slate-700">{item.legalTimeLimit} 工作日</span>
                </div>
                <div>
                  <span className="text-slate-500">承诺期限：</span>
                  <span className="text-success-600 font-medium">
                    {item.promisedTimeLimit} 工作日
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">申请材料：</span>
                  <span className="text-slate-700">{materials.length} 项</span>
                </div>
                <div>
                  <span className="text-slate-500">受理条件：</span>
                  <span className="text-slate-700">{conditions.length} 条</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-800 mb-3">校验结果</h4>
              <div className="space-y-2">
                {validationItems.map((v) => {
                  const iconMap = {
                    error: <XCircle className="w-4 h-4 text-danger-500" />,
                    warning: <AlertCircle className="w-4 h-4 text-warning-500" />,
                    success: <CheckCircle2 className="w-4 h-4 text-success-500" />,
                    info: <Info className="w-4 h-4 text-primary-500" />,
                  };
                  const bgMap = {
                    error: 'bg-danger-50 border-danger-200',
                    warning: 'bg-warning-50 border-warning-200',
                    success: 'bg-success-50 border-success-200',
                    info: 'bg-primary-50 border-primary-200',
                  };
                  return (
                    <div
                      key={v.id}
                      className={`flex items-start gap-3 p-3 rounded border ${bgMap[v.type as keyof typeof bgMap]}`}
                    >
                      {iconMap[v.type as keyof typeof iconMap]}
                      <div className="flex-1">
                        <p className="text-sm text-slate-700">{v.message}</p>
                        <p className="text-xs text-slate-500 mt-0.5">字段：{v.field}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-success-500" />
                  <span className="text-slate-600">通过 {validationItems.filter((v) => v.type === 'success').length} 项</span>
                </span>
                <span className="flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-warning-500" />
                  <span className="text-slate-600">警告 {validationItems.filter((v) => v.type === 'warning').length} 项</span>
                </span>
                <span className="flex items-center gap-1">
                  <XCircle className="w-4 h-4 text-danger-500" />
                  <span className="text-slate-600">错误 {validationItems.filter((v) => v.type === 'error').length} 项</span>
                </span>
              </div>
            </div>
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
          onClick={() => navigate('/compilation')}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          返回
        </button>
        <div className="h-5 w-px bg-slate-200"></div>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-slate-800 truncate">
            {isNewItem ? '新建事项' : item.name || '新建事项'}
          </h1>
        </div>
        <StatusBadge status={item.status} />
        <div className="h-5 w-px bg-slate-200"></div>
        <div className="text-sm text-slate-500">
          完成度 <span className="text-primary-600 font-medium">{item.completionProgress}%</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary btn-sm">
            <Save className="w-3.5 h-3.5 mr-1" />
            保存草稿
          </button>
          <button className="btn-primary btn-sm">
            <Send className="w-3.5 h-3.5 mr-1" />
            提交审校
          </button>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex min-h-0">
        {/* 左侧步骤导航 */}
        <div className="w-52 bg-white border-r border-slate-200 flex-shrink-0 py-4">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = activeStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600 font-medium'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{step.label}</span>
              </button>
            );
          })}

          <div className="mt-4 px-4 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500 mb-2">编制进度</p>
            <div className="progress-bar h-1.5">
              <div className="progress-fill" style={{ width: `${item.completionProgress}%` }}></div>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              预计还需 {Math.ceil((100 - item.completionProgress) / 20)} 步完成
            </p>
          </div>
        </div>

        {/* 中间表单区 */}
        <div className="flex-1 overflow-auto p-6 bg-slate-50">
          <div className="max-w-4xl mx-auto">
            <div className="card p-6">{getStepContent()}</div>
          </div>
        </div>

        {/* 右侧校验面板 */}
        <div className="w-72 bg-white border-l border-slate-200 flex-shrink-0 flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-800">实时校验</h3>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-2">
            {validationItems.map((v) => {
              const iconMap = {
                error: <XCircle className="w-4 h-4 text-danger-500 flex-shrink-0" />,
                warning: <AlertCircle className="w-4 h-4 text-warning-500 flex-shrink-0" />,
                success: <CheckCircle2 className="w-4 h-4 text-success-500 flex-shrink-0" />,
                info: <Info className="w-4 h-4 text-primary-500 flex-shrink-0" />,
              };
              return (
                <div key={v.id} className="flex items-start gap-2 p-2 rounded hover:bg-slate-50">
                  {iconMap[v.type as keyof typeof iconMap]}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700 line-clamp-2">{v.message}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{v.field}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-4 border-t border-slate-200">
            <div className="text-xs text-slate-500">
              <div className="flex items-center justify-between mb-1">
                <span>通过率</span>
                <span className="text-success-600 font-medium">
                  {Math.round(
                    (validationItems.filter((v) => v.type === 'success').length /
                      validationItems.length) *
                      100
                  )}
                  %
                </span>
              </div>
              <div className="progress-bar h-1">
                <div
                  className="progress-fill !bg-success-500"
                  style={{
                    width: `${Math.round(
                      (validationItems.filter((v) => v.type === 'success').length /
                        validationItems.length) *
                        100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
