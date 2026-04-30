import { apiFetch } from '../lib/api';
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ChevronLeft, Activity, Save } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { db } from "../lib/db";
import { useAuth } from "../context/AuthContext";
import { ResultBanner } from "../components/result/ResultBanner";
import { ResultAnomalies } from "../components/result/ResultAnomalies";
import { ResultActions } from "../components/result/ResultActions";
import { motion } from "framer-motion";
import Markdown from 'react-markdown';
import { useTranslation } from 'react-i18next';

export default function ResultPage() {
  const { t } = useTranslation();
  const { taskId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'local';
  const { token } = useAuth();
  const [result, setResult] = useState<any>(location.state?.result);
  const [loading, setLoading] = useState(!location.state?.result);

  useEffect(() => {
    if (result || !taskId) return;
    
    if (mode === 'remote' && token) {
       apiFetch(`/api/reports/${taskId}`, { headers: { Authorization: `Bearer ${token}` } })
         .then(res => res.json())
         .then(data => {
            if (data.result) {
              setResult(data.result);
            } else {
              toast.error(t('result.notFound'));
              navigate('/');
            }
         })
         .finally(() => setLoading(false));
    } else {
       db.reports.get(taskId).then(record => {
         if (record) {
           setResult(record.result);
         } else {
           navigate("/");
         }
       }).finally(() => setLoading(false));
    }
  }, [result, taskId, navigate, mode, token, t]);

  useEffect(() => {
    if (result && taskId && mode === 'local') {
       db.reports.put({
         id: taskId,
         result: result,
         createdAt: new Date()
       });
    }
  }, [result, taskId, mode]);

  if (loading || !result) return (
    <div className="flex h-[60vh] w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-200 border-t-[#5A5A40]"></div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, staggerChildren: 0.1 }}
      className="space-y-8 pb-16 max-w-4xl mx-auto py-8 px-4"
    >
      <button 
        onClick={() => navigate("/")}
        className="flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-800 transition bg-stone-100/50 hover:bg-stone-100 px-4 py-2 rounded-full w-fit"
      >
        <ChevronLeft size={16} />
        {t('result.backHome')}
      </button>

      <ResultBanner criticalAlert={result.critical_alert} />

      {/* Main Overall Summary */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#fdfdfa] rounded-[32px] p-8 md:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#e5e5dd] relative overflow-hidden transition-all hover:shadow-md"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Activity size={160} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#f7f7f3] border border-[#e5e5dd] text-[#5a5a35] flex items-center justify-center shrink-0 shadow-inner">
               <Activity size={20} />
            </div>
            <h2 className="font-serif text-3xl font-medium text-stone-800">{t('result.overallSummary')}</h2>
          </div>
          <div className="text-stone-700 leading-[1.8] text-lg font-serif">
            {/* Displaying summary directly as requested */}
            <div className="markdown-body">
              <Markdown>{result.summary}</Markdown>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <ResultAnomalies indicators={result.abnormal_indicators} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <ResultActions doctorQuestions={result.doctor_questions} wechatMessage={result.wechat_message} />
      </motion.div>

      {/* Disclaimer */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-center pt-8">
        <p className="text-[11px] text-stone-400 max-w-lg mx-auto leading-relaxed px-4">
          {t('result.disclaimerStart')}<span className="font-bold underline decoration-stone-300 underline-offset-2">{t('result.disclaimerBold')}</span>{t('result.disclaimerEnd')}
        </p>
      </motion.div>

      {mode === 'remote' && token && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-[#fffdf7] rounded-[32px] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#f5ebc3] mt-8 transition-all hover:shadow-md">
          <h3 className="font-serif font-medium text-xl text-yellow-900 mb-2 flex items-center gap-2">
            <Save size={20} className="text-yellow-600" /> 
            {t('result.addNote')}
          </h3>
          <p className="text-sm text-yellow-800/70 mb-6 leading-relaxed">{t('result.noteDesc')}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              id="noteInput"
              placeholder={t('result.notePlaceholder')} 
              className="flex-grow px-5 py-3.5 rounded-full border border-yellow-200/60 outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 bg-white transition shadow-sm text-stone-700"
            />
            <button 
              onClick={async () => {
                const input = document.getElementById('noteInput') as HTMLInputElement;
                if (!input.value.trim()) return;
                try {
                  const r = await apiFetch('/api/notes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ report_id: taskId, content: input.value, family_member_id: result.family_member_id })
                  });
                  if (r.ok) {
                    toast.success(t('result.saveNoteSuccess'));
                    input.value = '';
                  } else {
                    toast.error(t('result.saveNoteFailed'));
                  }
                } catch (e) {
                   toast.error(t('result.networkError'));
                }
              }}
              className="bg-yellow-500 text-white px-8 py-3.5 rounded-full font-medium hover:bg-yellow-600 transition shadow-sm whitespace-nowrap"
            >
              {t('result.saveToRecords')}
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
