import { apiFetch } from '../../lib/api';
import { useCallback, useState, memo } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { UploadCloud, Camera, FileText, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";

export const UploadSection = memo(function UploadSection({ members, selectedMemberId, onSelectMember, isLoadingMembers }: { members: any[], selectedMemberId: string, onSelectMember: (id: string) => void, isLoadingMembers?: boolean }) {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const { t } = useTranslation();

  const onDrop = useCallback(async (acceptedFiles: File[], fileRejections: any[]) => {
    if (!token) {
       toast.error(t('upload.needLogin'));
       navigate('/login');
       return;
    }
    if (members.length === 0) {
       toast.error(t('upload.addFamilyFirst'));
       navigate('/family');
       return;
    }
    if (!selectedMemberId) {
       toast.error(t('upload.needFamily'));
       return;
    }

    if (fileRejections.length > 0) {
      if (fileRejections[0].errors[0].code === 'file-too-large') {
        toast.error(t('upload.fileTooLarge'));
      } else {
        toast.error(t('upload.unsupportedFormat'));
      }
      return;
    }

    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    await handleUpload(file);
  }, [token, members, selectedMemberId, navigate, t]);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("family_member_id", selectedMemberId);

    try {
      const res = await apiFetch("/api/reports/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) throw new Error(data.error || t('upload.uploadFailed'));
      navigate(`/process/${data.task_id}`);
    } catch (err: any) {
      toast.error(err.message || t('upload.uploadFailedRetry'));
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".png", ".jpg", ".webp"],
      "application/pdf": [".pdf"],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    noClick: !token || members.length === 0,
  });

  return (
    <div className="bg-[#fdfdfa] rounded-[32px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#e5e5dd] overflow-hidden relative group">
      <div className="p-6 border-b border-[#e5e5dd] bg-white/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#f7f7f3] text-[#5a5a35] flex items-center justify-center">
             <FileText size={18} />
          </div>
          <div>
             <h2 className="font-serif text-lg text-stone-800 font-medium">{t('upload.title')}</h2>
             <p className="text-xs text-stone-500">{t('upload.subtitle')}</p>
          </div>
        </div>
        
        {token && !isLoadingMembers && members.length > 0 && (
           <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm z-10 w-full md:w-auto">
             <select 
               value={selectedMemberId} 
               onChange={e => onSelectMember(e.target.value)}
               className="px-4 py-2 rounded-full border border-[#e5e5dd] bg-[#fdfdfa] font-medium text-stone-700 outline-none focus:ring-2 focus:ring-[#5a5a35]/30 cursor-pointer appearance-none text-center"
             >
               {members.map(m => (
                 <option key={m.id} value={m.id}>{t('upload.bindTo').replace('{{name}}', m.name)}</option>
               ))}
             </select>
           </div>
        )}
      </div>

      <div
        {...getRootProps()}
        className={`relative overflow-hidden p-8 md:p-16 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-500
          ${isDragActive ? "bg-[#f5f5f0]" : "hover:bg-[#f7f7f3]/50"}
          ${(!token || members.length === 0) ? "opacity-90" : ""}
        `}
      >
        <input {...getInputProps()} />
        
        {isUploading ? (
          <div className="flex flex-col items-center text-[#5a5a35] gap-4">
            <Loader2 className="w-12 h-12 animate-spin" />
            <div className="text-xl font-serif font-medium">{t('upload.interpreting')}</div>
            <p className="text-sm text-stone-500">{t('upload.interpretingDesc')}</p>
          </div>
        ) : isLoadingMembers ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#d5d5c5]" />
          </div>
        ) : (
          <div className="flex flex-col items-center max-w-md mx-auto">
             <div className="w-24 h-24 bg-[#ededdf] text-[#5a5a35] rounded-full flex items-center justify-center mb-8 shadow-sm relative group-hover:scale-105 transition-transform duration-500 ease-out">
                <UploadCloud size={36} strokeWidth={1.5} />
                <div className="absolute right-0 bottom-0 w-8 h-8 bg-[#fdfdfa] rounded-full shadow-sm flex items-center justify-center border border-[#e5e5dd]">
                  <Camera size={14} className="text-[#a8a86c]" />
                </div>
             </div>
             
             <h3 className="font-serif text-2xl text-stone-800 mb-3">{t('upload.clickOrDrag')}</h3>
             
             {(!token || members.length === 0) ? (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(token ? '/family' : '/login');
                  }}
                  className="mt-6 bg-[#5a5a35] text-white px-8 py-3 rounded-full font-medium shadow-sm hover:bg-[#4a4a2e] transition transform hover:-translate-y-0.5"
                >
                  <span className="flex items-center gap-2">
                     <Sparkles size={18} />
                     {token ? t('upload.addFamilyFirst') : t('upload.loginToStart')}
                  </span>
                </button>
             ) : (
                <>
                  <p className="text-stone-500 text-sm mb-8 leading-relaxed">
                    {t('upload.supportsText1')}
                    <br />
                    {t('upload.supportsText2')}
                  </p>
                  
                  <div className="flex flex-wrap justify-center items-center gap-3 text-[11px] font-medium text-stone-400 uppercase tracking-wider">
                     <span className="flex items-center gap-1.5 bg-white px-4 py-2 rounded-full border border-[#e5e5dd] shadow-sm">
                        <FileText size={14} /> {t('upload.security')}
                     </span>
                     <span className="flex items-center gap-1.5 bg-white px-4 py-2 rounded-full border border-[#e5e5dd] shadow-sm">
                        <Camera size={14} /> {t('upload.calibration')}
                     </span>
                  </div>
                </>
             )}
          </div>
        )}
      </div>
    </div>
  );
});

