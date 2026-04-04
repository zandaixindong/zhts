import React, { Suspense } from 'react';
import { useAdminStore } from './store/useAdminStore';
import AdminLogin from './components/auth/AdminLogin';
import AdminLayout from './components/layout/AdminLayout';
import { BookOpen, Calendar, LayoutDashboard, MapPin, Smartphone, Users, Loader2 } from 'lucide-react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAdminPathBySection, getAdminSectionByPath } from './navigation';

// Lazy load all admin panels for code splitting
const DashboardHome = React.lazy(() => import('./components/dashboard/DashboardHome'));
const BookManager = React.lazy(() => import('./components/books/BookManager'));
const SeatManager = React.lazy(() => import('./components/seats/SeatManager'));
const EventManager = React.lazy(() => import('./components/events/EventManager'));
const UserList = React.lazy(() => import('./components/users/UserList'));

const sectionMeta: Record<string, { title: string; description: string; icon: React.ElementType }> = {
  dashboard: {
    title: '运营总览',
    description: '围绕馆藏、座位、用户和活动，集中展示适合汇报与演示的核心运营指标。',
    icon: LayoutDashboard,
  },
  books: {
    title: '书籍管理',
    description: '维护馆藏资料、上架状态与重点图书信息，支持更清晰的资产管理视角。',
    icon: BookOpen,
  },
  seats: {
    title: '楼层座位管理',
    description: '按楼层维护座位布局与资源状态，兼顾大屏管理与移动查看。',
    icon: MapPin,
  },
  events: {
    title: '活动管理',
    description: '统一处理活动信息、策展主题与用户参与度展示。',
    icon: Calendar,
  },
  users: {
    title: '用户管理',
    description: '查看注册用户、借阅与预约行为，为运营决策提供支撑。',
    icon: Users,
  },
};

// Loading fallback for lazy loaded components
const LoadingFallback = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
  </div>
);

const App: React.FC = () => {
  const location = useLocation();
  const currentAdmin = useAdminStore(s => s.currentAdmin);
  const activeSection = useAdminStore(s => s.activeSection);
  const setActiveSection = useAdminStore(s => s.setActiveSection);
  const routeSection = getAdminSectionByPath(location.pathname);
  const effectiveSection = routeSection || activeSection;
  const section = sectionMeta[effectiveSection] || sectionMeta.dashboard;

  React.useEffect(() => {
    if (routeSection && routeSection !== activeSection) {
      setActiveSection(routeSection);
    }
  }, [routeSection, activeSection, setActiveSection]);

  if (!currentAdmin) {
    if (location.pathname !== '/login') {
      return <Navigate to="/login" replace />;
    }
    return <AdminLogin />;
  }

  if (location.pathname === '/' || location.pathname === '/login') {
    return <Navigate to={getAdminPathBySection(activeSection)} replace />;
  }

  if (!routeSection) {
    return <Navigate to={getAdminPathBySection(activeSection)} replace />;
  }

  const renderPanel = (content: React.ReactNode) => {
    if (effectiveSection === 'dashboard') return content;

    const Icon = section.icon;
    return (
      <div className="admin-panel p-5 sm:p-6">
        <div className="mb-6 flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{section.title}</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">{section.description}</p>
            </div>
          </div>
          <span className="admin-chip">
            <Smartphone className="h-3.5 w-3.5" />
            Mobile Friendly
          </span>
        </div>
        <Suspense fallback={<LoadingFallback />}>
          {content}
        </Suspense>
      </div>
    );
  };

  const renderContent = () => {
    switch (effectiveSection) {
      case 'dashboard':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <DashboardHome />
          </Suspense>
        );
      case 'books': return renderPanel(<BookManager />);
      case 'seats': return renderPanel(<SeatManager />);
      case 'events': return renderPanel(<EventManager />);
      case 'users': return renderPanel(<UserList />);
      default: return <DashboardHome />;
    }
  };

  return (
    <AdminLayout>
      {renderContent()}
    </AdminLayout>
  );
};

export default App;
