import React, { Suspense, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import MobileHeader from './components/layout/MobileHeader';
import BottomNav from './components/layout/BottomNav';
import PageTransition from './components/layout/PageTransition';
import InstallPrompt from './components/ui/InstallPrompt';
import Login from './components/features/auth/Login';
import { useStore } from './store/useStore';
import { authApi } from './utils/api';
import { BellRing, Bot, LibraryBig, ScanLine, Sparkles, Smartphone, Armchair, Bookmark, Loader2 } from 'lucide-react';
import { Navigate, useLocation } from 'react-router-dom';
import { getPathByTab, getTabByPath } from './navigation';

// Lazy load all feature pages for code splitting
const BookSearch = React.lazy(() => import('./components/features/book-search/BookSearch'));
const ForYou = React.lazy(() => import('./components/features/recommendations/ForYou'));
const SeatReservation = React.lazy(() => import('./components/features/seat-map/SeatReservation'));
const ChatWindow = React.lazy(() => import('./components/features/chat-assistant/ChatWindow'));
const NotificationCenter = React.lazy(() => import('./components/features/notifications/NotificationCenter'));
const BarcodeScanner = React.lazy(() => import('./components/features/barcode-scanner/BarcodeScanner'));
const MyActivity = React.lazy(() => import('./components/features/my-activity/MyActivity'));
const BookmarksList = React.lazy(() => import('./components/features/bookmarks/BookmarksList'));

const tabMeta: Record<string, { title: string; description: string }> = {
  scan: { title: '扫码找书', description: '用镜头快速进入馆藏世界，适合现场演示与导览。' },
  search: { title: '智慧检索', description: '自然语言搜索、状态过滤与藏书定位统一到一个流畅入口。' },
  'for-you': { title: '灵感推荐', description: '把阅读兴趣、近期热门和馆藏深度组合成精美推荐流。' },
  seats: { title: '座位预约', description: '结合热力图与偏好条件，给出更沉浸的空间选择体验。' },
  'my-activity': { title: '我的活动', description: '把借阅、预约和活动足迹集中到一个可回顾的个人空间。' },
  bookmarks: { title: '收藏夹', description: '支持跨会话保留重点书单，适合演示“稍后再看”的使用场景。' },
  chat: { title: 'AI 助手', description: '在统一对话窗里完成问答、规则说明与学习支持。' },
  notifications: { title: '通知中心', description: '聚合借阅提醒、活动推送和个性化运营触达。' },
};

// Loading fallback for lazy loaded components
const LoadingFallback = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
  </div>
);

function App() {
  const location = useLocation();
  const activeTab = useStore(state => state.activeTab);
  const setActiveTab = useStore(state => state.setActiveTab);
  const currentUser = useStore(state => state.currentUser);
  const setNotifications = useStore(state => state.setNotifications);
  const routeTab = getTabByPath(location.pathname);
  const effectiveTab = routeTab || activeTab;
  const currentTab = tabMeta[effectiveTab] || tabMeta.search;

  // Check overdue books when user is logged in
  useEffect(() => {
    if (currentUser) {
      authApi.checkOverdue(currentUser.id).catch(() => {});
    }
  }, [currentUser, setNotifications]);

  useEffect(() => {
    if (routeTab && routeTab !== activeTab) {
      setActiveTab(routeTab);
    }
  }, [routeTab, activeTab, setActiveTab]);

  if (!currentUser) {
    if (location.pathname !== '/login') {
      return <Navigate to="/login" replace />;
    }

    return (
      <div className="app-shell">
        <main className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
          <Login />
        </main>
        <footer className="relative z-10 mt-auto border-t border-white/60 bg-white/60 py-6 text-center text-sm text-gray-500 backdrop-blur-xl">
          <p>AI 智慧图书馆 • Powered by GLM-4</p>
        </footer>
      </div>
    );
  }

  if (location.pathname === '/' || location.pathname === '/login') {
    return <Navigate to={getPathByTab(activeTab)} replace />;
  }

  if (!routeTab) {
    return <Navigate to={getPathByTab(activeTab)} replace />;
  }

  const renderContent = () => {
    switch (effectiveTab) {
      case 'scan': return <BarcodeScanner />;
      case 'search': return <BookSearch />;
      case 'for-you': return <ForYou />;
      case 'seats': return <SeatReservation />;
      case 'my-activity': return <MyActivity />;
      case 'bookmarks': return <BookmarksList />;
      case 'chat': return <ChatWindow />;
      case 'notifications': return <NotificationCenter />;
      default: return <BarcodeScanner />;
    }
  };

  return (
    <div className="app-shell">
      <Navbar />
      <MobileHeader />
      <main className="relative z-10 py-6 px-4 sm:px-6 lg:px-8 pb-24 md:pb-8">
        <section className="hidden md:block mb-8">
          <div className="hero-banner">
            <div className="relative z-10 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="feature-chip">
                    <Sparkles className="h-3.5 w-3.5" />
                    精美演示模式
                  </span>
                  <span className="feature-chip">
                    <Smartphone className="h-3.5 w-3.5" />
                    手机端适配完成
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium tracking-[0.24em] text-sky-200 uppercase">Current Scene</p>
                  <h1 className="mt-3 text-3xl font-semibold leading-tight lg:text-4xl">{currentTab.title}</h1>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200 lg:text-base">{currentTab.description}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                    <div className="flex items-center gap-2 text-sm text-sky-100">
                      <LibraryBig className="h-4 w-4" />
                      馆藏交互
                    </div>
                    <p className="mt-2 text-lg font-semibold">多入口探索</p>
                    <p className="mt-1 text-sm text-slate-300">搜索、扫码、推荐三种入口可无缝串联。</p>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                    <div className="flex items-center gap-2 text-sm text-violet-100">
                      <Armchair className="h-4 w-4" />
                      空间体验
                    </div>
                    <p className="mt-2 text-lg font-semibold">沉浸预约</p>
                    <p className="mt-1 text-sm text-slate-300">预约流程与热力图展示适合大屏和手机双端演示。</p>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                    <div className="flex items-center gap-2 text-sm text-amber-100">
                      <Bot className="h-4 w-4" />
                      智能服务
                    </div>
                    <p className="mt-2 text-lg font-semibold">对话导览</p>
                    <p className="mt-1 text-sm text-slate-300">AI 助手与通知流提升整个平台的完整度。</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <div className="metric-tile bg-white/14 text-white backdrop-blur-xl border-white/15">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-200">
                    <ScanLine className="h-3.5 w-3.5" />
                    场景切换
                  </div>
                  <p className="mt-3 text-2xl font-semibold">{currentTab.title}</p>
                  <p className="mt-2 text-sm text-slate-200">当前页面已经统一到新的沉浸式视觉语言。</p>
                </div>
                <div className="metric-tile bg-white/14 text-white backdrop-blur-xl border-white/15">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-200">
                    <Bookmark className="h-3.5 w-3.5" />
                    体验连续性
                  </div>
                  <p className="mt-3 text-2xl font-semibold">已增强</p>
                  <p className="mt-2 text-sm text-slate-200">登录状态与当前页面会在刷新后保留，更适合演示切换。</p>
                </div>
                <div className="metric-tile bg-white/14 text-white backdrop-blur-xl border-white/15">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-200">
                    <BellRing className="h-3.5 w-3.5" />
                    演示准备度
                  </div>
                  <p className="mt-3 text-2xl font-semibold">Mobile Ready</p>
                  <p className="mt-2 text-sm text-slate-200">前台支持局域网访问，适合直接在手机浏览器演示。</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <PageTransition activeKey={location.pathname}>
          <Suspense fallback={<LoadingFallback />}>
            {renderContent()}
          </Suspense>
        </PageTransition>
      </main>
      <footer className="relative z-10 hidden md:block mt-auto border-t border-white/60 bg-white/60 py-6 text-center text-sm text-gray-500 backdrop-blur-xl">
        <p>AI 智慧图书馆 • Powered by GLM-4</p>
      </footer>
      <BottomNav />
      <InstallPrompt />
    </div>
  );
}

export default App;
