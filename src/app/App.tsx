import React, { useState, useRef, useEffect } from "react";
import { Plus, Settings, Database, Trash2, LogOut, Bug, AlertCircle, CheckCircle, Info, ArrowLeft, Menu, UserCog, X, MoreVertical, Bot, Calendar, MessageSquare, Users, Moon, Sun, Zap, FileText, GraduationCap, ChevronLeft, ChevronRight, ChevronsRight, ChevronsLeft, FastForward, Rewind } from "lucide-react";

import { AuthScreen } from "../components/authmodal";
import { AdminPanel } from "../components/admindashboard";
import { ProfileModal } from "../components/modals/profilemodal";
import { BugModal } from "../components/modals/bugsmodal";
import { AcademicCalendar } from "../components/modals/academiccalendar"; 

import { ChatCITLogo, Avatar, GearAbs, DayNightToggle, GearboxLoader, RATIO, N_SM, OR_SM, CENTER_D, TOP_H, GEAR_VIS, RAIL_W, STEP_DEG, OR_LG, PANEL_W, IR_SM, IR_LG, N_LG } from "../components/ui/helpers";

import { ChatLoader } from "../components/ui/chatloader";
import { CosmicInput } from "../components/ui/inputbar";
import { ChatMessageBubble } from "../components/chatmessagebubble";

import { Message, Chat, User, ToastMsg } from "../types";
import { QUICK_PROMPTS, ORGANIZATIONS, MAJORS, DOCUMENTS, MID_CHOICES, API_URL, DEFAULT_CATEGORIES, ALL_DEPTS } from "../config";

export default function App() {
  // --- KIOSK STATE (Toggled via Ctrl+K) ---
  const [simKiosk, setSimKiosk] = useState(false);
  const [simScale, setSimScale] = useState(1);
  const [screenState, setScreenState] = useState<"screensaver" | "kiosk_result" | "chat">("screensaver");
  const [kioskCategory, setKioskCategory] = useState<"Quick Prompts" | "Organizations" | "Majors" | "Documents" | null>(null);
  
  // Custom Result View State
  const [kioskResult, setKioskResult] = useState<{ title: string, content?: string, loading?: boolean, image?: string, isPdf?: boolean, pdfUrl?: string } | null>(null);
  const [pdfPage, setPdfPage] = useState(1);

  const [kbOpen, setKbOpen] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && (window.innerWidth <= 1280 || simKiosk));
  
  const [appLoading, setAppLoading] = useState(true); 
  const [dark, setDark] = useState(true);
  
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const [showAuthPopup, setShowAuthPopup] = useState(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem('chatcit_user');
      if (!savedUser) return true;
      try { const u = JSON.parse(savedUser); if (Number(u.id) === -1) return true; } catch (e) { return true; }
    }
    return false;
  });

  const [guestMessageCount, setGuestMessageCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [viewMode, setViewMode] = useState<"chat" | "admin">("chat"); 
  const [chats, setChats] = useState<Chat[]>([]);

  const [adminTab, setAdminTab] = useState<'knowledge' | 'faq' | 'unanswered' | 'bugs' | 'users'>('knowledge');
  const [adminCategory, setAdminCategory] = useState("All");
  const [adminDept, setAdminDept] = useState("All");
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [dbCategories, setDbCategories] = useState<string[]>([]);

  const allDynamicCategories = Array.from(new Set([...DEFAULT_CATEGORIES.filter(c => c !== "All"), ...customCategories, ...dbCategories]));

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get("token");
      if (tokenFromUrl) {
        setResetToken(tokenFromUrl);
        setShowResetModal(true);
        window.history.replaceState({}, document.title, window.location.pathname); 
      }
    }
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('chatcit_user');
    const isGuest = !savedUser || Number(JSON.parse(savedUser).id) === -1;

    if (!isGuest) {
      setCurrentUser(JSON.parse(savedUser!));
      const savedChats = localStorage.getItem('chatcit_chats');
      if (savedChats) {
        try {
          const parsed = JSON.parse(savedChats);
          setChats(parsed.map((c: any) => ({ ...c, timestamp: new Date(c.timestamp), messages: c.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })) })));
        } catch (e) { }
      }
    } else {
      setCurrentUser({ id: -1, email: "guest@bulsu.edu.ph", role: "student", username: "Guest User" });
      setChats([]); 
    }

    const savedMode = localStorage.getItem('chatcit_viewMode');
    if (savedMode && savedMode !== "auth") setViewMode(savedMode as "chat" | "admin");
    
    setTimeout(() => setAppLoading(false), 1200);
  }, []);

  // --- KIOSK HOTKEY LISTENER (Ctrl + K) ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSimKiosk(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- AUTO-IDLE RESET TIMER (60 Seconds) ---
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const resetTimer = () => {
      if (!simKiosk) return; 
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setScreenState("screensaver");
        setKioskCategory(null);
        setKioskResult(null);
        setActiveChatId(null);
        setViewMode("chat");
        setSidebarOpen(!isMobile);
        setRightRailOpen(false);
      }, 60000); 
    };

    resetTimer();
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(e => document.addEventListener(e, resetTimer));

    return () => {
      clearTimeout(timeoutId);
      events.forEach(e => document.removeEventListener(e, resetTimer));
    };
  }, [simKiosk, isMobile]);

  useEffect(() => {
    if (simKiosk) {
      setScreenState("screensaver");
      setKioskCategory(null);
      setKioskResult(null);
    }
  }, [simKiosk]);

  useEffect(() => {
    if (!appLoading) {
      if (currentUser && Number(currentUser.id) !== -1) {
        localStorage.setItem('chatcit_user', JSON.stringify(currentUser));
        localStorage.setItem('chatcit_chats', JSON.stringify(chats));
      } else {
        localStorage.removeItem('chatcit_user');
        localStorage.removeItem('chatcit_chats');
      }
      localStorage.setItem('chatcit_viewMode', viewMode);
    }
  }, [currentUser, viewMode, chats, appLoading]);

  useEffect(() => {
    if (viewMode === 'admin') setGearMode(false);
  }, [viewMode]);

  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const [fullScreenMedia, setFullScreenMedia] = useState<string | null>(null);
  const [fullScreenIframe, setFullScreenIframe] = useState<string | null>(null); 

  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [rightRailOpen, setRightRailOpen] = useState(false); 
  const [gearMode, setGearMode] = useState(false);
  
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showBugModal, setShowBugModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  
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
  const activeChat = chats.find((c) => c.id === activeChatId) ?? null;

  // --- STRICT GUEST TRAP HANDLER ---
  const requireAuth = (action: () => void) => {
    if (currentUser && Number(currentUser.id) === -1) {
      setAuthMode("login"); 
      setShowAuthPopup(true);
      if (isMobile) {
        setSidebarOpen(false);
        setRightRailOpen(false);
      }
    } else {
      action();
    }
  };

  // --- PERFECT KIOSK SCALING (Maintains Ratio, Fills Screen) ---
  useEffect(() => {
    const handleResize = () => {
      const scaleX = window.innerWidth / 768;
      const scaleY = window.innerHeight / 1366;
      const scale = Math.min(scaleX, scaleY);
      setSimScale(scale);
      
      const mobile = window.innerWidth <= 1280 || simKiosk;
      setIsMobile(prevMobile => {
        if (!prevMobile && mobile) {
            setSidebarOpen(false); 
        } else if (prevMobile && !mobile && !simKiosk) {
            setSidebarOpen(true); 
        }
        return mobile;
      });
    };
    
    handleResize(); 
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [simKiosk]); 

  // VIRTUAL KEYBOARD FOCUS DETECTOR
  useEffect(() => {
    if (!simKiosk) { setKbOpen(false); return; }
    
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName) && target.getAttribute('type') !== 'file') {
        setKbOpen(true);
      }
    };
    const handleFocusOut = () => {
      setTimeout(() => {
        const el = document.activeElement;
        if (!el || !['INPUT', 'TEXTAREA'].includes(el.tagName)) {
          setKbOpen(false);
        }
      }, 100);
    };

    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);
    return () => { window.removeEventListener('focusin', handleFocusIn); window.removeEventListener('focusout', handleFocusOut); };
  }, [simKiosk]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };

  useEffect(() => {
    fetch(`${API_URL}/faqs/top`).then(res => res.json()).then(data => setTopFaqs(data)).catch(() => {});
  }, []);

  const handlePasswordReset = async () => {
    if (!newPassword || newPassword.length < 6) {
      showToast("Password must be at least 6 characters.", "error");
      return;
    }
    setIsResetting(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, newPassword })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      showToast(data.message || "Password reset successfully!", "success");
      setShowResetModal(false);
      setResetToken(null);
      setNewPassword("");
      
      setAuthMode("login");
      setShowAuthPopup(true);
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setIsResetting(false);
    }
  };

  const sendMessage = async (text: string = input) => {
    if (!text.trim() || isTyping) return;
    const content = text.trim();
    setInput("");
    
    if (simKiosk && (screenState === "screensaver" || screenState === "kiosk_result")) {
      setScreenState("chat");
      setKioskCategory(null);
      setKioskResult(null);
    }

    if (currentUser && Number(currentUser.id) === -1) {
      const newCount = guestMessageCount + 1;
      setGuestMessageCount(newCount);
      if (newCount % 3 === 0) {
        setAuthMode("login"); 
        setShowAuthPopup(true);
      }
    }
    
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
        body: JSON.stringify({ chatId: chatId, message: content, history: messagesToSend })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      const mMsg: Message = { id: `msg-${Date.now()}`, role: "model", content: data.reply || "Sorry, I encountered an error communicating with my database.", timestamp: new Date(), pictures: data.pictures };
      setChats((p) => p.map((c) => c.id === chatId ? { ...c, messages: [...c.messages, mMsg] } : c));
    } catch (error: any) {
      const errorMessage = error.message === "Unexpected end of JSON input" || error.message.includes("failed") 
        ? "⚠️ Connection failed. Is the Node.js backend server running?" : `⚠️ ${error.message}`;
      const errorMsg: Message = { id: `msg-${Date.now()}`, role: "model", content: errorMessage, timestamp: new Date() };
      setChats((p) => p.map((c) => c.id === chatId ? { ...c, messages: [...c.messages, errorMsg] } : c));
    } finally {
      setIsTyping(false);
    }
  };

  // --- KIOSK DEDICATED SELECTION HANDLER ---
  const handleKioskSelection = async (category: string, item: string) => {
    const action = async () => {
      let prompt = item;
      if (category === "Organizations") prompt = `Tell me about ${item}`;
      if (category === "Majors") prompt = `Tell me about the ${item} program`;
      if (category === "Documents") prompt = `Show me the ${item}`;
      
      setScreenState("kiosk_result");

      // Handle Document View (PDF)
      if (category === "Documents" || item === "Handbook" || item === "Magna Carta" || item === "Completion Form" || item.includes("Form")) {
         setKioskResult({ title: item, isPdf: true, pdfUrl: `/docs/${item.replace(/\s+/g, '-').toLowerCase()}.pdf` });
         setPdfPage(1);
         return;
      }

      // Handle Text/Image View
      setKioskResult({ title: item, loading: true, image: getCardImage(item) });

      try {
         const response = await fetch(`${API_URL}/chat`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chatId: `kiosk-${Date.now()}`, message: prompt, history: [] })
         });
         const data = await response.json();
         if (data.error) throw new Error(data.error);

         setKioskResult({ title: item, loading: false, content: data.reply, image: getCardImage(item) });
      } catch (e) {
         setKioskResult({ title: item, loading: false, content: "I am having trouble connecting to the database right now. Please try again later.", image: getCardImage(item) });
      }
    };

    if (category === "Majors" || item.toLowerCase().includes("facilities")) {
      action();
    } else {
      requireAuth(action);
    }
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const getCardImage = (item: string) => {
    const images: Record<string, string> = {
      "Handbook": "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&q=80",
      "Industry Partners": "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=800&q=80",
      "Facilities": "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
      "Faculty & Teachers": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80",
      "Magna Carta": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=80",
      "Computer Technology": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
      "Local Student Council": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
      "Completion Form": "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=800&q=80"
    };
    return images[item] || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80";
  };

  const deleteChat = (idToDelete: string) => {
    setChats(prev => prev.filter(c => c.id !== idToDelete));
    if (activeChatId === idToDelete) { setActiveChatId(null); setViewMode("chat"); }
    showToast("Chat deleted successfully.", "success");
  };

  const handleLogout = () => { 
    setCurrentUser({ id: -1, email: "guest@bulsu.edu.ph", role: "student", username: "Guest User" }); 
    setChats([]); 
    setActiveChatId(null); 
    setViewMode("chat"); 
    localStorage.removeItem('chatcit_user');
    localStorage.removeItem('chatcit_chats');
    showToast("Logged out successfully.", "info");
    setAuthMode("login");
    setShowAuthPopup(true);
  };

  const handleVirtualKeyPress = (key: string, e: React.MouseEvent) => {
    e.preventDefault(); 
    const el = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
    if (!el || !['INPUT', 'TEXTAREA'].includes(el.tagName)) return;

    let newValue = el.value;

    if (key === 'BACK') {
      newValue = newValue.slice(0, -1);
    } else if (key === 'ENTER') {
      const form = el.closest('form');
      if (form) {
         const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
         if (submitBtn && !submitBtn.disabled) submitBtn.click();
      } else {
         el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
      }
      return;
    } else if (key === 'CLOSE') {
      setKbOpen(false);
      el.blur();
      return;
    } else if (key === 'SPACE') {
      newValue += ' ';
    } else {
      newValue += key;
    }

    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;

    if (el.tagName === 'INPUT' && nativeInputValueSetter) {
      nativeInputValueSetter.call(el, newValue);
    } else if (el.tagName === 'TEXTAREA' && nativeTextAreaValueSetter) {
      nativeTextAreaValueSetter.call(el, newValue);
    } else {
      el.value = newValue; 
    }

    el.dispatchEvent(new Event('input', { bubbles: true }));
  };

  // --- DYNAMIC TOP RIGHT BUTTONS ---
  const trBtnSize = simKiosk ? 64 : 40;
  const trIconSize = simKiosk ? 32 : 20;
  const trRadius = simKiosk ? 20 : 12;
  const trGap = simKiosk ? 20 : 12;

  const topRightButtons = (
    <div style={{ display: "flex", alignItems: "center", gap: trGap }}>
      <button onClick={() => requireAuth(() => setShowBugModal(true))} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: trBtnSize, height: trBtnSize, borderRadius: trRadius, background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)", color: "#ef4444", cursor: "pointer", transition: "all 0.2s" }} title="Report a Bug"><Bug size={trIconSize} /></button>
      <button onClick={() => requireAuth(() => setShowCalendar(true))} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: trBtnSize, height: trBtnSize, borderRadius: trRadius, background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)", color: "#10b981", cursor: "pointer", transition: "all 0.2s" }} title="Academic Calendar"><Calendar size={trIconSize} /></button>
      <div className="theme-toggle-wrapper" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: trBtnSize, transform: simKiosk ? 'scale(1.3)' : 'scale(0.85)', transformOrigin: 'center' }}>
        <DayNightToggle dark={dark} toggleDark={() => setDark(!dark)} />
      </div>
    </div>
  );

  const renderRail = (side: "left" | "right", topSlot?: React.ReactNode) => {
    const gearsRight = side === "right";
    const currentAngle = gearsRight ? rightAngle : leftAngle;
    const r = { mid: currentAngle, sm: -currentAngle * RATIO + (180 / N_SM) };
    
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
    const gearAreaH = vh - TOP_H;
    const span = OR_SM + CENTER_D * 2 + OR_SM;
    const margin = Math.max(OR_SM * 0.2, (gearAreaH - span) / 2);
    const y1 = TOP_H + margin + OR_SM, y2 = y1 + CENTER_D, y3 = y2 + CENTER_D;

    const grayTint = dark ? { light: "#9a9aa8", mid: "#5e5e6c", dark: "#333340" } : { light: "#f0f0f4", mid: "#b6b6c4", dark: "#7a7a8a" };
    const blueTint = dark ? { light: "#84acf2", mid: "#3f6dc4", dark: "#213c73" } : { light: "#bcd4ff", mid: "#5b8ae6", dark: "#2f5fb0" };
    const panelBase: React.CSSProperties = { position: "absolute", width: PANEL_W, padding: "0 14px", transform: "translateY(-50%)", textAlign: gearsRight ? "right" : "left", ...(gearsRight ? { right: GEAR_VIS } : { left: GEAR_VIS }) };

    const panels = gearsRight
      ? [
          { y: y1, label: "Organizations", value: ORGANIZATIONS[orgIdx], onPick: () => requireAuth(() => { sendMessage(`Tell me about ${ORGANIZATIONS[orgIdx]}`); if(isMobile) setRightRailOpen(false); }), onGear: () => { setRightAngle(a => a + STEP_DEG); setOrgIdx(i => (i + 1) % ORGANIZATIONS.length); } },
          { y: y2, label: "Majors", value: MAJORS[majIdx], onPick: () => { sendMessage(`Tell me about the ${MAJORS[majIdx]} program`); if(isMobile) setRightRailOpen(false); }, onGear: () => { setRightAngle(a => a + STEP_DEG); setMajIdx(i => (i + 1) % MAJORS.length); } },
          { y: y3, label: "Documents", value: DOCUMENTS[docIdx], onPick: () => requireAuth(() => { sendMessage(`Show me the ${DOCUMENTS[docIdx]}`); if(isMobile) setRightRailOpen(false); }), onGear: () => { setRightAngle(a => a + STEP_DEG); setDocIdx(i => (i + 1) % DOCUMENTS.length); } },
        ]
      : [
          { y: y1, label: "Quick Prompts", value: QUICK_PROMPTS[quickIdx], onPick: () => { 
            if (QUICK_PROMPTS[quickIdx].toLowerCase().includes('facilities')) {
              sendMessage(QUICK_PROMPTS[quickIdx]); if(isMobile) setSidebarOpen(false);
            } else {
              requireAuth(() => { sendMessage(QUICK_PROMPTS[quickIdx]); if(isMobile) setSidebarOpen(false); });
            }
          }, onGear: () => { setLeftAngle(a => a + STEP_DEG); setQuickIdx(i => (i + 1) % QUICK_PROMPTS.length); } },
          { y: y2, label: "", value: MID_CHOICES[midIdx], onPick: () => { if (midIdx === 0) { requireAuth(() => { setActiveChatId(null); setViewMode("chat"); if(isMobile) setSidebarOpen(false); }); } else { setGearMode(g => !g); if(isMobile) setSidebarOpen(false); } }, onGear: () => { setLeftAngle(a => a + STEP_DEG); setMidIdx(i => (i + 1) % MID_CHOICES.length); }, mid: true },
          { y: y3, label: "Recent", value: chats.length > 0 ? chats[recentsIdx].title : "No chats", onPick: () => requireAuth(() => { if(chats.length) { setActiveChatId(chats[recentsIdx].id); setViewMode("chat"); if(isMobile) setSidebarOpen(false); } }), onGear: () => { setLeftAngle(a => a + STEP_DEG); if(chats.length) setRecentsIdx(i => (i + 1) % chats.length); }, sub: chats.length > 0 ? "Past Conversation" : "" },
        ];

    const isOpen = gearsRight ? rightRailOpen : sidebarOpen;
    
    const railStyle: React.CSSProperties = {
      width: RAIL_W, flexShrink: 0, background: bg, position: "absolute", top: 0, bottom: 0,
      left: !gearsRight ? (isMobile ? (isOpen ? 0 : -RAIL_W) : 0) : "auto",
      right: gearsRight ? (isMobile ? (isOpen ? 0 : -RAIL_W) : 0) : "auto",
      zIndex: 60, transition: "all 0.3s ease",
      boxShadow: isMobile && isOpen ? "0 0 24px rgba(0,0,0,0.5)" : "none", overflow: "hidden"
    };

    return (
      <aside style={railStyle}>
        <div style={{ position: "absolute", top: 0, bottom: 0, width: GEAR_VIS, zIndex: 1, ...(gearsRight ? { right: 0 } : { left: 0 }) }}>
          <GearAbs id={`g-${side}-top`} side={side} OR={OR_SM} IR={IR_SM} n={N_SM} tint={grayTint} holeColor={bg} centerY={y1} rotation={r.sm} onClick={panels[0].onGear} />
          <GearAbs id={`g-${side}-mid`} side={side} OR={OR_LG} IR={IR_LG} n={N_LG} tint={blueTint} holeColor={bg} centerY={y2} rotation={r.mid} onClick={panels[1].onGear} />
          <GearAbs id={`g-${side}-bot`} side={side} OR={OR_SM} IR={IR_SM} n={N_SM} tint={grayTint} holeColor={bg} centerY={y3} rotation={r.sm} onClick={panels[2].onGear} />
        </div>
        
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: TOP_H, display: "flex", alignItems: "center", justifyContent: gearsRight ? "flex-end" : "flex-start", padding: "14px 16px 0", zIndex: 20 }}>
          {topSlot}
        </div>
        
        {panels.map((p: any, i: number) => {
          const isMidBtn = p.mid;
          const justify = isMidBtn ? (gearsRight ? "flex-end" : "flex-start") : "center";
          const align = isMidBtn ? "center" : (gearsRight ? "flex-end" : "flex-start");
          const textDirection = isMidBtn ? "row" : "column";

          return (
            <div key={i} style={{ ...panelBase, top: p.y, zIndex: 10 }}>
              {p.label && <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: textFaint, marginBottom: 8, textAlign: gearsRight ? "right" : "left" }}>{p.label}</div>}
              
              <button 
                onClick={p.onPick} 
                className={`gear-panel-btn ${p.sub ? 'is-sub' : ''}`}
                style={{
                  flexDirection: textDirection,
                  alignItems: align,
                  justifyContent: justify,
                  gap: isMidBtn ? "8px" : "0",
                  textAlign: gearsRight ? "right" : "left"
                }}
              >
                {isMidBtn && (midIdx === 0 ? <Plus size={16} style={{ flexShrink: 0 }} /> : <Settings size={16} style={{ flexShrink: 0 }} />)}
                
                {p.sub ? (
                  <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: gearsRight ? 'flex-end' : 'flex-start' }}>
                    <div style={{ width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.value}</div>
                    <div style={{ fontSize: 10, color: textFaint, marginTop: 4, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>{p.sub}</div>
                  </div>
                ) : (
                  <span style={{ display: "block", width: "100%", whiteSpace: "normal", wordBreak: "break-word", lineHeight: 1.25 }}>
                    {isMidBtn && midIdx === 0 ? p.value.replace(/^\+\s*/, '') : p.value}
                  </span>
                )}
              </button>
              
              <div style={{ fontSize: 10, color: textFaint, marginTop: 8, opacity: 0.8, fontWeight: 500, textAlign: gearsRight ? "right" : "left" }}>click gear to cycle</div>
            </div>
          );
        })}
      </aside>
    );
  };

  const bg = dark ? "#1c1b22" : "#f4f5f7";
  const sbBg = dark ? "#0d2460" : "#1558d6";
  const textPrimary = dark ? "#e8eaed" : "#1a1a2e";
  const textMuted = dark ? "#9aa0a6" : "#6b7280";
  const textFaint = dark ? "#5f6368" : "#9ca3af";
  const sb = { text: "#fff", muted: "rgba(255,255,255,0.70)", faint: "rgba(255,255,255,0.42)", hover: "rgba(255,255,255,0.10)", active: "rgba(255,255,255,0.20)", border: "rgba(255,255,255,0.14)" };

  if (appLoading) {
    return (
      <div className={dark ? "dark-mode" : "light-mode"} style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", background: bg, alignItems: "center", justifyContent: "center", zIndex: 99999 }}>
        <div style={{ width: 100, height: 100, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", transform: 'scale(1.2)' }}>
            <GearboxLoader />
          </div>
        </div>
        <div style={{ color: textPrimary, fontSize: 14, fontWeight: 700, letterSpacing: "0.2em", marginTop: 40 }}>
          INITIALIZING SYSTEM...
        </div>
      </div>
    );
  }

  const containerStyle: React.CSSProperties = simKiosk ? {
    position: "fixed", top: "50%", left: "50%",
    width: 768, height: 1366, 
    transform: `translate(-50%, -50%) scale(${simScale})`,
    transformOrigin: "center center",
    display: "flex", overflow: "hidden", background: bg, 
    fontFamily: "'Inter', sans-serif", color: textPrimary,
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.8), 0 0 0 16px #111", 
    borderRadius: 24
  } : {
    position: "fixed", top: 0, bottom: 0, left: 0, right: 0, 
    display: "flex", overflow: "hidden", background: bg, 
    fontFamily: "'Inter', sans-serif", color: textPrimary 
  };

  const virtualKeyRows = [
    ['1','2','3','4','5','6','7','8','9','0'],
    ['q','w','e','r','t','y','u','i','o','p'],
    ['a','s','d','f','g','h','j','k','l'],
    ['z','x','c','v','b','n','m', 'BACK'],
    ['SPACE', 'ENTER', 'CLOSE']
  ];

  return (
    <>
      <style>{`
        .theme-toggle-wrapper input[type="checkbox"] { display: none !important; opacity: 0 !important; width: 0px !important; height: 0px !important; position: absolute; z-index: -100; }
        
        .light-mode aside .brand-logo-fix svg path,
        .light-mode aside .brand-logo-fix svg circle,
        .light-mode aside .brand-logo-fix svg rect,
        .light-mode aside .brand-logo-fix span,
        .light-mode aside .brand-logo-fix div {
           fill: #ffffff !important;
           color: #ffffff !important;
        }

        /* FULLSCREEN SCREENSAVER OVERLAY */
        .screensaver-fullscreen {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          z-index: 999995;
          background: url('/Screensaver.jpg') center/cover no-repeat;
          background-color: ${dark ? '#0f172a' : '#ffffff'};
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.3s ease;
          border-radius: inherit;
          overflow: hidden;
        }
        
        .screensaver-overlay {
          position: absolute;
          inset: 0;
          background: ${dark ? 'linear-gradient(180deg, rgba(15,23,42,0.4) 0%, rgba(15,23,42,0.95) 100%)' : 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.98) 100%)'};
          backdrop-filter: blur(12px);
        }

        .screensaver-content {
          position: relative;
          z-index: 999996;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 800px;
          padding: 32px 24px;
        }

        .bento-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          width: 100%;
          max-width: 600px;
          margin-top: 50px;
          margin-bottom: 40px;
        }

        /* Carousel structural styles */
        .carousel-track::-webkit-scrollbar { display: none; }
        .nav-arrow {
          display: flex; align-items: center; justify-content: center;
          width: 56px; height: 56px; border-radius: 50%; border: none; cursor: pointer;
          background: ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
          color: ${dark ? '#fff' : '#1a1a2e'};
          transition: all 0.2s; flex-shrink: 0;
        }
        .nav-arrow:hover { background: ${dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}; transform: scale(1.05); }

        .bento-card {
          background: ${dark ? 'rgba(30, 35, 50, 0.6)' : 'rgba(240, 245, 255, 0.9)'};
          border: 1px solid ${dark ? 'rgba(66, 133, 244, 0.2)' : 'rgba(66, 133, 244, 0.3)'};
          padding: 32px 24px;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          color: ${dark ? '#fff' : '#1a1a2e'};
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          text-align: center;
        }
        .bento-card:hover {
          transform: translateY(-6px) scale(1.02);
          background: ${dark ? 'rgba(40, 50, 75, 0.8)' : '#ffffff'};
          border-color: rgba(66, 133, 244, 0.8);
          box-shadow: 0 16px 48px rgba(66, 133, 244, 0.25);
        }
        .bento-card:active { transform: scale(0.96); }
        .bento-card span { font-size: 20px; font-weight: 700; letter-spacing: 0.02em; }

        .chat-cta-btn {
          width: 100%;
          max-width: 600px;
          background: linear-gradient(135deg, #4285f4 0%, #1e3a8a 100%);
          color: #fff;
          border: none;
          padding: 24px;
          border-radius: 24px;
          font-size: 24px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          cursor: pointer;
          box-shadow: 0 12px 32px rgba(66, 133, 244, 0.4), inset 0 2px 4px rgba(255,255,255,0.2);
          transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
          animation: pulseGlow 2.5s infinite;
        }
        .chat-cta-btn:hover {
          transform: scale(1.02);
          box-shadow: 0 16px 48px rgba(66, 133, 244, 0.6), inset 0 2px 4px rgba(255,255,255,0.3);
        }
        .chat-cta-btn:active { transform: scale(0.98); }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          background: ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
          border: 1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
          color: ${dark ? '#fff' : '#1a1a2e'};
          padding: 12px 24px;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          align-self: flex-start;
          transition: all 0.2s;
        }
        .back-btn:hover { background: ${dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}; transform: translateX(-4px); }

        .pdf-btn {
           background: ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
           border: none;
           color: ${dark ? '#fff' : '#000'};
           padding: 8px 16px;
           border-radius: 8px;
           font-weight: 700;
           font-size: 16px;
           cursor: pointer;
           transition: all 0.2s;
           display: flex; align-items: center; justify-content: center;
        }
        .pdf-btn:hover { background: rgba(66, 133, 244, 0.6); color: #fff; }
        .pdf-btn:active { transform: scale(0.95); }

        @keyframes pulseGlow {
          0% { box-shadow: 0 0 0 0 rgba(66, 133, 244, 0.6); }
          70% { box-shadow: 0 0 0 20px rgba(66, 133, 244, 0); }
          100% { box-shadow: 0 0 0 0 rgba(66, 133, 244, 0); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        /* GEAR PANEL BUTTONS */
        .gear-panel-btn {
          width: 100%;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
          backdrop-filter: blur(12px);
          z-index: 10;
          position: relative;
          display: flex;
        }
        .dark-mode .gear-panel-btn {
          background: linear-gradient(135deg, rgba(30, 35, 50, 0.7) 0%, rgba(15, 18, 25, 0.7) 100%);
          border: 1px solid rgba(66, 133, 244, 0.2);
          color: #e8eaed;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.05);
        }
        .dark-mode .gear-panel-btn:hover {
          background: linear-gradient(135deg, rgba(40, 50, 75, 0.9) 0%, rgba(20, 25, 35, 0.9) 100%);
          border-color: rgba(66, 133, 244, 0.9);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6), 0 0 20px rgba(66, 133, 244, 0.4);
          transform: scale(1.04) translateY(-2px);
          color: #fff;
          text-shadow: 0 0 8px rgba(255,255,255,0.3);
        }
        .light-mode .gear-panel-btn {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(230, 240, 255, 0.95) 100%);
          border: 1px solid rgba(66, 133, 244, 0.4);
          color: #0f172a;
          box-shadow: 0 4px 12px rgba(66, 133, 244, 0.15), inset 0 2px 4px rgba(255, 255, 255, 1);
        }
        .light-mode .gear-panel-btn:hover {
          background: linear-gradient(135deg, #ffffff 0%, rgba(220, 235, 255, 1) 100%);
          border-color: rgba(66, 133, 244, 0.9);
          box-shadow: 0 8px 24px rgba(66, 133, 244, 0.3), 0 0 20px rgba(66, 133, 244, 0.35);
          transform: scale(1.04) translateY(-2px);
          color: #1558d6;
        }
        .gear-panel-btn:active { transform: scale(0.98) !important; }

        .gear-panel-btn.is-sub {
          background: transparent !important;
          border: 1px dashed rgba(150, 150, 150, 0.3) !important;
          box-shadow: none !important;
          padding: 8px 12px;
        }
        .dark-mode .gear-panel-btn.is-sub:hover {
          border-color: rgba(66, 133, 244, 0.6) !important;
          background: rgba(66, 133, 244, 0.1) !important;
        }
        .light-mode .gear-panel-btn.is-sub:hover {
          border-color: rgba(66, 133, 244, 0.6) !important;
          background: rgba(66, 133, 244, 0.05) !important;
        }

        /* NEW STANDARD SIDEBAR BUTTONS */
        .sidebar-btn {
          width: 100%;
          padding: 10px 14px;
          border-radius: 12px; 
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1px solid transparent;
          text-align: left;
        }
        .dark-mode .sidebar-btn {
          background: rgba(255,255,255,0.03);
          color: #9aa0a6; 
          border-color: rgba(255,255,255,0.05);
        }
        .dark-mode .sidebar-btn.primary {
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%);
          color: #fff;
          border-color: rgba(255,255,255,0.15);
          font-weight: 600;
          box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.05);
        }
        .dark-mode .sidebar-btn:hover {
          background: linear-gradient(135deg, rgba(66, 133, 244, 0.2) 0%, rgba(66, 133, 244, 0.05) 100%);
          border-color: rgba(66, 133, 244, 0.5);
          color: #fff;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .light-mode .sidebar-btn {
          background: rgba(255,255,255,0.1);
          color: #ffffff; 
          border-color: rgba(255,255,255,0.2);
        }
        .light-mode .sidebar-btn.primary {
          background: linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%);
          color: #1558d6;
          border-color: rgba(66, 133, 244, 0.3);
          font-weight: 600;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .light-mode .sidebar-btn:hover {
          background: rgba(255,255,255,0.25);
          border-color: rgba(255,255,255,0.4);
          color: #ffffff;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .light-mode .sidebar-btn.primary:hover {
          background: linear-gradient(135deg, #ffffff 0%, #eef2ff 100%);
          border-color: rgba(66, 133, 244, 0.6);
          color: #1558d6;
          box-shadow: 0 4px 12px rgba(66, 133, 244, 0.15);
        }
        .sidebar-btn:active { transform: scale(0.98) !important; }
      `}</style>

      {/* DARK BACKGROUND TO FRAME THE KIOSK SIMULATOR */}
      {simKiosk && <div style={{ position: "fixed", inset: 0, background: "#0a0a0a", zIndex: -1 }} />}

      <div className={dark ? "dark-mode" : "light-mode"} style={containerStyle}>

        {/* === KIOSK OVERLAY ATTRACT MODE & RESULT VIEW === */}
        {simKiosk && (screenState === "screensaver" || screenState === "kiosk_result") && (
          <div className="screensaver-fullscreen">
            <div className="screensaver-overlay" />
            
            {/* ABSOLUTE TOP RIGHT BUTTONS DURING SCREENSAVER */}
            <div style={{ position: "absolute", top: 24, right: 24, zIndex: 999997 }}>
              {topRightButtons}
            </div>

            {screenState === "screensaver" ? (
              <div className="screensaver-content">
                {!kioskCategory ? (
                  <>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                      <div style={{ width: 80, height: 80, display: "flex", justifyContent: "center", alignItems: "center", background: "rgba(66, 133, 244, 0.1)", borderRadius: "50%", border: "2px solid rgba(66, 133, 244, 0.3)", boxShadow: "0 0 40px rgba(66,133,244,0.3)" }}>
                        <Settings color="#4285f4" className="animate-spin" style={{ animationDuration: '4s' }} size={44} />
                      </div>
                      <h1 style={{ fontSize: 56, fontWeight: 800, color: dark ? '#fff' : '#0f172a', letterSpacing: "-1px", margin: 0 }}>ChatCIT Kiosk</h1>
                      <p style={{ color: dark ? '#94a3b8' : '#475569', fontSize: 20, textAlign: "center", maxWidth: 500, lineHeight: 1.5, margin: 0 }}>
                        Your interactive digital assistant for Bulacan State University Computer Technology.
                      </p>
                    </div>

                    <div className="bento-grid">
                      <div className="bento-card" onClick={() => setKioskCategory("Quick Prompts")}>
                        <Zap size={48} color="#f59e0b" />
                        <span>Quick Prompts</span>
                      </div>
                      <div className="bento-card" onClick={() => setKioskCategory("Organizations")}>
                        <Users size={48} color="#4285f4" />
                        <span>Organizations</span>
                      </div>
                      <div className="bento-card" onClick={() => setKioskCategory("Majors")}>
                        <GraduationCap size={48} color="#10b981" />
                        <span>Majors</span>
                      </div>
                      <div className="bento-card" onClick={() => setKioskCategory("Documents")}>
                        <FileText size={48} color="#8b5cf6" />
                        <span>Documents</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <button className="back-btn" onClick={() => setKioskCategory(null)}>
                      <ChevronLeft size={24} /> Back
                    </button>
                    
                    <h2 style={{ fontSize: 40, fontWeight: 800, color: dark ? '#fff' : '#0f172a', marginTop: 32, marginBottom: 12 }}>
                      {kioskCategory}
                    </h2>
                    <p style={{ color: dark ? '#94a3b8' : '#475569', fontSize: 18, marginBottom: 20 }}>Select an option to view more details.</p>

                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 16, marginTop: 24, marginBottom: 40 }}>
                      <button onClick={() => scrollCarousel('left')} className="nav-arrow"><ChevronLeft size={36}/></button>
                      
                      <div ref={carouselRef} className="carousel-track" style={{ display: 'flex', gap: 24, overflowX: 'auto', scrollBehavior: 'smooth', scrollSnapType: 'x mandatory', width: '100%', padding: '16px 0' }}>
                        {(kioskCategory === "Quick Prompts" ? QUICK_PROMPTS :
                          kioskCategory === "Organizations" ? ORGANIZATIONS :
                          kioskCategory === "Majors" ? MAJORS : DOCUMENTS).map((item, idx) => (
                          <div 
                            key={idx} 
                            className="bento-card visual-card" 
                            style={{ scrollSnapAlign: 'center', flexShrink: 0, width: 280, height: 400, backgroundImage: `url(${getCardImage(item)})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', overflow: 'hidden', padding: 0 }} 
                            onClick={() => handleKioskSelection(kioskCategory, item)}
                          >
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(15,23,42,0.95) 100%)', borderRadius: 'inherit' }} />
                            <span style={{ position: 'absolute', bottom: 24, left: 24, right: 24, color: '#fff', fontSize: 24, fontWeight: 800, textAlign: 'left', textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>{item}</span>
                          </div>
                        ))}
                      </div>

                      <button onClick={() => scrollCarousel('right')} className="nav-arrow"><ChevronRight size={36}/></button>
                    </div>
                  </div>
                )}

                <button className="chat-cta-btn" onClick={() => { setScreenState("chat"); setKioskCategory(null); }}>
                  <MessageSquare size={32} />
                  Talk with ChatCIT
                </button>
              </div>
            ) : (
              // --- NEW KIOSK RESULT VIEW ---
              <div className="screensaver-content" style={{ height: '100%', maxWidth: 1000, padding: '40px 24px 24px', display: 'flex', flexDirection: 'column' }}>
                <button className="back-btn" onClick={() => { setScreenState("screensaver"); setKioskResult(null); }} style={{ marginBottom: 24, alignSelf: 'flex-start' }}>
                  <ChevronLeft size={24} /> Back
                </button>

                <div style={{ flex: 1, width: '100%', background: dark ? 'rgba(25, 28, 40, 0.95)' : 'rgba(255,255,255,0.95)', borderRadius: 32, border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, padding: '40px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 24px 60px rgba(0,0,0,0.4)', overflowY: 'auto' }}>
                  
                  {kioskResult?.isPdf ? (
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <h2 style={{ fontSize: 32, fontWeight: 800, margin: 0, color: dark ? '#fff' : '#000' }}>{kioskResult.title}</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: dark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)', padding: '12px 24px', borderRadius: 24 }}>
                          <span style={{ fontSize: 18, fontWeight: 700, marginRight: 8 }}>Page {pdfPage}</span>
                          <button onClick={() => setPdfPage(p => Math.max(1, p - 5))} className="pdf-btn">-5</button>
                          <button onClick={() => setPdfPage(p => Math.max(1, p - 2))} className="pdf-btn">-2</button>
                          <button onClick={() => setPdfPage(p => Math.max(1, p - 1))} className="pdf-btn" style={{ padding: '8px 12px' }}><ChevronLeft size={24}/></button>
                          <button onClick={() => setPdfPage(p => p + 1)} className="pdf-btn" style={{ padding: '8px 12px' }}><ChevronRight size={24}/></button>
                          <button onClick={() => setPdfPage(p => p + 2)} className="pdf-btn">+2</button>
                          <button onClick={() => setPdfPage(p => p + 5)} className="pdf-btn">+5</button>
                        </div>
                      </div>
                      <div style={{ flex: 1, width: '100%', borderRadius: 16, overflow: 'hidden', border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, background: '#e5e7eb' }}>
                         {/* Embedding PDF using object, simulating native PDF controls hidden */}
                         <object data={`${kioskResult.pdfUrl}#page=${pdfPage}&toolbar=0&navpanes=0`} type="application/pdf" width="100%" height="100%">
                            <p>Loading document...</p>
                         </object>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 800, margin: '0 auto' }}>
                      {kioskResult?.image && (
                        <img src={kioskResult.image} alt="Logo" style={{ width: 240, height: 240, objectFit: 'cover', borderRadius: '50%', marginBottom: 32, border: `4px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, boxShadow: '0 12px 32px rgba(0,0,0,0.3)' }} />
                      )}
                      <h2 style={{ fontSize: 48, fontWeight: 800, marginBottom: 24, color: dark ? '#fff' : '#000', textAlign: 'center' }}>{kioskResult?.title}</h2>
                      
                      {kioskResult?.loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginTop: 40 }}>
                          <Bot color="#4285f4" size={64} className="animate-pulse" />
                          <span style={{ fontSize: 24, color: textMuted }}>ChatCIT is thinking...</span>
                        </div>
                      ) : (
                        <div style={{ fontSize: 24, lineHeight: 1.6, color: dark ? '#cbd5e1' : '#334155', textAlign: 'center' }}>
                          {kioskResult?.content}
                        </div>
                      )}
                    </div>
                  )}

                </div>

                <button className="chat-cta-btn" onClick={() => { setScreenState("chat"); setKioskCategory(null); setKioskResult(null); }} style={{ marginTop: 24, flexShrink: 0 }}>
                  <MessageSquare size={32} />
                  Talk with ChatCIT
                </button>
              </div>
            )}
          </div>
        )}

        {showResetModal && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 1000000, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", backdropFilter: "blur(4px)", padding: 20 }}>
             <div style={{ position: "relative", width: "100%", maxWidth: 380, padding: 24, background: dark ? "#1e1e24" : "#ffffff", borderRadius: 20, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", border: dark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)" }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: textPrimary }}>Reset Password</h2>
                <p style={{ fontSize: 13, color: textMuted, marginBottom: 20 }}>Enter your new password below to regain access to your account.</p>
                <input 
                  type="password" 
                  placeholder="New Password (min 6 chars)" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)", background: dark ? "rgba(0,0,0,0.2)" : "#f9fafb", color: textPrimary, fontSize: 14, marginBottom: 16, outline: "none" }}
                />
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => { setShowResetModal(false); setResetToken(null); setNewPassword(""); }} style={{ flex: 1, padding: "10px 0", borderRadius: 12, background: "transparent", border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)", color: textPrimary, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                  <button onClick={handlePasswordReset} disabled={isResetting} style={{ flex: 1, padding: "10px 0", borderRadius: 12, background: "#4285f4", border: "none", color: "#fff", fontWeight: 600, cursor: isResetting ? "not-allowed" : "pointer", opacity: isResetting ? 0.7 : 1 }}>{isResetting ? "Saving..." : "Save Password"}</button>
                </div>
             </div>
          </div>
        )}

        {showAuthPopup && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 1000000, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", backdropFilter: "blur(4px)", padding: 20 }}>
             <div style={{ position: "relative", width: "100%", maxWidth: 380, background: dark ? "#1e1e24" : "#ffffff", borderRadius: 20, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", border: dark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)" }}>
                <button onClick={() => setShowAuthPopup(false)} style={{ position: "absolute", top: 16, right: 16, zIndex: 50, background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", border: "none", color: textPrimary, width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} onMouseLeave={e => e.currentTarget.style.background = dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}>
                  <X size={18} />
                </button>
                <AuthScreen 
                  dark={dark} 
                  initialIsLogin={authMode === "login"}
                  onSuccess={(userData: User, userChats: Chat[]) => { 
                    setCurrentUser(userData); setChats(userChats); setViewMode("chat"); setShowAuthPopup(false); 
                    showToast(`Welcome back, ${userData.username || 'Bulsuan'}!`, "success"); 
                  }} 
                />
             </div>
          </div>
        )}

        <div style={{ position: "absolute", bottom: 24, right: 24, zIndex: 1000001, display: "flex", flexDirection: "column", gap: 10 }}>
          {toasts.map((t: ToastMsg) => (
            <div key={t.id} style={{ background: dark ? '#25242c' : '#fff', border: `1px solid ${t.type === 'error' ? '#ef4444' : t.type === 'success' ? '#10b981' : '#4285f4'}`, color: textPrimary, padding: "12px 16px", borderRadius: 8, display: "flex", alignItems: "center", gap: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", fontSize: 14, fontWeight: 500, minWidth: 280, animation: "badgePop 0.3s cubic-bezier(0.2, 1.5, 0.5, 1)" }}>
              {t.type === 'success' && <CheckCircle size={18} color="#10b981" />}
              {t.type === 'error' && <AlertCircle size={18} color="#ef4444" />}
              {t.type === 'info' && <Info size={18} color="#4285f4" />}
              {t.message}
            </div>
          ))}
        </div>

        {isMobile && sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'absolute', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }} />}
        {isMobile && rightRailOpen && <div onClick={() => setRightRailOpen(false)} style={{ position: 'absolute', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }} />}

        <>
          {gearMode && renderRail("left", 
            <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
              {currentUser && Number(currentUser.id) !== -1 ? (
                <>
                  <button onClick={() => setGearMode(false)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: 8, background: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)", border: "none", color: textPrimary, cursor: "pointer", marginRight: 4 }} title="Exit Taskbar Mode"><ArrowLeft size={16} /></button>
                  <Avatar name={currentUser?.username || currentUser?.email || "User"} size={30} bg="#7c3aed" />
                  <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentUser?.username || currentUser?.email.split('@')[0]}</div>
                  <button onClick={() => setShowProfileModal(true)} style={{ color: textMuted, background: "none", border: "none", cursor: "pointer", padding: 4 }} title="Edit Profile"><UserCog size={15} /></button>
                  {(currentUser?.role === 'admin' || currentUser?.role === 'superadmin') && <button onClick={() => { setViewMode(viewMode === 'admin' ? 'chat' : 'admin'); if(isMobile) setSidebarOpen(false); }} style={{ color: viewMode === "admin" ? "#4285f4" : textMuted, background: "none", border: "none", cursor: "pointer", padding: 4 }} title="Admin Panel"><Database size={15} /></button>}
                  <button onClick={handleLogout} style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: 4 }} title="Logout"><LogOut size={15} /></button>
                </>
              ) : (
                <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                  <button onClick={() => { setAuthMode("login"); setShowAuthPopup(true); }} style={{ padding: "6px 16px", borderRadius: 20, background: dark ? "#fff" : "#1a1a2e", color: dark ? "#1a1a2e" : "#fff", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer" }}>Log in to Save Chats</button>
                </div>
              )}
            </div>
          )}

          {!gearMode && (
            <aside style={{ width: RAIL_W, flexShrink: 0, background: sbBg, position: "absolute", top: 0, bottom: 0, left: isMobile ? (sidebarOpen ? 0 : -RAIL_W) : 0, zIndex: 60, transition: "all 0.3s ease", boxShadow: isMobile && sidebarOpen ? "0 0 24px rgba(0,0,0,0.5)" : "none", overflow: "hidden" }}>
              
              <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: GEAR_VIS, zIndex: 1, pointerEvents: "none" }}>
                <GearAbs id="left-top" side="left" OR={OR_SM} IR={IR_SM} n={N_SM} tint={dark ? { light: "#9a9aa8", mid: "#5e5e6c", dark: "#333340" } : { light: "#f0f0f4", mid: "#b6b6c4", dark: "#7a7a8a" }} holeColor={bg} centerY={TOP_H + 100} rotation={-leftAngle * RATIO + (180 / N_SM)} onClick={() => setSidebarOpen(true)} />
              </div>

              <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", position: "relative", zIndex: 10, background: sbBg }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 16px 12px", flexShrink: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 24, height: 24, display: "flex", justifyContent: "center", alignItems: "center" }}>
                      <Settings color={dark ? "#4285f4" : "#1e3a8a"} className="animate-spin" style={{ animationDuration: '3s' }} size={24} />
                    </div>
                    <div className="brand-logo-fix">
                      <ChatCITLogo dark={dark} onBlue />
                    </div>
                  </div>
                  <button onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: sb.muted }}><ArrowLeft size={15} /></button>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                  <div style={{ padding: "12px 12px 0 12px", display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>
                    
                    {viewMode === "admin" ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24, marginTop: 12 }}>
                        <button onClick={() => { setViewMode("chat"); if(isMobile) setSidebarOpen(false); }} className="sidebar-btn primary">
                          <ArrowLeft size={16} /> Back to Chat
                        </button>

                        {adminTab === 'knowledge' && (
                          <div style={{ marginTop: 8 }}>
                            <div style={{ padding: "0 4px 8px" }}><span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: sb.faint }}>Database Categories</span></div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                              {["All", ...allDynamicCategories].map(cat => (
                                <button key={cat} onClick={() => { setAdminCategory(cat); if(isMobile) setSidebarOpen(false); }} className={`sidebar-btn ${adminCategory === cat ? 'primary' : ''}`}>{cat}</button>
                              ))}
                              <button onClick={() => requireAuth(() => {
                                const newCat = window.prompt("Enter new category name:");
                                if (newCat && newCat.trim() !== "") {
                                  setCustomCategories(prev => Array.from(new Set([...prev, newCat.trim()])));
                                  setAdminCategory(newCat.trim());
                                  showToast(`Added new tab: ${newCat.trim()}`, "success");
                                }
                              })} className="sidebar-btn" style={{ border: `1px dashed ${sb.faint}` }}><Plus size={14}/> Add Custom Tab</button>
                            </div>
                          </div>
                        )}

                        {adminTab === 'users' && (
                          <div style={{ marginTop: 8 }}>
                            <div style={{ padding: "0 4px 8px" }}><span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: sb.faint }}>Departments Filter</span></div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                              {ALL_DEPTS.map(dept => (
                                <button key={dept} onClick={() => { setAdminDept(dept); if(isMobile) setSidebarOpen(false); }} className={`sidebar-btn ${adminDept === dept ? 'primary' : ''}`}>{dept}</button>
                              ))}
                            </div>
                          </div>
                        )}

                        {adminTab !== 'knowledge' && adminTab !== 'users' && (
                          <div style={{ padding: "24px 4px", textAlign: "center", color: sb.faint, fontSize: 12 }}>
                             Select 'Database' or 'Users' to view filters.
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24, marginTop: 12 }}>
                          <button onClick={() => requireAuth(() => {setActiveChatId(null); setViewMode("chat"); if(isMobile) setSidebarOpen(false);})} className="sidebar-btn primary">
                            <Plus size={16} /> New chat
                          </button>
                          <button onClick={() => { setGearMode(true); if(isMobile) setSidebarOpen(false); }} className="sidebar-btn primary">
                            <Settings size={16} /> Change taskbar mode
                          </button>
                        </div>

                        <div style={{ padding: "0 4px 8px" }}><span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: sb.faint }}>Quick Prompts</span></div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 24 }}>
                          {QUICK_PROMPTS.map((lbl: string) => (
                            <button key={lbl} onClick={() => { 
                              if (lbl.toLowerCase().includes('facilities')) {
                                sendMessage(lbl); if(isMobile) setSidebarOpen(false);
                              } else {
                                requireAuth(() => { sendMessage(lbl); if(isMobile) setSidebarOpen(false); });
                              }
                            }} className="sidebar-btn">{lbl}</button>
                          ))}
                        </div>
                        
                        {currentUser && Number(currentUser.id) !== -1 && chats.length > 0 && (
                          <>
                            <div style={{ padding: "0 4px 8px" }}><span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: sb.faint }}>Recent</span></div>
                            <div style={{ maxHeight: 200, overflowY: "auto", padding: "0 4px", display: "flex", flexDirection: "column" }}>
                              {chats.slice(0, 5).map((chat: Chat) => (
                                <div key={chat.id} className="group" style={{ display: "flex", alignItems: "center", width: "100%", gap: 8, marginBottom: 6 }}>
                                  <button onClick={() => requireAuth(() => { setActiveChatId(chat.id); setViewMode("chat"); if(isMobile) setSidebarOpen(false); })} 
                                    style={{ 
                                      flex: 1, padding: "10px 16px", 
                                      background: activeChatId === chat.id && viewMode === "chat" ? (dark ? "rgba(66, 133, 244, 0.15)" : "rgba(66, 133, 244, 0.1)") : "transparent", 
                                      border: `1px solid ${dark ? "rgba(66, 133, 244, 0.4)" : "rgba(66, 133, 244, 0.6)"}`, 
                                      borderRadius: "16px", color: dark ? "#fff" : "#1e3a8a", 
                                      fontSize: 13, fontWeight: 700, textAlign: "left", cursor: "pointer", transition: "all 0.2s",
                                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" 
                                    }}>
                                    {chat.title}
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); requireAuth(() => deleteChat(chat.id)); }} 
                                    style={{ padding: "8px", background: "transparent", border: "none", color: dark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)", cursor: "pointer", transition: "color 0.2s" }}
                                    onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                                    onMouseLeave={e => e.currentTarget.style.color = dark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"}
                                    title="Delete Chat"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div style={{ padding: "16px 12px 18px", borderTop: `1px solid ${sb.border}`, flexShrink: 0 }}>
                  {currentUser && Number(currentUser.id) === -1 ? (
                    <div style={{ display: "flex", gap: 8, width: "100%" }}>
                      <button onClick={() => { setAuthMode("login"); setShowAuthPopup(true); }} style={{ flex: 1, padding: "8px 0", borderRadius: 24, background: "#fff", color: "#1a1a2e", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", transition: "opacity 0.2s" }} onMouseEnter={e => e.currentTarget.style.opacity = "0.9"} onMouseLeave={e => e.currentTarget.style.opacity = "1"}>Log in</button>
                      <button onClick={() => { setAuthMode("signup"); setShowAuthPopup(true); }} style={{ flex: 1, padding: "8px 0", borderRadius: 24, background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, fontWeight: 600, border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}>Sign up</button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div onClick={() => setShowProfileModal(true)} style={{ cursor: "pointer", transition: "transform 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                        <Avatar name={currentUser?.username || currentUser?.email || "User"} size={34} bg="#7c3aed" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: sb.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentUser?.username || currentUser?.email?.split('@')[0]}</div>
                        <div style={{ fontSize: 11, color: sb.faint }}>{currentUser?.role === 'superadmin' ? 'Superadmin' : currentUser?.role === 'admin' ? 'Administrator' : 'Student'}</div>
                      </div>
                      <button onClick={() => setShowProfileModal(true)} style={{ color: sb.muted, background: "none", border: "none", cursor: "pointer", padding: 5 }} title="Edit Profile"><UserCog size={15} /></button>
                      {(currentUser?.role === 'admin' || currentUser?.role === 'superadmin') && <button onClick={() => { setViewMode(viewMode === 'admin' ? 'chat' : 'admin'); if(isMobile) setSidebarOpen(false); }} style={{ color: viewMode === "admin" ? "#fff" : sb.muted, background: "none", border: "none", cursor: "pointer", padding: 5 }} title="Admin Dashboard"><Database size={15} /></button>}
                      <button onClick={handleLogout} style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: 5 }} title="Logout"><LogOut size={15} /></button>
                    </div>
                  )}
                </div>
              </div>
            </aside>
          )}

          <main style={{ 
            flex: 1, 
            display: "flex", 
            flexDirection: "column", 
            overflow: "hidden", 
            minWidth: 0, 
            position: "absolute",
            top: 0, bottom: 0,
            left: !isMobile && !gearMode ? RAIL_W : 0,
            right: !isMobile ? RAIL_W : 0,
            paddingBottom: kbOpen ? 360 : 0, 
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          }}>
            
            <header style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", height: TOP_H, padding: "0 16px", flexShrink: 0, borderBottom: isMobile ? `1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` : "none", background: bg, zIndex: 50 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {(isMobile || (!gearMode && !sidebarOpen)) && (
                  <button onClick={() => setSidebarOpen(true)} style={{ padding: '8px 8px 8px 0', color: textMuted, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", zIndex: 60 }}><Menu size={22} /></button>
                )}
                {(!gearMode && (isMobile || !sidebarOpen)) && (
                  <><div style={{ width: 24, height: 24, display: "flex", justifyContent: "center", alignItems: "center" }}><Settings color={dark ? "#4285f4" : "#1e3a8a"} className="animate-spin" style={{ animationDuration: '3s' }} size={24} /></div><ChatCITLogo dark={dark} /></>
                )}
              </div>
              
              {(!gearMode) && (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {isMobile && <button onClick={() => setRightRailOpen(true)} style={{ padding: 8, color: textMuted, background: "none", border: "none", cursor: "pointer", zIndex: 60 }}><MoreVertical size={20} /></button>}
                </div>
              )}
            </header>

            <div id="chat-scroll-container" style={{ flex: 1, overflowY: "auto", overflowX: "hidden", position: "relative" }}>
              
              {viewMode === "admin" && currentUser ? (
                <AdminPanel 
                  dark={dark} showToast={showToast} currentUser={currentUser} 
                  activeTab={adminTab} setActiveTab={setAdminTab}
                  activeCategoryTab={adminCategory} activeDeptTab={adminDept}
                  allCategories={allDynamicCategories} setDbCategories={setDbCategories}
                />
              ) : !activeChat || activeChat.messages.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100%", padding: "48px 16px" }}>
                  <div style={{ width: 140, height: 140, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                    <div style={{ position: "absolute", transform: isMobile ? "scale(0.65)" : "scale(0.85)" }}>
                      <GearboxLoader />
                    </div>
                  </div>
                  <h1 style={{ fontSize: isMobile ? 24 : 30, fontWeight: 300, color: textPrimary, marginBottom: 8, letterSpacing: "-0.5px", textAlign: "center" }}>Hello, <strong style={{ fontWeight: 700 }}>{currentUser && Number(currentUser.id) === -1 ? "Guest" : currentUser?.username || currentUser?.email?.split('@')[0] || "Bulsuan"}!</strong></h1>
                  <p style={{ color: textMuted, fontSize: 15, marginBottom: 32, textAlign: "center" }}>How can I help you today?</p>
                  
                  {topFaqs.length > 0 && (!currentUser || Number(currentUser.id) !== -1) && (
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10, maxWidth: 700 }}>
                      {topFaqs.slice(0, isMobile ? 3 : topFaqs.length).map((faq, idx) => {
                        const primaryTag = faq.keyword ? faq.keyword.split(',')[0].trim() : "Question";
                        return (
                          <button key={idx} onClick={() => sendMessage(primaryTag)} style={{ padding: "10px 18px", borderRadius: 24, border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, background: dark ? "rgba(255,255,255,0.03)" : "#fff", color: textPrimary, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s ease" }} onMouseEnter={e => e.currentTarget.style.background = dark ? "rgba(255,255,255,0.08)" : "#ffffff"} onMouseLeave={e => e.currentTarget.style.background = dark ? "rgba(255,255,255,0.03)" : "#fff"}>
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
                    <ChatMessageBubble key={msg.id} msg={msg} dark={dark} currentUser={currentUser} isMobile={isMobile} onEnlarge={setFullScreenMedia} onOpenIframe={setFullScreenIframe} onLoad={scrollToBottom} />
                  ))}
                  {isTyping && (
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <div style={{ flexShrink: 0, marginTop: 4, width: 28, height: 28, display: "flex", justifyContent: "center", alignItems: "center" }}><Bot color="#4285f4" size={28} className="animate-pulse" /></div>
                      <div style={{ paddingTop: 3 }}><ChatLoader /></div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {viewMode === "chat" && (!simKiosk || screenState === "chat") && (
              <div style={{ flexShrink: 0, padding: isMobile ? "8px 12px 12px" : "8px 16px 16px" }}>
                <div style={{ maxWidth: 768, margin: "0 auto" }}>
                  <CosmicInput input={input} setInput={setInput} onSend={() => sendMessage()} isTyping={isTyping} dark={dark} />
                  <div style={{ textAlign: "center", marginTop: 10, fontSize: 11, color: textFaint, letterSpacing: "0.2px" }}>
                    ChatCIT is AI. By using it, you agree to our <span style={{ textDecoration: "underline", cursor: "pointer", color: textMuted }}>Terms</span> & <span style={{ textDecoration: "underline", cursor: "pointer", color: textMuted }}>Privacy Policy</span>.
                  </div>
                </div>
              </div>
            )}
          </main>
          
          {/* RIGHT RAIL AND TOP RIGHT BUTTONS */}
          {renderRail("right", topRightButtons)}

          {showProfileModal && currentUser && <ProfileModal dark={dark} user={currentUser} onClose={() => setShowProfileModal(false)} onUpdate={(updated: User) => { setCurrentUser(updated); showToast("Profile updated successfully!", "success"); }} showToast={showToast} />}
          {showBugModal && <BugModal dark={dark} user={currentUser} onClose={() => setShowBugModal(false)} showToast={showToast} />}
          {showCalendar && <AcademicCalendar dark={dark} user={currentUser} onClose={() => setShowCalendar(false)} />}
        </>

        {simKiosk && kbOpen && (
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 8px 24px", background: dark ? "rgba(28, 27, 34, 0.98)" : "rgba(229, 231, 235, 0.98)", backdropFilter: "blur(20px)", borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, zIndex: 999999, display: "flex", flexDirection: "column", gap: 10, boxShadow: "0 -10px 40px rgba(0,0,0,0.5)", animation: "slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}>
            {virtualKeyRows.map((row, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                {row.map(k => (
                  <button 
                    key={k} 
                    onMouseDown={(e) => handleVirtualKeyPress(k, e)} 
                    style={{ 
                      padding: "16px 0", flex: k === 'SPACE' ? 2.5 : (k === 'ENTER' || k === 'BACK' || k === 'CLOSE') ? 1.5 : 1, 
                      maxWidth: k.length === 1 ? 64 : 'none', fontSize: 18, fontWeight: 600, 
                      background: k === 'ENTER' ? '#4285f4' : k === 'CLOSE' ? '#ef4444' : (dark ? '#333340' : '#fff'), 
                      color: (k === 'ENTER' || k === 'CLOSE') ? '#fff' : (dark ? '#fff' : '#000'), 
                      border: "none", borderRadius: 10, cursor: "pointer", textTransform: k.length > 1 ? 'uppercase' : 'lowercase',
                      boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
                    }}
                  >
                    {k === 'BACK' ? '⌫' : k === 'ENTER' ? '↵' : k === 'CLOSE' ? '✕' : k}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}

      </div>

      {fullScreenMedia && (
        <div onClick={() => setFullScreenMedia(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999999, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', padding: 24 }}>
          <img src={fullScreenMedia} alt="Fullscreen View" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 8, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }} />
          <button onClick={() => setFullScreenMedia(null)} style={{ position: 'absolute', top: 24, right: 24, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
            <X size={24} />
          </button>
        </div>
      )}

      {fullScreenIframe && (
        <div onClick={() => setFullScreenIframe(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999999, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ width: '100%', maxWidth: 1200, height: '90vh', background: dark ? '#1c1b22' : '#fff', borderRadius: 12, overflow: 'hidden', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
            <iframe src={fullScreenIframe} style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen />
            <button onClick={() => setFullScreenIframe(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}>
              <X size={24} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}