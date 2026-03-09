import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Shield, Save, Globe, Lock, User as UserIcon, Key } from 'lucide-react';
import { ApiSettings } from '../types';

export function AdminSettings() {
  const [settings, setSettings] = useState<ApiSettings>({
    apiKey: '',
    panelUsername: '',
    panelPassword: '',
    panelBaseUrl: 'https://activationpanel.net/api/api.php'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      if (!db) return;
      try {
        const docSnap = await getDoc(doc(db, 'config', 'apiSettings'));
        if (docSnap.exists()) {
          setSettings(docSnap.data() as ApiSettings);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    setSaving(true);
    setMessage('');
    try {
      await setDoc(doc(db, 'config', 'apiSettings'), settings);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      console.error('Error saving settings:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="w-8 h-8 border-4 border-cyan/20 border-t-cyan rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-cyan/10 rounded-xl flex items-center justify-center border border-cyan/30 shadow-[0_0_20px_rgba(0,245,255,0.1)]">
          <Shield className="w-6 h-6 text-cyan" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-black text-white uppercase italic tracking-tighter">
            Master <span className="text-cyan">Settings</span>
          </h1>
          <p className="text-text-muted font-mono text-xs uppercase tracking-widest">System API Configuration</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="glass-panel p-8 rounded-3xl border-white/5 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-xs font-mono text-cyan uppercase tracking-widest">
                <Key className="w-3 h-3" /> ActivationPanel API Key
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="password"
                  value={settings.apiKey}
                  onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                  className="w-full bg-void border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white font-mono text-sm focus:border-cyan outline-none transition-all"
                  placeholder="Enter API Key"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-xs font-mono text-cyan uppercase tracking-widest">
                <Globe className="w-3 h-3" /> Panel Base URL
              </label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="text"
                  value={settings.panelBaseUrl}
                  onChange={(e) => setSettings({ ...settings, panelBaseUrl: e.target.value })}
                  className="w-full bg-void border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white font-mono text-sm focus:border-cyan outline-none transition-all"
                  placeholder="https://activationpanel.net/api/api.php"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-xs font-mono text-cyan uppercase tracking-widest">
                <UserIcon className="w-3 h-3" /> Panel Username
              </label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="text"
                  value={settings.panelUsername}
                  onChange={(e) => setSettings({ ...settings, panelUsername: e.target.value })}
                  className="w-full bg-void border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white font-mono text-sm focus:border-cyan outline-none transition-all"
                  placeholder="Panel Username"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-xs font-mono text-cyan uppercase tracking-widest">
                <Lock className="w-3 h-3" /> Panel Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="password"
                  value={settings.panelPassword}
                  onChange={(e) => setSettings({ ...settings, panelPassword: e.target.value })}
                  className="w-full bg-void border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white font-mono text-sm focus:border-cyan outline-none transition-all"
                  placeholder="Panel Password"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest">
              {message && (
                <span className={message.startsWith('Error') ? 'text-red' : 'text-emerald-400 animate-pulse'}>
                  {message}
                </span>
              )}
            </p>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-8 py-4 bg-cyan text-void font-display font-black uppercase tracking-widest text-xs rounded-xl hover:bg-cyan-400 hover:shadow-[0_0_30px_rgba(0,245,255,0.3)] transition-all disabled:opacity-50"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-void/20 border-t-void rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Configuration
            </button>
          </div>
        </div>
      </form>

      <div className="mt-12 p-6 bg-orange-500/5 border border-orange-500/20 rounded-2xl">
        <h3 className="text-xs font-mono text-orange-500 uppercase tracking-widest mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4" /> Security Notice
        </h3>
        <p className="text-[10px] font-mono text-text-muted uppercase leading-relaxed">
          These credentials are encrypted at rest in Firestore and are only accessible by the Master Admin. 
          Resellers will never see these keys. All API calls are proxied through the secure backend.
        </p>
      </div>
    </div>
  );
}
