import { useTranslation } from "react-i18next";

export function ResultAnomalies({ indicators }: { indicators: any[] }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-stone-800 flex items-center gap-2 pl-2">
         {t('result.abnormalAnalysis')} <span className="text-sm font-normal text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">{indicators?.length || 0}{t('result.items')}</span>
      </h3>
      
      {!indicators || indicators.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 text-center text-stone-500 border border-stone-100">
          {t('result.noAbnormal')}
        </div>
      ) : (
        indicators.map((item: any, idx: number) => (
          <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h4 className="font-bold text-lg text-stone-800">{item.name}</h4>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-baseline gap-1">
                     <span className="text-sm text-stone-500">{t('result.detectedValue')}</span>
                     <span className={`text-xl font-bold ${item.value > Number(item.range?.split("-")[1]) ? "text-red-500" : item.value < Number(item.range?.split("-")[0]) ? "text-blue-500" : "text-[#5A5A40]"}`}>
                       {item.value}
                     </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                     <span className="text-sm text-stone-500">{t('result.refRange')}</span>
                     <span className="text-sm font-mono text-stone-400">{item.range}</span>
                  </div>
                </div>
              </div>
              <div className="text-xs font-medium px-3 py-1 bg-amber-50 text-amber-700 rounded-full w-fit">
                 {t('result.needsAttention')}
              </div>
            </div>
            <div className="bg-[#fcfcfb] rounded-xl p-4 text-stone-600 text-sm leading-relaxed border border-stone-100">
              {item.explanation}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
