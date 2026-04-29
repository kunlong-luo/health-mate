import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Check, ShieldCheck, Sparkles, Server, Zap } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";

export default function PricingPage() {
  const { user, token, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const isPro = user?.is_pro === 1;

  const handleUpgrade = async () => {
    if (!token) {
      toast.error("请先登录");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/upgrade', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success("成功升级至 Pro！");
        if (user) {
          updateUser({ ...user, is_pro: 1 });
        }
      }
    } catch (e) {
      toast.error("网络错误");
    }
    setLoading(false);
  };

  return (
    <div className="py-8 px-4 animate-in fade-in max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-serif font-medium text-stone-800 mb-4">
          选择适合您的健康计划
        </h1>
        <p className="text-stone-500 text-lg">
          每一份陪伴都值得珍视。升级 Pro，解锁全平台守护体系。
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {/* Free Tier */}
        <div className="bg-white rounded-[32px] p-8 border border-stone-200 shadow-sm flex flex-col pt-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5">
             <Server size={100} />
          </div>
          <h2 className="text-2xl font-serif font-medium text-stone-800 mb-2">本地版</h2>
          <div className="text-4xl font-semibold mb-6 text-stone-800">
            免费<span className="text-base font-normal text-stone-500"> / 永远</span>
          </div>
          <p className="text-stone-500 mb-8 h-12">
            完整本地模型支持，无限制使用，您的数据留在您的设备上。
          </p>
          <ul className="space-y-4 flex-1 mb-8">
            {["不限数量添加家人", "无限次化验单OCR解读", "就诊日记 & 录音速记", "基础服药提醒与分析"].map((feature, i) => (
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
            您当前所在的版本
          </button>
        </div>

        {/* Pro Tier */}
        <div className="bg-[#1f201c] rounded-[32px] p-8 shadow-2xl flex flex-col pt-12 relative overflow-hidden border border-[#5A5A40]">
          <div className="absolute top-0 right-[-20px] p-6 opacity-10 text-[#e9edca]">
             <ShieldCheck size={140} />
          </div>
          
          <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#5A5A40] text-white px-4 py-1 rounded-b-xl text-sm font-medium flex items-center gap-1">
             <Sparkles size={14} /> 主推
          </div>

          <h2 className="text-2xl font-serif font-medium text-white mb-2">Pro 云端版</h2>
          <div className="text-4xl font-semibold mb-6 text-white flex items-baseline gap-2">
            ¥199 <span className="text-base font-normal text-stone-400"> / 终身买断</span>
          </div>
          <p className="text-stone-400 mb-8 h-12">
            解锁云端大模型，自动同步备份，享高阶分析与专人客服。
          </p>
          <ul className="space-y-4 flex-1 mb-8 relative z-10">
            {["全自动云端同步备份 (端到端加密)", "PDF 完整体检报告深度解析", "影像科报告智能提取", "年度健康报告 深度定制版", "优先专属产品客服"].map((feature, i) => (
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
            {isPro ? "已解锁 Pro 权限" : "立即买断升级"}
          </button>
        </div>
      </div>

      <div className="mt-16 text-center text-stone-400 text-sm">
        <p>支付即表示同意<a href="#" className="underline hover:text-stone-600 outline-none">《HealthMate 用户服务协议》</a>与<a href="#" className="underline hover:text-stone-600 outline-none">《隐私政策》</a></p>
        <p className="mt-2 text-xs">郑重承诺：7日内无理由退款 | 所有的医疗建议均需咨询专业医师</p>
      </div>
    </div>
  );
}
