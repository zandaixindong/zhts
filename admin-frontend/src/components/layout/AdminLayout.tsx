import React from 'react';
import { Menu, ShieldCheck, Smartphone } from 'lucide-react';
import { useAdminStore } from '../../store/useAdminStore';
import Sidebar from './Sidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { sidebarOpen, toggleSidebar, currentAdmin } = useAdminStore();

  return (
    <div className="admin-shell">
      <Sidebar />

      <div className={`relative z-10 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        <header className="sticky top-0 z-20 border-b border-white/70 bg-white/70 backdrop-blur-2xl">
          <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
            <div className="flex items-center gap-3">
              <button onClick={toggleSidebar} className="rounded-xl border border-slate-200 bg-white/80 p-2.5 text-slate-600 transition-colors hover:bg-slate-50">
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400">Admin Command Center</p>
                <h1 className="text-base font-semibold text-slate-900">AI 智慧图书馆管理后台</h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="admin-chip">
                <Smartphone className="h-3.5 w-3.5" />
                演示友好
              </span>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{currentAdmin?.name || '管理员'}</p>
                  <p className="text-xs text-slate-500">{currentAdmin?.email || 'admin@university.edu'}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-4 md:px-6 md:py-6 lg:px-8">
          <div className="mx-auto max-w-[1440px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
