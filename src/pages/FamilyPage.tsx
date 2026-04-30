import { apiFetch } from '../lib/api';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Users, Plus, UserCircle, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function FamilyPage() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newMember, setNewMember] = useState({ name: '', gender: t('family.male'), birth_year: 1960 });

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchMembers();
  }, [token]);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch('/api/family', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newMember.name) return toast.error(t('family.enterName'));
    const res = await apiFetch('/api/family', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(newMember)
    });
    if (res.ok) {
      toast.success(t('family.addFamilySuccess'));
      setShowAdd(false);
      setNewMember({ name: '', gender: t('family.male'), birth_year: 1960 });
      fetchMembers();
    } else if (res.status === 401) {
      toast.error(t('family.sessionExpired'));
    } else {
      toast.error(t('family.addFamilyFailed'));
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 font-sans animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-medium text-stone-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f7f7f3] text-[#5a5a35] flex items-center justify-center">
               <Users size={20} />
            </div>
            {t('family.title')}
          </h1>
          <p className="text-stone-500 mt-2 text-sm max-w-sm leading-relaxed">{t('family.desc')}</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-[#5a5a35] text-[#fdfdfa] px-5 py-2.5 rounded-full flex items-center justify-center gap-2 hover:bg-[#4a4a2e] transition shadow-sm font-medium w-full sm:w-auto"
        >
          <Plus size={18} /> <span>{t('family.addFamily')}</span>
        </button>
      </div>

      {showAdd && (
        <div className="bg-[#fdfdfa] p-6 sm:p-8 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#e5e5dd] mb-8 animate-in slide-in-from-top-4 duration-300">
          <h2 className="text-xl font-serif font-medium mb-6 text-stone-800">{t('family.createProfile')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-xs text-stone-500 font-medium uppercase tracking-wider block">{t('family.nameLabel')}</label>
              <input 
                type="text" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})}
                className="w-full px-4 py-2.5 bg-white border border-[#e5e5dd] focus:border-[#5a5a35] focus:ring-1 focus:ring-[#5a5a35] rounded-xl outline-none transition" placeholder={t('family.namePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-stone-500 font-medium uppercase tracking-wider block">{t('family.genderLabel')}</label>
              <select 
                value={newMember.gender} onChange={e => setNewMember({...newMember, gender: e.target.value})}
                className="w-full px-4 py-2.5 bg-white border border-[#e5e5dd] focus:border-[#5a5a35] focus:ring-1 focus:ring-[#5a5a35] rounded-xl outline-none transition cursor-pointer"
              >
                <option>{t('family.male')}</option>
                <option>{t('family.female')}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-stone-500 font-medium uppercase tracking-wider block">{t('family.birthYearLabel')}</label>
              <input 
                type="number" value={newMember.birth_year || ''} onChange={e => setNewMember({...newMember, birth_year: parseInt(e.target.value)})}
                className="w-full px-4 py-2.5 bg-white border border-[#e5e5dd] focus:border-[#5a5a35] focus:ring-1 focus:ring-[#5a5a35] rounded-xl outline-none transition"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[#e5e5dd]">
            <button onClick={() => setShowAdd(false)} className="px-6 py-2.5 text-stone-500 hover:text-stone-800 font-medium transition rounded-full hover:bg-stone-100">{t('family.cancel')}</button>
            <button onClick={handleAdd} className="px-8 py-2.5 bg-[#5a5a35] text-white rounded-full font-medium hover:bg-[#4a4a2e] transition shadow-sm">{t('family.save')}</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white p-6 rounded-[24px] shadow-sm border border-[#e5e5dd] flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-stone-200 rounded-full flex-shrink-0"></div>
                  <div className="space-y-3">
                    <div className="h-5 w-24 bg-stone-200 rounded-md"></div>
                    <div className="flex gap-2">
                      <div className="h-4 w-8 bg-stone-100 rounded-full"></div>
                      <div className="h-4 w-12 bg-stone-100 rounded-full"></div>
                    </div>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-stone-100 flex-shrink-0"></div>
              </div>
            ))}
          </>
        ) : (
          <>
            {members.map(m => (
              <Link to={`/family/${m.id}`} key={m.id} className="bg-white p-6 rounded-[24px] shadow-sm border border-[#e5e5dd] flex items-center justify-between hover:shadow-md hover:border-[#5a5a35]/40 transition-all duration-300 group">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-[#f7f7f3] border border-[#e5e5dd] rounded-full flex items-center justify-center text-2xl shadow-sm">
                    {m.avatar_emoji || '👤'}
                  </div>
                  <div>
                    <h3 className="font-serif font-medium text-stone-800 text-xl tracking-tight mb-1">{m.name}</h3>
                    <div className="flex items-center gap-2 text-xs font-medium text-stone-400">
                       <span className="bg-[#f7f7f3] px-2 py-0.5 rounded-full border border-[#e5e5dd]">{m.gender}</span>
                       <span className="bg-[#f7f7f3] px-2 py-0.5 rounded-full border border-[#e5e5dd]">{m.birth_year}{t('family.bornIn')}</span>
                    </div>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#fdfdfa] border border-[#e5e5dd] flex items-center justify-center group-hover:bg-[#5a5a35] group-hover:bg-opacity-10 text-stone-300 group-hover:text-[#5a5a35] transition">
                  <ChevronRight size={20} />
                </div>
              </Link>
            ))}
            {members.length === 0 && !showAdd && (
              <div className="col-span-full py-16 text-center text-stone-500 bg-[#fdfdfa] rounded-[32px] border border-dashed border-[#d6d3d1]">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-[#e5e5dd] shadow-sm">
                   <Users size={24} className="text-[#a8a86c]" />
                </div>
                <p className="font-medium text-stone-700">{t('family.noProfiles')}</p>
                <p className="text-sm mt-1">{t('family.noProfilesDesc')}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
