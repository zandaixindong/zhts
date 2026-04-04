import React, { useState } from 'react';
import { ArrowRight, BookOpen, Bot, Sparkles, Smartphone, TabletSmartphone } from 'lucide-react';
import { authApi } from '../../../utils/api';
import { useStore } from '../../../store/useStore';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setCurrentUser = useStore(state => state.setCurrentUser);
  const setActiveTab = useStore(state => state.setActiveTab);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login(email, password);
      if (response.user) {
        setCurrentUser(response.user);
        setActiveTab('search');
      } else {
        setError(response.message || '登录失败');
      }
    } catch (e: any) {
      console.error('Login error:', e);
      setError(e.response?.data?.message || '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const currentUser = useStore(state => state.currentUser);
  if (currentUser) {
    return null;
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-160px)] max-w-6xl items-center justify-center">
      <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hero-banner hidden min-h-[560px] flex-col justify-between lg:flex">
          <div className="relative z-10 space-y-6">
            <span className="feature-chip">
              <Sparkles className="h-3.5 w-3.5" />
              演示级视觉体验
            </span>
            <div>
              <h1 className="max-w-xl text-4xl font-semibold leading-tight">把图书馆服务做成更适合展示、答辩与落地演示的数字产品。</h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-200">
                现在的首页更强调沉浸感、品牌感与移动演示体验，适合从扫码、找书、推荐、座位预约一路串到 AI 助手。
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                <Bot className="h-5 w-5 text-sky-200" />
                <p className="mt-4 text-lg font-semibold">AI 导览</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">搜索、答疑、推荐与通知形成完整的智能服务闭环。</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                <TabletSmartphone className="h-5 w-5 text-violet-200" />
                <p className="mt-4 text-lg font-semibold">双端适配</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">桌面端强调展示气质，手机端保持触控与安全区体验。</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                <Smartphone className="h-5 w-5 text-amber-200" />
                <p className="mt-4 text-lg font-semibold">移动演示</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">支持局域网访问与隧道分享，无公网 IP 也能让手机直接打开。</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <p className="text-sm text-slate-300">推荐氛围</p>
              <p className="mt-1 text-xl font-semibold">更精美</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <p className="text-sm text-slate-300">状态保持</p>
              <p className="mt-1 text-xl font-semibold">更稳定</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <p className="text-sm text-slate-300">手机演示</p>
              <p className="mt-1 text-xl font-semibold">已增强</p>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-[28px] p-6 sm:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
                <BookOpen className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">AI 智慧图书馆</h2>
              <p className="mt-2 text-sm leading-7 text-gray-600">登录后即可体验新的品牌化界面、流畅导航与移动端展示能力。</p>
            </div>
            <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">Demo Ready</span>
          </div>

          <div className="mb-6 grid gap-3 sm:grid-cols-3 lg:hidden">
            <div className="spotlight-card p-4">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              <p className="mt-3 text-sm font-semibold text-gray-900">视觉升级</p>
            </div>
            <div className="spotlight-card p-4">
              <Bot className="h-5 w-5 text-sky-600" />
              <p className="mt-3 text-sm font-semibold text-gray-900">AI 体验</p>
            </div>
            <div className="spotlight-card p-4">
              <Smartphone className="h-5 w-5 text-emerald-600" />
              <p className="mt-3 text-sm font-semibold text-gray-900">手机演示</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">邮箱</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="demo@university.edu"
                className="input-modern h-12"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">密码</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="input-modern h-12"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex h-12 w-full items-center justify-center gap-2 rounded-xl"
            >
              <span>{loading ? '登录中...' : '进入演示'}</span>
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <div className="mt-6 grid gap-3">
            <div className="spotlight-card p-4">
              <p className="text-sm font-semibold text-gray-900">演示账号</p>
              <p className="mt-2 text-sm leading-7 text-gray-600">
                用户：demo@university.edu / demo
                <br />
                管理员：admin@university.edu / admin123
              </p>
            </div>
            <div className="spotlight-card p-4">
              <p className="text-sm font-semibold text-gray-900">手机演示方式</p>
              <p className="mt-2 text-sm leading-7 text-gray-600">同一 Wi-Fi 下可直接使用本机局域网地址访问；若需外网分享，可使用项目内置的隧道脚本。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
