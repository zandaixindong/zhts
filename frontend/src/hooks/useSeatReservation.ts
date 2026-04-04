import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  aiFindSeats,
  cancelReservation,
  checkInReservation,
  checkViolationStatus,
  extendReservation,
  finishReservation,
  getCurrentReservation,
  getReservationHistory,
  reserveSeat,
  temporaryLeaveReservation,
  unlockReservation,
} from '../utils/api';
import type { AISeatResponse, Floor, Seat, SeatReservation as SeatReservationType, User } from '../types';
import { OPENING_HOURS, ReservationTab, StudyMode, isDateOpen, studyModePrompts } from '../components/features/seat-map/seatReservationUtils';

interface UseSeatReservationOptions {
  currentUser: User | null;
  selectedFloorId?: string | null;
}

export const useSeatReservation = ({ currentUser, selectedFloorId }: UseSeatReservationOptions) => {
  const [activeTab, setActiveTab] = useState<ReservationTab>('booking');
  const [studyMode, setStudyMode] = useState<StudyMode>('study');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AISeatResponse | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [duration, setDuration] = useState(2);
  const [startHour, setStartHour] = useState<number>(() => {
    const currentHour = new Date().getHours();
    if (currentHour >= OPENING_HOURS.start && currentHour < OPENING_HOURS.end - 1) {
      return currentHour + 1;
    }
    return OPENING_HOURS.start;
  });
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ message: string; onConfirm: () => void } | null>(null);
  const [currentFloorId, setCurrentFloorId] = useState<string | null>(selectedFloorId || null);
  const [currentReservation, setCurrentReservation] = useState<SeatReservationType | null>(null);
  const [reservationHistory, setReservationHistory] = useState<SeatReservationType[]>([]);
  const [remainingTime, setRemainingTime] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const updateCountdown = useCallback(() => {
    if (!currentReservation) {
      setRemainingTime('');
      return;
    }

    const endTime = new Date(currentReservation.endTime);
    const diff = endTime.getTime() - Date.now();
    if (diff <= 0) {
      setRemainingTime('已过期');
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    setRemainingTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  }, [currentReservation]);

  const loadReservations = useCallback(async () => {
    if (!currentUser) return;

    try {
      const [currentResp, historyResp] = await Promise.all([
        getCurrentReservation(currentUser.id),
        getReservationHistory(currentUser.id),
      ]);

      if (currentResp.success && currentResp.reservation) {
        setCurrentReservation(currentResp.reservation);
      } else {
        setCurrentReservation(null);
      }

      if (historyResp.success) {
        setReservationHistory(historyResp.reservations);
      }
    } catch (e) {
      console.error('Failed to load reservations:', e);
    }
  }, [currentUser]);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  useEffect(() => {
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [updateCountdown]);

  useEffect(() => {
    if (selectedFloorId) {
      setCurrentFloorId(selectedFloorId);
    }
  }, [selectedFloorId]);

  const dateLabel = useMemo(() => (
    selectedDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
  ), [selectedDate]);

  const handleSearch = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!query.trim() && !currentFloorId && !studyMode) {
      setError('请输入你的座位需求或选择一个楼层');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const baseQuery = query.trim();
      const enhancedQuery = baseQuery
        ? `${baseQuery}；学习模式：${studyModePrompts[studyMode].query}`
        : studyModePrompts[studyMode].query;

      const response = await aiFindSeats(enhancedQuery, currentFloorId || selectedFloorId || '');
      setResults(response);
      if (response.seats.length > 0) {
        setSelectedSeat(response.seats[0]);
      }
    } catch (e) {
      console.error('Seat search error:', e);
      setError('查找座位失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async () => {
    if (!selectedSeat || !currentUser) return;

    const now = new Date();
    const today = new Date();
    const selectedDay = new Date(selectedDate);
    selectedDay.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (selectedDay < today) {
      setError('不能预约过去的日期');
      return;
    }

    if (!isDateOpen(selectedDate)) {
      setError('该日期图书馆不开放，请选择其他日期');
      return;
    }

    const startTime = new Date(selectedDate);
    startTime.setHours(startHour, 0, 0, 0);
    const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);

    if (startHour < OPENING_HOURS.start || startHour >= OPENING_HOURS.end) {
      setError(`开始时间必须在开放时间范围内(${OPENING_HOURS.start}:00 - ${OPENING_HOURS.end}:00)`);
      return;
    }

    if (endTime.getHours() > OPENING_HOURS.end || endTime.getTime() > new Date(selectedDate).setHours(OPENING_HOURS.end, 0, 0, 0)) {
      setError(`预约结束时间超出闭馆时间(${OPENING_HOURS.end}:00)，请缩短时长或选择更早开始时间`);
      return;
    }

    if (selectedDay.getTime() === today.getTime() && startTime.getTime() < now.getTime()) {
      setError('开始时间不能早于当前时间');
      return;
    }

    setLoading(true);
    try {
      const violationCheck = await checkViolationStatus(currentUser.id);
      if (violationCheck.exceeded) {
        setError(`您已达到违约次数上限(${violationCheck.maxViolations}次)，暂时无法预约`);
        setLoading(false);
        return;
      }

      const result = await reserveSeat(selectedSeat.id, duration, currentUser.id, startTime);
      if (result.success) {
        showToast(result.message);
        setSelectedSeat(null);
        setResults(null);
        await loadReservations();
      } else {
        setError(result.message);
      }
    } catch {
      setError('预约座位失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedSeat || !currentUser) return;
    try {
      const result = await cancelReservation(selectedSeat.id, currentUser.id);
      if (result.success) {
        showToast(result.message);
        setSelectedSeat(null);
        await loadReservations();
      } else {
        setError(result.message);
      }
    } catch {
      setError('取消预约失败');
    }
  };

  const handleFloorChange = (floor: Floor) => {
    setCurrentFloorId(floor.id);
    setSelectedSeat(null);
  };

  const handleCheckIn = async () => {
    if (!currentReservation || !currentUser) return;
    try {
      const result = await checkInReservation(currentReservation.id, currentUser.id);
      if (result.success) {
        showToast(result.message);
        await loadReservations();
      } else {
        showToast(result.error || '签到失败', 'error');
      }
    } catch (e) {
      console.error('Checkin failed:', e);
      showToast('签到失败', 'error');
    }
  };

  const handleTemporaryLeave = async () => {
    if (!currentReservation || !currentUser) return;
    try {
      await temporaryLeaveReservation(currentReservation.id, currentUser.id);
      await loadReservations();
      showToast('已标记为暂离');
    } catch (e) {
      console.error('Failed to temporary leave:', e);
      showToast('操作失败', 'error');
    }
  };

  const handleUnlock = async () => {
    if (!currentReservation || !currentUser) return;
    try {
      await unlockReservation(currentReservation.id, currentUser.id);
      await loadReservations();
      showToast('已恢复使用');
    } catch (e) {
      console.error('Failed to unlock:', e);
      showToast('操作失败', 'error');
    }
  };

  const handleFinish = async () => {
    if (!currentReservation || !currentUser) return;
    setConfirmAction({
      message: '确认退座？座位将被释放',
      onConfirm: async () => {
        try {
          await finishReservation(currentReservation.id, currentUser.id);
          await loadReservations();
          setCurrentReservation(null);
          showToast('退座成功');
        } catch (e) {
          console.error('Failed to finish:', e);
          showToast('操作失败', 'error');
        }
        setConfirmAction(null);
      },
    });
  };

  const handleExtend = async (hours: number = 1) => {
    if (!currentReservation || !currentUser) return;
    try {
      await extendReservation(currentReservation.id, currentUser.id, hours);
      await loadReservations();
      showToast(`成功延长 ${hours} 小时`);
    } catch (e) {
      console.error('Failed to extend:', e);
      showToast('续约失败', 'error');
    }
  };

  const handleReReserve = (reservation: SeatReservationType) => {
    setActiveTab('booking');
    setCurrentFloorId(reservation.seat.floorId);
    setSelectedSeat(null);
  };

  const clearError = (message: string | null = null) => setError(message);

  return {
    activeTab,
    setActiveTab,
    studyMode,
    setStudyMode,
    query,
    setQuery,
    loading,
    results,
    selectedSeat,
    setSelectedSeat,
    duration,
    setDuration,
    startHour,
    setStartHour,
    error,
    clearError,
    toast,
    setToast,
    confirmAction,
    setConfirmAction,
    currentFloorId,
    currentReservation,
    reservationHistory,
    remainingTime,
    selectedDate,
    setSelectedDate,
    calendarMonth,
    setCalendarMonth,
    dateLabel,
    handleSearch,
    handleReserve,
    handleCancel,
    handleFloorChange,
    handleCheckIn,
    handleTemporaryLeave,
    handleUnlock,
    handleFinish,
    handleExtend,
    handleReReserve,
  };
};
