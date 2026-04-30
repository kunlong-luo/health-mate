import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ResultBanner({ criticalAlert }: { criticalAlert?: string }) {
  const { t } = useTranslation();
  if (!criticalAlert || criticalAlert === "null") return null;
  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-start gap-3 shadow-sm">
      <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" />
      <div>
        <h3 className="font-bold text-red-800 mb-1">{t('result.criticalAlertTitle')}</h3>
        <p className="text-red-700 text-sm leading-relaxed">
          {criticalAlert}
        </p>
        <a href="tel:120" className="inline-block mt-3 bg-red-500 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-red-600 transition shadow-sm">
          {t('result.callEmergency')}
        </a>
      </div>
    </div>
  );
}
