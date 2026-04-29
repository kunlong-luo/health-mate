import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { Bell, FileText, Activity, AlertTriangle, CheckCircle, ChevronRight } from "lucide-react";
import dayjs from "dayjs";
import clsx from "clsx";

export default function NotificationsPage() {
  const { token } = useAuth();
  
  const { data: notifications = [], refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      if (!token) return [];
      const res = await fetch('/api/notifications', { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    },
    enabled: !!token
  });

  const handleRead = async (id: string, is_read: number) => {
    if (is_read) return;
    await fetch(`/api/notifications/${id}/read`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    refetch();
  };

  const IconType = (type: string) => {
    if (type === 'weekly_report') return <FileText size={18} className="text-blue-500" />;
    if (type === 'alert') return <AlertTriangle size={18} className="text-red-500" />;
    return <Bell size={18} className="text-[#5A5A40]" />;
  };

  return (
    <div className="py-6 animate-in fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl font-medium text-stone-800 flex items-center gap-2">
          <Bell className="text-[#5A5A40]" /> 消息中心
        </h2>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-100 shadow-sm">
           <Bell size={48} className="mx-auto text-stone-200 mb-4" />
           <p className="text-stone-500 font-medium">暂时没有新消息</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((n: any) => (
             <div 
               key={n.id} 
               onClick={() => handleRead(n.id, n.is_read)}
               className={clsx(
                 "bg-white p-5 rounded-3xl border transition cursor-pointer flex gap-4 items-start",
                 n.is_read ? "border-stone-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] opacity-70" : "border-[#5A5A40]/30 shadow-sm ring-1 ring-[#5A5A40]/10"
               )}
             >
               <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center shrink-0", n.is_read ? "bg-stone-50" : "bg-stone-100" )}>
                 {IconType(n.type)}
               </div>
               <div className="flex-1">
                 <div className="flex justify-between items-start mb-1">
                   <h3 className="font-medium text-stone-800">{n.title}</h3>
                   <span className="text-[10px] text-stone-400">{dayjs(n.created_at).format('MM-DD HH:mm')}</span>
                 </div>
                 <p className="text-sm text-stone-600 mb-3 leading-relaxed whitespace-pre-wrap">{n.content}</p>
                 {n.type === 'weekly_report' && (
                   <div className="flex gap-2">
                     <a href="tel:" className="text-xs bg-stone-100 text-stone-600 px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-200 transition">打电话看看</a>
                   </div>
                 )}
               </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
}
