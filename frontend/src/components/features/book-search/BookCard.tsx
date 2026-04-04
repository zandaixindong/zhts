import React, { useState } from 'react';
import { Book, CheckCircle, XCircle, Download, Bell, Bookmark as BookmarkIcon, Map } from 'lucide-react';
import type { Book as BookType } from '../../../types';
import { subscribeBook } from '../../../utils/api';
import { useStore } from '../../../store/useStore';
import AvailabilityAlert from './AvailabilityAlert';
import WayfindingModal from './WayfindingModal';

interface BookCardProps {
  book: BookType;
  onSubscribe?: () => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onSubscribe }) => {
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWayfinding, setShowWayfinding] = useState(false);
  const toggleBookmark = useStore(state => state.toggleBookmark);
  const isBookmarked = useStore(state => state.isBookmarked(book.id));

  const handleSubscribe = async () => {
    setSubscribing(true);
    setError(null);
    try {
      const result = await subscribeBook(book.id);
      if (result.success) {
        setSubscribed(true);
        onSubscribe?.();
      } else {
        setError(result.message);
      }
    } catch (_) {
      setError('订阅失败，请重试。');
    } finally {
      setSubscribing(false);
    }
  };

  const handleToggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBookmark(book.id);
  };

  const getStatusBadge = () => {
    if (book.status === 'available') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          可借阅
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircle className="w-3 h-3 mr-1" />
          已借出
      </span>
    );
  };

  const getFormatBadge = () => {
    if (book.format === 'both') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 ml-2">
          <Book className="w-3 h-3 mr-1" />
          纸本+电子
        </span>
      );
    }
    if (book.format === 'electronic') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 ml-2">
          <Download className="w-3 h-3 mr-1" />
          电子书
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 ml-2">
        <Book className="w-3 h-3 mr-1" />
          纸本
      </span>
    );
  };

  return (
    <div className="card-modern p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{book.title}</h3>
          <p className="text-sm text-gray-600">{book.author}</p>
          {book.description && (
            <p className="mt-2 text-sm text-gray-500 line-clamp-2">{book.description}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-1">
            {getStatusBadge()}
            {getFormatBadge()}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            位置: {book.location}
            {book.year && ` • ${book.year}`}
          </div>
        </div>
        <button
          className={`ml-2 p-2 rounded-full touch-target transition-colors ${
            isBookmarked
              ? 'bg-blue-100 text-blue-600'
              : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
          }`}
          onClick={handleToggleBookmark}
          title={isBookmarked ? '取消收藏' : '收藏这本书'}
        >
          <BookmarkIcon className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {book.status !== 'available' && !subscribed && (
        <div className="mt-4">
          <AvailabilityAlert
            onSubscribe={handleSubscribe}
            loading={subscribing}
            error={error}
          />
        </div>
      )}

      {subscribed && (
        <div className="mt-4 bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded p-3">
          <div className="flex items-center text-blue-800">
            <Bell className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">已开启通知</span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            这本书可借阅时会通知你
          </p>
        </div>
      )}

      {book.electronicUrl && (
        <div className="mt-4">
          <a
            href={book.electronicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary inline-flex items-center px-3 py-2 text-sm leading-4 font-medium text-blue-700"
          >
            <Download className="w-4 h-4 mr-2" />
            在线阅读
          </a>
        </div>
      )}
      {book.status === 'available' && book.format !== 'electronic' && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <button
            onClick={() => setShowWayfinding(true)}
            className="flex w-full items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-700 font-semibold rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors"
          >
            <Map className="w-4 h-4" />
            <span>🗺️ AR 导航去取书</span>
          </button>
        </div>
      )}

      {showWayfinding && (
        <WayfindingModal
          location={book.location}
          bookTitle={book.title}
          onClose={() => setShowWayfinding(false)}
        />
      )}
    </div>
  );
};

export default BookCard;
