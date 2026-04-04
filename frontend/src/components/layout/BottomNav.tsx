import React from 'react';
import { BookOpen, MapPin, MessageSquare, Sparkles, Bell, Scan, Bookmark, Book } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { getPathByTab } from '../../navigation';

const tabs = [
  { id: 'scan', label: '扫码', icon: Scan },
  { id: 'search', label: '找书', icon: BookOpen },
  { id: 'for-you', label: '推荐', icon: Sparkles },
  { id: 'seats', label: '座位', icon: MapPin },
  { id: 'my-activity', label: '我的', icon: Book },
  { id: 'bookmarks', label: '收藏', icon: Bookmark },
  { id: 'chat', label: 'AI助手', icon: MessageSquare },
  { id: 'notifications', label: '通知', icon: Bell },
];

const BottomNav: React.FC = () => {
  const activeTab = useStore(state => state.activeTab);
  const setActiveTab = useStore(state => state.setActiveTab);
  const unreadCount = useStore(state => state.unreadCount);
  const navigate = useNavigate();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 pb-safe">
      <div className="flex justify-around items-center h-16">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const hasBadge = tab.id === 'notifications' && unreadCount > 0;

          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                navigate(getPathByTab(tab.id));
              }}
              className={`relative flex flex-col items-center justify-center w-full h-full touch-target transition-all duration-200 ${
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-400 active:text-gray-600'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full" />
              )}
              <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] mt-0.5 font-medium">{tab.label}</span>
              {hasBadge && (
                <span className="absolute top-1 right-1/4 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
