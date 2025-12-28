
import React, { useState, useRef, useEffect } from 'react';
import { getGeminiChatResponse } from '../services/gemini';
import { ChatMessage } from '../types';
import { Send, Sparkles, Loader2, Bot } from 'lucide-react';

export const Assistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Bonjour ! I'm Lili, your Parisian student pal. Need help with parties, finding an apartment, or just wondering where the best croissant is? Ask away! ✨" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await getGeminiChatResponse(input, messages);
      const modelMsg: ChatMessage = { role: 'model', text: response.text };
      setMessages(prev => [...prev, modelMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "Désolée, I had a little trouble processing that. Can you try again?" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col p-4">
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-2 scrollbar-thin scrollbar-thumb-stone-200" ref={scrollRef}>
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
          >
            <div className={`max-w-[85%] rounded-3xl px-5 py-3 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white border border-stone-100 text-slate-800 rounded-tl-none'
            }`}>
              {msg.role === 'model' && (
                <div className="flex items-center gap-2 mb-1">
                  <Bot className="w-3 h-3 text-blue-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Lili</span>
                </div>
              )}
              <p className="text-sm leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-stone-100 rounded-3xl rounded-tl-none px-5 py-3 flex gap-2 items-center">
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
              <span className="text-xs text-slate-400 italic">Lili is thinking...</span>
            </div>
          </div>
        )}
      </div>

      <form 
        onSubmit={handleSend}
        className="relative bg-white border border-stone-200 rounded-2xl p-2 shadow-lg flex items-center gap-2"
      >
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Lili about life in Paris..."
          className="flex-1 bg-transparent py-2 px-3 text-sm outline-none"
        />
        <button 
          type="submit"
          disabled={!input.trim() || loading}
          className="bg-blue-600 text-white p-3 rounded-xl disabled:opacity-50 transition-opacity"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
