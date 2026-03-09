import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Background } from './Background';
import { Lock, Mail, Shield, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFirstRun, setIsFirstRun] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isFirstRun) {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters');
        }

        const userCredential = await createUserWithEmailAndPassword(auth!, email, password);
        const user = userCredential.user;
        
        await setDoc(doc(db!, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          username: user.email?.split('@')[0] || 'admin',
          role: 'ADMIN',
          status: 'approved',
          credits: 9999,
          createdAt: new Date().toISOString()
        });
        navigate('/admin/dashboard');
      } else {
        await signInWithEmailAndPassword(auth!, email, password);
        // App.tsx will handle the redirection once onAuthStateChanged and onSnapshot fire
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        if (email === 'arcanocipher@gmail.com' || email === 'admin@pandatv.ca') {
          setIsFirstRun(true);
          setError('SYSTEM INITIALIZATION REQUIRED: No admin account detected. Set your master password below.');
        } else {
          setError('ACCESS DENIED: Invalid credentials.');
        }
      } else if (err.code === 'auth/email-already-in-use') {
        setIsFirstRun(false);
        setError('ACCOUNT EXISTS: Please sign in with your master credentials.');
      } else {
        setError(err.message || 'An error occurred during authentication.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-void flex items-center justify-center p-6 relative overflow-hidden">
      <Background />
      
      {/* Scanline effect */}
      <div className="fixed inset-0 scanline-cyber opacity-[0.03] pointer-events-none z-50" />

      <div className="glass-panel p-12 rounded-[2.5rem] max-w-md w-full space-y-8 border-pink-500/30 relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-pink-500/10 rounded-2xl flex items-center justify-center mx-auto border border-pink-500/30 shadow-[0_0_30px_rgba(236,72,153,0.2)] mb-4">
            <Shield className="w-10 h-10 text-pink-500" />
          </div>
          <h1 className="text-2xl font-display font-black text-white uppercase italic tracking-tighter">
            Panda <span className="text-pink-500">Admin Portal</span>
          </h1>
          <p className="text-[10px] font-mono text-pink-500/60 uppercase tracking-[0.3em]">Restricted Access Area</p>
        </div>

        {error && (
          <div className="p-4 bg-red/10 border border-red/20 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-4 h-4 text-red shrink-0" />
            <p className="text-[10px] font-mono text-red uppercase tracking-wider">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block font-mono text-[0.65rem] tracking-[0.2em] uppercase text-text-muted ml-2">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-500/40" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@pandapanel.tv" 
                  className="w-full pl-12 pr-4 py-4 bg-pink-500/5 border border-pink-500/15 rounded-2xl text-text-primary outline-none focus:border-pink-500 focus:bg-pink-500/10 transition-all text-sm" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-mono text-[0.65rem] tracking-[0.2em] uppercase text-text-muted ml-2">
                {isFirstRun ? 'Set Master Password' : 'Master Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-500/40" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full pl-12 pr-4 py-4 bg-pink-500/5 border border-pink-500/15 rounded-2xl text-text-primary outline-none focus:border-pink-500 focus:bg-pink-500/10 transition-all text-sm" 
                />
              </div>
            </div>

            {isFirstRun && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block font-mono text-[0.65rem] tracking-[0.2em] uppercase text-text-muted ml-2">Confirm Master Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-500/40" />
                  <input 
                    type="password" 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full pl-12 pr-4 py-4 bg-pink-500/5 border border-pink-500/15 rounded-2xl text-text-primary outline-none focus:border-pink-500 focus:bg-pink-500/10 transition-all text-sm" 
                  />
                </div>
              </div>
            )}
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-pink-600 to-red rounded-2xl text-white font-display font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(236,72,153,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isFirstRun ? 'Initialize System' : 'Access Control Room')}
          </button>
        </form>

        <div className="text-center">
          <p className="text-[10px] font-mono text-text-muted uppercase tracking-[0.2em] opacity-50">
            Authorized personnel only
          </p>
        </div>
      </div>
    </div>
  );
}
