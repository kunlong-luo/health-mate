import { apiFetch } from '../lib/api';
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pill, Plus, ArrowRight, AlertTriangle } from "lucide-react";
import dayjs from "dayjs";

export default function MedicationsPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: meds = [] } = useQuery({
    queryKey: ['medications'],
    queryFn: async () => {
      const res = await apiFetch('/api/medications', { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    },
    enabled: !!token
  });

  const [checkingInteraction, setCheckingInteraction] = useState(false);
  const [warnings, setWarnings] = useState<any[]>([]);

  const handleCheck = async () => {
    setCheckingInteraction(true);
    setWarnings([]);
    try {
      const allDrugNames = meds.map((m: any) => m.name);
      const res = await apiFetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
           messages: [{ role: 'user', content: `使用 check_drug_interaction 工具检查这些药物： ${allDrugNames.join(', ')}。请直接输出是否有严重冲突。` }]
        })
      });
      // Simplified response handling
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let outcome = "";
      while (reader) {
        const { value, done } = await reader.read();
        if (done) break;
        outcome += decoder.decode(value);
      }
      setWarnings([outcome]);
    } catch {}
    setCheckingInteraction(false);
  };

  return (
    <div className="animate-in fade-in py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl font-medium text-stone-800 flex items-center gap-2">
          <Pill className="text-[#5A5A40]" /> 用药管理
        </h2>
        <button onClick={handleCheck} disabled={checkingInteraction || meds.length < 2} className="px-4 py-2 bg-stone-100 text-[#5A5A40] rounded-full text-sm font-medium disabled:opacity-50">
          {checkingInteraction ? '检查中...' : '冲突排查'}
        </button>
      </div>

      {warnings.length > 0 && (
         <div className="bg-red-50 border border-red-200 p-4 rounded-2xl mb-6">
            <h3 className="text-red-700 font-medium flex items-center gap-2 mb-2"><AlertTriangle size={18} /> 发现潜在冲突提示</h3>
            <p className="text-sm text-red-600 whitespace-pre-wrap">{warnings[0]?.replace(/0:"/g, '').replace(/"/g, '').replace(/\\n/g, '\n')}</p>
         </div>
      )}

      {meds.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-100 shadow-sm">
           <Pill size={48} className="mx-auto text-stone-200 mb-4" />
           <p className="text-stone-500 font-medium">当前没有在吃的药</p>
        </div>
      ) : (
        <div className="space-y-4">
          {meds.map((m: any) => (
             <div key={m.id} className="bg-white p-5 rounded-3xl shadow-sm border border-stone-100">
               <div className="flex justify-between items-start mb-3">
                 <div>
                   <h3 className="font-medium text-lg text-stone-800">{m.name}</h3>
                   {m.generic_name && <p className="text-xs text-stone-500">{m.generic_name}</p>}
                 </div>
                 <span className="bg-green-50 text-green-700 text-[10px] px-2 py-1 rounded">在吃</span>
               </div>
               <div className="grid grid-cols-2 gap-2 text-sm text-stone-600 bg-stone-50 p-3 rounded-xl mb-3">
                 <div>剂量: {m.dosage}</div>
                 <div>频次: {m.frequency}</div>
               </div>
               {m.instructions && <div className="text-sm text-stone-500 mb-2">说明: {m.instructions}</div>}
               <button onClick={async () => {
                  await apiFetch(`/api/medications/${m.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ active: 0 })
                  });
                  queryClient.invalidateQueries({ queryKey: ['medications'] });
               }} className="text-sm text-stone-400 hover:text-red-500 transition">设为停药</button>
             </div>
          ))}
        </div>
      )}
    </div>
  );
}
