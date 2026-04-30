import { apiFetch } from '../lib/api';
import { useState, useEffect } from "react";
import { AlertCircle, FileText } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { CareReminders } from "../components/home/CareReminders";
import { UploadSection } from "../components/home/UploadSection";
import { useTranslation } from "react-i18next";

export default function HomePage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    if (token) {
      setIsLoadingMembers(true);
      apiFetch('/api/family', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setMembers(data);
            if (data.length > 0) setSelectedMemberId(data[0].id);
          }
        })
        .finally(() => setIsLoadingMembers(false));
    } else {
      setIsLoadingMembers(false);
    }
  }, [token]);

  return (
    <div className="flex flex-col gap-8">
      <CareReminders />

      <div className="text-center space-y-4 mt-8 mb-6">
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-[#292524] tracking-tight leading-tight">
          {t('home.title')}<br className="md:hidden" /><span className="italic text-[#5a5a35]">{t('home.subtitle')}</span>
        </h1>
        <p className="text-stone-500 text-sm md:text-base max-w-md mx-auto leading-relaxed">
          {t('home.desc')}
        </p>
      </div>

      <UploadSection 
         members={members} 
         selectedMemberId={selectedMemberId} 
         onSelectMember={setSelectedMemberId} 
         isLoadingMembers={isLoadingMembers}
      />
      
      <div className="grid sm:grid-cols-2 gap-4">
         <div className="bg-[#fdfdfa] rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-stone-100">
          <h3 className="font-semibold text-stone-800 mb-2 flex items-center gap-2">
             <span className="text-[#5a5a35]">💡</span> {t('home.alerts.title')}
          </h3>
          <p className="text-sm text-stone-500 leading-relaxed">
             {t('home.alerts.desc')}
          </p>
         </div>
         <div 
            onClick={() => navigate('/annual-report')}
            className="cursor-pointer bg-gradient-to-br from-[#5a5a35] to-[#404029] rounded-[24px] p-6 shadow-[0_4px_20px_rgba(90,90,53,0.15)] text-white hover:scale-[1.02] transform transition-transform duration-300 flex flex-col justify-center relative overflow-hidden"
         >
          <div className="relative z-10">
            <h3 className="font-serif text-xl mb-2 font-medium">{t('home.annual.title')}</h3>
            <p className="text-sm text-white/80 max-w-[200px]">{t('home.annual.desc')} &rarr;</p>
          </div>
          <div className="absolute right-0 bottom-0 pointer-events-none opacity-10">
            <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="80" cy="80" r="40" stroke="currentColor" strokeWidth="20"/>
            </svg>
          </div>
         </div>
      </div>
    </div>
  );
}

