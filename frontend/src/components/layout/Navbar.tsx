import React from 'react';
import { BookOpen, MapPin, MessageSquare, Sparkles, Bell, LogOut, Scan, Bookmark, Book } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { getPathByTab } from '../../navigation';

const tabs = [
  { id: 'scan', label: '扫码找书', icon: Scan },
  { id: 'search', label: '找书', icon: BookOpen },
  { id: 'for-you', label: '为你推荐', icon: Sparkles },
  { id: 'seats', label: '座位预约', icon: MapPin },
  { id: 'my-activity', label: '我的', icon: Book },
  { id: 'bookmarks', label: '收藏', icon: Bookmark },
  { id: 'chat', label: 'AI助手', icon: MessageSquare },
  { id: 'notifications', label: '通知', icon: Bell },
];

const Navbar: React.FC = () => {
  const activeTab = useStore(state => state.activeTab);
  const setActiveTab = useStore(state => state.setActiveTab);
  const unreadCount = useStore(state => state.unreadCount);
  const setCurrentUser = useStore(state => state.setCurrentUser);
  const navigate = useNavigate();

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('search');
    navigate('/login');
  };

  return (
    <nav className="hidden md:block bg-white/80 backdrop-blur-md shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">AI 智慧图书馆</span>
            </div>
          </div>

          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const hasBadge = tab.id === 'notifications' && unreadCount > 0;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    navigate(getPathByTab(tab.id));
                  }}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                  {hasBadge && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              退出
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
