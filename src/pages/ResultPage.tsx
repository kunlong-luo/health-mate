import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ChevronLeft, Activity, Save } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { db } from "../lib/db";
import { useAuth } from "../context/AuthContext";
import { ResultBanner } from "../components/result/ResultBanner";
import { ResultAnomalies } from "../components/result/ResultAnomalies";
import { ResultActions } from "../components/result/ResultActions";

export default function ResultPage() {
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
       fetch(`/api/reports/${taskId}`, { headers: { Authorization: `Bearer ${token}` } })
         .then(res => res.json())
         .then(data => {
            if (data.result) {
              setResult(data.result);
            } else {
              toast.error('找不到远端报告');
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
  }, [result, taskId, navigate, mode, token]);

  useEffect(() => {
    if (result && taskId && mode === 'local') {
       db.reports.put({
         id: taskId,
         result: result,
         createdAt: new Date()
       });
    }
  }, [result, taskId, mode]);

  if (loading || !result) return <div className="p-8 text-center text-stone-500">加载中...</div>;

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-500 max-w-4xl mx-auto py-8 px-4">
      
      <button 
        onClick={() => navigate("/")}
        className="flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-800 transition bg-stone-100/50 hover:bg-stone-100 px-4 py-2 rounded-full w-fit"
      >
        <ChevronLeft size={16} />
        返回主页
      </button>

      <ResultBanner criticalAlert={result.critical_alert} />

      {/* Main Overall Summary */}
      <div className="bg-[#fdfdfa] rounded-[32px] p-8 md:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#e5e5dd] relative overflow-hidden transition-all hover:shadow-md">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Activity size={160} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#f7f7f3] border border-[#e5e5dd] text-[#5a5a35] flex items-center justify-center shrink-0 shadow-inner">
               <Activity size={20} />
            </div>
            <h2 className="font-serif text-3xl font-medium text-stone-800">总览评估</h2>
          </div>
          <p className="text-stone-700 leading-[1.8] text-lg font-serif">
            {result.summary}
          </p>
        </div>
      </div>

      <ResultAnomalies indicators={result.abnormal_indicators} />

      <ResultActions doctorQuestions={result.doctor_questions} wechatMessage={result.wechat_message} />

      {/* Disclaimer */}
      <div className="text-center pt-8">
        <p className="text-[11px] text-stone-400 max-w-lg mx-auto leading-relaxed px-4">
          免责声明：本解读由 HealthMate AI 辅助生成，仅供家属参考了解病情背景，<span className="font-bold underline decoration-stone-300 underline-offset-2">绝不</span>作为最终疾病诊断和治疗的依据。请以线下实体医院专业医生的诊断为准。
        </p>
      </div>

      {mode === 'remote' && token && (
        <div className="bg-[#fffdf7] rounded-[32px] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#f5ebc3] mt-8 transition-all hover:shadow-md">
          <h3 className="font-serif font-medium text-xl text-yellow-900 mb-2 flex items-center gap-2">
            <Save size={20} className="text-yellow-600" /> 
            添加补充说明 (长期记忆录入)
          </h3>
          <p className="text-sm text-yellow-800/70 mb-6 leading-relaxed">您可以记录下目前的用药情况、老人的自觉感受等。这将被 AI 记住并在下次解读中参考趋势。</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              id="noteInput"
              placeholder="例如：这周开始每天吃半片降压药，感觉头晕有所缓解" 
              className="flex-grow px-5 py-3.5 rounded-full border border-yellow-200/60 outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 bg-white transition shadow-sm text-stone-700"
            />
            <button 
              onClick={async () => {
                const input = document.getElementById('noteInput') as HTMLInputElement;
                if (!input.value.trim()) return;
                try {
                  const r = await fetch('/api/notes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ report_id: taskId, content: input.value, family_member_id: result.family_member_id })
                  });
                  if (r.ok) {
                    toast.success('笔记已安全存入家庭医疗档案');
                    input.value = '';
                  } else {
                    toast.error('保存记录失败');
                  }
                } catch (e) {
                   toast.error('网络连接错误');
                }
              }}
              className="bg-yellow-500 text-white px-8 py-3.5 rounded-full font-medium hover:bg-yellow-600 transition shadow-sm whitespace-nowrap"
            >
              录入档案
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
