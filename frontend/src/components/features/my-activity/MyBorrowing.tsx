import React, { useState, useEffect } from 'react';
import { Book, Calendar, AlertCircle } from 'lucide-react';
import { myActivityApi } from '../../../utils/api';
import { useStore } from '../../../store/useStore';
import ActivityCard from './ActivityCard';
import type { BookCheckout } from '../../../types';

const MyBorrowing: React.FC = () => {
  const [borrowings, setBorrowings] = useState<BookCheckout[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useStore(state => state.currentUser);

  useEffect(() => {
    if (currentUser) {
      loadBorrowings();
    }
  }, [currentUser]);

  const loadBorrowings = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const data = await myActivityApi.getBorrowings(currentUser.id);
      setBorrowings(data);
    } catch (error) {
      console.error('Failed to load borrowings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBorrowingStatus = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'error';
    if (diffDays <= 3) return 'warning';
    return 'success';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="card-modern p-4 animate-shimmer h-24" />
        ))}
      </div>
    );
  }

  if (borrowings.length === 0) {
    return (
      <div className="card-modern p-8 text-center">
        <Book className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">当前没有借阅中的书籍</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {borrowings.map((borrowing, index) => (
        <div key={borrowing.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
          <ActivityCard
            title={borrowing.book.title}
            subtitle={`${borrowing.book.author} • ${borrowing.book.location}`}
            status={getBorrowingStatus(borrowing.dueDate)}
            actions={null}
          >
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>借出日期: {formatDate(borrowing.checkoutDate)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>到期日期: {formatDate(borrowing.dueDate)}</span>
              </div>
            </div>
            {getBorrowingStatus(borrowing.dueDate) === 'error' && (
              <div className="mt-2 flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>这本书已逾期，请尽快归还</span>
              </div>
            )}
          </ActivityCard>
        </div>
      ))}
    </div>
  );
};

export default MyBorrowing;
