import React from 'react';
import { Armchair, Clock3, Sparkles } from 'lucide-react';
import type { SeatReservation } from '../../../types';
import { formatTimeRange, getReservationPrompt, getStatusText } from './seatReservationUtils';

interface CurrentReservationCardProps {
  reservation: SeatReservation;
  remainingTime: string;
  onCheckIn: () => void;
  onTemporaryLeave: () => void;
  onUnlock: () => void;
  onFinish: () => void;
  onExtend: (hours?: number) => void;
}

const CurrentReservationCard: React.FC<CurrentReservationCardProps> = ({
  reservation,
  remainingTime,
  onCheckIn,
  onTemporaryLeave,
  onUnlock,
  onFinish,
  onExtend,
}) => {
  const prompt = getReservationPrompt(reservation);

  return (
    <div className="overflow-hidden rounded-[28px] bg-gradient-to-r from-slate-950 via-indigo-950 to-violet-950 p-6 text-white shadow-[0_30px_90px_-40px_rgba(15,23,42,0.9)]">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className="feature-chip">
              <Sparkles className="h-3.5 w-3.5" />
              当前空间已锁定
            </span>
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm">
              {getStatusText(reservation.status)}
            </span>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <Armchair className="h-6 w-6 text-cyan-200" />
            </div>
            <div>
              <h2 className="text-3xl font-semibold">{reservation.seat.floor.name} {reservation.seat.seatNumber}</h2>
              <p className="mt-1 text-sm text-slate-300">{formatTimeRange(reservation.startTime, reservation.endTime)}</p>
            </div>
          </div>

          {remainingTime && (
            <div className="mt-6 rounded-[24px] border border-white/10 bg-white/10 px-6 py-5 backdrop-blur-xl">
              <div className="flex items-center gap-2 text-slate-300">
                <Clock3 className="h-4 w-4" />
                <span className="text-sm">剩余使用时长</span>
              </div>
              <p className="mt-3 text-5xl font-semibold tracking-tight">{remainingTime}</p>
            </div>
          )}
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:w-[320px] lg:grid-cols-1">
          {reservation.status === 'reserved' && (
            <button onClick={onCheckIn} className="rounded-2xl bg-white px-5 py-3 font-semibold text-indigo-700 transition-colors hover:bg-slate-100">
              签到入座
            </button>
          )}
          {reservation.status === 'checked_in' && (
            <>
              <button onClick={() => onExtend(1)} className="rounded-2xl bg-white/12 px-5 py-3 font-medium text-white transition-colors hover:bg-white/20">
                续约 +1小时
              </button>
              <button onClick={onTemporaryLeave} className="rounded-2xl bg-white/12 px-5 py-3 font-medium text-white transition-colors hover:bg-white/20">
                暂离
              </button>
              <button onClick={onFinish} className="rounded-2xl bg-white px-5 py-3 font-semibold text-indigo-700 transition-colors hover:bg-slate-100">
                退座
              </button>
            </>
          )}
          {reservation.status === 'temporarily_left' && (
            <button onClick={onUnlock} className="rounded-2xl bg-white px-5 py-3 font-semibold text-indigo-700 transition-colors hover:bg-slate-100">
              开锁恢复
            </button>
          )}
        </div>
      </div>

      {prompt && (
        <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-200/10 px-4 py-3 text-center text-sm text-amber-100">
          {prompt}
        </div>
      )}
    </div>
  );
};

export default CurrentReservationCard;
