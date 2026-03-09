import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured, getFirebaseDiagnostics } from './lib/firebase';
import { WaitingRoom } from './components/WaitingRoom';
import { Background } from './components/Background';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Dashboard } from './components/Dashboard';
import { ProfileAPI } from './components/ProfileAPI';
import { Statistics } from './components/Statistics';
import { Customers } from './components/Customers';
import { SystemPanel } from './components/SystemPanel';
import { LandingPage } from './components/LandingPage';
import { Chatbot } from './components/Chatbot';
import { DeviceForm } from './components/DeviceForm';
import { LogsTable } from './components/LogsTable';
import { AdminSettings } from './components/AdminSettings';
import { AdminResellers } from './components/AdminResellers';
import { AdminCredits } from './components/AdminCredits';
import { AdminAnnouncements } from './components/AdminAnnouncements';
import { ResellerSubsellers } from './components/ResellerSubsellers';
import { SupportChat } from './components/SupportChat';
import { ToolsServices } from './components/ToolsServices';
import { ToolsBulk } from './components/ToolsBulk';
import { ToolsUpdates } from './components/ToolsUpdates';
import { AdminLoginPage } from './components/AdminLoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Activity, ShieldAlert, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

import { User } from './types';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-void flex items-center justify-center p-6 text-center">
          <Background />
          <div className="glass-panel p-12 rounded-[2.5rem] max-w-2xl w-full space-y-8 border-red/30 relative z-10">
            <div className="w-24 h-24 bg-red/10 rounded-full flex items-center justify-center mx-auto border border-red/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
              <AlertTriangle className="w-12 h-12 text-red animate-pulse" />
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-display font-black text-white uppercase italic tracking-tighter">
                System <span className="text-red">Crash</span>
              </h1>
              <p className="text-text-muted font-mono text-sm uppercase tracking-widest leading-relaxed">
                A critical error occurred in the neural interface.
              </p>
              <div className="p-4 bg-black/40 rounded-xl border border-white/5 text-left overflow-auto max-h-40">
                <code className="text-red text-xs font-mono break-all">
                  {this.state.error?.toString()}
                </code>
              </div>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              Reboot System
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function MainLayout({ 
  userData, 
  handleLogout, 
  isGlassmorphic, 
  setIsGlassmorphic 
}: { 
  userData: User, 
  handleLogout: () => Promise<void>,
  isGlassmorphic: boolean,
  setIsGlassmorphic: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSystemPanelOpen, setIsSystemPanelOpen] = useState(false);
  const isAdmin = userData.role === 'ADMIN';
  const isReseller = userData.role === 'RESELLER' || userData.role === 'SUBSELLER';

  const renderContent = () => {
    if (activeTab.startsWith('logs-')) {
      const type = activeTab.split('-')[1] as any;
      return <LogsTable type={type === 'sub' ? 'subscription' : type} userData={userData} />;
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard userData={userData} setActiveTab={setActiveTab} />;
      case 'profile':
        return <ProfileAPI isGlassmorphic={isGlassmorphic} setIsGlassmorphic={setIsGlassmorphic} />;
      case 'statistics':
        return <Statistics userData={userData} setActiveTab={setActiveTab} />;
      case 'mag-add':
      case 'mag-quick':
        return <DeviceForm type="mag" userData={userData} setActiveTab={setActiveTab} />;
      case 'm3u-add':
      case 'm3u-quick':
        return <DeviceForm type="m3u" userData={userData} setActiveTab={setActiveTab} />;
      case 'mag-list':
        return <Customers type="mag" userData={userData} setActiveTab={setActiveTab} />;
      case 'm3u-list':
        return <Customers type="m3u" userData={userData} setActiveTab={setActiveTab} />;
      case 'admin-settings':
        return isAdmin ? <AdminSettings /> : <Dashboard userData={userData} setActiveTab={setActiveTab} />;
      case 'admin-resellers':
      case 'admin-pending':
        return isAdmin ? <AdminResellers /> : <Dashboard userData={userData} setActiveTab={setActiveTab} />;
      case 'admin-credits':
        return isAdmin ? <AdminCredits /> : <Dashboard userData={userData} setActiveTab={setActiveTab} />;
      case 'admin-announcements':
        return isAdmin ? <AdminAnnouncements /> : <Dashboard userData={userData} setActiveTab={setActiveTab} />;
      case 'subsellers':
        return isReseller ? <ResellerSubsellers userData={userData} /> : <Dashboard userData={userData} setActiveTab={setActiveTab} />;
      case 'support-chat':
        return <SupportChat userData={userData} />;
      case 'tools-services':
        return <ToolsServices />;
      case 'tools-bulk':
        return isAdmin ? <ToolsBulk /> : <Dashboard userData={userData} setActiveTab={setActiveTab} />;
      case 'tools-updates':
        return <ToolsUpdates />;
      case 'ticket':
        return (
          <div className="p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-display font-bold text-white mb-6">Open a Ticket</h2>
            <div className="glass-panel p-8 rounded-2xl space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-mono text-text-muted uppercase">Subject</label>
                <input type="text" className="w-full bg-void border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-cyan-400" placeholder="Brief description of the issue" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono text-text-muted uppercase">Priority</label>
                <select className="w-full bg-void border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-cyan-400">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Urgent</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono text-text-muted uppercase">Message</label>
                <textarea rows={5} className="w-full bg-void border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-cyan-400 resize-none" placeholder="Describe your problem in detail..." />
              </div>
              <button className="w-full py-4 bg-cyan-500 text-void font-bold rounded-xl hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(0,245,255,0.2)]">
                Submit Ticket
              </button>
            </div>
          </div>
        );
      default:
        return <Dashboard userData={userData} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className={clsx(
      "flex h-screen w-screen overflow-hidden bg-void selection:bg-cyan-400/30 selection:text-cyan-100 transition-all duration-700",
      isGlassmorphic ? "glass-mode" : "standard-mode"
    )}>
      <Background />
      
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} userRole={userData?.role} onLogout={handleLogout} />
      
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        <Topbar setActiveTab={setActiveTab} onLogout={handleLogout} />
        
        <main className="flex-1 overflow-y-auto custom-scrollbar relative">
          {renderContent()}
          
          {!isSystemPanelOpen && (
            <button 
              onClick={() => setIsSystemPanelOpen(true)}
              className="fixed right-0 top-1/2 -translate-y-1/2 w-8 h-24 bg-panel border-l border-y border-border-glow rounded-l-xl flex items-center justify-center hover:bg-white/5 transition-all z-20 group"
            >
              <Activity className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            </button>
          )}
        </main>
      </div>

      <SystemPanel isOpen={isSystemPanelOpen} onClose={() => setIsSystemPanelOpen(false)} />
      <Chatbot />
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGlassmorphic, setIsGlassmorphic] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (user && db) {
      setLoading(true);
      const userRef = doc(db, 'users', user.uid);
      
      const unsubscribeDoc = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData({ uid: docSnap.id, ...data } as User);
          setLoading(false);
        } else {
          // Document doesn't exist, bootstrap it
          const email = user.email || '';
          const username = email.split('@')[0];
          const isAdmin = email === 'arcanocipher@gmail.com' || email === 'admin@pandatv.ca';
          const isTestUser = email === 'test@pandapanel.tv';
          
          const newUser = {
            uid: user.uid,
            email: email,
            username: username,
            role: isAdmin ? 'ADMIN' : 'RESELLER',
            status: (isAdmin || isTestUser) ? 'approved' : 'pending',
            credits: isAdmin ? 9999 : (isTestUser ? 500 : 0),
            createdAt: serverTimestamp(),
            parentId: null
          };
          
          setDoc(userRef, newUser).catch(error => {
            console.error("Error bootstrapping user:", error);
          });
          // We don't set loading to false here; the next snapshot will handle it
        }
      }, (error) => {
        console.error("Firestore snapshot error:", error);
        setLoading(false);
      });

      return () => unsubscribeDoc();
    } else if (user && !db) {
      setLoading(false);
    }
  }, [user, db]);

  const handleLogout = async () => {
    if (auth) await signOut(auth);
  };

  if (!isFirebaseConfigured) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center p-6">
        <Background />
        <div className="glass-panel p-12 rounded-[2.5rem] max-w-2xl w-full text-center space-y-8 border-orange-500/30 relative z-10">
          <div className="w-24 h-24 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto border border-orange-500/30 shadow-[0_0_30px_rgba(249,115,22,0.2)]">
            <ShieldAlert className="w-12 h-12 text-orange-500 animate-pulse" />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-display font-black text-white uppercase italic tracking-tighter">
              Neural Link <span className="text-orange-500">Offline</span>
            </h1>
            <p className="text-text-muted font-mono text-sm uppercase tracking-widest leading-relaxed">
              Firebase configuration is missing or invalid. <br />
              Please set your <span className="text-cyan">VITE_FIREBASE_*</span> environment variables in AI Studio to establish a connection.
            </p>
          </div>
          <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-left space-y-4">
            <h3 className="text-xs font-mono text-white uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" /> System Diagnostics:
            </h3>
            <div className="grid grid-cols-1 gap-2 text-[10px] font-mono">
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-text-muted">API KEY DETECTED:</span>
                <span className={getFirebaseDiagnostics().hasApiKey ? "text-emerald-400" : "text-red"}>
                  {getFirebaseDiagnostics().hasApiKey ? `YES (${getFirebaseDiagnostics().apiKeyLength} chars)` : "NO"}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-text-muted">PROJECT ID:</span>
                <span className="text-cyan">{getFirebaseDiagnostics().projectId}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-screen w-screen bg-void flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan/20 border-t-cyan rounded-full animate-spin" />
      </div>
    );
  }

  if (user && !userData && !loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center p-6 text-center">
        <Background />
        <div className="glass-panel p-12 rounded-[2.5rem] max-w-md w-full space-y-8 border-cyan/30 relative z-10">
          <div className="w-20 h-20 bg-cyan/10 rounded-2xl flex items-center justify-center mx-auto border border-cyan/30 shadow-[0_0_30px_rgba(0,245,255,0.2)] mb-4">
            <Activity className="w-10 h-10 text-cyan animate-pulse" />
          </div>
          <h1 className="text-2xl font-display font-black text-white uppercase italic tracking-tighter">
            Establishing <span className="text-cyan">Neural Link</span>
          </h1>
          <p className="text-[10px] font-mono text-text-muted uppercase tracking-[0.3em] leading-relaxed">
            The system is synchronizing your profile data. If this takes more than a few seconds, please check your connection.
          </p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-cyan/10 border border-cyan/20 rounded-xl text-cyan font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-cyan/20 transition-all"
            >
              Retry Connection
            </button>
            <button 
              onClick={handleLogout}
              className="w-full py-4 bg-white/5 border border-white/10 rounded-xl text-text-muted font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <HashRouter>
        <Routes>
          <Route path="/" element={
            user && userData ? (
              userData.role === 'ADMIN' ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/reseller" replace />
            ) : (
              <LandingPage onEnter={() => {}} />
            )
          } />
          
          <Route path="/admin" element={
            user && userData ? (
              userData.role === 'ADMIN' ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/reseller" replace />
            ) : (
              <AdminLoginPage />
            )
          } />

          <Route path="/admin/dashboard" element={
            <ProtectedRoute user={user} userData={userData} loading={loading} requiredRole="ADMIN">
              <MainLayout userData={userData!} handleLogout={handleLogout} isGlassmorphic={isGlassmorphic} setIsGlassmorphic={setIsGlassmorphic} />
            </ProtectedRoute>
          } />

          <Route path="/reseller" element={
            <ProtectedRoute user={user} userData={userData} loading={loading} requiredRole="RESELLER">
              {userData?.status === 'pending' ? (
                <WaitingRoom onLogout={handleLogout} />
              ) : (
                <MainLayout userData={userData!} handleLogout={handleLogout} isGlassmorphic={isGlassmorphic} setIsGlassmorphic={setIsGlassmorphic} />
              )}
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </ErrorBoundary>
  );
}
