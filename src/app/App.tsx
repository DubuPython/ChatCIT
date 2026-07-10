import React, { useState, useRef, useEffect } from "react";
import { Plus, Settings, Send, Database, Trash2, LogOut, Bug, CheckCircle, AlertCircle, Info, ArrowLeft, Menu, UserCog, X } from "lucide-react";

import { AuthScreen } from "../components/authmodal";
import { AdminPanel } from "../components/admindashboard";
import { ProfileModal } from "../components/modals/profilemodal";
import { BugModal } from "../components/modals/bugsmodal";

import { 
  SpinningGear, ChatCITLogo, Avatar, MarkdownText, GearAbs, DayNightToggle, GearboxLoader,
  RATIO, N_SM, OR_SM, CENTER_D, TOP_H, GEAR_VIS, RAIL_W, STEP_DEG, OR_LG,
  PANEL_W, IR_SM, IR_LG, N_LG
} from "../components/ui/helpers";

import { Message, Chat, User, ToastMsg } from "../types";
import { QUICK_PROMPTS, ORGANIZATIONS, MAJORS, DOCUMENTS, MID_CHOICES, API_URL } from "../config";

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

// --- CANVAS-BASED PDF VIEWER ---
function CanvasPDFViewer({ fileUrl, dark, onEnlarge, onLoad, isMobile }: { fileUrl: string, dark: boolean, onEnlarge: (url: string) => void, onLoad: () => void, isMobile: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pdfRef, setPdfRef] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const border = dark ? '#334155' : '#e2e8f0';
  const btnBg = dark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';
  const textMuted = dark ? '#9aa0a6' : '#6b7280'; 

  useEffect(() => {
    let isMounted = true;
    const loadPDF = async () => {
      setLoading(true);
      if (!window.pdfjsLib) {
         await new Promise((resolve) => {
           const script = document.createElement('script');
           script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
           script.onload = () => {
             window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
             resolve(true);
           };
           document.body.appendChild(script);
         });
      }
      
      try {
         const cleanUrl = fileUrl.split('#')[0];
         const loadingTask = window.pdfjsLib.getDocument(cleanUrl);
         const pdf = await loadingTask.promise;
         
         if(isMounted) {
           setPdfRef(pdf);
           setTotalPages(pdf.numPages);
           const hashMatch = fileUrl.match(/#page=(\d+)/);
           const startPage = hashMatch ? parseInt(hashMatch[1], 10) : 1;
           setPage(startPage);
         }
      } catch(e) {
         if(isMounted) setLoading(false);
      }
    };
    loadPDF();
    return () => { isMounted = false; };
  }, [fileUrl]);

  useEffect(() => {
     const renderPage = async () => {
        if (!pdfRef || !canvasRef.current) return;
        setLoading(true);
        try {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          const pdfPage = await pdfRef.getPage(page);
          
          const viewport = pdfPage.getViewport({ scale: 1.5 });
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          const renderContext = { canvasContext: ctx, viewport: viewport };
          await pdfPage.render(renderContext).promise;
          onLoad();
        } catch(e) {}
        setLoading(false);
     };
     renderPage();
  }, [pdfRef, page]);

  return (
    <div style={{ maxWidth: isMobile ? '100%' : 380, width: '100%', marginTop: 12, borderRadius: 8, border: `1px solid ${border}`, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: dark ? '#25242c' : '#fff', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: dark ? '#1e293b' : '#f8fafc', borderBottom: `1px solid ${border}`, zIndex: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: dark ? '#cbd5e1' : '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>📄 Viewer</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} style={{ padding: '4px 8px', borderRadius: 6, border: 'none', background: page <= 1 ? 'transparent' : btnBg, color: page <= 1 ? textMuted : dark ? '#e8eaed' : '#1a1a2e', cursor: page <= 1 ? 'default' : 'pointer', fontSize: 12, fontWeight: 500, transition: 'opacity 0.2s' }}>&larr;</button>
          <span style={{ fontSize: 11, fontWeight: 600, color: dark ? '#94a3b8' : '#64748b', minWidth: 40, textAlign: 'center' }}>{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} style={{ padding: '4px 8px', borderRadius: 6, border: 'none', background: page >= totalPages ? 'transparent' : btnBg, color: page >= totalPages ? textMuted : dark ? '#e8eaed' : '#1a1a2e', cursor: page >= totalPages ? 'default' : 'pointer', fontSize: 12, fontWeight: 500, transition: 'opacity 0.2s' }}>&rarr;</button>
        </div>
      </div>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 250, position: 'relative' }}>
        {loading && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) scale(0.4)', zIndex: 10 }}>
            <GearboxLoader />
          </div>
        )}
        <canvas ref={canvasRef} onClick={() => { if(canvasRef.current) { try { onEnlarge(canvasRef.current.toDataURL()); } catch(e) {} } }} style={{ width: '100%', height: 'auto', display: 'block', opacity: loading ? 0.3 : 1, transition: 'opacity 0.3s', cursor: 'zoom-in' }} />
      </div>
    </div>
  );
}

// --- <LOADING/> CHAT COMPONENT ---
function ChatLoader() {
  return (
    <div className="chat-loader">
      <span>&lt;</span>
      <span>LOADING</span>
      <span>/&gt;</span>
    </div>
  );
}

export default function App() {
  // --- RESPONSIVE ENGINE STATE ---
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && window.innerWidth < 768);

  const [appLoading, setAppLoading] = useState(true); 
  const [dark, setDark] = useState(true);
  const [viewMode, setViewMode] = useState<"auth" | "chat" | "admin">("auth"); 
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const [fullScreenMedia, setFullScreenMedia] = useState<string | null>(null);

  // Default sidebar state depends on whether it loads on mobile or desktop
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [gearMode, setGearMode] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showBugModal, setShowBugModal] = useState(false);
  
  const [leftAngle, setLeftAngle] = useState(0);
  const [rightAngle, setRightAngle] = useState(0);
  const [quickIdx, setQuickIdx] = useState(0);
  const [midIdx, setMidIdx] = useState(1);
  const [recentsIdx, setRecentsIdx] = useState(0);
  const [orgIdx, setOrgIdx] = useState(0);
  const [majIdx, setMajIdx] = useState(0);
  const [docIdx, setDocIdx] = useState(0);

  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [topFaqs, setTopFaqs] = useState<{keyword: string}[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const activeChat = chats.find((c) => c.id === activeChatId) ?? null;

  // --- RESPONSIVE EVENT LISTENER ---
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && sidebarOpen) {
         setSidebarOpen(false); // Auto-collapse when snapping to mobile
      } else if (!mobile && !sidebarOpen) {
         setSidebarOpen(true); // Auto-open when snapping back to desktop
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sidebarOpen]);

  useEffect(() => {
    const timer = setTimeout(() => setAppLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };

  useEffect(() => {
    fetch(`${API_URL}/faqs/top`).then(res => res.json()).then(data => setTopFaqs(data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (currentUser && currentUser.id !== -1 && viewMode !== "auth") {
      fetch(`${API_URL}/chats/${currentUser.id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chats }) }).catch(() => {});
    }
  }, [chats, currentUser, viewMode]);

  useEffect(() => { if (viewMode === "chat") scrollToBottom(); }, [activeChat?.messages, isTyping, viewMode]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const bg = dark ? "#1c1b22" : "#f8f9fa";
  const sbBg = dark ? "#0d2460" : "#1558d6";
  const textPrimary = dark ? "#e8eaed" : "#1a1a2e";
  const textMuted = dark ? "#9aa0a6" : "#6b7280";
  const textFaint = dark ? "#5f6368" : "#9ca3af";
  const sb = { text: "#fff", muted: "rgba(255,255,255,0.70)", faint: "rgba(255,255,255,0.42)", hover: "rgba(255,255,255,0.10)", active: "rgba(255,255,255,0.20)", border: "rgba(255,255,255,0.14)" };
  const inputBg = dark ? "#25242c" : "#ffffff";
  const inputBorder = dark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.12)";

  const sendMessage = async (text: string = input) => {
    if (!text.trim() || isTyping) return;
    const content = text.trim();
    setInput("");
    
    const userMsg: Message = { id: `msg-${Date.now()}`, role: "user", content, timestamp: new Date() };
    let chatId = activeChatId;
    let messagesToSend: { role: string, content: string }[] = [];

    if (!chatId) {
      const nc: Chat = { id: `c-${Date.now()}`, title: content.length > 40 ? content.slice(0, 40) + "…" : content, lastMessage: content, timestamp: new Date(), messages: [userMsg] };
      setChats((p) => [nc, ...p]); setActiveChatId(nc.id); chatId = nc.id;
      messagesToSend = [{ role: "user", content }];
    } else {
      const existingChat = chats.find(c => c.id === chatId);
      messagesToSend = existingChat ? [...existingChat.messages, userMsg].map(m => ({ role: m.role, content: m.content })) : [{ role: "user", content }];
      setChats((p) => p.map((c) => c.id === chatId ? { ...c, messages: [...c.messages, userMsg], lastMessage: content } : c));
    }
    
    setIsTyping(true);
    
    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, history: messagesToSend })
      });
      const data = await response.json();
      
      const mMsg: Message = { id: `msg-${Date.now()}`, role: "model", content: data.reply || "Sorry, I encountered an error communicating with my database.", timestamp: new Date(), picture: data.picture };
      setChats((p) => p.map((c) => c.id === chatId ? { ...c, messages: [...c.messages, mMsg] } : c));
    } catch (error) {
      const errorMsg: Message = { id: `msg-${Date.now()}`, role: "model", content: "⚠️ Connection failed. Is the Node.js backend server running?", timestamp: new Date() };
      setChats((p) => p.map((c) => c.id === chatId ? { ...c, messages: [...c.messages, errorMsg] } : c));
    } finally {
      setIsTyping(false);
    }
  };

  const deleteChat = (idToDelete: string) => {
    setChats(prev => prev.filter(c => c.id !== idToDelete));
    if (activeChatId === idToDelete) { setActiveChatId(null); setViewMode("chat"); }
    showToast("Chat deleted successfully.", "success");
  };

  const handleLogout = () => { 
    setCurrentUser(null); setChats([]); setActiveChatId(null); setViewMode("auth"); 
    showToast("Logged out successfully.", "info");
  };

  const renderRail = (side: "left" | "right", topSlot?: React.ReactNode) => {
    if (viewMode === "auth") return null;
    const gearsRight = side === "right";
    const currentAngle = gearsRight ? rightAngle : leftAngle;
    const r = { mid: currentAngle, sm: -currentAngle * RATIO + (180 / N_SM) };
    
    const gearAreaH = (typeof window !== "undefined" ? window.innerHeight : 800) - TOP_H;
    const span = OR_SM + CENTER_D * 2 + OR_SM;
    const margin = Math.max(OR_SM * 0.2, (gearAreaH - span) / 2);
    const y1 = TOP_H + margin + OR_SM, y2 = y1 + CENTER_D, y3 = y2 + CENTER_D;

    const grayTint = dark ? { light: "#9a9aa8", mid: "#5e5e6c", dark: "#333340" } : { light: "#f0f0f4", mid: "#b6b6c4", dark: "#7a7a8a" };
    const blueTint = dark ? { light: "#84acf2", mid: "#3f6dc4", dark: "#213c73" } : { light: "#bcd4ff", mid: "#5b8ae6", dark: "#2f5fb0" };
    const panelBase: React.CSSProperties = { position: "absolute", width: PANEL_W, padding: "0 14px", transform: "translateY(-50%)", textAlign: gearsRight ? "right" : "left", ...(gearsRight ? { right: GEAR_VIS } : { left: GEAR_VIS }) };
    const btnStyle: React.CSSProperties = { width: "100%", textAlign: gearsRight ? "right" : "left", padding: "8px 12px", borderRadius: 9, background: dark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.07)", color: textPrimary, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none" };

    const panels = gearsRight
      ? [
          { y: y1, label: "Organizations", value: ORGANIZATIONS[orgIdx], onPick: () => sendMessage(`Tell me about ${ORGANIZATIONS[orgIdx]}`), onGear: () => { setRightAngle(a => a + STEP_DEG); setOrgIdx(i => (i + 1) % ORGANIZATIONS.length); } },
          { y: y2, label: "Majors", value: MAJORS[majIdx], onPick: () => sendMessage(`Tell me about the ${MAJORS[majIdx]} program`), onGear: () => { setRightAngle(a => a + STEP_DEG); setMajIdx(i => (i + 1) % MAJORS.length); } },
          { y: y3, label: "Documents", value: DOCUMENTS[docIdx], onPick: () => { sendMessage(`Show me the ${DOCUMENTS[docIdx]}`); }, onGear: () => { setRightAngle(a => a + STEP_DEG); setDocIdx(i => (i + 1) % DOCUMENTS.length); } },
        ]
      : [
          { y: y1, label: "Quick Prompts", value: QUICK_PROMPTS[quickIdx], onPick: () => sendMessage(QUICK_PROMPTS[quickIdx]), onGear: () => { setLeftAngle(a => a + STEP_DEG); setQuickIdx(i => (i + 1) % QUICK_PROMPTS.length); } },
          { y: y2, label: "", value: MID_CHOICES[midIdx], onPick: () => { if (midIdx === 0) { setActiveChatId(null); setViewMode("chat"); } else setGearMode(g => !g); }, onGear: () => { setLeftAngle(a => a + STEP_DEG); setMidIdx(i => (i + 1) % MID_CHOICES.length); }, mid: true },
          { y: y3, label: "Recent", value: chats.length > 0 ? chats[recentsIdx].title : "No chats", onPick: () => { if(chats.length) { setActiveChatId(chats[recentsIdx].id); setViewMode("chat"); } }, onGear: () => { setLeftAngle(a => a + STEP_DEG); if(chats.length) setRecentsIdx(i => (i + 1) % chats.length); }, sub: chats.length > 0 ? "Past Conversation" : "" },
        ];

    return (
      <aside style={{ width: isMobile && gearsRight ? 0 : RAIL_W, flexShrink: 0, background: bg, position: "relative", overflow: "hidden", display: isMobile && gearsRight ? "none" : "block" }}>
        <div style={{ position: "absolute", top: 0, bottom: 0, width: GEAR_VIS, zIndex: 1, ...(gearsRight ? { right: 0 } : { left: 0 }) }}>
          <GearAbs id={`g-${side}-top`} side={side} OR={OR_SM} IR={IR_SM} n={N_SM} tint={grayTint} holeColor={bg} centerY={y1} rotation={r.sm} onClick={panels[0].onGear} />
          <GearAbs id={`g-${side}-mid`} side={side} OR={OR_LG} IR={IR_LG} n={N_LG} tint={blueTint} holeColor={bg} centerY={y2} rotation={r.mid} onClick={panels[1].onGear} />
          <GearAbs id={`g-${side}-bot`} side={side} OR={OR_SM} IR={IR_SM} n={N_SM} tint={grayTint} holeColor={bg} centerY={y3} rotation={r.sm} onClick={panels[2].onGear} />
        </div>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: TOP_H, display: "flex", alignItems: "center", justifyContent: gearsRight ? "flex-end" : "flex-start", padding: "14px 16px 0", zIndex: 20 }}>{topSlot}</div>
        {panels.map((p: any, i: number) => (
          <div key={i} style={{ ...panelBase, top: p.y, zIndex: 10 }}>
            {p.label && <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: textFaint, marginBottom: 8 }}>{p.label}</div>}
            <button onClick={p.onPick} style={p.mid ? { ...btnStyle, display: "flex", alignItems: "center", gap: 8, justifyContent: gearsRight ? "flex-end" : "flex-start" } : p.sub ? { ...btnStyle, background: "transparent", padding: "2px 0" } : btnStyle}>
              {p.mid && (midIdx === 0 ? <Plus size={15} /> : <Settings size={15} />)}
              {p.sub ? (<><div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.value}</div><div style={{ fontSize: 11, color: textFaint, marginTop: 3 }}>{p.sub}</div></>) : p.value}
            </button>
            <div style={{ fontSize: 10, color: textFaint, marginTop: 6, opacity: 0.75 }}>{p.mid ? "click gear to cycle" : "click text to open"}</div>
          </div>
        ))}
      </aside>
    );
  };

  if (appLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100vw", background: dark ? "#1c1b22" : "#f8f9fa", alignItems: "center", justifyContent: "center", gap: 30 }}>
        <GearboxLoader />
        <div style={{ color: dark ? "#e8eaed" : "#1a1a2e", fontSize: 14, fontWeight: 700, letterSpacing: "0.2em", marginTop: 20 }}>
          INITIALIZING SYSTEM...
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%", overflow: "hidden", background: bg, fontFamily: "'Inter', sans-serif", color: textPrimary, position: "relative" }}>
      
      {/* Toast Notifications */}
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10 }}>
        {toasts.map((t: ToastMsg) => (
          <div key={t.id} style={{ background: dark ? '#25242c' : '#fff', border: `1px solid ${t.type === 'error' ? '#ef4444' : t.type === 'success' ? '#10b981' : '#4285f4'}`, color: textPrimary, padding: "12px 16px", borderRadius: 8, display: "flex", alignItems: "center", gap: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", fontSize: 14, fontWeight: 500, minWidth: 280, animation: "badgePop 0.3s cubic-bezier(0.2, 1.5, 0.5, 1)" }}>
            {t.type === 'success' && <CheckCircle size={18} color="#10b981" />}
            {t.type === 'error' && <AlertCircle size={18} color="#ef4444" />}
            {t.type === 'info' && <Info size={18} color="#4285f4" />}
            {t.message}
          </div>
        ))}
      </div>

      {/* Fullscreen Media Overlay */}
      {fullScreenMedia && (
        <div onClick={() => setFullScreenMedia(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999999, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', padding: 24 }}>
          <img src={fullScreenMedia} alt="Fullscreen View" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 8, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }} />
          <button onClick={() => setFullScreenMedia(null)} style={{ position: 'absolute', top: 24, right: 24, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}><X size={24} /></button>
        </div>
      )}

      {/* MOBILE DIMMED OVERLAY FOR SIDEBAR */}
      {isMobile && sidebarOpen && !gearMode && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }} 
        />
      )}

      {viewMode === "auth" ? (
        <AuthScreen dark={dark} onSuccess={(userData: User, userChats: Chat[]) => { setCurrentUser(userData); setChats(userChats); setViewMode("chat"); showToast(`Welcome back, ${userData.username || 'Bulsuan'}!`, "success"); }} onGuest={() => { setCurrentUser({ id: -1, email: "guest@bulsu.edu.ph", role: "student", username: "Guest User" }); setChats([]); setViewMode("chat"); showToast("Logged in as Guest.", "info"); }} />
      ) : (
        <>
          {gearMode && renderRail("left", 
            <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
              <Avatar name={currentUser?.username || currentUser?.email || "User"} size={30} bg="#7c3aed" />
              <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentUser?.username || currentUser?.email.split('@')[0]}</div>
              {currentUser?.id !== -1 && <button onClick={() => setShowProfileModal(true)} style={{ color: textMuted, background: "none", border: "none", cursor: "pointer", padding: 4 }} title="Edit Profile"><UserCog size={15} /></button>}
              {currentUser?.role === 'admin' && <button onClick={() => setViewMode(viewMode === 'admin' ? 'chat' : 'admin')} style={{ color: viewMode === "admin" ? "#4285f4" : textMuted, background: "none", border: "none", cursor: "pointer", padding: 4 }} title="Admin Panel"><Database size={15} /></button>}
              <button onClick={handleLogout} style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: 4 }} title="Logout"><LogOut size={15} /></button>
            </div>
          )}

          {!gearMode && (
            <aside style={{ width: sidebarOpen ? 256 : 0, flexShrink: 0, background: sbBg, overflow: "hidden", display: "flex", flexDirection: "column", transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)", position: isMobile ? "fixed" : "relative", zIndex: 50, height: "100%", boxShadow: isMobile && sidebarOpen ? "4px 0 24px rgba(0,0,0,0.5)" : "none" }}>
              <div style={{ width: 256, height: "100%", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 16px 12px", flexShrink: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}><SpinningGear size={18} color="#c0dcff" /><ChatCITLogo dark={dark} onBlue /></div>
                  <button onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: sb.muted }}><ArrowLeft size={15} /></button>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                  <div style={{ padding: "12px 12px 0 12px", display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>
                    <button onClick={() => {setActiveChatId(null); setViewMode("chat"); if(isMobile) setSidebarOpen(false);}} style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 14px", marginBottom: 32, borderRadius: 12, border: "none", cursor: "pointer", background: "rgba(255,255,255,0.12)", color: sb.text, fontSize: 13, fontWeight: 500 }}>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={13} /></div>New chat
                    </button>
                    <div style={{ padding: "0 4px 8px" }}><span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: sb.faint }}>Quick Prompts</span></div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 24 }}>
                      {QUICK_PROMPTS.map((lbl: string) => (
                        <button key={lbl} onClick={() => { sendMessage(lbl); if(isMobile) setSidebarOpen(false); }} style={{ textAlign: "left", padding: "8px 14px", borderRadius: 10, background: "transparent", color: sb.muted, border: `1px solid ${sb.border}`, fontSize: 13, cursor: "pointer" }} onMouseEnter={(e) => { e.currentTarget.style.background = sb.hover; e.currentTarget.style.color = sb.text; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = sb.muted; }}>{lbl}</button>
                      ))}
                    </div>
                    <div style={{ padding: "0 4px 8px" }}><span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: sb.faint }}>Recent</span></div>
                    <div style={{ maxHeight: 200, overflowY: "auto", padding: "0 4px", display: "flex", flexDirection: "column", gap: 3 }}>
                      {chats.slice(0, 5).map((chat: Chat) => (
                        <div key={chat.id} className="group" style={{ display: "flex", alignItems: "center", width: "100%", borderRadius: 10, background: activeChatId === chat.id && viewMode === "chat" ? sb.active : "transparent" }}>
                          <button onClick={() => { setActiveChatId(chat.id); setViewMode("chat"); if(isMobile) setSidebarOpen(false); }} style={{ flex: 1, textAlign: "left", padding: "9px 12px", background: "transparent", border: "none", cursor: "pointer", color: sb.text, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{chat.title}</div>
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ padding: "8px 10px", background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer" }}><Trash2 size={13} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ padding: "16px 12px 18px", borderTop: `1px solid ${sb.border}`, flexShrink: 0 }}>
                  <button onClick={() => { setGearMode(true); if(isMobile) setSidebarOpen(false); }} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", padding: "9px 12px", borderRadius: 12, border: `1px solid ${sb.border}`, background: "transparent", color: sb.text, fontSize: 12, cursor: "pointer", marginBottom: 14 }}><Settings size={12} /> Change taskbar mode</button>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div onClick={() => { if(currentUser?.id !== -1) setShowProfileModal(true) }} style={{ cursor: currentUser?.id !== -1 ? "pointer" : "default", transition: "transform 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                      <Avatar name={currentUser?.username || currentUser?.email || "User"} size={34} bg="#7c3aed" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: sb.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentUser?.id === -1 ? "Guest User" : currentUser?.username || currentUser?.email.split('@')[0]}</div>
                      {currentUser?.id !== -1 && <div style={{ fontSize: 11, color: sb.faint }}>{currentUser?.role === 'admin' ? 'Administrator' : 'Student'}</div>}
                    </div>
                    {currentUser?.id !== -1 && <button onClick={() => setShowProfileModal(true)} style={{ color: sb.muted, background: "none", border: "none", cursor: "pointer", padding: 5 }} title="Edit Profile"><UserCog size={15} /></button>}
                    {currentUser?.role === 'admin' && <button onClick={() => { setViewMode(viewMode === 'admin' ? 'chat' : 'admin'); if(isMobile) setSidebarOpen(false); }} style={{ color: viewMode === "admin" ? "#fff" : sb.muted, background: "none", border: "none", cursor: "pointer", padding: 5 }} title="Admin Dashboard"><Database size={15} /></button>}
                    <button onClick={handleLogout} style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: 5 }} title="Logout"><LogOut size={15} /></button>
                  </div>
                </div>
              </div>
            </aside>
          )}

          <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0, position: "relative" }}>
            <header style={{ display: "flex", alignItems: "center", height: TOP_H, padding: "14px 16px 0", flexShrink: 0 }}>
              {gearMode ? ( <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}><SpinningGear size={22} color="#4285f4" /><ChatCITLogo dark={dark} size={24} /></div> ) : ( <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>{!sidebarOpen && <button onClick={() => setSidebarOpen(true)} style={{ padding: 8, color: textMuted, background: "none", border: "none", cursor: "pointer" }}><Menu size={18} /></button>}{!sidebarOpen && <><SpinningGear size={18} color="#4285f4" /><ChatCITLogo dark={dark} /></>}</div> )}
            </header>
            <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
              {viewMode === "admin" ? (
                <AdminPanel dark={dark} showToast={showToast} />
              ) : !activeChat || activeChat.messages.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100%", padding: "48px 16px" }}>
                  <div style={{ transform: isMobile ? "scale(0.65)" : "scale(0.85)" }}>
                    <GearboxLoader />
                  </div>
                  <h1 style={{ fontSize: isMobile ? 24 : 30, fontWeight: 300, color: textPrimary, marginTop: 40, marginBottom: 8, letterSpacing: "-0.5px", textAlign: "center" }}>Hello, <strong style={{ fontWeight: 700 }}>{currentUser?.id === -1 ? "Guest" : currentUser?.username || currentUser?.email.split('@')[0] || "Bulsuan"}!</strong></h1>
                  <p style={{ color: textMuted, fontSize: 15, marginBottom: 32, textAlign: "center" }}>How can I help you today?</p>
                  
                  {topFaqs.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10, maxWidth: 700 }}>
                      {topFaqs.map((faq, idx) => {
                        const primaryTag = faq.keyword ? faq.keyword.split(',')[0].trim() : "Question";
                        return (
                          <button key={idx} onClick={() => sendMessage(primaryTag)} style={{ padding: "10px 18px", borderRadius: 24, border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, background: dark ? "rgba(255,255,255,0.03)" : "#fff", color: textPrimary, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s ease" }} onMouseEnter={e => e.currentTarget.style.background = dark ? "rgba(255,255,255,0.08)" : "#f8fafc"} onMouseLeave={e => e.currentTarget.style.background = dark ? "rgba(255,255,255,0.03)" : "#fff"}>
                            {primaryTag}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ maxWidth: 768, margin: "0 auto", padding: isMobile ? "16px 12px" : "24px 16px", display: "flex", flexDirection: "column", gap: 24 }}>
                  {activeChat.messages.map((msg: Message) => (
                    <div key={msg.id} className="group" style={{ display: "flex", gap: 10, flexDirection: msg.role === "user" ? "row-reverse" : "row", alignItems: "flex-start" }}>
                      {msg.role === "model" && <div style={{ flexShrink: 0, marginTop: 2 }}><SpinningGear size={22} color="#4285f4" /></div>}
                      {msg.role === "user" && <div style={{ flexShrink: 0, marginTop: 2 }}><Avatar name={currentUser?.username || currentUser?.email || "U"} size={28} bg="#7c3aed" /></div>}
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: isMobile ? "90%" : "82%", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                        {msg.role === "user" ? (
                          <div style={{ padding: "10px 16px", borderRadius: "18px 4px 18px 18px", background: dark ? "rgba(255,255,255,0.07)" : "#dce8fc", border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(21,88,214,0.2)"}`, color: dark ? "#e8eaed" : "#1a1a2e", fontSize: 14, lineHeight: 1.65 }}>{msg.content}</div>
                        ) : ( 
                          <>
                            <div style={{ paddingTop: 2 }}><MarkdownText text={msg.content} dark={dark} /></div>
                            {msg.picture && (
                              msg.picture.toLowerCase().includes('.pdf') ? (
                                <CanvasPDFViewer fileUrl={msg.picture} dark={dark} onEnlarge={(url) => setFullScreenMedia(url)} onLoad={scrollToBottom} isMobile={isMobile} />
                              ) : (
                                <img src={msg.picture} alt="Reference" onClick={() => setFullScreenMedia(msg.picture!)} onLoad={scrollToBottom} style={{ marginTop: 8, maxWidth: isMobile ? '100%' : 380, maxHeight: 480, objectFit: 'contain', borderRadius: 8, border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`, cursor: 'zoom-in' }} />
                              )
                            )}
                          </> 
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <div style={{ flexShrink: 0, marginTop: 2 }}><SpinningGear size={22} color="#4285f4" /></div>
                      <div style={{ paddingTop: 3 }}><ChatLoader /></div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {viewMode === "chat" && (
              <div style={{ flexShrink: 0, padding: isMobile ? "8px 12px 12px" : "8px 16px 16px" }}>
                <div style={{ maxWidth: 768, margin: "0 auto" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, borderRadius: 16, background: inputBg, border: `1px solid ${inputBorder}`, padding: "10px 12px", boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
                    <textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} placeholder="Ask ChatCIT..." rows={1} style={{ flex: 1, resize: "none", background: "transparent", padding: 0, fontSize: 14, color: textPrimary, outline: "none", lineHeight: 1.5, maxHeight: 120, overflowY: "auto", fontFamily: "inherit" }} />
                    <button onClick={() => sendMessage()} disabled={!input.trim() || isTyping} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 9, border: "none", cursor: input.trim() && !isTyping ? "pointer" : "not-allowed", background: input.trim() && !isTyping ? "#4285f4" : dark ? "rgba(255,255,255,0.1)" : "#e5e7eb", color: input.trim() && !isTyping ? "#fff" : textFaint }}><Send size={14} /></button>
                  </div>
                </div>
              </div>
            )}
          </main>
          
          {renderRail("right", 
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => setShowBugModal(true)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 12, background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", border: "1px solid rgba(128,128,128,0.2)", color: "#ef4444", cursor: "pointer", transition: "background 0.2s" }} title="Report a Bug"><Bug size={22} /></button>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44 }}>
                <DayNightToggle dark={dark} toggleDark={() => setDark(!dark)} />
              </div>
            </div>
          )}

          {showProfileModal && currentUser && <ProfileModal dark={dark} user={currentUser} onClose={() => setShowProfileModal(false)} onUpdate={(updated: User) => { setCurrentUser(updated); showToast("Profile updated successfully!", "success"); }} showToast={showToast} />}
          {showBugModal && <BugModal dark={dark} user={currentUser} onClose={() => setShowBugModal(false)} showToast={showToast} />}
        </>
      )}
    </div>
  );
}