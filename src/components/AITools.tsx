import React, { useState } from 'react';
import { Sparkles, Terminal, Megaphone, Zap, Loader2, BrainCircuit } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import { clsx } from 'clsx';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export function AITools() {
  const [activeTool, setActiveTool] = useState<'analyst' | 'pitcher' | 'hype' | null>(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const tools = [
    { 
      id: 'analyst', 
      name: 'Log Analyst', 
      icon: Terminal, 
      desc: 'Neural audit of transaction patterns', 
      color: 'text-cyan', 
      bg: 'bg-cyan/10',
      prompt: "Analyze these mock logs and identify potential churn risks or growth opportunities for an IPTV reseller: [User ee8a9d2a30 renewed for 3 months, User 8e0fe93529 is on a demo, User 1607565e27 renewed for 6 months]. Provide a concise cyberpunk-style report."
    },
    { 
      id: 'pitcher', 
      name: 'Content Pitcher', 
      icon: Megaphone, 
      desc: 'Generate high-conversion sales copy', 
      color: 'text-violet', 
      bg: 'bg-violet/10',
      prompt: "Generate a high-conversion sales pitch for a 'Panda IPTV Platinum' package featuring 20,000+ channels, 4K VOD, and Anti-Freeze technology. Target audience: Sports fans and movie buffs. Use a professional yet futuristic tone."
    },
    { 
      id: 'hype', 
      name: 'Hype Engine', 
      icon: Zap, 
      desc: 'Viral social media deployment', 
      color: 'text-pink', 
      bg: 'bg-pink/10',
      prompt: "Create 3 viral social media posts (Twitter/X style) to hype up a new server update for Panda IPTV. Include emojis and hashtags like #PandaIPTV #CyberStream #NextGenTV."
    }
  ];

  const runTool = async (toolId: string) => {
    const tool = tools.find(t => t.id === toolId);
    if (!tool) return;

    setActiveTool(toolId as any);
    setLoading(true);
    setResult('');

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [{ role: 'user', parts: [{ text: tool.prompt }] }],
        config: {
          systemInstruction: "You are the Panda IPTV AI Core. You provide strategic intelligence for resellers. Your tone is futuristic, efficient, and highly professional. Use markdown for formatting.",
        }
      });

      setResult(response.text || "Neural link interrupted. Retry deployment.");
    } catch (error) {
      console.error("AI Tool Error:", error);
      setResult("Critical failure in AI core. Check system logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <BrainCircuit className="w-5 h-5 text-cyan animate-pulse" />
        <h2 className="text-xl font-display font-black text-white uppercase tracking-wider italic">AI Strategic <span className="text-cyan">Intelligence</span></h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => runTool(tool.id)}
            disabled={loading}
            className={clsx(
              "glass-panel p-6 rounded-xl border-white/5 text-left group transition-all hover:border-white/20 relative overflow-hidden",
              activeTool === tool.id && "border-cyan/50 bg-cyan/5"
            )}
          >
            <div className={clsx("w-12 h-12 rounded-lg flex items-center justify-center mb-4 border shadow-inner transition-transform group-hover:scale-110", tool.bg, tool.color, "border-white/10")}>
              <tool.icon className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">{tool.name}</h4>
            <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest leading-relaxed">{tool.desc}</p>
            
            {loading && activeTool === tool.id && (
              <div className="absolute inset-0 bg-void/60 backdrop-blur-sm flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-cyan animate-spin" />
              </div>
            )}
          </button>
        ))}
      </div>

      {result && (
        <div className="glass-panel p-8 rounded-2xl border-cyan/20 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan via-violet to-pink" />
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan" />
              <span className="text-[10px] font-mono text-cyan uppercase tracking-[0.3em] font-bold">Neural Output Generated</span>
            </div>
            <button 
              onClick={() => setResult('')}
              className="text-text-muted hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="markdown-body text-sm text-text-muted leading-relaxed prose prose-invert max-w-none">
            <Markdown>{result}</Markdown>
          </div>
        </div>
      )}
    </div>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
