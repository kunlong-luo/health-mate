import { toast } from 'sonner';

export class ApiError extends Error {
  status: number;
  data?: any;
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

/**
 * 统一封装的 fetch 方法：
 * 1. 自动附加 hm_token 
 * 2. 自动统一处理 401 和 5xx 状态并派发事件和 Toast
 * 3. 自动加上 Content-Type: application/json (除非传递了 FormData)
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('hm_token');
  const headers = new Headers(options.headers);

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Auto set content-type for objects, unless it's FormData
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers
    });

    if (response.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    } else if (response.status >= 500) {
      toast.error('服务器遇到了点小问题，请稍后重试');
    }

    return response;
  } catch (error) {
    // Network errors like timeout, DNS failure
    toast.error('网络连接异常，请检查网络设置');
    throw error;
  }
}
