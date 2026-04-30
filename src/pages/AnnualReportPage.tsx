import { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { Download, ChevronRight, ChevronLeft, Heart } from "lucide-react";
import html2canvas from "html2canvas";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function AnnualReportPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const { t } = useTranslation();

  const bpData = useMemo(() => [
    { month: t('annual.jan'), sys: 145, dia: 90 },
    { month: t('annual.mar'), sys: 138, dia: 88 },
    { month: t('annual.jun'), sys: 142, dia: 89 },
    { month: t('annual.sep'), sys: 132, dia: 84 },
    { month: t('annual.dec'), sys: 128, dia: 82 },
  ], [t]);

  const pages = useMemo(() => [
    {
      title: t('annual.page1Title'),
      content: t('annual.page1Content'),
      highlight: t('annual.page1Highlight'),
      color: "bg-[#e8ecef]",
      textColor: "text-[#2d3a4b]"
    },
    {
      title: t('annual.page2Title'),
      content: t('annual.page2Content'),
      highlight: t('annual.page2Highlight'),
      color: "bg-[#f5eef0]",
      textColor: "text-[#6b4249]",
      hasChart: true
    },
    {
      title: t('annual.page3Title'),
      content: t('annual.page3Content'),
      highlight: t('annual.page3Highlight'),
      color: "bg-[#f9f5e3]",
      textColor: "text-[#5a4810]"
    },
    {
      title: t('annual.page4Title'),
      content: t('annual.page4Content'),
      highlight: t('annual.page4Highlight'),
      color: "bg-[#5A5A40]",
      textColor: "text-white"
    }
  ], [t]);

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
                      <Line type="monotone" name={t('annual.sys')} dataKey="sys" stroke="#d9777f" strokeWidth={3} dot={{r: 4}} />
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
