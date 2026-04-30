import { apiFetch } from '../lib/api';
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { FileHeart, Plus, Activity, ChevronRight } from "lucide-react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

export default function VisitListPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: visits = [], isLoading } = useQuery({
    queryKey: ['visits'],
    queryFn: async () => {
      if (!token) return [];
      try {
        const res = await apiFetch('/api/visits', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch (err) {
        return [];
      }
    },
    enabled: !!token
  });

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl font-medium text-stone-800 flex items-center gap-2">
          <Activity className="text-[#5A5A40]" /> {t('visitList.title')}
        </h2>
        <Link to="/visits/prepare" className="px-4 py-2 bg-[#5A5A40] text-white rounded-full text-sm font-medium flex items-center gap-1 shadow-sm">
          <Plus size={16} /> {t('visitList.prepareBtn')}
        </Link>
      </div>

      {isLoading ? (
         <div className="text-stone-400 text-sm">{t('visitList.loading')}</div>
      ) : visits.length === 0 ? (
         <div className="text-center py-20 bg-white rounded-3xl border border-stone-100 shadow-sm">
           <Activity size={48} className="mx-auto text-stone-200 mb-4" />
           <p className="text-stone-500 font-medium">{t('visitList.noVisits')}</p>
         </div>
      ) : (
         <div className="space-y-4">
           {visits.map((v: any) => (
             <div key={v.id} onClick={() => navigate(`/visits/${v.id}/active`)} className="bg-white p-5 rounded-3xl shadow-sm border border-stone-100 flex items-center justify-between cursor-pointer hover:border-[#5A5A40]/30 transition group">
                <div>
                  <div className="text-xs text-stone-400 mb-1">{dayjs(v.created_at).format('YYYY-MM-DD')}</div>
                  <h3 className="font-medium text-stone-800 line-clamp-1">{v.complaint}</h3>
                  <div className="text-xs text-[#5A5A40] bg-[#5A5A40]/10 px-2 py-1 rounded inline-block mt-2">
                    {v.status === 'active' ? t('visitList.statusActive') : v.status === 'completed' ? t('visitList.statusCompleted') : t('visitList.statusPending')}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-[#5A5A40] group-hover:text-white transition">
                  <ChevronRight size={18} />
                </div>
             </div>
           ))}
         </div>
      )}
    </div>
  );
}
