import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BookOpen, Calendar, MapPin, ShieldCheck, Smartphone, TrendingUp, Users, Wifi } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { analyticsApi } from '../../utils/api';
import type { OverviewStats } from '../../types';
import { useAdminStore } from '../../store/useAdminStore';
import { getAdminPathBySection } from '../../navigation';
import StatsCard from './StatsCard';
import BorrowTrendChart from './BorrowTrendChart';
import SeatUsageChart from './SeatUsageChart';
import PopularBooksChart from './PopularBooksChart';
import EventParticipationChart from './EventParticipationChart';
import TimePeriodAnalysis from './TimePeriodAnalysis';
import CategoryDistribution from './CategoryDistribution';
import AnomalyAlerts from './AnomalyAlerts';
import OpsTodoCenter from './OpsTodoCenter';
import ReportCenterCard from './ReportCenterCard';
import LibraryStrategyCard from './LibraryStrategyCard';
import DailyBriefGenerator from './DailyBriefGenerator';
import AtmosphereTrendChart from './AtmosphereTrendChart';
import AIProcurementCard from './AIProcurementCard';

const DashboardHome: React.FC = () => {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const setActiveSection = useAdminStore(s => s.setActiveSection);
  const navigate = useNavigate();

  const jumpToSection = (section: string) => {
    setActiveSection(section);
    navigate(getAdminPathBySection(section));
  };

  useEffect(() => {
    analyticsApi.getOverview().then(setStats).finally(() => setLoading(false));
  }, []);

  const resolvedStats = stats ?? {
    totalBooks: 0,
    availableBooks: 0,
    totalSeats: 0,
    availableSeats: 0,
    totalEvents: 0,
    totalFloors: 0,
    totalUsers: 0,
    totalReservations: 0,
    onlineUsers: 0,
    todayReservations: 0,
    overdueCheckouts: 0,
  };

  const seatLoad = useMemo(() => (
    resolvedStats.totalSeats ? Math.round(((resolvedStats.totalSeats - resolvedStats.availableSeats) / resolvedStats.totalSeats) * 100) : 0
  ), [resolvedStats.availableSeats, resolvedStats.totalSeats]);

  const bookAvailability = useMemo(() => (
    resolvedStats.totalBooks ? Math.round((resolvedStats.availableBooks / resolvedStats.totalBooks) * 100) : 0
  ), [resolvedStats.availableBooks, resolvedStats.totalBooks]);

  const reservationPressure = useMemo(() => (
    resolvedStats.totalUsers ? Math.min(100, Math.round((resolvedStats.todayReservations / resolvedStats.totalUsers) * 100)) : 0
  ), [resolvedStats.todayReservations, resolvedStats.totalUsers]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-shimmer rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 animate-shimmer rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return <div>加载失败</div>;

  const focusItems = [
    {
      title: '馆藏可借阅率',
      value: `${bookAvailability}%`,
      description: bookAvailability >= 70 ? '当前可借阅资源充足，适合重点展示推荐与搜索能力。' : '建议优先检查热门图书库存和借阅峰值。 ',
      action: 'books',
    },
    {
      title: '座位负载',
      value: `${seatLoad}%`,
      description: seatLoad >= 80 ? '座位紧张，建议重点演示热力图与预约引导。' : '当前仍有余量，可以突出预约流程与偏好筛选。 ',
      action: 'seats',
    },
    {
      title: '活动热度',
      value: `${stats.totalEvents} 场`,
      description: stats.totalEvents >= 3 ? '活动内容充足，适合结合通知流和推荐模块进行展示。' : '可补充更多主题活动，提高平台运营想象空间。 ',
      action: 'events',
    },
  ];

  const quickActions = [
    { title: '管理馆藏', subtitle: '维护上架与图书信息', action: 'books' },
    { title: '维护座位', subtitle: '查看楼层状态与空闲余量', action: 'seats' },
    { title: '策划活动', subtitle: '补强通知与活动联动', action: 'events' },
    { title: '观察用户', subtitle: '洞察注册与行为数据', action: 'users' },
  ];

  return (
    <div className="space-y-6">
      <section className="admin-panel overflow-hidden p-5 sm:p-6 lg:p-7">
        <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
          <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 p-6 text-white shadow-[0_30px_80px_-36px_rgba(30,41,59,0.8)]">
            <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16),transparent_55%)]" />
            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/85">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  运营总控
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/85">
                  <Smartphone className="h-3.5 w-3.5" />
                  移动演示已适配
                </span>
              </div>
              <h2 className="mt-5 text-3xl font-semibold leading-tight">让管理员看板从“数据堆叠”升级为可直接演示的运营驾驶舱。</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200">
                新版首页强化了信息分层、视觉氛围与快速行动入口，让你在答辩、路演或现场演示时能更快讲清楚平台价值。
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                  <p className="text-sm text-slate-300">馆藏状态</p>
                  <p className="mt-2 text-2xl font-semibold">{bookAvailability}%</p>
                  <p className="mt-1 text-sm text-slate-300">当前可借阅占比</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                  <p className="text-sm text-slate-300">座位负载</p>
                  <p className="mt-2 text-2xl font-semibold">{seatLoad}%</p>
                  <p className="mt-1 text-sm text-slate-300">实时占用压力</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                  <p className="text-sm text-slate-300">预约活跃</p>
                  <p className="mt-2 text-2xl font-semibold">{stats.todayReservations}</p>
                  <p className="mt-1 text-sm text-slate-300">今日预约数量</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="admin-stat-card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">系统健康度</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">稳定可演示</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                  <Wifi className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <div>
                  <div className="mb-1 flex items-center justify-between text-sm text-slate-500">
                    <span>馆藏可用性</span>
                    <span>{bookAvailability}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500" style={{ width: `${bookAvailability}%` }} />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-sm text-slate-500">
                    <span>座位负载</span>
                    <span>{seatLoad}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500" style={{ width: `${seatLoad}%` }} />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-sm text-slate-500">
                    <span>预约活跃度</span>
                    <span>{reservationPressure}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" style={{ width: `${reservationPressure}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-stat-card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">快速行动</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">一键进入核心运营模块</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {quickActions.map(item => (
                  <button
                    key={item.title}
                    onClick={() => jumpToSection(item.action)}
                    className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-left transition-all hover:border-indigo-200 hover:bg-white"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.subtitle}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatsCard title="总书籍" value={resolvedStats.totalBooks} subtitle={`${resolvedStats.availableBooks} 本可借阅`} icon={BookOpen} color="blue" />
        <StatsCard title="总座位" value={resolvedStats.totalSeats} subtitle={`${resolvedStats.availableSeats} 个空闲`} icon={MapPin} color="green" />
        <StatsCard title="在线用户" value={resolvedStats.onlineUsers} subtitle="当前活跃" icon={Wifi} color="indigo" />
        <StatsCard title="今日预约" value={resolvedStats.todayReservations} subtitle="座位预约数" icon={TrendingUp} color="purple" />
        <StatsCard title="总用户" value={resolvedStats.totalUsers} subtitle="注册用户数" icon={Users} color="amber" />
        <StatsCard title="活动" value={resolvedStats.totalEvents} subtitle="即将到来" icon={Calendar} color="red" />
      </div>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="admin-panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">今日重点</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-900">运营关注事项</h3>
            </div>
            <TrendingUp className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            {focusItems.map(item => (
              <button
                key={item.title}
                onClick={() => jumpToSection(item.action)}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-left transition-all hover:border-indigo-200 hover:bg-white"
              >
                <p className="text-sm font-medium text-slate-500">{item.title}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="admin-panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">演示建议</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-900">推荐讲解顺序</h3>
            </div>
          </div>
          <div className="space-y-3">
            {[
              '先用运营总览说明平台价值，再进入馆藏与座位模块展示可管理性。',
              '配合手机访问能力，可直接切换到前台演示扫码、预约与通知体验。',
              '活动与用户模块适合用于说明平台具备持续运营而非一次性查询工具。'
            ].map((item, index) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-semibold text-indigo-600">
                  {index + 1}
                </div>
                <p className="text-sm leading-6 text-slate-600">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BorrowTrendChart />
        <SeatUsageChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <OpsTodoCenter onNavigate={jumpToSection} />
        <ReportCenterCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LibraryStrategyCard />
        <AIProcurementCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DailyBriefGenerator />
        <PopularBooksChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TimePeriodAnalysis />
        <CategoryDistribution />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="admin-panel p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">运营摘要</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-900">适合汇报的结论卡片</h3>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-indigo-50 p-4">
              <p className="text-sm font-medium text-slate-500">用户活跃</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.onlineUsers}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">在线用户数量可以配合前台手机演示，体现系统实时性。</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-cyan-50 p-4">
              <p className="text-sm font-medium text-slate-500">座位空间</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.availableSeats}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">空闲座位可直接衔接前台预约场景，形成管理端到用户端闭环。</p>
            </div>
          </div>
        </div>
        <AnomalyAlerts />
      </div>
    </div>
  );
};

export default DashboardHome;
