import { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, ChevronRight, FileHeart, CloudUpload } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import dayjs from "dayjs";

export default function HistoryPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [remoteReports, setRemoteReports] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [isMigrating, setIsMigrating] = useState(false);
  const [showMigrateModal, setShowMigrateModal] = useState(false);
  const [selectedMemberForMigration, setSelectedMemberForMigration] = useState("");

  const localReports = useLiveQuery(() => db.reports.orderBy('createdAt').reverse().toArray());

  useEffect(() => {
    if (token) {
      Promise.all([
        fetch('/api/reports/history', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/family', { headers: { Authorization: `Bearer ${token}` } })
      ])
      .then(async ([resReports, resFamily]) => {
        if (resReports.ok) setRemoteReports(await resReports.json());
        if (resFamily.ok) {
           const family = await resFamily.json();
           setMembers(family);
           if (family.length > 0) setSelectedMemberForMigration(family[0].id);
        }
      });
    }
  }, [token]);

  const handleMigrate = async () => {
    if (!selectedMemberForMigration) return toast.error('请选择归属成员');
    setIsMigrating(true);
    try {
      const res = await fetch('/api/migrate/from_indexeddb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reports: localReports, family_member_id: selectedMemberForMigration })
      });
      if (res.ok) {
        toast.success('历史记录同步成功！');
        await db.reports.clear();
        setShowMigrateModal(false);
        // refresh history
        const resReports = await fetch('/api/reports/history', { headers: { Authorization: `Bearer ${token}` } });
        if (resReports.ok) setRemoteReports(await resReports.json());
      } else {
        toast.error('同步失败');
      }
    } catch (e) {
      toast.error('网络错误');
    }
    setIsMigrating(false);
  };

  const displayReports = token ? (remoteReports || []) : (localReports || []);

  const safeParseJSON = (str: string) => {
    try {
      return JSON.parse(str) || {};
    } catch (e) {
      return {};
    }
  };

  return (
    <div className="animate-in fade-in duration-500 relative max-w-3xl mx-auto py-8">
      <h2 className="font-serif text-3xl font-medium text-stone-800 mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#f7f7f3] text-[#5a5a35] flex items-center justify-center">
           <FileHeart size={20} />
        </div>
        {token ? '全家历史解读' : '本地历史解读'}
      </h2>

      {token && localReports && localReports.length > 0 && (
        <div className="bg-[#f7f7f3] border border-[#e5e5dd] p-6 rounded-[24px] mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div>
            <h3 className="font-medium text-[#5a5a35] flex items-center gap-2 text-lg">
              <CloudUpload size={20} /> 发现 {localReports.length} 份本地未同步报告
            </h3>
            <p className="text-sm text-stone-500 mt-1">您可以将它们分配给某位家人，实现跨设备趋势分析。</p>
          </div>
          <button onClick={() => setShowMigrateModal(true)} className="px-6 py-2.5 bg-[#5a5a35] hover:bg-[#4a4a2e] text-white rounded-full text-sm font-medium whitespace-nowrap transition shadow-sm">
            立即同步
          </button>
        </div>
      )}

      {showMigrateModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#fdfdfa] rounded-[32px] p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="font-serif font-medium text-xl mb-6 text-center text-stone-800">把这些报告归属于谁？</h3>
            <select 
              value={selectedMemberForMigration} 
              onChange={e => setSelectedMemberForMigration(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#e5e5dd] bg-white text-stone-700 outline-none focus:ring-2 focus:ring-[#5a5a35]/30 mb-8 cursor-pointer"
            >
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              {members.length === 0 && <option value="">请先到家人页面添加</option>}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setShowMigrateModal(false)} className="px-5 py-3 text-stone-500 font-medium hover:text-stone-800 bg-stone-100/50 hover:bg-stone-100 rounded-full flex-1 transition">取消</button>
              <button 
                 onClick={handleMigrate} 
                 disabled={isMigrating || members.length === 0}
                 className="px-5 py-3 bg-[#5a5a35] text-white font-medium hover:bg-[#4a4a2e] rounded-full flex-1 disabled:opacity-50 transition shadow-sm"
              >
                {isMigrating ? '同步中...' : '确认同步'}
              </button>
            </div>
          </div>
        </div>
      )}

      {!displayReports ? (
        <div className="text-stone-400 text-sm text-center py-12">加载中...</div>
      ) : displayReports.length === 0 ? (
        <div className="text-center py-24 bg-[#fdfdfa] rounded-[32px] border border-[#e5e5dd] shadow-sm">
           <div className="w-20 h-20 bg-[#f7f7f3] rounded-full flex items-center justify-center mx-auto mb-6">
             <FileHeart size={32} className="text-[#a8a86c]" />
           </div>
           <p className="text-stone-600 font-serif text-xl">暂时没有历史记录</p>
           {!token && <p className="text-stone-400 text-sm mt-2">登录后可查看云端家人档案与关联记录</p>}
        </div>
      ) : (
        <div className="space-y-4">
          {displayReports.map((report) => (
            <div 
               key={report.id} 
               onClick={() => navigate(`/result/${report.id}?mode=${token ? 'remote' : 'local'}`)}
               className="bg-[#fdfdfa] p-6 rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#e5e5dd] flex items-center justify-between hover:border-[#5a5a35]/40 hover:shadow-md transition-all duration-300 cursor-pointer group"
            >
              <div>
                <div className="flex items-center gap-2 text-[#a8a86c] text-xs font-medium uppercase tracking-wider mb-2">
                  <Calendar size={14} />
                  {dayjs(report.createdAt || report.uploaded_at).format('YYYY-MM-DD HH:mm:ss')}
                </div>
                <h3 className="text-stone-800 font-medium text-lg line-clamp-1 pr-6 leading-relaxed">
                  {report.result?.summary ? report.result.summary.substring(0, 30) + "..." : 
                   report.interpretation_json ? safeParseJSON(report.interpretation_json).summary?.substring(0, 30) + "..." : "化验单解读结果"}
                </h3>
              </div>
              <div className="w-10 h-10 shrink-0 rounded-full bg-[#f7f7f3] border border-[#e5e5dd] text-stone-400 flex items-center justify-center group-hover:bg-[#5a5a35] group-hover:border-[#5a5a35] group-hover:text-white transition">
                <ChevronRight size={20} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
