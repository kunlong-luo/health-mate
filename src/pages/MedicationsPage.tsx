import { apiFetch } from '../lib/api';
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pill, Plus, ArrowRight, AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";
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
  
  const { data: familyMembers = [] } = useQuery({
    queryKey: ['familyMembers'],
    queryFn: async () => {
      const res = await apiFetch('/api/family', { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    },
    enabled: !!token
  });

  const [checkingInteraction, setCheckingInteraction] = useState(false);
  const [warnings, setWarnings] = useState<any[]>([]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMed, setNewMed] = useState({
    family_member_id: '',
    name: '',
    generic_name: '',
    dosage: '',
    frequency: '',
    instructions: ''
  });

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
      if (reader) {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          outcome += decoder.decode(value);
        }
      }
      setWarnings([outcome]);
    } catch {}
    setCheckingInteraction(false);
  };
  
  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMed.family_member_id || !newMed.name) {
      toast.error('请选择用药家人并填写药物名称');
      return;
    }
    
    try {
      const res = await apiFetch('/api/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newMed)
      });
      if (res.ok) {
        toast.success("已添加药物");
        setShowAddModal(false);
        setNewMed({
          family_member_id: '',
          name: '',
          generic_name: '',
          dosage: '',
          frequency: '',
          instructions: ''
        });
        queryClient.invalidateQueries({ queryKey: ['medications'] });
      } else {
        toast.error("添加失败");
      }
    } catch (e) {
      toast.error("网络错误");
    }
  };

  return (
    <div className="animate-in fade-in py-6 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative">
        <h2 className="font-serif text-2xl font-medium text-stone-800 flex items-center gap-2">
          <Pill className="text-[#5A5A40]" /> 用药管理
        </h2>
        <div className="flex gap-2">
          <button onClick={handleCheck} disabled={checkingInteraction || meds.length < 2} className="px-4 py-2 bg-stone-100 text-[#5A5A40] rounded-full text-sm font-medium disabled:opacity-50 transition">
            {checkingInteraction ? '检查中...' : '冲突排查'}
          </button>
          <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-[#5A5A40] hover:bg-[#4a4a2e] text-white rounded-full text-sm font-medium transition flex items-center gap-1 shadow-sm">
            <Plus size={16} /> 添加药物
          </button>
        </div>
      </div>
      
      {showAddModal && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#fdfdfa] w-full max-w-md rounded-3xl p-6 shadow-xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:bg-stone-100 rounded-full transition"
            >
              <X size={20} />
            </button>
            <h3 className="font-serif text-xl font-medium mb-6">添加新药</h3>
            
            <form onSubmit={handleAddMedication} className="space-y-4">
              <div>
                <label className="text-xs text-stone-500 font-medium uppercase tracking-wider block mb-1">为谁添加</label>
                <select 
                  value={newMed.family_member_id}
                  onChange={(e) => setNewMed({...newMed, family_member_id: e.target.value})}
                  className="w-full bg-white border border-[#e5e5dd] focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] rounded-xl px-4 py-2.5 outline-none transition cursor-pointer"
                  required
                >
                  <option value="">请选择家人</option>
                  {familyMembers.map((fm: any) => (
                    <option key={fm.id} value={fm.id}>{fm.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-xs text-stone-500 font-medium uppercase tracking-wider block mb-1">药品名称 *</label>
                <input 
                  type="text"
                  value={newMed.name}
                  onChange={(e) => setNewMed({...newMed, name: e.target.value})}
                  placeholder="如：立普妥"
                  className="w-full bg-white border border-[#e5e5dd] focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] rounded-xl px-4 py-2.5 outline-none transition"
                  required
                />
              </div>
              
              <div>
                <label className="text-xs text-stone-500 font-medium uppercase tracking-wider block mb-1">通用名 (选填)</label>
                <input 
                  type="text"
                  value={newMed.generic_name}
                  onChange={(e) => setNewMed({...newMed, generic_name: e.target.value})}
                  placeholder="如：阿托伐他汀钙片"
                  className="w-full bg-white border border-[#e5e5dd] focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] rounded-xl px-4 py-2.5 outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-stone-500 font-medium uppercase tracking-wider block mb-1">剂量</label>
                  <input 
                    type="text"
                    value={newMed.dosage}
                    onChange={(e) => setNewMed({...newMed, dosage: e.target.value})}
                    placeholder="如：20mg"
                    className="w-full bg-white border border-[#e5e5dd] focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] rounded-xl px-4 py-2.5 outline-none transition"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-500 font-medium uppercase tracking-wider block mb-1">用药频次</label>
                  <input 
                    type="text"
                    value={newMed.frequency}
                    onChange={(e) => setNewMed({...newMed, frequency: e.target.value})}
                    placeholder="如：一天一次"
                    className="w-full bg-white border border-[#e5e5dd] focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] rounded-xl px-4 py-2.5 outline-none transition"
                  />
                </div>
              </div>
              
              <button type="submit" className="w-full py-3 mt-4 bg-[#5A5A40] hover:bg-[#4a4a2e] text-white rounded-xl font-medium transition shadow-sm">
                保存
              </button>
            </form>
          </div>
        </div>
      )}

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {meds.map((m: any) => {
             const familyMember = familyMembers.find((f: any) => f.id === m.family_member_id);
             return (
               <div key={m.id} className="bg-white p-5 rounded-3xl shadow-sm border border-stone-100 flex flex-col justify-between">
                 <div>
                   <div className="flex justify-between items-start mb-3">
                     <div>
                       <h3 className="font-medium text-lg text-stone-800 flex items-center gap-2">
                         {m.name}
                       </h3>
                       {m.generic_name && <p className="text-xs text-stone-500 mb-1">{m.generic_name}</p>}
                       {familyMember && (
                         <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded-full inline-block mt-1">
                           服用者: {familyMember.avatar_emoji} {familyMember.name}
                         </span>
                       )}
                     </div>
                     <span className="bg-green-50 text-green-700 text-[10px] px-2 py-1 rounded">在吃</span>
                   </div>
                   <div className="grid grid-cols-2 gap-2 text-sm text-stone-600 bg-stone-50 p-3 rounded-xl mb-3">
                     <div>剂量: {m.dosage || '-'}</div>
                     <div>频次: {m.frequency || '-'}</div>
                   </div>
                   {m.instructions && <div className="text-sm text-stone-500 mb-2">说明: {m.instructions}</div>}
                 </div>
                 <div className="flex justify-end pt-2 mt-auto">
                   <button onClick={async () => {
                      await apiFetch(`/api/medications/${m.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ active: 0 })
                      });
                      queryClient.invalidateQueries({ queryKey: ['medications'] });
                   }} className="text-xs text-stone-400 hover:text-red-500 font-medium transition cursor-pointer px-3 py-1.5 hover:bg-red-50 inline-block rounded-full">设为停药</button>
                 </div>
               </div>
             );
          })}
        </div>
      )}
    </div>
  );
}
