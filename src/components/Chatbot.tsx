import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Sparkles } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import { clsx } from 'clsx';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: 'Greetings, Reseller. I am the Panda AI Intelligence. How can I assist your operations today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: messages.concat({ role: 'user', text: userMsg }).map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
        config: {
          systemInstruction: "You are the Panda IPTV AI Assistant. You help resellers manage their business, explain technical features like Anti-Freeze technology, DDoS protection, and global CDN. You are professional, futuristic, and helpful. Keep responses concise and use cyberpunk terminology where appropriate.",
        }
      });

      const aiText = response.text || "I encountered a glitch in the matrix. Please try again.";
      setMessages(prev => [...prev, { role: 'model', text: aiText }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Connection to the neural network failed. Check your uplink." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={clsx(
          "fixed bottom-8 right-8 w-14 h-14 rounded-full bg-gradient-to-br from-cyan to-violet flex items-center justify-center shadow-[0_0_20px_rgba(0,245,255,0.4)] hover:shadow-[0_0_30px_rgba(0,245,255,0.6)] hover:scale-110 transition-all z-40",
          isOpen && "scale-0 opacity-0"
        )}
      >
        <MessageSquare className="w-6 h-6 text-void" />
      </button>

      {/* Chat Window */}
      <div className={clsx(
        "fixed bottom-8 right-8 w-[400px] h-[600px] glass-panel rounded-2xl flex flex-col z-50 transition-all duration-500 origin-bottom-right",
        isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-border-glow flex items-center justify-between bg-white/5 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan/20 flex items-center justify-center border border-cyan/30">
              <Bot className="w-5 h-5 text-cyan" />
            </div>
            <div>
              <h3 className="text-sm font-display font-bold text-white tracking-wider">PANDA AI</h3>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Neural Link Active</span>
              </div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-text-muted hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
          {messages.map((m, i) => (
            <div key={i} className={clsx("flex gap-3", m.role === 'user' ? "flex-row-reverse" : "flex-row")}>
              <div className={clsx(
                "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border",
                m.role === 'user' ? "bg-violet-500/20 border-violet-500/30" : "bg-cyan-500/20 border-cyan-500/30"
              )}>
                {m.role === 'user' ? <User className="w-4 h-4 text-violet-400" /> : <Bot className="w-4 h-4 text-cyan-400" />}
              </div>
              <div className={clsx(
                "max-w-[80%] p-3 rounded-xl text-sm leading-relaxed",
                m.role === 'user' ? "bg-violet-500/10 text-white border border-violet-500/20" : "bg-white/5 text-text-muted border border-white/10"
              )}>
                <div className="markdown-body">
                  <Markdown>{m.text}</Markdown>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                <Bot className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-cyan rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-cyan rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-cyan rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border-glow bg-white/5 rounded-b-2xl">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Panda AI..."
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-cyan transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-cyan/20 flex items-center justify-center text-cyan hover:bg-cyan/30 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2 flex items-center justify-center gap-1 text-[10px] font-mono text-text-muted uppercase tracking-widest">
            <Sparkles className="w-3 h-3 text-cyan" />
            Powered by Gemini 3.1 Pro
          </div>
        </div>
      </div>
    </>
  );
}
