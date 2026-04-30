import { apiFetch } from '../../lib/api';
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Heart } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function CareReminders() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const { data: reminders = [], refetch } = useQuery({
    queryKey: ['care-reminders'],
    queryFn: async () => {
      if (!token) return [];
      const res = await apiFetch('/api/care-reminders', { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    },
    enabled: !!token
  });

  const handleReminderAction = async (id: string, actionType: string, url_path: string) => {
    // mark as handled
    await apiFetch(`/api/care-reminders/${id}/handle`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    refetch();
    
    if (actionType === 'url' && url_path) {
      if (url_path.startsWith('http') || url_path.startsWith('tel:') || url_path.startsWith('wechat:')) {
         window.location.href = url_path;
      } else {
         navigate(url_path);
      }
    } else {
      toast.success("已标记处理");
    }
  };

  if (reminders.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-100 rounded-3xl p-5 shadow-sm">
      <div className="flex items-center gap-2 text-red-600 mb-3 font-medium">
         <Heart size={18} className="fill-current" />
         亲情关怀提醒 ({reminders.length})
      </div>
      <div className="flex flex-col gap-3">
        {reminders.map((r: any) => (
          <div key={r.id} className="bg-white/60 p-3 rounded-2xl flex items-center justify-between gap-4">
             <div className="flex-1">
                <p className="text-stone-800 font-medium text-sm">{r.title}</p>
             </div>
             <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => handleReminderAction(r.id, 'url', 'tel:')} className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg shadow-sm hover:bg-red-700 transition">
                   打电话
                </button>
                <button onClick={() => handleReminderAction(r.id, 'done', '')} className="text-xs bg-white text-stone-500 px-3 py-1.5 rounded-lg border border-stone-200 transition">
                   已处理
                </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
