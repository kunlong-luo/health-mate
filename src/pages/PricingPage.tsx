import { apiFetch } from '../lib/api';
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Check, ShieldCheck, Sparkles, Server, Zap } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

export default function PricingPage() {
  const { user, token, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const isPro = user?.is_pro === 1;

  const handleUpgrade = async () => {
    if (!token) {
      toast.error(t('pricing.loginFirst'));
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/upgrade', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t('pricing.upgradeSuccess'));
        if (user) {
          updateUser({ ...user, is_pro: 1 });
        }
      }
    } catch (e) {
      toast.error(t('pricing.networkError'));
    }
    setLoading(false);
  };

  return (
    <div className="py-8 px-4 animate-in fade-in max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-serif font-medium text-stone-800 mb-4">
          {t('pricing.title')}
        </h1>
        <p className="text-stone-500 text-lg">
          {t('pricing.subtitle')}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {/* Free Tier */}
        <div className="bg-white rounded-[32px] p-8 border border-stone-200 shadow-sm flex flex-col pt-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5">
             <Server size={100} />
          </div>
          <h2 className="text-2xl font-serif font-medium text-stone-800 mb-2">{t('pricing.localTitle')}</h2>
          <div className="text-4xl font-semibold mb-6 text-stone-800">
            {t('pricing.freeForever').split(' / ')[0]}<span className="text-base font-normal text-stone-500"> / {t('pricing.freeForever').split(' / ')[1]}</span>
          </div>
          <p className="text-stone-500 mb-8 h-12">
            {t('pricing.localDesc')}
          </p>
          <ul className="space-y-4 flex-1 mb-8">
            {[t('pricing.localFeature1'), t('pricing.localFeature2'), t('pricing.localFeature3'), t('pricing.localFeature4')].map((feature, i) => (
              <li key={i} className="flex gap-3 text-stone-700">
                <Check className="text-stone-300 shrink-0" size={20} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <button 
            disabled
            className="w-full py-4 rounded-xl bg-stone-100 text-stone-500 font-medium"
          >
            {t('pricing.currentPlan')}
          </button>
        </div>

        {/* Pro Tier */}
        <div className="bg-[#1f201c] rounded-[32px] p-8 shadow-2xl flex flex-col pt-12 relative overflow-hidden border border-[#5A5A40]">
          <div className="absolute top-0 right-[-20px] p-6 opacity-10 text-[#e9edca]">
             <ShieldCheck size={140} />
          </div>
          
          <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#5A5A40] text-white px-4 py-1 rounded-b-xl text-sm font-medium flex items-center gap-1">
             <Sparkles size={14} /> {t('pricing.recommended')}
          </div>

          <h2 className="text-2xl font-serif font-medium text-white mb-2">{t('pricing.proTitle')}</h2>
          <div className="text-4xl font-semibold mb-6 text-white flex items-baseline gap-2">
            ¥199 <span className="text-base font-normal text-stone-400">{t('pricing.lifetime')}</span>
          </div>
          <p className="text-stone-400 mb-8 h-12">
            {t('pricing.proDesc')}
          </p>
          <ul className="space-y-4 flex-1 mb-8 relative z-10">
            {[t('pricing.proFeature1'), t('pricing.proFeature2'), t('pricing.proFeature3'), t('pricing.proFeature4'), t('pricing.proFeature5')].map((feature, i) => (
              <li key={i} className="flex gap-3 text-stone-300">
                <Check className="text-[#e9edca] shrink-0" size={20} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          
          <button 
            onClick={handleUpgrade}
            disabled={isPro || loading}
            className={clsx(
              "w-full py-4 rounded-xl font-medium transition-all relative z-10 flex items-center justify-center gap-2",
              isPro 
                ? "bg-[#5A5A40]/50 text-white cursor-not-allowed" 
                : "bg-[#e9edca] text-[#2d2d20] hover:bg-white active:scale-[0.98]"
            )}
          >
            {loading ? <Zap className="animate-pulse" size={20} /> : null}
            {isPro ? t('pricing.unlocked') : t('pricing.upgradeNow')}
          </button>
        </div>
      </div>

      <div className="mt-16 text-center text-stone-400 text-sm">
        <p>{t('pricing.agreementPrefix')}<a href="#" className="underline hover:text-stone-600 outline-none">{t('pricing.agreement')}</a>{t('pricing.and')}<a href="#" className="underline hover:text-stone-600 outline-none">{t('pricing.privacy')}</a></p>
        <p className="mt-2 text-xs">{t('pricing.promise')}</p>
      </div>
    </div>
  );
}
