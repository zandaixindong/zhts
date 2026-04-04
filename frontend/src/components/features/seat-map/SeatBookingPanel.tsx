import React from 'react';
import { Armchair, CalendarDays, Clock3, PlugZap, Sparkles, Trees } from 'lucide-react';
import type { Seat } from '../../../types';
import { OPENING_HOURS, getAvailableHours, getZoneLabel } from './seatReservationUtils';

interface SeatBookingPanelProps {
  seat: Seat;
  duration: number;
  startHour: number;
  selectedDateLabel: string;
  loading: boolean;
  onDurationChange: (duration: number) => void;
  onStartHourChange: (hour: number) => void;
  onReserve: () => void;
  onCancel: () => void;
}

const SeatBookingPanel: React.FC<SeatBookingPanelProps> = ({
  seat,
  duration,
  startHour,
  selectedDateLabel,
  loading,
  onDurationChange,
  onStartHourChange,
  onReserve,
  onCancel,
}) => {
  return (
    <div className="admin-panel p-5 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
              <Armchair className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold text-slate-900">座位 {seat.seatNumber}</h3>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">可预约</span>
              </div>
              <p className="mt-1 text-sm text-slate-500">已切换成更接近管理端质感的空间卡片视觉。</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <PlugZap className="h-4 w-4 text-indigo-500" />
                设备支持
              </div>
              <p className="mt-2 text-sm text-slate-800">{seat.hasOutlet ? '配有电源插座' : '无固定插座'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <Trees className="h-4 w-4 text-emerald-500" />
                空间属性
              </div>
              <p className="mt-2 text-sm text-slate-800">{seat.window ? '靠窗位，光线更好' : '非靠窗位，适合稳定专注'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <Sparkles className="h-4 w-4 text-violet-500" />
                AI 场景
              </div>
              <p className="mt-2 text-sm text-slate-800">{getZoneLabel(seat.zone)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
            <Clock3 className="h-4 w-4 text-slate-500" />
            开始时间
          </div>
          <select
            value={startHour}
            onChange={e => onStartHourChange(Number(e.target.value))}
            className="input-modern h-12"
          >
            {getAvailableHours().map(hour => (
              <option key={hour} value={hour}>
                {hour.toString().padStart(2, '0')}:00
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
            <Clock3 className="h-4 w-4 text-slate-500" />
            时长
          </div>
          <select
            value={duration}
            onChange={e => onDurationChange(Number(e.target.value))}
            className="input-modern h-12"
          >
            {[1, 2, 3, 4, 6, 8].map(hour => (
              <option key={hour} value={hour}>
                {hour}小时
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
            <CalendarDays className="h-4 w-4 text-slate-500" />
            预约日期
          </div>
          <div className="flex h-12 items-center rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700">
            {selectedDateLabel}
          </div>
          <div className="mt-2 text-xs text-indigo-600">
            开放时间：{OPENING_HOURS.start}:00 - {OPENING_HOURS.end}:00
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={onReserve}
          disabled={loading}
          className="btn-primary rounded-2xl px-5 py-3"
        >
          {loading ? '预约中...' : '确认预约'}
        </button>
        <button onClick={onCancel} className="btn-secondary rounded-2xl px-5 py-3">
          取消选择
        </button>
      </div>

      <p className="mt-4 text-xs leading-6 text-slate-500">
        如未在15分钟内签到，系统会自动释放座位，以保证馆内资源公平流转。
      </p>
    </div>
  );
};

export default SeatBookingPanel;
