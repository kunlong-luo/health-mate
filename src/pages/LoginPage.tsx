import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [step, setStep] = useState<'email' | 'login' | 'register' | 'check_email'>('email');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNext = async () => {
    if (!email || !email.includes('@')) return toast.error('请输入有效的邮箱');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.registered) {
        setStep('login');
      } else {
        setStep('register');
      }
    } catch (e) {
      toast.error('网络错误');
    }
    setLoading(false);
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!password) return toast.error('请输入密码');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        toast.success('登录成功');
        const state = location.state as { from?: string };
        navigate(state?.from || '/family');
      } else {
        toast.error(data.error || '登录失败');
      }
    } catch (e) {
      toast.error('网络错误');
    }
    setLoading(false);
  };

  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (password.length < 8) return toast.error('密码至少8位');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep('check_email');
      } else {
        toast.error(data.error || '注册失败');
      }
    } catch (e) {
      toast.error('网络错误');
    }
    setLoading(false);
  };

  const handleMagicLink = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/magic-link/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: 'login' }),
      });
      if (res.ok) {
        setStep('check_email');
      } else {
        const data = await res.json();
        toast.error(data.error || '发送失败');
      }
    } catch (e) {
      toast.error('网络错误');
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center h-[calc(100vh-100px)]">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 w-full max-w-sm animate-in fade-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-[#111827] text-white p-3 rounded-xl mb-6 shadow-sm">
            <Mail size={24} />
          </div>
          <h1 className="text-2xl font-bold text-stone-800 mb-2">登录 HealthMate</h1>
        </div>

        {step === 'email' && (
          <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-stone-700 block mb-2">输入邮箱</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:border-[#111827] focus:ring-1 focus:ring-[#111827] outline-none transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#111827] text-white rounded-xl font-medium hover:bg-black transition flex items-center justify-center gap-2"
            >
              继续
              {loading ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
            </button>
          </form>
        )}

        {step === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 animate-in slide-in-from-right-4">
            <div>
              <label className="text-sm font-medium text-stone-700 block mb-2">密码</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:border-[#111827] focus:ring-1 focus:ring-[#111827] outline-none transition"
              />
              <div className="flex justify-between items-center mt-2">
                <button type="button" onClick={() => navigate('/auth/reset-password')} className="text-xs text-stone-500 hover:text-stone-800">忘记密码？</button>
                <button type="button" onClick={() => setStep('email')} className="text-xs text-stone-500 hover:text-stone-800">切换账号</button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#111827] text-white rounded-xl font-medium hover:bg-black transition flex items-center justify-center"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : '密码登录'}
            </button>
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-200"></div></div>
              <div className="relative flex justify-center"><span className="bg-white px-2 text-xs text-stone-500">或</span></div>
            </div>
            <button
              type="button"
              onClick={handleMagicLink}
              disabled={loading}
              className="w-full py-3 bg-white text-[#111827] border border-stone-200 rounded-xl font-medium hover:bg-stone-50 transition flex items-center justify-center gap-2"
            >
              使用 Magic Link 登录
            </button>
          </form>
        )}

        {step === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4 animate-in slide-in-from-right-4">
            <div>
              <label className="text-sm font-medium text-stone-700 block mb-2">设置密码</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="至少 8 位密码"
                className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:border-[#111827] focus:ring-1 focus:ring-[#111827] outline-none transition"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 block mb-2">怎么称呼您？(选填)</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="例如：张三"
                className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:border-[#111827] focus:ring-1 focus:ring-[#111827] outline-none transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#111827] text-white rounded-xl font-medium hover:bg-black transition flex items-center justify-center"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : '注册账号'}
            </button>
            <button type="button" onClick={() => setStep('email')} className="w-full text-xs text-stone-500 mt-2 hover:text-stone-800">
              返回上一步
            </button>
          </form>
        )}

        {step === 'check_email' && (
          <div className="text-center space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-2 text-green-600">
              <Mail size={32} />
            </div>
            <h2 className="text-xl font-semibold text-stone-800">请查收邮件</h2>
            <p className="text-stone-500 text-sm">
              我们已发送一封包含专属链接的邮件至 <br/>
              <span className="font-medium text-stone-900">{email}</span>
            </p>
            <div className="pt-6">
              <button onClick={() => setStep('email')} className="w-full py-3 bg-stone-100 text-stone-700 rounded-xl font-medium hover:bg-stone-200 transition">
                返回
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
