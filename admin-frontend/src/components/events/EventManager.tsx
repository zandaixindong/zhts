import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Calendar, MapPin, Tag, Users } from 'lucide-react';
import { adminApi } from '../../utils/api';
import type { LibraryEvent } from '../../types';

const emptyEvent = { title: '', description: '', category: '', date: '', location: '', interests: [] as string[] };

const EventManager: React.FC = () => {
  const [events, setEvents] = useState<LibraryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; event?: LibraryEvent } | null>(null);
  const [form, setForm] = useState(emptyEvent);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try { 
      const data = await adminApi.getEvents();
      setEvents(data);
    } catch (e) { 
      console.error(e); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openAdd = () => { setForm(emptyEvent); setModal({ mode: 'add' }); };
  const openEdit = (event: LibraryEvent) => {
    setForm({ ...event, date: event.date ? event.date.split('T')[0] : '' });
    setModal({ mode: 'edit', event });
  };

  const handleSave = async () => {
    if (!form.title) return;
    try {
      const data = { ...form, date: new Date(form.date).toISOString() };
      if (modal?.mode === 'add') await adminApi.createEvent(data);
      else if (modal?.event) await adminApi.updateEvent(modal.event.id, data);
      setModal(null);
      fetchEvents();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminApi.deleteEvent(id);
      setDeleteConfirm(null);
      fetchEvents();
    } catch (e) { console.error(e); }
  };

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({length:4}).map((_,i) => (
        <div key={i} className="h-32 animate-pulse bg-slate-100 rounded-2xl" />
      ))}
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-100">
            {events.length} 个进行中活动
          </span>
        </div>
        <button 
          onClick={openAdd} 
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all shadow-md shadow-indigo-200"
        >
          <Plus className="w-4 h-4" /> 策划新活动
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {events.map(event => (
          <div key={event.id} className="group relative bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-start mb-3">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                  <Tag className="w-3 h-3" /> {event.category}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(event)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteConfirm(event.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-rose-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h4 className="font-bold text-slate-900 text-lg mb-2 leading-tight group-hover:text-indigo-600 transition-colors">{event.title}</h4>
              <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-1">{event.description}</p>
              
              <div className="space-y-2 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  {event.date ? new Date(event.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) : '日期未定'}
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  {event.location}
                </div>
              </div>
            </div>

            {deleteConfirm === event.id && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                <div className="bg-rose-100 p-3 rounded-full mb-3 text-rose-600">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h5 className="font-bold text-slate-900 mb-1">确定要取消该活动吗？</h5>
                <p className="text-xs text-slate-500 mb-4">此操作不可撤销，活动数据将被永久删除。</p>
                <div className="flex gap-2 w-full">
                  <button onClick={() => handleDelete(event.id)} className="flex-1 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 active:scale-95 transition-all shadow-md shadow-rose-200">彻底删除</button>
                  <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 active:scale-95 transition-all">我再想想</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in border border-white/20">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900">{modal.mode === 'add' ? '策划新活动' : '编辑活动详情'}</h3>
              <button onClick={() => setModal(null)} className="p-2 rounded-full hover:bg-white transition-colors text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">活动名称 *</label>
                <input 
                  value={form.title} 
                  onChange={e => setForm({...form, title: e.target.value})} 
                  className="input-modern w-full"
                  placeholder="例：AI时代的阅读革命讲座"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">分类</label>
                  <input 
                    value={form.category} 
                    onChange={e => setForm({...form, category: e.target.value})} 
                    className="input-modern w-full"
                    placeholder="例：学术讲座/读书会"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">活动日期</label>
                  <input 
                    type="date" 
                    value={form.date} 
                    onChange={e => setForm({...form, date: e.target.value})} 
                    className="input-modern w-full"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">活动地点</label>
                <input 
                  value={form.location} 
                  onChange={e => setForm({...form, location: e.target.value})} 
                  className="input-modern w-full"
                  placeholder="例：图书馆三楼多功能厅"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">活动详情描述</label>
                <textarea 
                  value={form.description} 
                  onChange={e => setForm({...form, description: e.target.value})} 
                  rows={4} 
                  className="input-modern w-full resize-none py-3" 
                  placeholder="请输入活动的详细介绍..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50/50">
              <button onClick={() => setModal(null)} className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors">取消</button>
              <button 
                onClick={handleSave} 
                disabled={!form.title}
                className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
              >
                发布活动
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManager;