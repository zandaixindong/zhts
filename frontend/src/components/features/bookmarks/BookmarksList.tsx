import React, { useState, useEffect } from 'react';
import { Bookmark, Trash2 } from 'lucide-react';
import { useStore } from '../../../store/useStore';
import BookCard from '../book-search/BookCard';
import type { Book } from '../../../types';

const BookmarksList: React.FC = () => {
  const bookmarks = useStore(state => state.bookmarks);
  const toggleBookmark = useStore(state => state.toggleBookmark);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarkedBooks();
  }, [bookmarks]);

  const loadBookmarkedBooks = async () => {
    if (bookmarks.length === 0) {
      setLoading(false);
      setBooks([]);
      return;
    }

    try {
      setLoading(true);
      // Load each book by ID - we need to get all books from backend
      // Since we only need the basic info, we can load them one by one
      const loadedBooks: Book[] = [];

      for (const bookId of bookmarks) {
        // We can get from admin API for now, or add an endpoint
        // For simplicity, let's get all books and filter
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/admin/books`);
        if (response.ok) {
          const allBooks = await response.json();
          const found = allBooks.find((b: Book) => b.id === bookId);
          if (found) {
            loadedBooks.push(found);
          }
        }
      }

      setBooks(loadedBooks);
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    } finally {
      setLoading(false);
    }
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

  if (books.length === 0) {
    return (
      <div className="card-modern p-8 text-center">
        <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 mb-1">还没有收藏任何书籍</p>
        <p className="text-sm text-gray-400">在找书结果页点击书籍卡片上的收藏按钮即可添加到这里</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="card-modern p-4 mb-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-blue-600" />
            我的收藏 ({books.length})
          </h3>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          收藏的书籍会保存在本地，方便你随时查看
        </p>
      </div>

      {books.map((book, index) => (
        <div key={book.id} className="animate-fade-in-up relative" style={{ animationDelay: `${index * 100}ms` }}>
          <div className="absolute top-4 right-4 z-10">
            <button
              className="p-2 bg-white/90 backdrop-blur rounded-full text-red-600 hover:bg-red-50 touch-target"
              onClick={() => toggleBookmark(book.id)}
              title="移除收藏"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <BookCard book={book} />
        </div>
      ))}
    </div>
  );
};

export default BookmarksList;
