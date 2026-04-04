import React from 'react';
import { BrainCircuit, CalendarDays, Loader2, MapPin, Search, Sparkles, Waves } from 'lucide-react';
import FloorSelector from './FloorSelector';
import SeatHeatmap from './SeatHeatmap';
import { useStore } from '../../../store/useStore';
import { useSeatReservation } from '../../../hooks/useSeatReservation';
import CurrentReservationCard from './CurrentReservationCard';
import ReservationTabs from './ReservationTabs';
import ReservationCalendar from './ReservationCalendar';
import SeatExperienceHero from './SeatExperienceHero';
import SeatBookingPanel from './SeatBookingPanel';
import ReservationHistoryList from './ReservationHistoryList';
import ReservationRules from './ReservationRules';
import GroupMatcher from './GroupMatcher';
import { OPENING_HOURS, studyModePrompts } from './seatReservationUtils';

const SeatReservation: React.FC = () => {
  const selectedFloor = useStore(state => state.selectedFloor);
  const currentUser = useStore(state => state.currentUser);
  const {
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
  } = useSeatReservation({
    currentUser,
    selectedFloorId: selectedFloor?.id,
  });

  const currentFloorName = selectedFloor?.name;

  const sceneCards = [
    {
      title: '灵感临窗',
      description: '适合写作、阅读与沉浸思考的光线型座位。',
      icon: Waves,
    },
    {
      title: '深度专注',
      description: '适合安静区学习、考试冲刺与长时间阅读。',
      icon: BrainCircuit,
    },
    {
      title: 'AI 定向筛选',
      description: '把插座、安静度、靠窗属性合并成自然语言筛选。',
      icon: Sparkles,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {currentReservation && (
        <CurrentReservationCard
          reservation={currentReservation}
          remainingTime={remainingTime}
          onCheckIn={handleCheckIn}
          onTemporaryLeave={handleTemporaryLeave}
          onUnlock={handleUnlock}
          onFinish={handleFinish}
          onExtend={handleExtend}
        />
      )}

      <SeatExperienceHero currentFloorName={currentFloorName} selectedDateLabel={dateLabel} />

      <ReservationTabs activeTab={activeTab} onChange={setActiveTab} />

      {error && (
        <div className="glass-panel rounded-2xl border-red-200 bg-red-50/80 p-4 text-red-700">
          {error}
        </div>
      )}

      {activeTab === 'booking' && (
        <div className="space-y-6 animate-fade-in">
          <GroupMatcher />
          <div className="glass-panel rounded-[28px] p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2">
                  <MapPin className="h-6 w-6 text-indigo-600" />
                  <h2 className="text-2xl font-semibold text-slate-900">AI 智能座位预约</h2>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  你可以直接说“安静区靠近插座”“靠窗写作位 3 小时”“协作讨论区”，让系统像 AI 空间助手一样帮你定位。
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 xl:w-[420px] xl:grid-cols-1">
                {sceneCards.map(item => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                      <Icon className="h-5 w-5 text-indigo-500" />
                      <p className="mt-3 text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-2 text-xs leading-6 text-slate-500">{item.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSearch} className="mt-6 space-y-5">
              <div className="grid gap-3 md:grid-cols-4">
                {Object.entries(studyModePrompts).map(([key, mode]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setStudyMode(key as keyof typeof studyModePrompts)}
                    className={`rounded-[22px] border px-4 py-4 text-left transition-all ${
                      studyMode === key
                        ? 'border-indigo-500 bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 text-white shadow-[0_22px_50px_-24px_rgba(79,70,229,0.75)]'
                        : 'border-slate-200 bg-slate-50/80 text-slate-700 hover:bg-white'
                    }`}
                  >
                    <p className="text-sm font-semibold">{mode.label}</p>
                    <p className={`mt-2 text-xs leading-6 ${studyMode === key ? 'text-slate-200' : 'text-slate-500'}`}>{mode.hint}</p>
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="描述你想要的空间，例如：安静区靠窗、有插座、适合长时间阅读"
                    className="input-modern h-12 pl-10 pr-4"
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary rounded-2xl px-6 py-3 whitespace-nowrap">
                  {loading ? <Loader2 className="inline h-5 w-5 animate-spin" /> : '查找座位'}
                </button>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
                <div>
                  <label className="mb-3 block text-sm font-medium text-slate-700">选择楼层</label>
                  <FloorSelector onFloorSelected={handleFloorChange} />
                </div>
                <div>
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <CalendarDays className="h-4 w-4 text-slate-500" />
                    选择预约日期
                  </div>
                  <ReservationCalendar
                    selectedDate={selectedDate}
                    calendarMonth={calendarMonth}
                    onMonthChange={setCalendarMonth}
                    onDateChange={setSelectedDate}
                    onError={clearError}
                  />
                  <div className="mt-3 rounded-2xl bg-indigo-50 px-4 py-3">
                    <p className="text-sm text-indigo-800">
                      <span className="font-medium">开放时间：</span>
                      每日 {OPENING_HOURS.start}:00 - {OPENING_HOURS.end}:00
                    </p>
                    <p className="mt-1 text-xs text-indigo-600">可以结合 AI 筛选词和日期共同决定你的最佳学习场景。</p>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {results?.message && (
            <div className="glass-panel rounded-2xl p-4">
              <p className="text-slate-700">{results.message}</p>
              {results.explanation && (
                <p className="mt-1 text-sm text-slate-500">{results.explanation}</p>
              )}
            </div>
          )}

          {currentFloorId && (
            <div className="space-y-4">
              <SeatHeatmap
                floorId={currentFloorId}
                onSeatClick={setSelectedSeat}
                selectedSeat={selectedSeat}
              />
            </div>
          )}

          {selectedSeat && (
            <SeatBookingPanel
              seat={selectedSeat}
              duration={duration}
              startHour={startHour}
              selectedDateLabel={dateLabel}
              loading={loading}
              onDurationChange={setDuration}
              onStartHourChange={setStartHour}
              onReserve={handleReserve}
              onCancel={handleCancel}
            />
          )}

          {!currentFloorId && !results && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="glass-panel rounded-[24px] p-5 text-center">
                <h3 className="font-medium text-slate-900 mb-2">AI 智能匹配</h3>
                <p className="text-sm text-slate-500">AI 理解自然语言偏好并推送更贴合的座位选择</p>
              </div>
              <div className="glass-panel rounded-[24px] p-5 text-center">
                <h3 className="font-medium text-slate-900 mb-2">空间可视化</h3>
                <p className="text-sm text-slate-500">用更精美的座位图形替代朴素格子，让画面更像真实空间</p>
              </div>
              <div className="glass-panel rounded-[24px] p-5 text-center">
                <h3 className="font-medium text-slate-900 mb-2">公平流转</h3>
                <p className="text-sm text-slate-500">未签到自动释放与暂离恢复机制保证空间资源流动性</p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'quick' && (
        <div className="space-y-6 animate-fade-in">
          <div className="glass-panel rounded-[28px] p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-slate-900">快速选座</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">如果你已经知道要在哪层选座，可以直接切楼层看图，不必先走 AI 搜索。</p>
              </div>
              <div className="rounded-2xl bg-slate-50/90 p-4 text-sm text-slate-600">
                已选日期：<span className="font-medium text-slate-900">{dateLabel}</span>
              </div>
            </div>
            <div className="mt-6">
              <FloorSelector onFloorSelected={handleFloorChange} />
            </div>
          </div>

          {currentFloorId ? (
            <>
              <SeatHeatmap floorId={currentFloorId} onSeatClick={setSelectedSeat} selectedSeat={selectedSeat} />
              {selectedSeat && (
                <SeatBookingPanel
                  seat={selectedSeat}
                  duration={duration}
                  startHour={startHour}
                  selectedDateLabel={dateLabel}
                  loading={loading}
                  onDurationChange={setDuration}
                  onStartHourChange={setStartHour}
                  onReserve={handleReserve}
                  onCancel={handleCancel}
                />
              )}
            </>
          ) : (
            <div className="glass-panel rounded-[24px] p-8 text-center">
              <MapPin className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-4 text-slate-500">请先选择楼层，再进入更美观的座位图界面</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="animate-fade-in">
          <ReservationHistoryList reservations={reservationHistory} onReReserve={handleReReserve} />
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="animate-fade-in">
          <ReservationRules />
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg text-white font-medium animate-fade-in-up ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.message}
        </div>
      )}

      {confirmAction && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-scale-in">
            <p className="text-gray-900 font-medium mb-6">{confirmAction.message}</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmAction(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                取消
              </button>
              <button onClick={confirmAction.onConfirm} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors active:scale-95">
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatReservation;
