import React, { useState } from 'react';
import { Download, FileSpreadsheet, Loader2, Sparkles } from 'lucide-react';
import { analyticsApi } from '../../utils/api';

const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};

const ReportCenterCard: React.FC = () => {
  const [loadingType, setLoadingType] = useState<'overview' | 'seat' | null>(null);

  const handleExport = async (type: 'overview' | 'seat') => {
    setLoadingType(type);
    try {
      const blob = type === 'overview'
        ? await analyticsApi.exportOverviewReport()
        : await analyticsApi.exportSeatUsageReport();

      const filename = type === 'overview'
        ? `ai-library-overview-${new Date().toISOString().slice(0, 10)}.csv`
        : `ai-library-seat-usage-${new Date().toISOString().slice(0, 10)}.csv`;

      downloadBlob(blob, filename);
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <div className="admin-panel p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">报表中心</p>
          <h3 className="mt-1 text-xl font-semibold text-slate-900">导出运营简报</h3>
        </div>
        <span className="admin-chip">
          <Sparkles className="h-3.5 w-3.5" />
          Demo Ready
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          onClick={() => handleExport('overview')}
          disabled={loadingType !== null}
          className="rounded-[22px] border border-slate-200 bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 p-5 text-left text-white transition-transform hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <FileSpreadsheet className="h-6 w-6 text-cyan-200" />
            {loadingType === 'overview' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4 text-slate-200" />}
          </div>
          <p className="mt-4 text-lg font-semibold">导出运营总览</p>
          <p className="mt-2 text-sm leading-6 text-slate-200">包含馆藏、座位、预约、用户与活动的综合概览，适合答辩和路演汇报。</p>
        </button>

        <button
          onClick={() => handleExport('seat')}
          disabled={loadingType !== null}
          className="rounded-[22px] border border-slate-200 bg-white/90 p-5 text-left transition-transform hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <FileSpreadsheet className="h-6 w-6 text-indigo-600" />
            {loadingType === 'seat' ? <Loader2 className="h-4 w-4 animate-spin text-indigo-500" /> : <Download className="h-4 w-4 text-slate-400" />}
          </div>
          <p className="mt-4 text-lg font-semibold text-slate-900">导出座位使用报表</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">按楼层输出总座位、空闲座位、占用率等指标，方便运营分析与线下汇报。</p>
        </button>
      </div>

      <div className="mt-5 rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
        <p className="text-sm font-semibold text-slate-900">AI 化报表创意</p>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          后续还可以继续扩展为 PDF 简报、图表快照、领导视角摘要、日报自动发送等功能，让后台更像真正的智慧图书馆运营平台。
        </p>
      </div>
    </div>
  );
};

export default ReportCenterCard;
