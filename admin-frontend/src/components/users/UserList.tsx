import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { adminApi } from '../../utils/api';
import type { User } from '../../types';

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'violations' | 'date'>('date');

  useEffect(() => {
    adminApi.getUsers().then(setUsers).catch(console.error).finally(() => setLoading(false));
  }, []);

  const sorted = [...users].sort((a, b) => {
    if (sortBy === 'violations') return b.violationCount - a.violationCount;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (loading) return <div className="text-center py-8 text-gray-400">加载中...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">{users.length} 位用户</span>
        <div className="flex gap-2">
          {(['date', 'name', 'violations'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                sortBy === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'date' ? '注册时间' : s === 'name' ? '姓名' : '违约次数'}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="pb-2 font-medium">姓名</th>
              <th className="pb-2 font-medium">邮箱</th>
              <th className="pb-2 font-medium">角色</th>
              <th className="pb-2 font-medium">预约次数</th>
              <th className="pb-2 font-medium">借阅次数</th>
              <th className="pb-2 font-medium">违约</th>
              <th className="pb-2 font-medium">注册时间</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(user => (
              <tr key={user.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${user.violationCount >= 3 ? 'bg-red-50/50' : ''}`}>
                <td className="py-2.5 font-medium text-gray-900">{user.name}</td>
                <td className="py-2.5 text-gray-600">{user.email}</td>
                <td className="py-2.5">
                  <span className={`px-2 py-0.5 rounded text-xs ${user.role === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                    {user.role === 'admin' ? '管理员' : '用户'}
                  </span>
                </td>
                <td className="py-2.5 text-gray-600">{user._count?.seats || 0}</td>
                <td className="py-2.5 text-gray-600">{user._count?.books || 0}</td>
                <td className="py-2.5">
                  <span className={`flex items-center gap-1 ${user.violationCount >= 3 ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                    {user.violationCount >= 3 && <AlertTriangle className="w-3.5 h-3.5" />}
                    {user.violationCount} 次
                  </span>
                </td>
                <td className="py-2.5 text-gray-500 text-xs">{new Date(user.createdAt).toLocaleDateString('zh-CN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;
