import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { isDateOpen } from './seatReservationUtils';

interface ReservationCalendarProps {
  selectedDate: Date;
  calendarMonth: Date;
  onMonthChange: (date: Date) => void;
  onDateChange: (date: Date) => void;
  onError: (message: string | null) => void;
}

const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

const ReservationCalendar: React.FC<ReservationCalendarProps> = ({
  selectedDate,
  calendarMonth,
  onMonthChange,
  onDateChange,
  onError,
}) => {
  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-10 rounded-xl bg-slate-50/80" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
    const isPast = date < today;
    const open = isDateOpen(date);
    const isToday = date.getTime() === today.getTime();

    days.push(
      <button
        key={day}
        onClick={() => {
          if (isPast) {
            onError('不能选择过去的日期');
            return;
          }
          if (!open) {
            onError('该日期图书馆不开放');
            return;
          }
          onDateChange(date);
          onError(null);
        }}
        disabled={isPast || !open}
        className={`h-10 rounded-xl text-sm transition-all ${
          isSelected
            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 font-medium text-white shadow-lg'
            : isToday
            ? 'bg-indigo-50 font-medium text-indigo-700'
            : isPast
            ? 'cursor-not-allowed bg-slate-50 text-slate-300'
            : !open
            ? 'cursor-not-allowed bg-slate-100 text-slate-400'
            : 'bg-white text-slate-700 hover:bg-indigo-50'
        }`}
      >
        {day}
      </button>
    );
  }

  return (
    <div className="rounded-[24px] border border-white/60 bg-white/85 p-4 shadow-[0_18px_50px_-32px_rgba(37,99,235,0.45)]">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => onMonthChange(new Date(year, month - 1, 1))}
          className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="font-semibold text-slate-900">
          {year}年 {month + 1}月
        </div>
        <button
          onClick={() => onMonthChange(new Date(year, month + 1, 1))}
          className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <div className="mb-1 grid grid-cols-7 gap-1">
        {weekDays.map(day => (
          <div key={day} className="flex h-8 items-center justify-center text-sm font-medium text-slate-500">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">{days}</div>
    </div>
  );
};

export default ReservationCalendar;
