import React from 'react';
import { CalendarClock } from 'lucide-react';
import type { SeatReservation } from '../../../types';
import { formatTimeRange, getStatusColor, getStatusText } from './seatReservationUtils';

interface ReservationHistoryListProps {
  reservations: SeatReservation[];
  onReReserve: (reservation: SeatReservation) => void;
}

const ReservationHistoryList: React.FC<ReservationHistoryListProps> = ({ reservations, onReReserve }) => {
  if (reservations.length === 0) {
    return (
      <div className="admin-panel p-12 text-center">
        <CalendarClock className="mx-auto h-12 w-12 text-slate-300" />
        <p className="mt-4 text-slate-500">暂无预约记录</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reservations.map(reservation => (
        <div key={reservation.id} className="admin-panel p-4 sm:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-xl font-semibold text-slate-900">
                  {reservation.seat.floor.name} {reservation.seat.seatNumber}
                </h3>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(reservation.status)}`}>
                  {getStatusText(reservation.status)}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{formatTimeRange(reservation.startTime, reservation.endTime)}</p>
              {reservation.status === 'checked_in' && <p className="mt-1 text-sm text-emerald-600">正在使用中</p>}
            </div>

            {['completed', 'canceled'].includes(reservation.status) && (
              <button onClick={() => onReReserve(reservation)} className="btn-secondary rounded-2xl px-4 py-2.5 whitespace-nowrap">
                再次预约
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReservationHistoryList;
