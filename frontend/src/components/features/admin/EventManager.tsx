import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { adminApi } from '../../../utils/api';
import type { LibraryEvent } from '../../../types';

const EventManager: React.FC = () => {
  const [events, setEvents] = useState<LibraryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<LibraryEvent | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    date: new Date().toISOString().slice(0, 16),
    location: '',
    interests: '[]',
  });

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getEvents();
      setEvents(data);
    } catch (e) {
      console.error('Failed to load events:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Parse interests from text to JSON array
      let interestsJson;
      try {
        interestsJson = JSON.parse(formData.interests);
      } catch (e) {
        interestsJson = [];
      }

      const submitData = {
        ...formData,
        interests: interestsJson,
        date: new Date(formData.date),
      };

      if (editingEvent) {
        await adminApi.updateEvent(editingEvent.id, submitData);
      } else {
        await adminApi.createEvent(submitData);
      }
      setShowModal(false);
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        category: '',
        date: new Date().toISOString().slice(0, 16),
        location: '',
        interests: '[]',
      });
      loadEvents();
    } catch (e) {
      console.error('Failed to save event:', e);
      alert('保存失败');
    }
  };

  const handleEdit = (event: LibraryEvent) => {
    setEditingEvent(event);
    // Parse interests from JSON to string for editing
    let interestsStr = '[]';
    try {
      // interests could be already parsed or string JSON
      if (Array.isArray(event.interests)) {
        interestsStr = JSON.stringify(event.interests);
      } else if (typeof event.interests === 'string') {
        interestsStr = event.interests;
      }
    } catch (e) {
      interestsStr = '[]';
    }

    setFormData({
      title: event.title,
      description: event.description,
      category: event.category,
      date: new Date(event.date).toISOString().slice(0, 16),
      location: event.location,
      interests: interestsStr,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个活动吗？')) return;
    try {
      await adminApi.deleteEvent(id);
      loadEvents();
    } catch (e) {
      console.error('Failed to delete event:', e);
      alert('删除失败');
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'workshop': return 'bg-blue-100 text-blue-800';
      case 'book_club': return 'bg-green-100 text-green-800';
      case 'exhibition': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'workshop': return '讲座/工作坊';
      case 'book_club': return '读书会';
      case 'exhibition': return '展览';
      default: return category;
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-lg border p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">活动管理</h3>
        <button
          onClick={() => {
            setEditingEvent(null);
            setFormData({
              title: '',
              description: '',
              category: '',
              date: new Date().toISOString().slice(0, 16),
              location: '',
              interests: '[]',
            });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          添加活动
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">加载中...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">标题</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">分类</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">位置</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.map((event) => (
                <tr key={event.id}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{event.title}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryBadgeClass(event.category)}`}>
                      {getCategoryName(event.category)}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                    {new Date(event.date).toLocaleString('zh-CN')}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500">{event.location}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(event)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-md rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingEvent ? '编辑活动' : '添加活动'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">活动标题 *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">选择分类</option>
                    <option value="workshop">讲座/工作坊</option>
                    <option value="book_club">读书会</option>
                    <option value="exhibition">展览</option>
                    <option value="other">其他</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">日期时间</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">位置</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="3楼会议室"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">兴趣标签 (JSON 数组)</label>
                <input
                  type="text"
                  value={formData.interests}
                  onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder='["computer science", "ai"]'
                />
                <p className="text-xs text-gray-500 mt-1">
                  用于AI匹配推送，格式是 JSON 数组，例如 [&quot;computer science&quot;, &quot;artificial intelligence&quot;]
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingEvent(null);
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingEvent ? '保存修改' : '添加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManager;
