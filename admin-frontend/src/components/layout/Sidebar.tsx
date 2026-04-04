import React from 'react';
import {
  LayoutDashboard, BookOpen, MapPin, Calendar, Users, LogOut, Sparkles, Smartphone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../store/useAdminStore';
import { getAdminPathBySection } from '../../navigation';

const navItems = [
  { id: 'dashboard', label: '数据概览', icon: LayoutDashboard },
  { id: 'books', label: '书籍管理', icon: BookOpen },
  { id: 'seats', label: '楼层座位', icon: MapPin },
  { id: 'events', label: '活动管理', icon: Calendar },
  { id: 'users', label: '用户管理', icon: Users },
];

const Sidebar: React.FC = () => {
  const { activeSection, setActiveSection, sidebarOpen, toggleSidebar, setCurrentAdmin } = useAdminStore();
  const navigate = useNavigate();

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={toggleSidebar} />
      )}

      <aside className={`fixed top-0 left-0 z-40 flex h-full flex-col overflow-hidden border-r border-white/10 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-white shadow-2xl shadow-slate-950/30 transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-0 lg:w-20'
      }`}>
        <div className="border-b border-white/10 px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 shadow-lg shadow-indigo-900/40">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            {sidebarOpen && (
              <div className="animate-fade-in">
                <h1 className="font-semibold text-lg leading-tight">管理后台</h1>
                <p className="text-indigo-200/75 text-xs">AI 智慧图书馆</p>
              </div>
            )}
          </div>

          {sidebarOpen && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <Sparkles className="h-4 w-4 text-cyan-300" />
                演示增强版后台
              </div>
              <p className="mt-2 text-xs leading-6 text-indigo-100/70">新增更强的信息层次、视觉氛围与移动端可读性，适合汇报展示。</p>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="mb-3 px-2 text-[11px] uppercase tracking-[0.26em] text-indigo-200/55">
            {sidebarOpen ? 'Navigation' : 'Nav'}
          </div>
          <div className="space-y-1.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  navigate(getAdminPathBySection(item.id));
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-indigo-950 shadow-[0_18px_40px_-18px_rgba(255,255,255,0.6)]'
                    : 'text-indigo-100/75 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && <span className="animate-fade-in">{item.label}</span>}
              </button>
            );
          })}
          </div>
        </nav>

        <div className="border-t border-white/10 p-3">
          {sidebarOpen && (
            <div className="mb-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-indigo-100/75">
              <div className="flex items-center gap-2 font-medium text-white">
                <Smartphone className="h-3.5 w-3.5 text-emerald-300" />
                手机可演示
              </div>
              <p className="mt-1 leading-5">支持局域网访问与移动侧边栏收起交互。</p>
            </div>
          )}
          <button
            onClick={() => {
              setCurrentAdmin(null);
              navigate('/login');
            }}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-indigo-100/75 transition-all duration-200 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span>退出登录</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
