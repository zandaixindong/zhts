import React from 'react';

const sections = [
  {
    title: '预约时间',
    color: 'from-sky-50 to-indigo-50 text-sky-900',
    items: ['可预约时长为 1-8 小时', '超过15分钟未签到，预约自动释放', '使用完毕请及时退座，方便他人继续使用'],
  },
  {
    title: '暂离机制',
    color: 'from-emerald-50 to-cyan-50 text-emerald-900',
    items: ['短暂离开可以选择“暂离”', '暂离超过30分钟未返回，座位将被自动释放', '返回后点击“开锁恢复”继续使用'],
  },
  {
    title: '违约规则',
    color: 'from-amber-50 to-orange-50 text-amber-900',
    items: ['预约成功后未使用将记违约一次', '提前取消预约不记违约', '累计违约3次将限制预约权限'],
  },
  {
    title: '续约说明',
    color: 'from-violet-50 to-fuchsia-50 text-violet-900',
    items: ['使用中可续约，每次延长1小时', '续约后总时长不超过8小时', '若后续时段冲突则无法续约'],
  },
];

const ReservationRules: React.FC = () => {
  return (
    <div className="admin-panel p-6">
      <h3 className="text-2xl font-semibold text-slate-900">预约规则说明</h3>
      <p className="mt-2 text-sm leading-7 text-slate-500">规则区也统一成了更接近后台面板的视觉表达，阅读更清晰，演示更完整。</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {sections.map(section => (
          <div key={section.title} className={`rounded-[24px] bg-gradient-to-br p-5 ${section.color}`}>
            <h4 className="text-lg font-semibold">{section.title}</h4>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
              {section.items.map(item => (
                <li key={item} className="rounded-2xl bg-white/70 px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReservationRules;
