import React, { useState, useEffect } from 'react';
import { BookOpen, MapPin, Calendar, Users, TrendingUp } from 'lucide-react';
import { adminApi } from '../../../utils/api';
import BookManager from './BookManager';
import FloorManager from './FloorManager';
import EventManager from './EventManager';

interface Stats {
  totalBooks: number;
  availableBooks: number;
  totalSeats: number;
  availableSeats: number;
  totalEvents: number;
  totalFloors: number;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stats' | 'books' | 'floors' | 'events'>('stats');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'stats') {
      loadStats();
    }
  }, [activeTab]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getStats();
      setStats(data);
    } catch (e) {
      console.error('Failed to load stats:', e);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'stats', label: '概览', icon: TrendingUp },
    { id: 'books', label: '书籍管理', icon: BookOpen },
    { id: 'floors', label: '楼层座位', icon: MapPin },
    { id: 'events', label: '活动管理', icon: Calendar },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="card-modern p-6 bg-gradient-to-r from-gray-50/90 to-slate-50/90">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-6 h-6 text-gray-600" />
          <h2 className="text-2xl font-bold text-gray-900">管理后台</h2>
        </div>
        <p className="text-gray-600">
          管理图书馆资源 - 书籍、楼层座位和活动。
        </p>
      </div>

      <div className="card-modern p-4">
        <div className="flex gap-2 flex-wrap">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'btn-secondary'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'stats' && (
        <div className="card-modern p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500 card-modern">加载中...</div>
          ) : stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="card-modern bg-gradient-to-br from-blue-50 to-blue-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">总书籍</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalBooks}</p>
                  </div>
                  <BookOpen className="w-10 h-10 text-blue-500 opacity-50" />
                </div>
                <p className="text-sm text-blue-700 mt-2">{stats.availableBooks} 本可借阅</p>
              </div>

              <div className="card-modern bg-gradient-to-br from-green-50 to-green-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">总座位</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalSeats}</p>
                  </div>
                  <MapPin className="w-10 h-10 text-green-500 opacity-50" />
                </div>
                <p className="text-sm text-green-700 mt-2">{stats.availableSeats} 个座位空闲</p>
              </div>

              <div className="card-modern bg-gradient-to-br from-purple-50 to-purple-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">活动</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalEvents}</p>
                  </div>
                  <Calendar className="w-10 h-10 text-purple-500 opacity-50" />
                </div>
                <p className="text-sm text-purple-700 mt-2">即将到来的活动</p>
              </div>

              <div className="card-modern bg-gradient-to-br from-amber-50 to-amber-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-amber-600 font-medium">楼层</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalFloors}</p>
                  </div>
                  <MapPin className="w-10 h-10 text-amber-500 opacity-50" />
                </div>
                <p className="text-sm text-amber-700 mt-2">图书馆楼层</p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'books' && <div className="card-modern p-6"><BookManager /></div>}
      {activeTab === 'floors' && <div className="card-modern p-6"><FloorManager /></div>}
      {activeTab === 'events' && <div className="card-modern p-6"><EventManager /></div>}
    </div>
  );
};

export default AdminDashboard;
