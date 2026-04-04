import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Calendar, QrCode } from 'lucide-react';
import { myActivityApi } from '../../../utils/api';
import { cancelReservation, extendReservation } from '../../../utils/api';
import { useStore } from '../../../store/useStore';
import ActivityCard from './ActivityCard';
import type { SeatReservationWithSeat } from '../../../types';

interface MyReservationsProps {
  onShowQR: (reservationId: string) => void;
}

const MyReservations: React.FC<MyReservationsProps> = ({ onShowQR }) => {
  const [reservations, setReservations] = useState<SeatReservationWithSeat[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const currentUser = useStore(state => state.currentUser);

  useEffect(() => {
    if (currentUser) {
      loadReservations();
    }
  }, [currentUser]);

  const loadReservations = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const data = await myActivityApi.getReservations(currentUser.id);
      setReservations(data);
    } catch (error) {
      console.error('Failed to load reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (reservationId: string, seatId: string) => {
    if (!currentUser) return;

    try {
      setProcessing(reservationId);
      await cancelReservation(seatId, currentUser.id);
      await loadReservations();
    } catch (error) {
      console.error('Failed to cancel:', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleExtend = async (reservationId: string, userId: string) => {
    try {
      setProcessing(reservationId);
      await extendReservation(reservationId, userId, 60); // extend 1 hour
      await loadReservations();
    } catch (error) {
      console.error('Failed to extend:', error);
    } finally {
      setProcessing(null);
    }
  };

  const getReservationStatus = (status: string, startTime: string) => {
    const now = new Date();
    const start = new Date(startTime);

    if (status === 'checked_in') return 'success';
    if (status === 'reserved') {
      if (now < start) return 'neutral';
      return 'warning';
    }
    return 'neutral';
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'reserved': return '已预约';
      case 'checked_in': return '已签到';
      case 'temporarily_left': return '临时离开';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="card-modern p-4 animate-shimmer h-28" />
        ))}
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="card-modern p-8 text-center">
        <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">当前没有预约中的座位</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reservations.map((reservation, index) => (
        <div key={reservation.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
          <ActivityCard
            title={`${reservation.seat.floor.name} - ${reservation.seat.seatNumber}号座位`}
            subtitle={reservation.seat.hasOutlet ? '靠近插座' : reservation.seat.window ? '靠窗' : reservation.seat.zone === 'quiet' ? '安静区' : '普通区'}
            status={getReservationStatus(reservation.status, reservation.startTime)}
            actions={
              <div className="flex flex-col gap-2">
                <button
                  className="btn-secondary px-3 py-1 text-sm touch-target"
                  onClick={() => onShowQR(reservation.id)}
                  disabled={processing === reservation.id}
                >
                  <QrCode className="w-4 h-4 inline mr-1" />
                  二维码
                </button>
                {reservation.status === 'reserved' && (
                  <button
                    className="bg-red-50 text-red-700 px-3 py-1 text-sm rounded-lg touch-target"
                    onClick={() => handleCancel(reservation.id, reservation.seatId)}
                    disabled={processing === reservation.id}
                  >
                    取消
                  </button>
                )}
                {reservation.status === 'checked_in' && (
                  <button
                    className="bg-blue-50 text-blue-700 px-3 py-1 text-sm rounded-lg touch-target"
                    onClick={() => handleExtend(reservation.id, currentUser!.id)}
                    disabled={processing === reservation.id}
                  >
                    延长1小时
                  </button>
                )}
              </div>
            }
          >
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>开始: {formatDateTime(reservation.startTime)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>结束: {formatDateTime(reservation.endTime)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium">{getStatusText(reservation.status)}</span>
              </div>
            </div>
          </ActivityCard>
        </div>
      ))}
    </div>
  );
};

export default MyReservations;
