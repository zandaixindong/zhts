import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Download, FileText, Loader2, Sparkles } from 'lucide-react';
import { analyticsApi } from '../../utils/api';
import type { DailyBrief, TemplateType } from '../../types';

const templateOptions = [
  {
    value: 'operations',
    label: '运营视角',
    description: '侧重待办事项、使用率、异常提醒，适合日常运营',
  },
  {
    value: 'curator',
    label: '馆长视角',
    description: '侧重馆藏、流通分析和采购建议，适合馆藏管理',
  },
  {
    value: 'defense',
    label: '答辩视角',
    description: '简洁核心指标，突出项目功能与创新点，适合演示答辩',
  },
] as const;

// PDF generation for different templates
const exportPdf = (brief: DailyBrief) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 48;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - margin * 2;
  let y = 56;

  const addWrapped = (text: string, size: number, gap = 20, isBold = false) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, margin, y);
    y += lines.length * (size + 4) + gap;
  };

  addWrapped(brief.title, 22, 8, true);
  addWrapped(`生成时间：${new Date(brief.generatedAt).toLocaleString('zh-CN')}`, 10, 20);

  switch (brief.templateType) {
    case 'curator':
      addWrapped('馆藏概况', 14, 8, true);
      addWrapped(`总藏书：${brief.collectionStatus.totalBooks} 本，可借阅：${brief.collectionStatus.availableBooks} 本，可借率：${brief.collectionStatus.availableRate}%`, 11, 10);
      addWrapped('热门馆藏类别：', 11, 10);
      brief.collectionStatus.topCategories.forEach(cat => {
        addWrapped(`• ${cat.category}: ${cat.count} 本`, 11, 8);
      });
      addWrapped('空间状态', 14, 16, true);
      addWrapped(`楼层：${brief.spaceStatus.totalFloors}，总座位：${brief.spaceStatus.totalSeats}，空位率：${brief.spaceStatus.availableSeatsRate}%`, 11, 10);
      addWrapped('流通问题', 14, 16, true);
      brief.circulationIssues.forEach(item => addWrapped(`• ${item}`, 11, 8));
      addWrapped('采购建议', 14, 16, true);
      brief.acquisitionRecommendations.forEach(item => addWrapped(`• ${item}`, 11, 8));
      addWrapped('活动规划', 14, 16, true);
      addWrapped(`现有活动：${brief.eventPlanning.totalExistingEvents}，即将到来：${brief.eventPlanning.upcomingEvents}`, 11, 10);
      addWrapped(brief.eventPlanning.suggestion, 11, 10);
      break;

    case 'defense':
      addWrapped('项目概述', 14, 8, true);
      addWrapped(brief.projectOverview, 11, 18);
      addWrapped('核心指标', 14, 8, true);
      brief.keyMetrics.forEach(metric => {
        addWrapped(`• ${metric.name}：${metric.value}`, 11, 8);
      });
      addWrapped('当前状态', 14, 16, true);
      addWrapped(`基础设施：${brief.currentStatus.infrastructure.books} 本书，${brief.currentStatus.infrastructure.seats} 个座位，${brief.currentStatus.infrastructure.floors} 层，${brief.currentStatus.infrastructure.events} 场活动`, 11, 10);
      addWrapped(`今日活动：${brief.currentStatus.todayActivity.reservations} 次预约，${brief.currentStatus.todayActivity.activeUsers} 位活跃用户，${brief.currentStatus.todayActivity.overdueBooks} 本逾期`, 11, 10);
      addWrapped(`整体座位使用率：${brief.currentStatus.overallOccupancy}`, 11, 18);
      addWrapped('系统核心功能', 14, 16, true);
      brief.systemFeatures.forEach(feature => addWrapped(`• ${feature}`, 11, 8));
      addWrapped('创新亮点', 14, 16, true);
      brief.innovationPoints.forEach(point => addWrapped(`• ${point}`, 11, 8));
      addWrapped('总结', 14, 16, true);
      addWrapped(brief.conclusion, 11, 10);
      break;

    case 'operations':
    default:
      addWrapped('今日头条', 14, 8, true);
      addWrapped(brief.headline, 12, 10);
      addWrapped(brief.summary, 11, 18);
      addWrapped('核心数据', 14, 8, true);
      addWrapped(`总书籍 ${brief.overview.totalBooks}，空闲座位 ${brief.overview.availableSeats}，在线用户 ${brief.overview.onlineUsers}，逾期 ${brief.overview.overdueCheckouts}`, 11, 18);
      addWrapped('待办事项', 14, 8, true);
      brief.todos.forEach(todo => addWrapped(`• [${todo.priority}] ${todo.title}：${todo.description}`, 11, 8));
      addWrapped('空间引导策略', 14, 16, true);
      brief.strategies.forEach(s => addWrapped(`• ${s.title}：${s.recommendation}`, 11, 8));
      addWrapped('AI 洞察', 14, 16, true);
      brief.insights.forEach(i => addWrapped(`• ${i.title}：${i.description}`, 11, 8));
      break;
  }

  doc.save(`ai-library-daily-brief-${brief.templateType}-${new Date().toISOString().slice(0, 10)}.pdf`);
};

// Render preview for different templates
const BriefPreview: React.FC<{ brief: DailyBrief }> = ({ brief }) => {
  switch (brief.templateType) {
    case 'curator':
      return (
        <div className="mt-5 rounded-[24px] border border-slate-200 bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 p-5 text-white">
          <div className="flex items-center gap-2 text-cyan-200">
            <FileText className="h-4 w-4" />
            <span className="text-sm font-medium">{brief.title}</span>
          </div>
          <p className="mt-4 text-lg font-semibold">{brief.executiveSummary}</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/10 p-4">
              <h4 className="font-semibold text-white">馆藏状态</h4>
              <p className="mt-2 text-sm text-slate-200">
                总书籍 {brief.collectionStatus.totalBooks} 本<br />
                可借阅 {brief.collectionStatus.availableBooks} 本<br />
                可借率 {brief.collectionStatus.availableRate}%
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <h4 className="font-semibold text-white">空间状态</h4>
              <p className="mt-2 text-sm text-slate-200">
                {brief.spaceStatus.totalFloors} 层<br />
                总座位 {brief.spaceStatus.totalSeats} 个<br />
                空位率 {brief.spaceStatus.availableSeatsRate}%
              </p>
            </div>
          </div>

          {brief.circulationIssues.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-white">流通问题</h4>
              <div className="mt-2 space-y-2">
                {brief.circulationIssues.map((issue, idx) => (
                  <div key={idx} className="rounded-xl bg-white/10 px-4 py-3 text-sm text-slate-100">
                    {issue}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4">
            <h4 className="font-semibold text-white">采购建议</h4>
            <div className="mt-2 space-y-2">
              {brief.acquisitionRecommendations.map((rec, idx) => (
                <div key={idx} className="rounded-xl bg-white/10 px-4 py-3 text-sm text-slate-100">
                  {rec}
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'defense':
      return (
        <div className="mt-5 rounded-[24px] border border-slate-200 bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 p-5 text-white">
          <div className="flex items-center gap-2 text-cyan-200">
            <FileText className="h-4 w-4" />
            <span className="text-sm font-medium">{brief.title}</span>
          </div>
          <p className="mt-4 text-base leading-relaxed text-slate-200">{brief.projectOverview}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {brief.keyMetrics.map((metric, idx) => (
              <div key={idx} className="rounded-2xl bg-white/10 p-4 text-center">
                <p className="text-xs text-slate-300">{metric.name}</p>
                <p className="mt-1 text-2xl font-bold text-white">{metric.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/10 p-4">
              <h4 className="font-semibold text-white">核心功能</h4>
              <ul className="mt-2 list-disc pl-5 text-sm text-slate-200">
                {brief.systemFeatures.map((f, i) => (
                  <li key={i} className="py-0.5">{f}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <h4 className="font-semibold text-white">创新亮点</h4>
              <ul className="mt-2 list-disc pl-5 text-sm text-slate-200">
                {brief.innovationPoints.map((p, i) => (
                  <li key={i} className="py-0.5">{p}</li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-4 text-sm font-medium">{brief.conclusion}</p>
        </div>
      );

    case 'operations':
    default:
      return (
        <div className="mt-5 rounded-[24px] border border-slate-200 bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 p-5 text-white">
          <div className="flex items-center gap-2 text-cyan-200">
            <FileText className="h-4 w-4" />
            <span className="text-sm font-medium">{brief.title}</span>
          </div>
          <p className="mt-4 text-lg font-semibold">{brief.headline}</p>
          <p className="mt-3 text-sm leading-7 text-slate-200">{brief.summary}</p>
          {brief.todos && brief.todos.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="font-semibold text-white">待办事项</p>
              {brief.todos.map(item => (
                <div key={item.id} className="rounded-2xl bg-white/10 px-4 py-3 text-sm leading-6 text-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.title}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      item.priority === 'high' ? 'bg-red-500/30 text-red-100' :
                      item.priority === 'medium' ? 'bg-yellow-500/30 text-yellow-100' :
                      'bg-blue-500/30 text-blue-100'
                    }`}>
                      {item.priority}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-200">{item.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      );
  }
};

const DailyBriefGenerator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [brief, setBrief] = useState<DailyBrief | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('operations');

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await analyticsApi.getDailyBrief(selectedTemplate);
      setBrief(data.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-panel p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">AI 运营日报生成器</p>
          <h3 className="mt-1 text-xl font-semibold text-slate-900">选择模板一键生成 PDF</h3>
        </div>
        <span className="admin-chip">
          <Sparkles className="h-3.5 w-3.5" />
          PDF Ready
        </span>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-sm font-medium text-slate-700">选择日报模板：</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {templateOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSelectedTemplate(opt.value as TemplateType)}
              className={`rounded-xl border p-3 text-left transition-all ${
                selectedTemplate === opt.value
                  ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <p className={`text-sm font-semibold ${selectedTemplate === opt.value ? 'text-indigo-900' : 'text-slate-900'}`}>
                {opt.label}
              </p>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">{opt.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button onClick={handleGenerate} disabled={loading} className="btn-primary rounded-2xl px-4 py-2.5">
          {loading ? <Loader2 className="h-4 w-4 animate-spin inline" /> : '生成 AI 日报'}
        </button>
        <button
          onClick={() => brief && exportPdf(brief)}
          disabled={!brief}
          className="btn-secondary inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          导出 PDF
        </button>
      </div>

      {brief ? (
        <BriefPreview brief={brief} />
      ) : (
        <div className="mt-5 rounded-[22px] border border-dashed border-slate-200 bg-slate-50/80 p-5 text-sm leading-7 text-slate-500">
          选择模板后点击生成，系统会根据今日馆藏、座位、预约数据自动生成对应视角的日报，并支持直接导出 PDF。
        </div>
      )}
    </div>
  );
};

export default DailyBriefGenerator;
