import type { SeatReservation } from '../../../types';

export type ReservationTab = 'booking' | 'quick' | 'history' | 'rules';
export type StudyMode = 'exam' | 'study' | 'writing' | 'discussion';

export const studyModePrompts: Record<StudyMode, { label: string; hint: string; query: string }> = {
  exam: {
    label: '备考',
    hint: '优先安静、稳定、长时间专注',
    query: '安静区、低干扰、适合长时间备考、尽量有插座',
  },
  study: {
    label: '自习',
    hint: '均衡舒适、适合日常阅读学习',
    query: '舒适自习座位、环境稳定、适合阅读学习',
  },
  writing: {
    label: '写作',
    hint: '靠窗、采光好、适合独立思考',
    query: '靠窗、采光好、安静、适合写作和思考',
  },
  discussion: {
    label: '讨论',
    hint: '适合协作交流和小组学习',
    query: '协作区、小组学习、适合讨论交流、空间开阔',
  },
};

export const OPENING_HOURS = {
  start: 8,
  end: 22,
};

export const isDateOpen = (date: Date): boolean => {
  return !!date;
};

export const getStatusText = (status: string) => {
  switch (status) {
    case 'reserved':
      return '已预约';
    case 'checked_in':
      return '学习中';
    case 'temporarily_left':
      return '暂离中';
    case 'completed':
      return '已完成';
    case 'canceled':
      return '已取消';
    default:
      return status;
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'reserved':
      return 'bg-blue-100 text-blue-800';
    case 'checked_in':
      return 'bg-emerald-100 text-emerald-800';
    case 'temporarily_left':
      return 'bg-amber-100 text-amber-800';
    case 'completed':
      return 'bg-slate-100 text-slate-700';
    case 'canceled':
      return 'bg-rose-100 text-rose-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
};

export const getZoneLabel = (zone: string) => {
  switch (zone) {
    case 'quiet':
      return '安静区';
    case 'group':
      return '协作区';
    default:
      return '普通区';
  }
};

export const formatTimeRange = (start: string, end: string) => {
  const startTime = new Date(start);
  const endTime = new Date(end);
  const formatTime = (date: Date) => `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  const totalHours = ((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)).toFixed(1);
  return `${formatTime(startTime)}-${formatTime(endTime)} · ${totalHours}小时`;
};

export const getAvailableHours = () => {
  return Array.from({ length: OPENING_HOURS.end - OPENING_HOURS.start }, (_, i) => OPENING_HOURS.start + i);
};

export const getReservationPrompt = (reservation: SeatReservation | null) => {
  if (!reservation) return null;
  if (reservation.status === 'reserved') {
    return '请在15分钟内到达座位并签到，否则预约将自动释放';
  }
  if (reservation.status === 'temporarily_left') {
    return '您已暂离，请在30分钟内回来开锁，否则座位将被释放';
  }
  return null;
};
