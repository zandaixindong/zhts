import React, { useState, useEffect } from 'react';
import { X, Loader2, BookOpen, MessageSquareText } from 'lucide-react';
import { getBookSummary } from '../../../utils/api';
import BookBuddyModal from './BookBuddyModal';

interface BookSummaryProps {
  bookId: string;
  title: string;
  onClose: () => void;
}

const BookSummary: React.FC<BookSummaryProps> = ({ bookId, title, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<string>('');
  const [insights, setInsights] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showBuddy, setShowBuddy] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getBookSummary(bookId);
        if (isMounted) {
          setSummary(response.summary);
          setInsights(response.insights);
        }
      } catch (e) {
        console.error('Error loading summary:', e);
        if (isMounted) setError('获取AI导读失败，请重试。');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    loadSummary();
    return () => { isMounted = false; };
  }, [bookId]);

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white/95 backdrop-blur-xl rounded-[24px] max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-white/20 animate-scale-in">
          <div className="flex justify-between items-center p-5 border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-10">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-xl">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">AI 智能导读</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <div className="p-6 md:p-8">
            <h4 className="text-2xl font-extrabold text-slate-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">{title}</h4>

            {loading && (
              <div className="text-center py-12">
                <Loader2 className="w-10 h-10 animate-spin mx-auto text-purple-500" />
                <p className="text-slate-500 mt-4 font-medium animate-pulse">AI 正在阅读全书并提取精华...</p>
              </div>
            )}

            {error && !loading && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 flex items-center gap-2">
                <X className="w-5 h-5" /> {error}
              </div>
            )}

            {!loading && !error && (
              <div className="space-y-8 animate-slide-up">
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <p className="text-slate-700 leading-relaxed text-lg">{summary}</p>
                </div>

                {insights.length > 0 && (
                  <div>
                    <h5 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <span className="bg-amber-100 text-amber-600 w-6 h-6 rounded-full flex items-center justify-center text-sm">✨</span>
                      核心要点洞察
                    </h5>
                    <ul className="space-y-3">
                      {insights.map((insight, index) => (
                        <li key={index} className="flex gap-3 text-slate-700 bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                          <span className="text-purple-500 font-bold mt-0.5">•</span>
                          <span className="leading-relaxed">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="pt-4 border-t border-slate-100 flex justify-center">
                  <button
                    onClick={() => setShowBuddy(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-full shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:scale-105 transition-all duration-300 active:scale-95"
                  >
                    <MessageSquareText className="w-5 h-5" />
                    唤起 AI 伴读导师
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showBuddy && (
        <BookBuddyModal
          bookId={bookId}
          bookTitle={title.split(' - ')[0]} // simple extract title
          bookAuthor={title.includes(' - ') ? title.split(' - ')[1] : '佚名'}
          onClose={() => setShowBuddy(false)}
        />
      )}
    </>
  );
};

export default BookSummary;
