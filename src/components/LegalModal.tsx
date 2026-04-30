import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, ShieldAlert } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LegalModal({ isOpen, onClose }: LegalModalProps) {
  const { t } = useTranslation();

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-xl relative animate-in zoom-in-95 duration-200 border border-stone-100 flex flex-col max-h-[85vh]">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-stone-400 hover:text-stone-700 transition"
        >
          <X size={24} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-700">
            <ShieldAlert size={24} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-800">
            {t('legal.disclaimer')}
          </h2>
        </div>

        <div className="overflow-y-auto pr-2 space-y-6 text-stone-600 flex-1">
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-stone-800">{t('legal.terms')}</h3>
            <p className="leading-relaxed text-sm bg-red-50 text-red-800 p-4 rounded-2xl">
              {t('legal.medicalDisclaimer')}
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-stone-800">{t('legal.privacy')}</h3>
            <p className="leading-relaxed text-sm bg-stone-50 border border-stone-100 p-4 rounded-2xl text-stone-700">
              {t('legal.privacyDetail')}
            </p>
          </section>
        </div>

        <div className="mt-8 pt-4 border-t border-stone-100">
          <button
            onClick={onClose}
            className="w-full py-4 bg-stone-900 text-white rounded-2xl font-medium hover:bg-black transition shadow-sm"
          >
            {t('legal.accept')}
          </button>
        </div>
      </div>
    </div>
  );
}
