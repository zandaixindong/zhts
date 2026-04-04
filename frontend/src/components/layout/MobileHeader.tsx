import React from 'react';
import { BookOpen, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { getPathByTab } from '../../navigation';

const tabLabels: Record<string, string> = {
  search: '找书',
  'for-you': '为你推荐',
  seats: '座位预约',
  chat: 'AI 助手',
  notifications: '通知中心',
};

const MobileHeader: React.FC = () => {
  const activeTab = useStore(state => state.activeTab);
  const setCurrentUser = useStore(state => state.setCurrentUser);
  const setActiveTab = useStore(state => state.setActiveTab);
  const navigate = useNavigate();

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('search');
    navigate('/login');
  };

  return (
    <header className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 pt-safe">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <button
            onClick={() => navigate(getPathByTab(activeTab))}
            className="font-bold text-gray-900"
          >
            {tabLabels[activeTab] || '智慧图书馆'}
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 text-gray-400 hover:text-gray-600 active:text-gray-800 touch-target flex items-center justify-center"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default MobileHeader;
