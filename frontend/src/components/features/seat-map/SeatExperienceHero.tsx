import React from 'react';
import { Bot, BrainCircuit, Compass, Sparkles, Waves } from 'lucide-react';

interface SeatExperienceHeroProps {
  currentFloorName?: string;
  selectedDateLabel: string;
}

const items = [
  {
    title: 'AI 氛围选座',
    description: '输入“静音深读”“灵感临窗”“协作讨论”等自然语言，系统会自动筛出更贴合的空间。',
    icon: Bot,
  },
  {
    title: '动态空间感知',
    description: '热力图与座位状态同步刷新，让演示效果更像实时运行的智慧馆舍系统。',
    icon: Waves,
  },
  {
    title: '学习模式推荐',
    description: '从专注、自习、讨论到短暂休息，用更贴近学习场景的方式组织预约体验。',
    icon: BrainCircuit,
  },
];

const SeatExperienceHero: React.FC<SeatExperienceHeroProps> = ({ currentFloorName, selectedDateLabel }) => {
  return (
    <section className="overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 p-6 text-white shadow-[0_30px_90px_-40px_rgba(15,23,42,0.9)]">
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <div className="relative">
          <div className="absolute -top-10 right-0 h-36 w-36 rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="feature-chip">
                <Sparkles className="h-3.5 w-3.5" />
                AI 图书馆空间引擎
              </span>
              <span className="feature-chip">
                <Compass className="h-3.5 w-3.5" />
                {currentFloorName || '选择楼层中'}
              </span>
            </div>
            <h2 className="mt-5 text-3xl font-semibold leading-tight">让座位预约像 AI 空间导航，而不是简单点格子选位置。</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200">
              我把这个模块往“智慧图书馆空间中台”的感觉去做了：更像管理端驾驶舱的审美，同时保留前台触控友好和演示流畅度。
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                <p className="text-sm text-slate-300">预约日期</p>
                <p className="mt-2 text-xl font-semibold">{selectedDateLabel}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                <p className="text-sm text-slate-300">演示气质</p>
                <p className="mt-2 text-xl font-semibold">管理端同款</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                <p className="text-sm text-slate-300">空间体验</p>
                <p className="mt-2 text-xl font-semibold">实时可视化</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          {items.map(item => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                    <Icon className="h-5 w-5 text-cyan-200" />
                  </div>
                  <p className="font-semibold">{item.title}</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-200">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SeatExperienceHero;
