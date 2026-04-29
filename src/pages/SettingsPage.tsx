import { useState, useEffect } from "react";
import { Save, CheckCircle2, Cloud, Server, Loader2, Key, Crown, Globe } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const [provider, setProvider] = useState("gemini");
  const [model, setModel] = useState("gemini-2.5-flash");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isPro = user?.is_pro === 1;

  useEffect(() => {
    fetch("/api/settings/llm")
      .then(res => res.json())
      .then(data => {
        if (data.provider) setProvider(data.provider);
        if (data.model) setModel(data.model);
        if (data.apiKey) setApiKey(data.apiKey);
        if (data.baseUrl) setBaseUrl(data.baseUrl);
      });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiKey, model, baseUrl })
      });
      if (!res.ok) throw new Error("Save disabled/failed");
      toast.success("Settings saved");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/settings/llm/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiKey, model, baseUrl })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Connection test successful!");
        setTestResult(data.response);
      } else {
        toast.error("Test failed: " + data.error);
        setTestResult(data.error);
      }
    } catch (e: any) {
      toast.error("Network error: " + e.message);
      setTestResult(e.message);
    } finally {
      setIsTesting(false);
    }
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(nextLang);
    localStorage.setItem('app-language', nextLang);
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-lg mx-auto space-y-8 py-8 md:pb-20">
      
      {/* Account Settings */}
      <div>
        <h2 className="font-serif text-3xl font-medium text-stone-800 mb-6">{t('settings.account')}</h2>
        <div className="bg-[#fdfdfa] rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-[#e5e5dd] flex items-center justify-between transition-transform hover:scale-[1.01] duration-300">
          <div className="flex flex-col">
            <span className="font-serif text-lg font-medium text-stone-800">{user?.name || t('settings.notLoggedIn')}</span>
            <span className="text-sm text-stone-500 font-mono mt-0.5">{user?.email || user?.phone || ""}</span>
          </div>
          {isPro ? (
            <div className="bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 border border-yellow-500/20 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <Crown size={14} /> {t('settings.proMember')}
            </div>
          ) : (
            <button 
              onClick={() => navigate('/pricing')}
              className="bg-stone-800 hover:bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              {t('settings.upgradePro')}
            </button>
          )}
        </div>
      </div>

      {/* Language Toggle */}
      <div>
        <div className="flex items-center justify-between bg-[#fdfdfa] rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-[#e5e5dd]">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-[#f7f7f3] text-[#5a5a35] flex items-center justify-center">
               <Globe size={20} />
             </div>
             <span className="font-serif font-medium text-lg text-stone-800">{t('settings.language')}</span>
          </div>
          <button 
             onClick={toggleLanguage}
             className="px-5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-full font-medium transition"
          >
             {i18n.language === 'en' ? 'English' : '中文'}
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-6">
           <h2 className="font-serif text-3xl font-medium text-stone-800">{t('settings.modelEngine')}</h2>
        </div>
        <div className="bg-[#fdfdfa] rounded-[32px] p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-[#e5e5dd] space-y-8">
        
        {/* Mode Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#f7f7f3] rounded-full border border-[#e5e5dd]">
           <button 
             onClick={() => { setProvider("ollama"); setModel("qwen2.5:7b"); setBaseUrl("http://127.0.0.1:11434/v1"); }}
             className={`py-3 rounded-full flex items-center justify-center gap-2 text-sm font-medium transition-all duration-300 ${provider === "ollama" ? "bg-white text-stone-800 shadow-sm border border-[#e5e5dd]" : "text-stone-400 hover:text-stone-700"}`}
           >
             <Server size={16} /> {t('settings.localMode')}
           </button>
           <button 
             onClick={() => { setProvider("gemini"); setModel("gemini-2.5-flash"); setBaseUrl(""); }}
             className={`py-3 rounded-full flex items-center justify-center gap-2 text-sm font-medium transition-all duration-300 ${provider !== "ollama" ? "bg-[#5a5a35] text-white shadow-sm" : "text-stone-400 hover:text-stone-700"}`}
           >
             <Cloud size={16} /> {t('settings.cloudMode')}
           </button>
        </div>

        <div className="space-y-5 pt-2">
           {provider !== "ollama" && (
             <div>
               <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2 pl-4">{t('settings.provider')}</label>
               <select 
                 value={provider} 
                 onChange={e => setProvider(e.target.value)}
                 className="w-full bg-white border border-[#e5e5dd] rounded-full px-5 py-3.5 text-stone-700 outline-none focus:border-[#5a5a35] focus:ring-1 focus:ring-[#5a5a35] shadow-sm transition appearance-none cursor-pointer"
               >
                 <option value="gemini">Google Gemini AI</option>
                 <option value="deepseek">DeepSeek AI</option>
                 <option value="tongyi">Alibaba Qwen</option>
                 <option value="claude">Anthropic Claude</option>
               </select>
             </div>
           )}

           <div>
             <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2 pl-4">{t('settings.modelName')}</label>
             <input 
               type="text" 
               value={model} 
               onChange={e => setModel(e.target.value)}
               className="w-full bg-white border border-[#e5e5dd] rounded-full px-5 py-3.5 text-stone-700 outline-none focus:border-[#5a5a35] focus:ring-1 focus:ring-[#5a5a35] shadow-sm transition"
               placeholder="qwen2.5:7b / gemini-2.5-flash"
             />
           </div>

           {(provider === "ollama" || provider === "tongyi" || provider === "deepseek") && (
             <div>
               <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2 pl-4">{t('settings.endpoint')}</label>
               <input 
                 type="text" 
                 value={baseUrl} 
                 onChange={e => setBaseUrl(e.target.value)}
                 className="w-full bg-white border border-[#e5e5dd] rounded-full px-5 py-3.5 text-stone-700 outline-none focus:border-[#5a5a35] focus:ring-1 focus:ring-[#5a5a35] shadow-sm transition font-mono text-sm"
                 placeholder="API Endpoint"
               />
             </div>
           )}

           {provider !== "ollama" && (
             <div>
               <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2 pl-4">{t('settings.apiKey')}</label>
               <div className="relative">
                 <Key size={16} className="absolute left-5 top-4 text-stone-400" />
                 <input 
                   type="password" 
                   value={apiKey} 
                   onChange={e => setApiKey(e.target.value)}
                   className="w-full bg-white border border-[#e5e5dd] rounded-full pl-12 pr-5 py-3.5 text-stone-700 outline-none focus:border-[#5a5a35] focus:ring-1 focus:ring-[#5a5a35] shadow-sm transition font-mono text-sm"
                   placeholder={provider === "gemini" ? t('settings.apiKeyPlaceholder') : "sk-..."}
                 />
               </div>
               <p className="text-[11px] text-stone-400 mt-3 pl-4 leading-relaxed">{t('settings.apiKeyDesc')} {provider === "gemini" && t('settings.systemDefault')}</p>
             </div>
           )}
        </div>

        <div className="flex gap-4 pt-6 border-t border-[#e5e5dd]">
           <button 
             onClick={handleTest}
             disabled={isTesting}
             className="flex-[2] bg-[#f7f7f3] hover:bg-[#ededdf] text-stone-600 py-3.5 rounded-full font-medium transition flex items-center justify-center gap-2 border border-[#e5e5dd]"
           >
             {isTesting ? <Loader2 size={18} className="animate-spin" /> : t('settings.testConnection')}
           </button>
           
           <button 
             onClick={handleSave}
             disabled={isSaving}
             className="flex-[3] bg-[#5a5a35] hover:bg-[#4a4a2e] text-white py-3.5 rounded-full font-medium transition flex items-center justify-center gap-2 shadow-sm"
           >
             {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
             {t('settings.saveConfig')}
           </button>
        </div>

        {testResult && (
          <div className="mt-6 p-5 bg-[#f7f7f3] border border-[#e5e5dd] rounded-[24px] text-xs text-stone-600 font-mono break-all relative shadow-inner">
            <span className="absolute -top-3 left-6 inline-flex bg-white px-3 py-1 rounded-full font-sans text-stone-400 border border-[#e5e5dd] font-semibold uppercase tracking-wider text-[10px] shadow-sm">Response Trace</span>
            <div className="mt-2 text-sm leading-relaxed overflow-x-auto">
              {testResult}
            </div>
          </div>
        )}
        </div>
      </div>

      <button
        onClick={() => { logout(); navigate("/login"); }}
        className="w-full bg-[#fdfdfa] hover:bg-[#f7f7f3] text-stone-500 hover:text-stone-800 border border-[#e5e5dd] shadow-[0_2px_8px_rgba(0,0,0,0.02)] py-4 rounded-full font-medium transition-colors flex items-center justify-center"
      >
        {t('settings.logout')}
      </button>
    </div>
  );
}
