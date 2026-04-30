import { apiFetch } from '../lib/api';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Stethoscope, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import * as htmlToImage from "html2canvas";
import { useTranslation } from "react-i18next";

export default function PrepareVisitPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [memberId, setMemberId] = useState("");
  const [complaint, setComplaint] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { t } = useTranslation();

  const { data: members = [] } = useQuery({
    queryKey: ['family'],
    queryFn: async () => {
      if (!token) return [];
      const res = await apiFetch('/api/family', { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    },
    enabled: !!token
  });

  const handlePrepare = async () => {
    if (!memberId || !complaint) return toast.error(t('prepare.validation'));
    setLoading(true);
    try {
       const res = await apiFetch('/api/chat/stream', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
         body: JSON.stringify({
           family_member_id: memberId,
           messages: [{ role: 'user', content: t('prepare.aiPrompt', { complaint }) }]
         })
       });
       
       if (!res.ok) throw new Error();
       
       const reader = res.body?.getReader();
       const decoder = new TextDecoder();
       let text = "";
       while (true && reader) {
         const { value, done } = await reader.read();
         if (done) break;
         
         const chunk = decoder.decode(value);
         text += chunk;
         setResult(text);
       }

    } catch (e) {
      toast.error(t('prepare.generateFailed'));
    }
    setLoading(false);
  };

  const handleSaveAppt = async () => {
    if (!token) return;
    try {
      const res = await apiFetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          family_member_id: memberId,
          complaint,
          questions_generated: result
        })
      });
      if (res.ok) {
        toast.success(t('prepare.saveSuccess'));
        navigate('/visits');
      }
    } catch {
      toast.error(t('prepare.saveFailed'));
    }
  };

  const handleDownloadImage = () => {
    const el = document.getElementById("visit-prep-card");
    if (!el) return;
    htmlToImage.default(el).then(canvas => {
      const link = document.createElement("a");
      link.download = t('prepare.downloadName');
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  return (
    <div className="max-w-xl mx-auto py-6 px-4 animate-in fade-in relative">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-stone-100 rounded-full text-stone-600 hover:bg-stone-200">
          <ArrowLeft size={18} />
        </button>
        <h2 className="font-serif text-2xl font-medium text-stone-800">{t('prepare.title')}</h2>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-stone-600 mb-2">{t('prepare.who')}</label>
          <select 
            value={memberId} 
            onChange={e => setMemberId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-stone-50 border-none outline-none focus:ring-2 focus:ring-[#5A5A40]"
          >
            <option value="">{t('prepare.selectFamily')}</option>
            {members.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-600 mb-2">{t('prepare.symptoms')}</label>
          <textarea 
            value={complaint}
            onChange={e => setComplaint(e.target.value)}
            placeholder={t('prepare.symptomsPlaceholder')}
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-stone-50 border-none outline-none focus:ring-2 focus:ring-[#5A5A40] resize-none"
          />
        </div>
        <button 
          onClick={handlePrepare}
          disabled={loading}
          className="w-full py-4 bg-[#5A5A40] text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-[#4A4A30] transition disabled:opacity-50"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Stethoscope size={18} />}
          {loading ? t('prepare.thinking') : t('prepare.generateBtn')}
        </button>
      </div>

      {result && (
        <div className="animate-in slide-in-from-bottom-4">
          <div id="visit-prep-card" className="bg-[#5A5A40]/5 border border-[#5A5A40]/10 p-6 rounded-3xl mb-4 relative">
             <div className="prose prose-stone text-sm max-w-none whitespace-pre-wrap">
               {/* Primitive markdown parse for demo */}
               {result.replace(/0:"/g, '').replace(/"/g, '').replace(/\\n/g, '\n')}
             </div>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap gap-3">
             <button onClick={handleDownloadImage} className="flex-1 py-3 bg-white border border-stone-200 rounded-xl font-medium text-stone-600 sm:w-auto w-full">{t('prepare.saveImage')}</button>
             <button onClick={() => { navigator.clipboard.writeText(result); toast.success(t('prepare.copySuccess')); }} className="flex-1 py-3 bg-white border border-stone-200 rounded-xl font-medium text-stone-600 sm:w-auto w-full">{t('prepare.copyWechat')}</button>
             <button onClick={handleSaveAppt} className="flex-1 py-3 bg-[#5A5A40] text-white rounded-xl font-medium flex items-center justify-center gap-2 sm:w-auto w-full">
               <Save size={16} /> {t('prepare.saveTask')}
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
