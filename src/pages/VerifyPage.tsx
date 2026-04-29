import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Loader2, AlertCircle } from 'lucide-react';

export default function VerifyPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const purpose = searchParams.get('purpose');
  const email = searchParams.get('email');
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const verifyAttempted = useRef(false);

  useEffect(() => {
    if (!token || !purpose || !email) {
      setStatus('error');
      setErrorMsg('无效的链接');
      return;
    }
    
    if (verifyAttempted.current) return;
    verifyAttempted.current = true;

    const verifyToken = async () => {
      try {
        const res = await fetch('/api/auth/magic-link/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, purpose, email }),
        });
        const data = await res.json();
        
        if (res.ok) {
          setStatus('success');
          
          if (purpose === 'reset') {
            navigate(`/auth/reset-password?session=${data.reset_session_token}`, { replace: true });
          } else {
            login(data.token, data.user);
            toast.success('登录成功');
            setTimeout(() => navigate('/family'), 1500);
          }
        } else {
          setStatus('error');
          setErrorMsg(data.error || '验证失败或链接已过期');
        }
      } catch (e) {
        setStatus('error');
        setErrorMsg('网络错误，请稍后再试');
      }
    };

    verifyToken();
  }, [token, purpose, email, login, navigate]);

  return (
    <div className="flex justify-center flex-col items-center h-[calc(100vh-100px)] px-4 text-center">
      {status === 'loading' && (
        <div className="flex flex-col items-center gap-4 animate-in fade-in">
          <Loader2 className="animate-spin text-[#111827]" size={40} />
          <p className="text-stone-600 font-medium">正在验证您的链接...</p>
        </div>
      )}
      
      {status === 'error' && (
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex flex-col items-center max-w-sm w-full animate-in zoom-in-95">
          <AlertCircle className="text-red-500 mb-3" size={40} />
          <h3 className="text-lg font-medium text-red-800 mb-1">验证失败</h3>
          <p className="text-red-600 text-sm mb-6">{errorMsg}</p>
          <button 
            onClick={() => navigate('/login')}
            className="w-full py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition"
          >
            返回登录页重新获取
          </button>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center gap-4 animate-in fade-in">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
            ✔
          </div>
          <p className="text-stone-800 font-medium text-lg">验证通过！</p>
          {purpose !== 'reset' && <p className="text-stone-500 text-sm">正在为您跳转...</p>}
        </div>
      )}
    </div>
  );
}
