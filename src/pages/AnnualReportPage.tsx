import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Download, ChevronRight, ChevronLeft, Heart } from "lucide-react";
import html2canvas from "html2canvas";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";

const bpData = [
  { month: '1月', sys: 145, dia: 90 },
  { month: '3月', sys: 138, dia: 88 },
  { month: '6月', sys: 142, dia: 89 },
  { month: '9月', sys: 132, dia: 84 },
  { month: '12月', sys: 128, dia: 82 },
];

export default function AnnualReportPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(0);

  const pages = [
    {
      title: "陪伴开始的地方",
      content: `2025年，你一共帮爸妈看了 14 次报告\n相当于平均每个月都跑了一趟医院。`,
      highlight: "辛苦了，HealthMate都记着呢。",
      color: "bg-[#e8ecef]",
      textColor: "text-[#2d3a4b]"
    },
    {
      title: "妈妈的坚持",
      content: "妈妈的血压指标改善了 12%\n收缩压从高危回落到了安全区间。",
      highlight: "这是你们共同努力的结果。",
      color: "bg-[#f5eef0]",
      textColor: "text-[#6b4249]",
      hasChart: true
    },
    {
      title: "一点点小危机",
      content: "10月的时候，爸爸的甘油三酯有点偏高\n不过你在两周后就带他去复查了。",
      highlight: "防患于未然，你是他们的健康守门人。",
      color: "bg-[#f9f5e3]",
      textColor: "text-[#5a4810]"
    },
    {
      title: "年度总结",
      content: `你陪伴爸妈的一年\n有焦虑，有奔波，但更多的是安心。`,
      highlight: "2026年，我们继续同行。❤️",
      color: "bg-[#5A5A40]",
      textColor: "text-white"
    }
  ];

  const handleExport = async () => {
    const el = document.getElementById("report-card");
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 2 });
    const link = document.createElement("a");
    link.download = "healthmate-annual-report.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center sm:p-4">
      <div 
        id="report-card" 
        className={`w-full max-w-md h-full sm:h-[800px] sm:rounded-[40px] flex flex-col justify-between py-16 px-10 transition-colors duration-500 relative overflow-hidden ${pages[page].color}`}
      >
        <AnimatePresence mode="wait">
          <motion.div 
            key={page}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex flex-col justify-center"
          >
             <h2 className={`text-4xl font-serif font-medium mb-12 ${pages[page].textColor}`}>
               {pages[page].title}
             </h2>
             
             {pages[page].hasChart && (
                <div className="h-48 w-full mb-8 bg-white/40 rounded-2xl p-4 backdrop-blur-sm">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={bpData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.1)" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6b4249', fontSize: 12}} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', background: 'rgba(255,255,255,0.9)' }} />
                      <Line type="monotone" name="收缩压" dataKey="sys" stroke="#d9777f" strokeWidth={3} dot={{r: 4}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
             )}

             <p className={`text-xl leading-relaxed whitespace-pre-wrap mb-10 ${pages[page].textColor} opacity-90`}>
               {pages[page].content}
             </p>
             <p className={`text-2xl font-serif italic ${pages[page].textColor}`}>
               {pages[page].highlight}
             </p>
          </motion.div>
        </AnimatePresence>
        
        {page === pages.length - 1 && (
           <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="absolute top-12 right-10 z-10">
             <button onClick={handleExport} className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition">
               <Download size={20} />
             </button>
           </motion.div>
        )}

        <div className="flex justify-between items-center absolute bottom-12 left-10 right-10">
           <button 
             onClick={() => setPage(Math.max(0, page - 1))} 
             className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${page === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'} ${pages[page].textColor} border-current`}
           >
             <ChevronLeft size={24} />
           </button>

           <div className="flex gap-2">
             {pages.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === page ? 'bg-current opacity-100 scale-125' : 'bg-current opacity-20'} ${pages[page].textColor}`} />
             ))}
           </div>

           <button 
             onClick={() => setPage(Math.min(pages.length - 1, page + 1))} 
             className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${page === pages.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'} ${pages[page].textColor} border-current`}
           >
             <ChevronRight size={24} />
           </button>
        </div>
        
        {/* Close button top left */}
        <button className="absolute top-12 left-10 text-xl font-medium z-10" style={{color: pages[page].textColor === 'text-white' ? 'white' : 'black'}} onClick={() => window.history.back()}>
          ✕
        </button>
      </div>
    </div>
  );
}
