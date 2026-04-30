import { apiFetch } from '../lib/api';
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createParser } from "eventsource-parser";
import { CheckCircle2, Loader2, Wrench, BrainCircuit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from 'react-i18next';

interface AgentEvent {
  type: "step_start" | "tool_call" | "tool_result" | "step_complete" | "thinking" | "final" | "error";
  data: any;
}

export default function AgentProcessPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const { t } = useTranslation();

  const verifyAttempted = useRef(false);

  useEffect(() => {
    if (!taskId) return;

    setEvents([]);
    setIsFinished(false);

    const abortController = new AbortController();
    let finalJsonResult: any = null;

    const fetchStream = async () => {
      try {
        const res = await apiFetch(`/api/reports/stream/${taskId}`, {
          signal: abortController.signal
        });
        if (!res.ok) {
          setEvents((prev) => [...prev, { type: "error", data: { message: "Failed to connect to agent." } }]);
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) return;

        const decoder = new TextDecoder();
        
        let currentEventStr = "";

        const parser = createParser({
          onEvent: (event) => {
            try {
              const data = JSON.parse(event.data);
              setEvents((prev) => [...prev, { type: event.event as any, data }]);
              
              if (event.event === "final") {
                  finalJsonResult = data.result_json;
              } else if (event.event === "error") {
                  setIsFinished(true);
              }
            } catch (e) {
              console.error("Failed to parse event data", e);
            }
          }
        });

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          parser.feed(decoder.decode(value, { stream: true }));
        }
        
        if (!abortController.signal.aborted) {
            setIsFinished(true);
            if (finalJsonResult) {
                setTimeout(() => {
                    navigate(`/result/${taskId}${token ? '?mode=remote' : ''}`, { state: { result: finalJsonResult } });
                }, 1500);
            }
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log('Fetch aborted');
        } else {
          console.error(err);
        }
      }
    };

    fetchStream();

    return () => {
      abortController.abort();
    };
  }, [taskId, navigate, token]);

  const renderError = () => {
    const errorEvent = events.find(e => e.type === 'error');
    if (!errorEvent) return null;
    return (
      <div className="text-center mt-8">
         <button onClick={() => navigate('/')} className="bg-stone-800 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-stone-700 transition">
           {t('agent.backHome')}
         </button>
      </div>
    );
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="mb-8 text-center space-y-2">
        <h2 className="font-serif text-2xl font-medium text-stone-800">
          {t('agent.thinking')}
        </h2>
        <p className="text-stone-500 text-sm">
          {t('agent.subtitle')}
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-stone-100">
        <div className="space-y-6">
          <AnimatePresence>
            {events.filter((evt, i, arr) => evt.type !== 'error' || arr.findIndex(e => e.type === 'error') === i).map((evt, idx) => (
              <EventRow key={idx} event={evt} isLast={idx === events.length - 1} t={t} />
            ))}
          </AnimatePresence>
          
          {!isFinished && !events.some(e => e.type === 'error') && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="flex items-center gap-3 text-stone-400 mt-4"
            >
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm font-medium">{t('agent.reasoning')}</span>
            </motion.div>
          )}
        </div>
      </div>
      
      {renderError()}
    </div>
  );
}

function EventRow({ event, isLast, t }: { event: AgentEvent, isLast: boolean, t: any }) {
  if (event.type === "step_start") {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-3"
      >
        <div className="w-8 h-8 rounded-full bg-[#f5f5f0] flex items-center justify-center flex-shrink-0 mt-1">
          <BrainCircuit size={16} className="text-[#5A5A40]" />
        </div>
        <div>
          <p className="text-stone-800 font-medium">{event.data.name}</p>
          <p className="text-stone-500 text-sm">{event.data.description}</p>
        </div>
      </motion.div>
    );
  }

  if (event.type === "tool_call") {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 ml-11 py-2 text-sm text-[#5A5A40] bg-[#5A5A40]/5 rounded-xl px-4 w-fit"
      >
        <Wrench size={14} />
        <span>{t('agent.toolCall')} <span className="font-mono text-xs">{event.data.tool_name}</span></span>
        {isLast && <Loader2 size={12} className="animate-spin ml-2" />}
      </motion.div>
    );
  }

  if (event.type === "tool_result") {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-start gap-2 ml-11 text-xs text-stone-400 font-mono border-l-2 border-stone-200 pl-3 py-1 overflow-hidden"
      >
         <span className="truncate">{event.data.result_preview}</span>
      </motion.div>
    );
  }

  if (event.type === "thinking") {
    return (
      <motion.div 
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        className="flex items-start gap-2 ml-11 text-sm text-[#8c8c73] font-serif italic py-1"
      >
        <span className="mt-1 flex-shrink-0 animate-pulse text-[#5A5A40]">💡</span>
        <motion.span 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ duration: 0.5 }}
        >
          {event.data.text || t('agent.thinkingText')}
        </motion.span>
      </motion.div>
    );
  }

  if (event.type === "error") {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3 mt-6 pt-6 border-t border-red-100 text-red-600"
      >
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
          <Wrench size={20} />
        </div>
        <div>
          <p className="font-medium text-lg">{t('agent.errorTitle')}</p>
          <p className="text-red-500/80 text-sm">{event.data?.message || t('agent.errorDesc')}</p>
        </div>
      </motion.div>
    );
  }

  if (event.type === "final") {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3 mt-6 pt-6 border-t border-stone-100"
      >
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
          <CheckCircle2 size={20} />
        </div>
        <div>
          <p className="text-stone-800 font-medium text-lg">{t('agent.completeTitle')}</p>
          <p className="text-stone-500 text-sm">{t('agent.completeDesc')}</p>
        </div>
      </motion.div>
    );
  }

  return null;
}
