import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Search } from 'lucide-react';
import { adminApi } from '../../utils/api';
import type { Book } from '../../types';

const emptyBook = { title: '', author: '', isbn: '', publisher: '', year: undefined as number | undefined, category: '', location: '', status: 'available', format: 'physical', description: '' };

const BookManager: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; book?: Book } | null>(null);
  const [form, setForm] = useState<typeof emptyBook>(emptyBook);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchBooks = async () => {
    setLoading(true);
    try { 
      const data = await adminApi.getBooks();
      setBooks(data); 
    } catch (e) { 
      console.error(e); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const openAdd = () => { setForm(emptyBook); setModal({ mode: 'add' }); };
  const openEdit = (book: Book) => {
    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn || '',
      publisher: book.publisher || '',
      year: book.year,
      category: book.category,
      location: book.location,
      status: book.status,
      format: book.format,
      description: book.description || '',
    });
    setModal({ mode: 'edit', book });
  };

  const handleSave = async () => {
    if (!form.title || !form.author) return;
    try {
      if (modal?.mode === 'add') {
        await adminApi.createBook(form);
      } else if (modal?.book) {
        await adminApi.updateBook(modal.book.id, form);
      }
      setModal(null);
      fetchBooks();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminApi.deleteBook(id);
      setDeleteConfirm(null);
      fetchBooks();
    } catch (e) { console.error(e); }
  };

  const filtered = books.filter(b =>
    !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="space-y-3">
      {Array.from({length:5}).map((_,i) => (
        <div key={i} className="h-12 animate-pulse bg-slate-100 rounded-lg" />
      ))}
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索书名、作者、ISBN或分类..."
            className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
          />
        </div>
        <button 
          onClick={openAdd} 
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all shadow-md shadow-indigo-200"
        >
          <Plus className="w-4 h-4" /> 添加书籍
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-left text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <th className="px-6 py-4">书名</th>
                <th className="px-6 py-4">作者</th>
                <th className="px-6 py-4">分类</th>
                <th className="px-6 py-4">状态</th>
                <th className="px-6 py-4 w-24 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(book => (
                <tr key={book.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4 font-semibold text-slate-900">{book.title}</td>
                  <td className="px-6 py-4 text-slate-600">{book.author}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[11px] font-bold border border-indigo-100">
                      {book.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                      book.status === 'available' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : 'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${book.status === 'available' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      {book.status === 'available' ? '在馆' : '已借出'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEdit(book)} 
                        className="p-2 rounded-lg hover:bg-white hover:shadow-md text-slate-400 hover:text-indigo-600 transition-all"
                        title="编辑"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      
                      {deleteConfirm === book.id ? (
                        <div className="flex gap-1 animate-scale-in">
                          <button onClick={() => handleDelete(book.id)} className="px-3 py-1 bg-rose-100 text-rose-700 rounded-lg text-xs font-bold hover:bg-rose-200">确认</button>
                          <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200">取消</button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setDeleteConfirm(book.id)} 
                          className="p-2 rounded-lg hover:bg-white hover:shadow-md text-slate-400 hover:text-rose-600 transition-all"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-slate-400">没有找到匹配的书籍</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in border border-white/20">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900">{modal.mode === 'add' ? '添加新馆藏' : '编辑图书详情'}</h3>
              <button onClick={() => setModal(null)} className="p-2 rounded-full hover:bg-white transition-colors text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">书名 *</label>
                  <input 
                    value={form.title} 
                    onChange={e => setForm({...form, title: e.target.value})} 
                    className="input-modern w-full"
                    placeholder="请输入完整的书名"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">作者 *</label>
                  <input 
                    value={form.author} 
                    onChange={e => setForm({...form, author: e.target.value})} 
                    className="input-modern w-full"
                    placeholder="主编或作者"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">ISBN</label>
                  <input 
                    value={form.isbn || ''} 
                    onChange={e => setForm({...form, isbn: e.target.value})} 
                    className="input-modern w-full"
                    placeholder="13位国际标准书号"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">分类</label>
                  <input 
                    value={form.category} 
                    onChange={e => setForm({...form, category: e.target.value})} 
                    className="input-modern w-full"
                    placeholder="例如：计算机/科幻"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">出版年份</label>
                  <input 
                    type="number"
                    value={form.year || ''} 
                    onChange={e => setForm({...form, year: parseInt(e.target.value) || undefined})} 
                    className="input-modern w-full"
                    placeholder="YYYY"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">物理位置</label>
                  <input 
                    value={form.location} 
                    onChange={e => setForm({...form, location: e.target.value})} 
                    className="input-modern w-full"
                    placeholder="例：3楼 A区 04架"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">图书简介</label>
                <textarea 
                  value={form.description || ''} 
                  onChange={e => setForm({...form, description: e.target.value})} 
                  rows={4} 
                  className="input-modern w-full resize-none py-3" 
                  placeholder="请输入图书的核心内容简介，将用于 AI 伴读功能的回答..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50/50">
              <button onClick={() => setModal(null)} className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors">取消</button>
              <button 
                onClick={handleSave} 
                disabled={!form.title || !form.author}
                className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
              >
                保存馆藏
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookManager;