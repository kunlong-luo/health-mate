import { useState, useRef, useEffect } from "react";
import { Drawer } from "vaul";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import clsx from "clsx";

export default function ChatDrawer() {
  const { token, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string, content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const handleSend = async () => {
    if (!input.trim() || !token) return;
    
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
        const res = await fetch('/api/chat/stream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ messages: newMessages })
        });
        
        if (!res.ok) throw new Error();
        
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let aiFullText = "";
        
        setMessages(prev => [...prev, { role: 'assistant', content: "" }]);

        while (reader) {
            const { value, done } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            // primitive stream parsing
            const validText = chunk.replace(/0:"/g, '').replace(/"/g, '').replace(/\\n/g, '\n');
            aiFullText += validText;
            
            setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1].content = aiFullText;
                return updated;
            });

            if (aiFullText.includes("[EMERGENCY_TRIGGER]")) {
                aiFullText = "⚠️ 发现紧急危险症状！建议您立即拨打 120 或立刻前往最近医院急诊科！";
                setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1].content = aiFullText;
                    return updated;
                });
                break;
            }
        }
    } catch (e) {
        setMessages(prev => [...prev, { role: 'assistant', content: "网络出错了，请稍后再试。" }]);
    }
    setLoading(false);
  };

  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="fixed md:bottom-8 md:right-8 bottom-20 right-4 w-14 h-14 bg-[#5A5A40] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform z-20"
      >
        <MessageCircle size={24} />
      </button>

      <Drawer.Root open={open} onOpenChange={setOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
          <Drawer.Content className="bg-[#f5f5f0] flex flex-col rounded-t-[32px] mt-24 max-h-[85vh] h-full fixed bottom-0 left-0 right-0 z-50 ring-0 outline-none max-w-xl mx-auto shadow-2xl">
            <Drawer.Title className="sr-only">Chat Assistant</Drawer.Title>
            <Drawer.Description className="sr-only">Chat with the AI Medical Assistant</Drawer.Description>
            <div className="p-4 bg-white rounded-t-[32px] border-b border-stone-100 flex items-center justify-between sticky top-0 shrink-0">
              <div className="flex items-center gap-2 text-stone-800">
                <Bot size={20} className="text-[#5A5A40]" />
                <span className="font-medium">AI 医疗助手</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-2 text-stone-400 hover:text-stone-600 bg-stone-50 rounded-full">
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                 <div className="text-center text-sm text-stone-400 mt-10">
                   您好，{user?.name}！我是您的家庭健康助手。<br/>
                   我可以帮您解读报告、查用药冲突、或解答健康疑问。
                 </div>
              )}
              {messages.map((msg, idx) => (
                <div key={idx} className={clsx("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "")}>
                  <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center shrink-0", msg.role === 'user' ? "bg-stone-200 text-stone-600" : "bg-[#5A5A40] text-white")}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={clsx("p-3 rounded-2xl max-w-[75%] text-sm whitespace-pre-wrap leading-relaxed", 
                     msg.role === 'user' ? "bg-stone-200 text-stone-800 rounded-tr-sm" : "bg-white border border-stone-100 shadow-sm rounded-tl-sm text-stone-700",
                     msg.content.includes('⚠️') && "bg-red-50 text-red-700 border-red-200"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#5A5A40] text-white flex items-center justify-center shrink-0">
                     <Bot size={16} />
                  </div>
                  <div className="p-3 bg-white border border-stone-100 rounded-2xl rounded-tl-sm text-sm text-stone-400 flex items-center gap-1">
                     <span className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce"></span>
                     <span className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce" style={{animationDelay:'0.1s'}}></span>
                     <span className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce" style={{animationDelay:'0.2s'}}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-stone-100 shrink-0">
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="问点什么..."
                  className="flex-1 bg-stone-50 border-none outline-none px-4 py-3 rounded-xl focus:ring-1 focus:ring-[#5A5A40]"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="w-12 h-12 bg-[#5A5A40] rounded-xl flex items-center justify-center text-white shrink-0 disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}
