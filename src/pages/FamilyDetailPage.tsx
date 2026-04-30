import { apiFetch } from '../lib/api';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';
import { ArrowLeft, FileText, StickyNote, AlertTriangle, Edit2, Trash2 } from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import { EmergencyDialog } from '../components/family/EmergencyDialog';
import { TrendChart } from '../components/family/TrendChart';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export default function FamilyDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [selectedIndicator, setSelectedIndicator] = useState('ALT');
  const [showEmergency, setShowEmergency] = useState(false);
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', gender: t('family.male'), birth_year: 1960 });

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchDetail();
    fetchTrend('ALT');
  }, [id, token]);

  const fetchDetail = async () => {
    const res = await apiFetch(`/api/family/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const memberData = await res.json();
      setData(memberData);
      setEditForm({
        name: memberData.name,
        gender: memberData.gender,
        birth_year: memberData.birth_year
      });
    } else {
      navigate('/family'); // Not found or error
    }
  };

  const fetchTrend = async (indicator: string) => {
    setSelectedIndicator(indicator);
    const res = await apiFetch(`/api/family/${id}/trends/${indicator}`, {
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

  const handleUpdate = async () => {
    if (!editForm.name) return toast.error(t('family.enterName'));
    const res = await apiFetch(`/api/family/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({
        ...editForm,
        conditions: data.conditions, // keep existing as parse/stringify logic handles it
        allergies: data.allergies,
        avatar_emoji: data.avatar_emoji
      })
    });
    
    if (res.ok) {
      toast.success(t('family.updateSuccess'));
      setIsEditing(false);
      fetchDetail();
    } else {
      toast.error(t('family.updateFailed'));
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('family.deleteConfirm'))) {
      return;
    }
    const res = await apiFetch(`/api/family/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Also delete local reports from IndexedDB if applicable, though primarily rely on remote DB for now
    if (res.ok) {
      toast.success(t('family.deletedSuccess'));
      navigate('/family');
    } else {
      toast.error(t('family.deleteFailed'));
    }
  };

  if (!data) return <div className="text-center py-12">{t('visitList.loading')}</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 font-sans animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <button onClick={() => navigate('/family')} className="flex items-center gap-2 text-stone-500 hover:text-stone-800 transition font-medium px-4 py-2 bg-stone-100/50 hover:bg-stone-100 rounded-full">
          <ArrowLeft size={16} /> <span className="text-sm">{t('family.backToList')}</span>
        </button>
        <button onClick={() => setShowEmergency(true)} className="px-4 py-2 bg-red-50 text-red-600 rounded-full text-xs font-bold border border-red-100 flex items-center gap-1.5 hover:bg-red-100 transition shadow-sm uppercase tracking-wider">
          <AlertTriangle size={14} /> {t('family.emergency')}
        </button>
      </div>

      {showEmergency && <EmergencyDialog onClose={() => setShowEmergency(false)} />}

      {isEditing ? (
        <div className="bg-[#fdfdfa] p-8 md:p-10 rounded-[32px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#e5e5dd] mb-10 transition-all">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-serif font-medium text-stone-800">{t('family.editProfile')}</h2>
            <button onClick={handleDelete} className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-full text-sm font-medium transition flex items-center gap-1.5">
              <Trash2 size={16} /> {t('family.deleteProfile')}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-xs text-stone-500 font-medium uppercase tracking-wider block">{t('family.nameLabel')}</label>
              <input 
                type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})}
                className="w-full px-4 py-2.5 bg-white border border-[#e5e5dd] focus:border-[#5a5a35] focus:ring-1 focus:ring-[#5a5a35] rounded-xl outline-none transition" placeholder={t('family.namePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-stone-500 font-medium uppercase tracking-wider block">{t('family.genderLabel')}</label>
              <select 
                value={editForm.gender} onChange={e => setEditForm({...editForm, gender: e.target.value})}
                className="w-full px-4 py-2.5 bg-white border border-[#e5e5dd] focus:border-[#5a5a35] focus:ring-1 focus:ring-[#5a5a35] rounded-xl outline-none transition cursor-pointer"
              >
                <option>{t('family.male')}</option>
                <option>{t('family.female')}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-stone-500 font-medium uppercase tracking-wider block">{t('family.birthYearLabel')}</label>
              <input 
                type="number" value={editForm.birth_year || ''} onChange={e => setEditForm({...editForm, birth_year: parseInt(e.target.value)})}
                className="w-full px-4 py-2.5 bg-white border border-[#e5e5dd] focus:border-[#5a5a35] focus:ring-1 focus:ring-[#5a5a35] rounded-xl outline-none transition"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[#e5e5dd]">
            <button onClick={() => setIsEditing(false)} className="px-6 py-2.5 text-stone-500 hover:text-stone-800 font-medium transition rounded-full hover:bg-stone-100">{t('family.cancel')}</button>
            <button onClick={handleUpdate} className="px-8 py-2.5 bg-[#5a5a35] text-white rounded-full font-medium hover:bg-[#4a4a2e] transition shadow-sm">{t('family.saveChanges')}</button>
          </div>
        </div>
      ) : (
        <div className="bg-[#fdfdfa] p-8 md:p-10 rounded-[32px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#e5e5dd] flex flex-col md:flex-row items-center md:items-start gap-8 mb-10 text-center md:text-left transition-all relative group">
          <button 
            onClick={() => setIsEditing(true)}
            className="absolute top-6 right-6 p-2 rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition opacity-0 group-hover:opacity-100"
            title={t('family.editProfile')}
          >
            <Edit2 size={18} />
          </button>
          <div className="w-24 h-24 bg-[#f7f7f3] border border-[#e5e5dd] rounded-full flex items-center justify-center text-4xl shadow-inner shrink-0">
            {data.avatar_emoji || '👤'}
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-serif font-medium text-stone-800 mb-2 tracking-tight">{data.name}</h1>
            <p className="text-stone-500 text-sm font-medium tracking-wide uppercase">
              {data.gender} <span className="mx-2 opacity-50">·</span> {data.birth_year} {t('family.bornIn')}
            </p>
            {(data.conditions || data.allergies) && (
              <div className="mt-5 flex flex-wrap justify-center md:justify-start gap-2 text-[11px] font-bold uppercase tracking-wider">
                {data.conditions && typeof data.conditions === 'string' && JSON.parse(data.conditions).map((c: string) => (
                   <span key={c} className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-full shadow-sm">{c}</span>
                ))}
                {data.allergies && (
                   <span className="px-3 py-1.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-full shadow-sm">{t('family.allergies')}: {data.allergies}</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <Tabs.Root defaultValue="trends" className="flex flex-col">
        <Tabs.List className="flex border-b border-[#e5e5dd] mb-8 overflow-x-auto hide-scrollbar">
          <Tabs.Trigger value="trends" className="whitespace-nowrap px-8 py-4 font-serif text-lg text-stone-400 data-[state=active]:text-[#5a5a35] data-[state=active]:font-medium data-[state=active]:border-b-2 data-[state=active]:border-[#5a5a35] transition-colors outline-none cursor-pointer">
            {t('family.trends')}
          </Tabs.Trigger>
          <Tabs.Trigger value="reports" className="whitespace-nowrap px-8 py-4 font-serif text-lg text-stone-400 data-[state=active]:text-[#5a5a35] data-[state=active]:font-medium data-[state=active]:border-b-2 data-[state=active]:border-[#5a5a35] transition-colors outline-none cursor-pointer">
            {t('family.reports')} <span className="ml-1 text-xs opacity-70">({data.reports.length})</span>
          </Tabs.Trigger>
          <Tabs.Trigger value="notes" className="whitespace-nowrap px-8 py-4 font-serif text-lg text-stone-400 data-[state=active]:text-[#5a5a35] data-[state=active]:font-medium data-[state=active]:border-b-2 data-[state=active]:border-[#5a5a35] transition-colors outline-none cursor-pointer">
            {t('family.notes')} <span className="ml-1 text-xs opacity-70">({data.notes.length})</span>
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
                    <div className="font-serif font-medium text-stone-800 text-lg">{t('family.reportItemTitle')}</div>
                    <div className="text-xs text-stone-400 mt-1 font-mono">{dayjs(r.uploaded_at).format('YYYY-MM-DD HH:mm')}</div>
                  </div>
                </div>
                <button onClick={() => navigate(`/result/${r.id}?mode=remote`)} className="px-5 py-2 bg-[#f7f7f3] text-[#5a5a35] text-sm font-medium rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity border border-[#e5e5dd]">
                  {t('family.viewDetails')}
                </button>
             </div>
          ))}
          {data.reports.length === 0 && <div className="text-center py-16 text-stone-400 bg-[#fdfdfa] rounded-[32px] border border-dashed border-[#e5e5dd]">{t('family.noReports')}</div>}
        </Tabs.Content>

        <Tabs.Content value="notes" className="focus:outline-none space-y-4 animate-in fade-in duration-500">
          {data.notes.map((n: any) => (
            <div key={n.id} className="bg-[#fffdf7] p-6 rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#f5ebc3]">
               <div className="flex items-center gap-2 mb-3 text-yellow-800 text-sm font-bold uppercase tracking-wider">
                 <StickyNote size={16} className="text-yellow-600" /> 
                 {n.is_auto_extracted ? t('family.aiMemory') : t('family.privateNote')}
                 <span className="text-xs font-mono text-yellow-600/50 pl-4 ml-auto border-l border-yellow-200">{dayjs(n.created_at).format('YYYY-MM-DD')}</span>
               </div>
               <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-wrap">{n.content}</p>
            </div>
          ))}
          {data.notes.length === 0 && <div className="text-center py-16 text-stone-400 bg-[#fdfdfa] rounded-[32px] border border-dashed border-[#e5e5dd]">{t('family.noNotes')}</div>}
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
