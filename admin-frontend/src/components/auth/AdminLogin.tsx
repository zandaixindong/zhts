import React, { useState } from 'react';
import { LayoutDashboard, AlertCircle } from 'lucide-react';
import { authApi } from '../../utils/api';
import { useAdminStore } from '../../store/useAdminStore';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setCurrentAdmin = useAdminStore(s => s.setCurrentAdmin);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      const user = res.user;
      const token = res.token;
      
      if (!user || user.role !== 'admin') {
        setError('该账号不是管理员账号');
        setLoading(false);
        return;
      }
      
      if (token) {
        localStorage.setItem('admin-token', token);
      }
      
      setCurrentAdmin(user);
    } catch {
      setError('邮箱或密码错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <LayoutDashboard className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">管理后台</h1>
            <p className="text-indigo-200 text-sm mt-1">AI 智慧图书馆管理系统</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-400/30 text-red-200 rounded-lg p-3 mb-4 flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-indigo-200 mb-1">邮箱</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-indigo-300 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all text-base"
                placeholder="admin@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-indigo-200 mb-1">密码</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-indigo-300 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all text-base"
                placeholder="请输入密码"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-lg shadow-indigo-500/30 disabled:opacity-50 active:scale-[0.98]"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          <p className="text-center text-indigo-300/60 text-xs mt-6">
            仅管理员账号可登录此系统
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
