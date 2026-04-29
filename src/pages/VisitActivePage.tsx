import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Edit3, Camera, HelpCircle, CheckCircle2, Circle, Mic, MicOff } from "lucide-react";
import { toast } from "sonner";
import clsx from "clsx";

export default function VisitActivePage() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [note, setNote] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Web Speech API
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'zh-CN';

      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setNote(prev => prev + ' ' + transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      if (recognitionRef.current) {
        setNote(""); // clear previous before new dictation (optional)
        recognitionRef.current.start();
        setIsRecording(true);
        toast.info("开始录音，记录医生对话");
      } else {
        toast.error("您的浏览器不支持语音识别");
      }
    }
  };

  const { data: visit, refetch } = useQuery({
    queryKey: ['visit', id],
    queryFn: async () => {
      const res = await fetch(`/api/visits/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    },
    enabled: !!token && !!id
  });

  const handleSaveNote = async () => {
    if (!note) return;
    setIsRecording(false);
    recognitionRef.current?.stop();
    toast.info("正在智能整理并提取医嘱...");
    try {
      await fetch(`/api/visits/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: note })
      });
      toast.success("医嘱已自动浓缩为结构化笔记");
      setNote("");
      refetch();
    } catch {
      toast.error("保存失败");
    }
  };

  if (!visit) return null;

  return (
    <div className="max-w-xl mx-auto py-6 px-4 min-h-screen bg-stone-900 text-stone-100 flex flex-col -m-4 sm:m-auto sm:rounded-3xl sm:-min-h-0 sm:h-[800px] overflow-hidden">
      {/* Dark mode specialized for active hospital visit */}
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 bg-stone-800 rounded-full text-stone-300">
          <ArrowLeft size={18} />
        </button>
        <h2 className="font-serif text-xl font-medium">就诊进行中</h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pb-20">
        <div className="bg-stone-800/50 p-5 rounded-2xl">
          <h3 className="text-stone-400 text-sm mb-2">本次主诉</h3>
          <p>{visit.complaint}</p>
        </div>

        <div className="bg-stone-800/50 p-5 rounded-2xl">
          <h3 className="text-stone-400 text-sm mb-3">要问医生的核心问题</h3>
          <div className="space-y-3">
             <div className="text-sm whitespace-pre-wrap text-stone-300">
               {visit.questions_generated?.replace(/0:"/g, '').replace(/"/g, '').replace(/\\n/g, '\n')}
             </div>
          </div>
        </div>

        {visit.notes?.length > 0 && (
          <div className="bg-stone-800/50 p-5 rounded-2xl">
            <h3 className="text-stone-400 text-sm mb-2">我的笔记 / 智能提取</h3>
            {visit.notes.map((n: any) => (
              <div key={n.id} className="text-sm border-b border-stone-700 pb-2 mb-2 last:border-0 last:mb-0 last:pb-0">{n.content}</div>
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 pt-4 grid grid-cols-2 gap-3 pb-6">
         <div className="col-span-2 relative flex flex-col gap-2">
            <textarea 
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="记录医生说的话，或点击录音由AI整理..."
              className="w-full h-24 bg-stone-800 text-stone-100 px-4 py-3 rounded-xl outline-none focus:ring-1 focus:ring-stone-600 resize-none text-sm"
            />
            <div className="flex justify-between items-center px-1">
              <button 
                onClick={toggleRecording} 
                className={clsx(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors",
                  isRecording ? "bg-red-500/20 text-red-400" : "bg-stone-700 text-stone-300"
                )}
              >
                {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                {isRecording ? "停止录音" : "语音输入"}
              </button>
              <button onClick={handleSaveNote} className="bg-[#5A5A40] text-white px-4 py-1.5 rounded-lg text-sm font-medium">整理并保存</button>
            </div>
         </div>
         <button className="bg-blue-900/30 text-blue-300 border border-blue-800 p-4 rounded-xl flex flex-col justify-center items-center gap-2" onClick={() => fileInputRef.current?.click()}>
            <Camera size={24} />
            <span className="text-sm">拍处方解读</span>
         </button>
         <button onClick={() => navigate('/medications')} className="bg-green-900/30 text-green-300 border border-green-800 p-4 rounded-xl flex flex-col justify-center items-center gap-2">
            <CheckCircle2 size={24} />
            <span className="text-sm">完成并用药</span>
         </button>
         <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={(e) => {
            if(e.target.files?.[0]) {
               toast.info("已提交识图大模型分析... (Demo)");
               setTimeout(() => navigate('/medications'), 1000);
            }
         }} />
      </div>
    </div>
  );
}
