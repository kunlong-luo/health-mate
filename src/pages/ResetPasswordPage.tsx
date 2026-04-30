import { apiFetch } from '../lib/api';
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Key, Loader2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const sessionToken = searchParams.get('session');
  
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRequestMode, setIsRequestMode] = useState(!sessionToken);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error('请输入邮箱');
    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/magic-link/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: 'reset' }),
      });
      if (res.ok) {
        toast.success('重置邮件已发送，请查收');
      } else {
        const data = await res.json();
        toast.error(data.error || '发送失败');
      }
    } catch (e) {
      toast.error('网络错误');
    }
    setLoading(false);
  };

  const handleResetConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast.error('密码至少 8 位');
    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/password-reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reset_session_token: sessionToken, new_password: password }),
      });
      if (res.ok) {
        toast.success('密码重置成功，请重新登录');
        navigate('/login', { replace: true });
      } else {
        const data = await res.json();
        toast.error(data.error || '重置失败');
        if (data.error?.includes('session')) {
          setIsRequestMode(true);
        }
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
            <Key size={24} />
          </div>
          <h1 className="text-2xl font-bold text-stone-800 mb-2">重置密码</h1>
        </div>

        {isRequestMode ? (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-stone-700 block mb-2">您的注册邮箱</label>
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
              {loading ? <Loader2 className="animate-spin" size={18} /> : '发送重置链接'}
            </button>
            <button type="button" onClick={() => navigate('/login')} className="w-full text-xs text-stone-500 mt-2 hover:text-stone-800">
             返回登录
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetConfirm} className="space-y-4 animate-in slide-in-from-right-4">
            <div>
              <label className="text-sm font-medium text-stone-700 block mb-2">新密码</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="至少 8 位"
                className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:border-[#111827] focus:ring-1 focus:ring-[#111827] outline-none transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#111827] text-white rounded-xl font-medium hover:bg-black transition flex items-center justify-center"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : '保存新密码'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
