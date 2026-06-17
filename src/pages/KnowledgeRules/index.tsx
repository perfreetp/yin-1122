import { useState } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Lightbulb,
  AlertTriangle,
  XCircle,
  Info,
  ChevronRight,
  Eye,
  ToggleLeft,
  ToggleRight,
  FileText,
  Clock,
  User,
  Tag,
  Settings,
  HelpCircle,
  CheckCircle,
} from 'lucide-react';
import { useReviewStore } from '@/store/reviewStore';
import type { ValidationRule, KnowledgeArticle } from '@/types';

const levelIconMap: Record<string, any> = {
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const levelColorMap: Record<string, string> = {
  error: 'text-danger-600 bg-danger-50',
  warning: 'text-warning-600 bg-warning-50',
  info: 'text-info-600 bg-info-50',
};

const ruleCategories = [
  { key: 'all', label: '全部规则' },
  { key: '时限校验', label: '时限校验' },
  { key: '材料校验', label: '材料校验' },
  { key: '流程校验', label: '流程校验' },
  { key: '编码校验', label: '编码校验' },
  { key: '层级校验', label: '层级校验' },
  { key: '内容校验', label: '内容校验' },
];

const articleCategories = [
  { key: 'all', label: '全部文章' },
  { key: '编制规范', label: '编制规范' },
  { key: '操作指南', label: '操作指南' },
  { key: '材料规范', label: '材料规范' },
  { key: '审校规范', label: '审校规范' },
  { key: '错误案例', label: '错误案例' },
];

export default function KnowledgeRules() {
  const {
    validationRules,
    knowledgeArticles,
    toggleRuleStatus,
    getRulesByCategory,
    getArticlesByCategory,
  } = useReviewStore();

  const [activeTab, setActiveTab] = useState('rules');
  const [ruleCategory, setRuleCategory] = useState('all');
  const [articleCategory, setArticleCategory] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedRule, setSelectedRule] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);

  const filteredRules = getRulesByCategory(ruleCategory).filter((rule) => {
    if (!searchKeyword) return true;
    const kw = searchKeyword.toLowerCase();
    return (
      rule.name.toLowerCase().includes(kw) ||
      rule.description.toLowerCase().includes(kw)
    );
  });

  const filteredArticles = getArticlesByCategory(articleCategory).filter((article) => {
    if (!searchKeyword) return true;
    const kw = searchKeyword.toLowerCase();
    return (
      article.title.toLowerCase().includes(kw) ||
      article.content.toLowerCase().includes(kw)
    );
  });

  const enabledCount = validationRules.filter((r) => r.isEnabled).length;

  const tabs = [
    { key: 'rules', label: '校验规则', icon: Settings },
    { key: 'knowledge', label: '知识库', icon: BookOpen },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">知识规则</h1>
          <p className="mt-1 text-sm text-slate-500">管理编制校验规则和业务知识文档</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          新建规则
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">校验规则总数</p>
              <p className="mt-2 text-3xl font-semibold text-primary-600">{validationRules.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center">
              <Settings className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500 flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-success-600" />
            已启用 {enabledCount} 条
          </p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">错误级规则</p>
              <p className="mt-2 text-3xl font-semibold text-danger-600">
                {validationRules.filter((r) => r.level === 'error').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-danger-50 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-danger-600" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">不通过将阻止提交</p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">知识文章数</p>
              <p className="mt-2 text-3xl font-semibold text-info-600">{knowledgeArticles.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-info-50 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-info-600" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500 flex items-center gap-1">
            <Eye className="w-3 h-3" />
            总浏览 {knowledgeArticles.reduce((sum, a) => sum + a.viewCount, 0).toLocaleString()} 次
          </p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">常见错误分类</p>
              <p className="mt-2 text-3xl font-semibold text-warning-600">6</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-warning-50 flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-warning-600" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">持续更新完善中</p>
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
                placeholder="搜索规则或文章..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="input pl-9 w-64"
              />
            </div>
            {activeTab === 'rules' && (
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={ruleCategory}
                  onChange={(e) => setRuleCategory(e.target.value)}
                  className="input w-32"
                >
                  {ruleCategories.map((cat) => (
                    <option key={cat.key} value={cat.key}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {activeTab === 'knowledge' && (
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={articleCategory}
                  onChange={(e) => setArticleCategory(e.target.value)}
                  className="input w-32"
                >
                  {articleCategories.map((cat) => (
                    <option key={cat.key} value={cat.key}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4">
          {activeTab === 'rules' && (
            <div className="space-y-3">
              {filteredRules.map((rule) => {
                const LevelIcon = levelIconMap[rule.level];
                return (
                  <div
                    key={rule.id}
                    className="p-4 border border-slate-200 rounded-lg hover:border-primary-300 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${levelColorMap[rule.level]}`}
                          >
                            <LevelIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="font-medium text-slate-900">{rule.name}</h3>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                                {rule.category}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded ${levelColorMap[rule.level]}`}>
                                {rule.level === 'error' ? '错误' : rule.level === 'warning' ? '警告' : '提示'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-slate-600 ml-11">{rule.description}</p>

                        {selectedRule === rule.id && (
                          <div className="mt-4 ml-11 space-y-4">
                            <div className="bg-slate-50 rounded-lg p-4">
                              <h4 className="text-sm font-medium text-slate-700 mb-2">规则表达式</h4>
                              <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-700">
                                {rule.ruleExpression}
                              </code>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-danger-700 mb-2 flex items-center gap-1">
                                  <XCircle className="w-4 h-4" />
                                  错误示例
                                </h4>
                                <p className="text-sm text-danger-600">{rule.errorExample}</p>
                              </div>
                              <div className="bg-success-50 border border-success-200 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-success-700 mb-2 flex items-center gap-1">
                                  <CheckCircle className="w-4 h-4" />
                                  正确示例
                                </h4>
                                <p className="text-sm text-success-600">{rule.correctExample}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleRuleStatus(rule.id)}
                          className="text-slate-500 hover:text-primary-600 transition-colors"
                        >
                          {rule.isEnabled ? (
                            <ToggleRight className="w-10 h-10 text-primary-600" />
                          ) : (
                            <ToggleLeft className="w-10 h-10 text-slate-400" />
                          )}
                        </button>
                        <button
                          onClick={() =>
                            setSelectedRule(selectedRule === rule.id ? null : rule.id)
                          }
                          className="text-slate-400 hover:text-primary-600 transition-colors"
                        >
                          <ChevronRight
                            className={`w-5 h-5 transition-transform ${
                              selectedRule === rule.id ? 'rotate-90' : ''
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredRules.length === 0 && (
                <div className="py-12 text-center text-slate-500">
                  <Settings className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p>暂无匹配的校验规则</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'knowledge' && (
            <div className="grid grid-cols-2 gap-4">
              {filteredArticles.map((article) => (
                <div
                  key={article.id}
                  className="p-5 border border-slate-200 rounded-lg hover:border-primary-300 hover:bg-primary-50/30 transition-all cursor-pointer"
                  onClick={() => setSelectedArticle(article)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-info-50 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-info-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                          {article.category}
                        </span>
                      </div>
                      <h3 className="mt-2 font-medium text-slate-900 line-clamp-1">
                        {article.title}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                        {article.content}
                      </p>
                      <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {article.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {article.createdAt}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {article.viewCount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedArticle && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="bg-white rounded-xl w-[700px] max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200 sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded">
                    {selectedArticle.category}
                  </span>
                  <h2 className="mt-2 text-lg font-semibold text-slate-900">
                    {selectedArticle.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {selectedArticle.author}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {selectedArticle.createdAt}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {selectedArticle.viewCount.toLocaleString()} 次浏览
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-line">
                {selectedArticle.content}
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button className="btn-secondary" onClick={() => setSelectedArticle(null)}>
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
