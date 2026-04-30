import { AlertTriangle, PhoneCall } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function EmergencyDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] p-6 w-full max-w-sm flex flex-col gap-4 animate-in zoom-in-95 duration-200 shadow-2xl">
         <div className="flex items-center gap-2 text-red-600 mb-2">
             <AlertTriangle size={24} />
             <h3 className="font-medium text-xl">{t('emergency.title')}</h3>
         </div>
         <a href="tel:120" className="w-full py-4 bg-red-600 text-white rounded-2xl font-medium text-center text-lg flex items-center justify-center gap-2 shadow-sm">
           <PhoneCall size={20} /> {t('emergency.call')}
         </a>
         <a href="tel:" className="w-full py-3 bg-stone-100 text-stone-800 rounded-xl font-medium text-center flex items-center justify-center gap-2">
           {t('emergency.contactFamily')}
         </a>
         <a href="https://uri.amap.com/search?keyword=急诊" target="_blank" className="w-full py-3 bg-stone-100 text-stone-800 rounded-xl font-medium text-center flex items-center justify-center gap-2">
           {t('emergency.viewMap')}
         </a>
         <button onClick={onClose} className="w-full py-3 mt-2 text-stone-500 text-sm font-medium">{t('emergency.cancel')}</button>
      </div>
    </div>
  );
}
