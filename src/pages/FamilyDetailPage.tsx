import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';
import { ArrowLeft, FileText, StickyNote, AlertTriangle } from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import { EmergencyDialog } from '../components/family/EmergencyDialog';
import { TrendChart } from '../components/family/TrendChart';

export default function FamilyDetailPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [selectedIndicator, setSelectedIndicator] = useState('ALT');
  const [showEmergency, setShowEmergency] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchDetail();
    fetchTrend('ALT');
  }, [id, token]);

  const fetchDetail = async () => {
    const res = await fetch(`/api/family/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      setData(await res.json());
    }
  };

  const fetchTrend = async (indicator: string) => {
    setSelectedIndicator(indicator);
    const res = await fetch(`/api/family/${id}/trends/${indicator}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const resp = await res.json();
      setTrendData(resp.map((d: any) => ({
        ...d,
        date: dayjs(d.uploaded_at).format('MM-DD'),
        value: Number(d.value)
      })));
    }
  };

  if (!data) return <div className="text-center py-12">加载中...</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 font-sans animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <button onClick={() => navigate('/family')} className="flex items-center gap-2 text-stone-500 hover:text-stone-800 transition font-medium px-4 py-2 bg-stone-100/50 hover:bg-stone-100 rounded-full">
          <ArrowLeft size={16} /> <span className="text-sm">返回家人列表</span>
        </button>
        <button onClick={() => setShowEmergency(true)} className="px-4 py-2 bg-red-50 text-red-600 rounded-full text-xs font-bold border border-red-100 flex items-center gap-1.5 hover:bg-red-100 transition shadow-sm uppercase tracking-wider">
          <AlertTriangle size={14} /> 爸妈不舒服?
        </button>
      </div>

      {showEmergency && <EmergencyDialog onClose={() => setShowEmergency(false)} />}

      <div className="bg-[#fdfdfa] p-8 md:p-10 rounded-[32px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#e5e5dd] flex flex-col md:flex-row items-center md:items-start gap-8 mb-10 text-center md:text-left transition-all">
        <div className="w-24 h-24 bg-[#f7f7f3] border border-[#e5e5dd] rounded-full flex items-center justify-center text-4xl shadow-inner shrink-0">
          {data.avatar_emoji || '👤'}
        </div>
        <div className="flex-1">
          <h1 className="text-4xl font-serif font-medium text-stone-800 mb-2 tracking-tight">{data.name}</h1>
          <p className="text-stone-500 text-sm font-medium tracking-wide uppercase">
            {data.gender} <span className="mx-2 opacity-50">·</span> {data.birth_year} 年生人
          </p>
          {(data.conditions || data.allergies) && (
            <div className="mt-5 flex flex-wrap justify-center md:justify-start gap-2 text-[11px] font-bold uppercase tracking-wider">
              {data.conditions && JSON.parse(data.conditions).map((c: string) => (
                 <span key={c} className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-full shadow-sm">{c}</span>
              ))}
              {data.allergies && (
                 <span className="px-3 py-1.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-full shadow-sm">过敏: {data.allergies}</span>
              )}
            </div>
          )}
        </div>
      </div>

      <Tabs.Root defaultValue="trends" className="flex flex-col">
        <Tabs.List className="flex border-b border-[#e5e5dd] mb-8 overflow-x-auto hide-scrollbar">
          <Tabs.Trigger value="trends" className="whitespace-nowrap px-8 py-4 font-serif text-lg text-stone-400 data-[state=active]:text-[#5a5a35] data-[state=active]:font-medium data-[state=active]:border-b-2 data-[state=active]:border-[#5a5a35] transition-colors outline-none cursor-pointer">
            健康趋势分析
          </Tabs.Trigger>
          <Tabs.Trigger value="reports" className="whitespace-nowrap px-8 py-4 font-serif text-lg text-stone-400 data-[state=active]:text-[#5a5a35] data-[state=active]:font-medium data-[state=active]:border-b-2 data-[state=active]:border-[#5a5a35] transition-colors outline-none cursor-pointer">
            化验报告 <span className="ml-1 text-xs opacity-70">({data.reports.length})</span>
          </Tabs.Trigger>
          <Tabs.Trigger value="notes" className="whitespace-nowrap px-8 py-4 font-serif text-lg text-stone-400 data-[state=active]:text-[#5a5a35] data-[state=active]:font-medium data-[state=active]:border-b-2 data-[state=active]:border-[#5a5a35] transition-colors outline-none cursor-pointer">
            医疗备忘录 <span className="ml-1 text-xs opacity-70">({data.notes.length})</span>
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="trends" className="focus:outline-none animate-in fade-in duration-500">
          <TrendChart trendData={trendData} selectedIndicator={selectedIndicator} onSelectIndicator={fetchTrend} />
        </Tabs.Content>

        <Tabs.Content value="reports" className="focus:outline-none space-y-4 animate-in fade-in duration-500">
          {data.reports.map((r: any) => (
             <div key={r.id} className="bg-[#fdfdfa] p-6 rounded-[24px] shadow-sm border border-[#e5e5dd] flex items-center justify-between hover:border-[#5a5a35]/40 hover:shadow-md transition-all duration-300 group">
                <div className="flex gap-4 items-center">
                  <div className="p-3 bg-[#f7f7f3] text-[#5a5a35] rounded-full shadow-inner"><FileText size={20} /></div>
                  <div>
                    <div className="font-serif font-medium text-stone-800 text-lg">化验单智能解读报告</div>
                    <div className="text-xs text-stone-400 mt-1 font-mono">{dayjs(r.uploaded_at).format('YYYY年MM月DD日 HH:mm')}</div>
                  </div>
                </div>
                <button onClick={() => navigate(`/result/${r.id}?mode=remote`)} className="px-5 py-2 bg-[#f7f7f3] text-[#5a5a35] text-sm font-medium rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity border border-[#e5e5dd]">
                  查看详情
                </button>
             </div>
          ))}
          {data.reports.length === 0 && <div className="text-center py-16 text-stone-400 bg-[#fdfdfa] rounded-[32px] border border-dashed border-[#e5e5dd]">暂无收录报告</div>}
        </Tabs.Content>

        <Tabs.Content value="notes" className="focus:outline-none space-y-4 animate-in fade-in duration-500">
          {data.notes.map((n: any) => (
            <div key={n.id} className="bg-[#fffdf7] p-6 rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#f5ebc3]">
               <div className="flex items-center gap-2 mb-3 text-yellow-800 text-sm font-bold uppercase tracking-wider">
                 <StickyNote size={16} className="text-yellow-600" /> 
                 {n.is_auto_extracted ? 'AI 自动提取记忆' : '私人笔记'}
                 <span className="text-xs font-mono text-yellow-600/50 pl-4 ml-auto border-l border-yellow-200">{dayjs(n.created_at).format('YYYY-MM-DD')}</span>
               </div>
               <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-wrap">{n.content}</p>
            </div>
          ))}
          {data.notes.length === 0 && <div className="text-center py-16 text-stone-400 bg-[#fdfdfa] rounded-[32px] border border-dashed border-[#e5e5dd]">暂无医疗笔记</div>}
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
