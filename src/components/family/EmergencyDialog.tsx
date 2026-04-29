import { AlertTriangle, PhoneCall } from 'lucide-react';

export function EmergencyDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] p-6 w-full max-w-sm flex flex-col gap-4 animate-in zoom-in-95 duration-200 shadow-2xl">
         <div className="flex items-center gap-2 text-red-600 mb-2">
             <AlertTriangle size={24} />
             <h3 className="font-medium text-xl">紧急救助</h3>
         </div>
         <a href="tel:120" className="w-full py-4 bg-red-600 text-white rounded-2xl font-medium text-center text-lg flex items-center justify-center gap-2 shadow-sm">
           <PhoneCall size={20} /> 拨打 120 急救中心
         </a>
         <a href="tel:" className="w-full py-3 bg-stone-100 text-stone-800 rounded-xl font-medium text-center flex items-center justify-center gap-2">
           联系其他家属
         </a>
         <a href="https://uri.amap.com/search?keyword=急诊" target="_blank" className="w-full py-3 bg-stone-100 text-stone-800 rounded-xl font-medium text-center flex items-center justify-center gap-2">
           通过地图查看附近急诊
         </a>
         <button onClick={onClose} className="w-full py-3 mt-2 text-stone-500 text-sm font-medium">取消并返回</button>
      </div>
    </div>
  );
}
