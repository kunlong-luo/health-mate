import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Stethoscope, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import * as htmlToImage from "html2canvas";

export default function PrepareVisitPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [memberId, setMemberId] = useState("");
  const [complaint, setComplaint] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const { data: members = [] } = useQuery({
    queryKey: ['family'],
    queryFn: async () => {
      if (!token) return [];
      const res = await fetch('/api/family', { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    },
    enabled: !!token
  });

  const handlePrepare = async () => {
    if (!memberId || !complaint) return toast.error("请选择家人并填写就诊原因");
    setLoading(true);
    try {
       const res = await fetch('/api/chat/stream', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
         body: JSON.stringify({
           family_member_id: memberId,
           messages: [{ role: 'user', content: `我想为家人准备就诊，主要症状/主诉：${complaint}。请直接给出应该挂哪个科室（带理由）、需要带哪些资料，以及我该问医生的8个核心问题结构化输出。` }]
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
      toast.error("生成失败请重试");
    }
    setLoading(false);
  };

  const handleSaveAppt = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          family_member_id: memberId,
          complaint,
          questions_generated: result
        })
      });
      if (res.ok) {
        toast.success("已保存为就诊任务");
        navigate('/visits');
      }
    } catch {
      toast.error("保存失败");
    }
  };

  const handleDownloadImage = () => {
    const el = document.getElementById("visit-prep-card");
    if (!el) return;
    htmlToImage.default(el).then(canvas => {
      const link = document.createElement("a");
      link.download = "就诊指南.png";
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
        <h2 className="font-serif text-2xl font-medium text-stone-800">陪爸妈看病</h2>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-stone-600 mb-2">给谁看病？</label>
          <select 
            value={memberId} 
            onChange={e => setMemberId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-stone-50 border-none outline-none focus:ring-2 focus:ring-[#5A5A40]"
          >
            <option value="">请选择家人</option>
            {members.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-600 mb-2">主要症状 / 疑惑</label>
          <textarea 
            value={complaint}
            onChange={e => setComplaint(e.target.value)}
            placeholder="例如：妈妈最近老说膝盖疼，坐久了起来困难"
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
          {loading ? "AI 专家推理中..." : "生成看病攻略"}
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
          <div className="flex gap-3">
             <button onClick={handleDownloadImage} className="flex-1 py-3 bg-white border border-stone-200 rounded-xl font-medium text-stone-600">保存为长图</button>
             <button onClick={() => { navigator.clipboard.writeText(result); toast.success("已复制"); }} className="flex-1 py-3 bg-white border border-stone-200 rounded-xl font-medium text-stone-600">复制发微信</button>
             <button onClick={handleSaveAppt} className="flex-1 py-3 bg-[#5A5A40] text-white rounded-xl font-medium flex items-center justify-center gap-2">
               <Save size={16} /> 存为任务
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
