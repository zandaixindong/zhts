import React, { useEffect, useMemo, useState } from 'react';
import { Maximize2, Sparkles, Zap } from 'lucide-react';
import type { Seat } from '../../../types';
import { getSeatsByFloor } from '../../../utils/api';
import { getZoneLabel } from './seatReservationUtils';
import AtmosphereTrendChart from './AtmosphereTrendChart';

interface SeatHeatmapProps {
  floorId: string;
  onSeatClick: (seat: Seat) => void;
  selectedSeat: Seat | null;
}

const SeatHeatmap: React.FC<SeatHeatmapProps> = ({ floorId, onSeatClick, selectedSeat }) => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'plan'>('cards');

  useEffect(() => {
    loadSeats();
    const interval = setInterval(loadSeats, 10000);
    return () => clearInterval(interval);
  }, [floorId]);

  const loadSeats = async () => {
    try {
      const data = await getSeatsByFloor(floorId);
      setSeats(data);
    } catch (e) {
      console.error('Error loading seats:', e);
      setError('加载座位图失败');
    } finally {
      setLoading(false);
    }
  };

  const getSeatTone = (seat: Seat) => {
    if (selectedSeat?.id === seat.id) {
      return {
        shell: 'border-indigo-500 bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-[0_20px_45px_-18px_rgba(79,70,229,0.75)]',
        seat: 'bg-white/25',
        glow: 'bg-indigo-200/30',
        label: 'text-white',
        badge: 'bg-white/20 text-white',
      };
    }

    if (seat.status === 'available') {
      return {
        shell: 'border-emerald-200 bg-gradient-to-br from-white to-emerald-50 text-slate-800 hover:border-emerald-300 hover:shadow-[0_18px_45px_-22px_rgba(16,185,129,0.45)]',
        seat: 'bg-gradient-to-br from-emerald-400 to-cyan-400',
        glow: 'bg-emerald-200/40',
        label: 'text-slate-700',
        badge: 'bg-emerald-50 text-emerald-700',
      };
    }

    return {
      shell: 'border-rose-200 bg-gradient-to-br from-white to-rose-50 text-slate-500',
      seat: 'bg-gradient-to-br from-rose-300 to-orange-300',
      glow: 'bg-rose-200/40',
      label: 'text-slate-500',
      badge: 'bg-rose-50 text-rose-700',
    };
  };

  const getSeatTooltip = (seat: Seat) => {
    return (
      <div className="absolute bottom-full left-1/2 z-10 mb-3 -translate-x-1/2 whitespace-nowrap rounded-2xl border border-white/15 bg-slate-950/95 px-3 py-2 text-xs text-white shadow-xl backdrop-blur-xl">
        <p className="font-semibold">{seat.seatNumber}</p>
        <p className="text-slate-300">
          状态: <span className={seat.status === 'available' ? 'text-emerald-400' : 'text-rose-400'}>
            {seat.status === 'available' ? '空闲' : '占用'}
          </span>
        </p>
        {seat.hasOutlet && (
          <p className="flex items-center justify-center gap-1 text-cyan-300">
            <Zap className="h-3 w-3" /> 电源插座
          </p>
        )}
        {seat.window && (
          <p className="flex items-center justify-center gap-1 text-indigo-300">
            <Maximize2 className="h-3 w-3" /> 靠窗
          </p>
        )}
        <p>区域: {getZoneLabel(seat.zone)}</p>
      </div>
    );
  };

  const { grid, gridSizeX, availableCount, totalCount } = useMemo(() => {
    const maxX = Math.max(...seats.map(s => s.x), 0);
    const maxY = Math.max(...seats.map(s => s.y), 0);
    const sizeX = Math.max(1, Math.ceil((maxX + 10) / 10));
    const sizeY = Math.max(1, Math.ceil((maxY + 10) / 10));
    const nextGrid: (Seat | null)[][] = Array(sizeY).fill(null).map(() => Array(sizeX).fill(null));

    seats.forEach(seat => {
      const gridX = Math.floor(seat.x / 10);
      const gridY = Math.floor(seat.y / 10);
      if (gridY >= 0 && gridY < sizeY && gridX >= 0 && gridX < sizeX) {
        nextGrid[gridY][gridX] = seat;
      }
    });

    return {
      grid: nextGrid,
      gridSizeX: sizeX,
      availableCount: seats.filter(s => s.status === 'available').length,
      totalCount: seats.length,
    };
  }, [seats]);

  const zoneSummary = useMemo(() => {
    const quiet = seats.filter(seat => seat.zone === 'quiet').length;
    const group = seats.filter(seat => seat.zone === 'group').length;
    return { quiet, group };
  }, [seats]);

  const atmosphereScores = useMemo(() => {
    const safeTotal = Math.max(seats.length, 1);
    const quietRatio = seats.filter(seat => seat.zone === 'quiet').length / safeTotal;
    const windowRatio = seats.filter(seat => seat.window).length / safeTotal;
    const outletRatio = seats.filter(seat => seat.hasOutlet).length / safeTotal;
    const occupiedRatio = seats.filter(seat => seat.status !== 'available').length / safeTotal;

    return [
      { label: '安静度', score: Math.round(58 + quietRatio * 34 - occupiedRatio * 8), color: 'from-sky-500 to-indigo-500' },
      { label: '采光感', score: Math.round(46 + windowRatio * 42), color: 'from-amber-400 to-orange-500' },
      { label: '插座密度', score: Math.round(40 + outletRatio * 55), color: 'from-emerald-400 to-cyan-500' },
      { label: '拥挤度', score: Math.round(28 + occupiedRatio * 68), color: 'from-rose-400 to-pink-500' },
    ];
  }, [seats]);

  const floorPlan = useMemo(() => {
    const maxX = Math.max(...seats.map(seat => seat.x), 10);
    const maxY = Math.max(...seats.map(seat => seat.y), 10);
    const width = Math.max(560, maxX * 9 + 120);
    const height = Math.max(360, maxY * 8 + 140);
    const padding = 42;

    return {
      width,
      height,
      roomWidth: width - padding * 2,
      roomHeight: height - padding * 2,
      corridorY: height / 2 - 24,
      seats: seats.map(seat => ({
        ...seat,
        px: padding + seat.x * 9,
        py: padding + seat.y * 8,
      })),
    };
  }, [seats]);

  if (loading) {
    return (
      <div className="admin-panel animate-pulse p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-4 w-32 rounded bg-slate-200" />
          <div className="flex gap-4">
            <div className="h-4 w-12 rounded bg-slate-200" />
            <div className="h-4 w-12 rounded bg-slate-200" />
          </div>
        </div>
        <div className="grid grid-cols-6 gap-2 md:grid-cols-10">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">{error}</div>;
  }

  return (
    <div className="admin-panel animate-fade-in p-4 sm:p-5">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            AI 空间可视化
          </div>
          <div className="mt-2 text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{availableCount}</span> / <span className="font-semibold text-slate-900">{totalCount}</span> 座位可用
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          <span className="admin-chip">安静区 {zoneSummary.quiet}</span>
          <span className="admin-chip">协作区 {zoneSummary.group}</span>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500" />
            <span className="text-slate-600">空闲</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-500" />
            <span className="text-slate-600">占用</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-full border-2 border-indigo-500" />
            <span className="text-slate-600">选中</span>
          </div>
          <div className="inline-flex rounded-full border border-slate-200 bg-white p-1">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === 'cards' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}
            >
              座椅视图
            </button>
            <button
              type="button"
              onClick={() => setViewMode('plan')}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === 'plan' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}
            >
              平面图
            </button>
          </div>
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {atmosphereScores.map(item => (
          <div key={item.label} className="rounded-[22px] border border-slate-200 bg-slate-50/75 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-600">{item.label}</p>
              <span className="text-xl font-semibold text-slate-900">{item.score}</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-200">
              <div className={`h-2 rounded-full bg-gradient-to-r ${item.color}`} style={{ width: `${Math.min(100, Math.max(0, item.score))}%` }} />
            </div>
          </div>
        ))}
      </div>

      {viewMode === 'cards' ? (
        <div className="overflow-x-auto -mx-2 px-2">
          <div className="grid min-w-[460px] gap-3" style={{ gridTemplateColumns: `repeat(${gridSizeX}, minmax(0, 1fr))` }}>
            {grid.map((row, rowIndex) =>
              row.map((seat, colIndex) => {
                if (!seat) {
                  return <div key={`${rowIndex}-${colIndex}`} className="aspect-square rounded-[22px] border border-dashed border-slate-200 bg-slate-50/80" />;
                }

                const tone = getSeatTone(seat);
                const clickable = seat.status === 'available';

                return (
                  <button
                    key={seat.id}
                    type="button"
                    className={`group relative aspect-square rounded-[24px] border p-2 text-left transition-all duration-200 ${
                      tone.shell
                    } ${clickable ? 'cursor-pointer hover:-translate-y-0.5' : 'cursor-not-allowed opacity-90'}`}
                    onClick={() => {
                      if (clickable) onSeatClick(seat);
                    }}
                  >
                    <div className={`absolute inset-x-3 top-3 h-3 rounded-t-2xl ${tone.seat}`} />
                    <div className={`absolute inset-x-2 top-5 bottom-3 rounded-[20px] ${tone.glow}`} />
                    <div className="relative flex h-full flex-col justify-between rounded-[18px] bg-white/75 px-2 py-2 backdrop-blur-xl">
                      <div className="flex items-start justify-between">
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${tone.badge}`}>
                          {seat.seatNumber}
                        </span>
                        <div className="flex gap-1">
                          {seat.hasOutlet && (
                            <span className="rounded-full bg-slate-900/5 p-1 text-indigo-500">
                              <Zap className="h-3 w-3" />
                            </span>
                          )}
                          {seat.window && (
                            <span className="rounded-full bg-slate-900/5 p-1 text-cyan-500">
                              <Maximize2 className="h-3 w-3" />
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-center">
                        <div className={`h-8 w-9 rounded-t-[16px] ${tone.seat}`} />
                        <div className={`-mt-1 h-5 w-12 rounded-[14px] ${tone.seat}`} />
                        <p className={`mt-2 text-center text-[10px] font-medium ${tone.label}`}>{getZoneLabel(seat.zone)}</p>
                      </div>
                    </div>

                    <div className="pointer-events-none absolute inset-x-0 -top-2 flex justify-center opacity-0 transition-opacity group-hover:opacity-100">
                      {getSeatTooltip(seat)}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-100 to-indigo-50 p-3">
          <svg viewBox={`0 0 ${floorPlan.width} ${floorPlan.height}`} className="min-w-[560px]">
            <rect x="20" y="20" width={floorPlan.width - 40} height={floorPlan.height - 40} rx="34" fill="#0f172a" opacity="0.08" />
            <rect x="42" y="42" width={floorPlan.roomWidth} height={floorPlan.roomHeight} rx="28" fill="#ffffff" stroke="#cbd5e1" strokeWidth="3" />
            <rect x="58" y={floorPlan.corridorY} width={floorPlan.roomWidth - 32} height="48" rx="20" fill="#e2e8f0" />
            <text x="74" y={floorPlan.corridorY - 16} fill="#64748b" fontSize="14" fontWeight="600">主通道</text>
            <rect x={floorPlan.width - 100} y="56" width="26" height={floorPlan.roomHeight - 28} rx="13" fill="#bfdbfe" opacity="0.6" />
            <text x={floorPlan.width - 106} y="78" fill="#2563eb" fontSize="12" fontWeight="700">窗景带</text>
            <rect x="60" y="62" width="86" height="42" rx="18" fill="#ede9fe" />
            <text x="78" y="89" fill="#6d28d9" fontSize="13" fontWeight="700">静音岛</text>
            <rect x="60" y={floorPlan.height - 108} width="92" height="42" rx="18" fill="#dcfce7" />
            <text x="78" y={floorPlan.height - 81} fill="#15803d" fontSize="13" fontWeight="700">协作区</text>

            {floorPlan.seats.map(seat => {
              const selected = selectedSeat?.id === seat.id;
              const available = seat.status === 'available';
              const fill = selected ? '#4f46e5' : available ? '#14b8a6' : '#fb7185';
              const stroke = selected ? '#312e81' : available ? '#0f766e' : '#be123c';

              return (
                <g
                  key={seat.id}
                  onClick={() => {
                    if (available) onSeatClick(seat);
                  }}
                  className={available ? 'cursor-pointer' : 'cursor-not-allowed'}
                >
                  <rect x={seat.px - 14} y={seat.py - 14} width="28" height="18" rx="8" fill={fill} opacity={selected ? 1 : 0.92} stroke={stroke} strokeWidth="2" />
                  <rect x={seat.px - 18} y={seat.py + 2} width="36" height="16" rx="8" fill={fill} opacity="0.84" stroke={stroke} strokeWidth="2" />
                  {seat.window && <circle cx={seat.px + 18} cy={seat.py - 14} r="4" fill="#38bdf8" />}
                  {seat.hasOutlet && <circle cx={seat.px - 18} cy={seat.py - 14} r="4" fill="#a78bfa" />}
                  <text x={seat.px} y={seat.py + 38} textAnchor="middle" fill="#334155" fontSize="10" fontWeight="700">
                    {seat.seatNumber}
                  </text>
                  <title>{`${seat.seatNumber} · ${available ? '空闲' : '占用'} · ${getZoneLabel(seat.zone)}`}</title>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <Zap className="h-3 w-3" /> 徽标代表配有电源插座
        </div>
        <div className="flex items-center gap-1">
          <Maximize2 className="h-3 w-3" /> 靠窗位会显示窗景标识
        </div>
        <div className="flex items-center gap-1">
          <Sparkles className="h-3 w-3" /> 空闲座位可点击进入 AI 预约流程
        </div>
      </div>

      <AtmosphereTrendChart floorId={floorId} />
    </div>
  );
};

export default SeatHeatmap;
