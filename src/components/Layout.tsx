import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Database,
  FileEdit,
  CheckSquare,
  Tags,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  User,
  Building2,
} from 'lucide-react';

const menuItems = [
  { path: '/', label: '督办看板', icon: LayoutDashboard },
  { path: '/item-library', label: '事项库', icon: Database },
  { path: '/compilation', label: '编制台', icon: FileEdit },
  { path: '/review', label: '审校中心', icon: CheckSquare },
  { path: '/version', label: '版本发布', icon: Tags },
  { path: '/knowledge', label: '知识规则', icon: BookOpen },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const getBreadcrumb = () => {
    const item = menuItems.find((m) => location.pathname.startsWith(m.path) && m.path !== '/');
    if (item) {
      return [
        { label: '首页', path: '/' },
        { label: item.label, path: item.path },
      ];
    }
    if (location.pathname === '/') {
      return [{ label: '督办看板', path: '/' }];
    }
    return [{ label: '首页', path: '/' }];
  };

  const breadcrumb = getBreadcrumb();

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary-600 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <span className="font-semibold text-slate-800 text-sm truncate">
                政务服务清单管理
              </span>
            )}
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 py-4 px-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''} ${
                  collapsed ? 'justify-center px-2' : ''
                }`}
                title={item.label}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="border-t border-slate-200 p-2">
          <div
            className={`flex items-center gap-3 p-2 rounded hover:bg-slate-50 cursor-pointer ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-primary-600" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-700 truncate">
                  省级管理员
                </div>
                <div className="text-xs text-slate-500 truncate">
                  省政务服务管理局
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="h-10 border-t border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-6 gap-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 flex-1">
            {breadcrumb.map((item, index) => (
              <div key={item.label} className="flex items-center">
                {index > 0 && <span className="breadcrumb-separator">/</span>}
                {index === breadcrumb.length - 1 ? (
                  <span className="text-sm text-slate-800 font-medium">
                    {item.label}
                  </span>
                ) : (
                  <NavLink to={item.path} className="breadcrumb-item">
                    {item.label}
                  </NavLink>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="搜索事项..."
                className="w-56 h-8 pl-9 pr-3 text-sm border border-slate-300 rounded bg-slate-50 focus:bg-white focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>
            <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
