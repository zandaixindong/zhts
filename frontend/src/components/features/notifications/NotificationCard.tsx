import React from 'react';
import { Bell, BookOpen, Calendar, CheckCircle } from 'lucide-react';
import type { Notification } from '../../../types';

interface NotificationCardProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ notification, onMarkRead }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'book_available':
        return <Bell className="w-5 h-5 text-amber-500" />;
      case 'new_arrival':
        return <BookOpen className="w-5 h-5 text-green-500" />;
      case 'event':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const typeLabel = () => {
    switch (notification.type) {
      case 'book_available':
        return '书籍可借阅';
      case 'new_arrival':
        return '新书到货';
      case 'event':
        return '活动通知';
      default:
        return '通知';
    }
  };

  return (
    <div
      className={`card-modern p-4 ${notification.read ? 'bg-white/70' : 'bg-blue-50/80'}`}
      onClick={() => !notification.read && onMarkRead(notification.id)}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 mb-1">
                {typeLabel()}
              </span>
              <h4 className={`font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                {notification.title}
              </h4>
            </div>
            {!notification.read && (
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            )}
          </div>
          <p className={`mt-1 text-sm ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
            {notification.content}
          </p>
          <p className="mt-2 text-xs text-gray-400">
            {new Date(notification.createdAt).toLocaleString('zh-CN')}
          </p>
          {!notification.read && (
            <div className="mt-2 flex items-center text-xs text-blue-600">
              <CheckCircle className="w-3 h-3 mr-1" />
              点击标记为已读
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
