import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertCircle } from 'lucide-react';
import { getNotifications, markNotificationRead } from '../../../utils/api';
import type { Notification } from '../../../types';
import { useStore } from '../../../store/useStore';
import NotificationCard from './NotificationCard';

const NotificationSkeleton = () => (
  <div className="card-modern p-4 animate-pulse">
    <div className="flex gap-3">
      <div className="w-10 h-10 rounded-full bg-gray-200" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
  </div>
);

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const unreadCount = useStore(state => state.unreadCount);
  const setNotificationsInStore = useStore(state => state.setNotifications);
  const markAsRead = useStore(state => state.markAsRead);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNotifications();
      setNotifications(data);
      setNotificationsInStore(data);
    } catch (e) {
      console.error('Error loading notifications:', e);
      setError('加载通知失败');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (e) {
      console.error('Error marking notification read:', e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card-modern p-4 md:p-6 mb-4 bg-gradient-to-r from-amber-50/90 to-orange-50/90">
        <div className="flex items-center gap-2 mb-2">
          <Bell className="w-6 h-6 text-amber-600" />
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">通知中心</h2>
          {unreadCount > 0 && (
            <span className="badge-custom bg-gradient-to-r from-red-500 to-pink-500">
              {unreadCount} 条新通知
            </span>
          )}
        </div>
        <p className="text-sm md:text-base text-gray-600">
          AI根据你的兴趣和订阅个性化推送通知。不错过任何重要的书籍到货和图书馆活动。
        </p>
      </div>

      {error && (
        <div className="card-modern bg-red-50/80 border-red-200 p-4 text-red-700 flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <NotificationSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && notifications.length === 0 && (
        <div className="text-center py-12 card-modern bg-gray-50/80 animate-fade-in">
          <CheckCircle className="w-12 h-12 mx-auto text-gray-300" />
          <p className="text-gray-500 mt-4">暂无通知</p>
          <p className="text-sm text-gray-400 mt-1">你已经看完所有通知了！</p>
        </div>
      )}

      {!loading && notifications.length > 0 && (
        <div className="space-y-3">
          {notifications
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((notification, i) => (
              <div key={notification.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                <NotificationCard notification={notification} onMarkRead={handleMarkRead} />
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
