import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from '../types';
import { Send, User as UserIcon, Shield, MessageSquare, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  createdAt: any;
  isAdmin: boolean;
}

export function SupportChat({ userData }: { userData: User }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAdmin = userData?.role === 'ADMIN';

  useEffect(() => {
    if (!db || !userData) return;

    // If admin, show all messages? Or maybe we need a room system.
    // For now, let's assume a single global support channel for simplicity, 
    // or a channel per user.
    const q = isAdmin 
      ? query(collection(db, 'support_messages'), orderBy('createdAt', 'asc'))
      : query(collection(db, 'support_messages'), where('chatId', '==', userData.uid), orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userData, isAdmin]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !db) return;

    try {
      await addDoc(collection(db, 'support_messages'), {
        text: newMessage,
        senderId: userData.uid,
        senderName: userData.username,
        chatId: isAdmin ? 'GLOBAL' : userData.uid, // Simple logic
        isAdmin: isAdmin,
        createdAt: new Date().toISOString()
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-cyan/10 rounded-xl flex items-center justify-center border border-cyan/30">
          <MessageSquare className="w-6 h-6 text-cyan" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-black text-white uppercase italic tracking-tighter">
            Support <span className="text-cyan">Chat</span>
          </h1>
          <p className="text-text-muted font-mono text-xs uppercase tracking-widest">Direct line to Panda HQ</p>
        </div>
      </div>

      <div className="flex-1 glass-panel rounded-3xl border-white/5 flex flex-col overflow-hidden">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar"
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 text-cyan animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
              <MessageSquare className="w-12 h-12 text-text-muted" />
              <p className="text-text-muted font-mono text-xs uppercase tracking-widest">No messages yet. Start the conversation.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div 
                key={msg.id} 
                className={clsx(
                  "flex flex-col max-w-[80%]",
                  msg.senderId === userData.uid ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div className="flex items-center gap-2 mb-1 px-2">
                  <span className="text-[8px] font-mono text-text-muted uppercase tracking-widest">{msg.senderName}</span>
                  {msg.isAdmin && <Shield className="w-2 h-2 text-cyan" />}
                </div>
                <div className={clsx(
                  "px-4 py-3 rounded-2xl text-sm font-mono leading-relaxed",
                  msg.senderId === userData.uid 
                    ? "bg-cyan text-void rounded-tr-none shadow-[0_0_20px_rgba(0,245,255,0.1)]" 
                    : "bg-white/5 text-white border border-white/10 rounded-tl-none"
                )}>
                  {msg.text}
                </div>
                <span className="text-[8px] font-mono text-text-muted mt-1 px-2 uppercase">
                  {msg.createdAt?.split('T')[1]?.slice(0, 5)}
                </span>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSend} className="p-4 bg-white/5 border-t border-white/5 flex gap-4">
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 bg-void border border-white/10 rounded-xl px-6 py-4 text-white font-mono text-sm focus:border-cyan outline-none transition-all"
            placeholder="Type your message..."
          />
          <button 
            type="submit"
            className="w-14 h-14 bg-cyan text-void rounded-xl flex items-center justify-center hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(0,245,255,0.2)]"
          >
            <Send className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
}
