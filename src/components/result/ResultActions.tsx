import { HelpCircle, MessageCircle, Copy } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export function ResultActions({ doctorQuestions, wechatMessage }: { doctorQuestions: string[], wechatMessage: string }) {
  const { t } = useTranslation();
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t('result.copySuccess'));
  };

  return (
    <div className="grid md:grid-cols-2 gap-4 pt-4">
      {/* Doctor Questions */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-4 text-[#5A5A40]">
          <HelpCircle size={20} />
          <h3 className="font-medium">{t('result.docQuestionsTitle')}</h3>
        </div>
        <p className="text-xs text-stone-400 mb-4">{t('result.docQuestionsDesc')}</p>
        <ul className="space-y-3 flex-grow">
          {doctorQuestions?.map((q: string, i: number) => (
            <li key={i} className="flex gap-2 text-sm text-stone-700 bg-stone-50 p-3 rounded-xl">
               <span className="text-stone-300 font-bold">{i+1}.</span> {q}
            </li>
          ))}
        </ul>
      </div>

      {/* WeChat Message */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2 text-[#5A5A40]">
            <MessageCircle size={20} />
            <h3 className="font-medium">{t('result.msgForDocTitle')}</h3>
          </div>
          <button 
            onClick={() => handleCopy(wechatMessage)}
            className="p-2 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-800 transition"
            title={t('result.msgForDocCopy')}
          >
            <Copy size={16} />
          </button>
        </div>
        <p className="text-xs text-stone-400 mb-4">{t('result.msgForDocDesc')}</p>
        <div className="bg-green-50/50 border border-green-100 p-4 rounded-2xl flex-grow text-sm text-stone-700 whitespace-pre-wrap leading-relaxed relative">
          {wechatMessage}
        </div>
      </div>
    </div>
  );
}
