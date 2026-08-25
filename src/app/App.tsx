import React, { useState, useRef, useEffect, useMemo } from "react";
import { Plus, Settings, Database, Trash2, LogOut, Bug, AlertCircle, CheckCircle, Info, ArrowLeft, ArrowRight, Menu, UserCog, X, MoreVertical, Bot, Calendar as CalendarIcon, Folder, User as UserIcon, Briefcase, Smartphone, Edit2, FileText, Maximize, ChevronLeft, ChevronRight } from "lucide-react";

import { AuthScreen } from "../components/authmodal";
import { AdminPanel } from "../components/admindashboard";
import { ProfileModal } from "../components/modals/profilemodal";
import { BugModal } from "../components/modals/bugsmodal";
import { ChatDirectory } from "../components/chatdirectory";

import { VirtualKeyboard } from "../components/ui/virtualkeyboard";
import { KioskScreen } from "../components/kioskscreen";

import { Avatar, GearAbs, DayNightToggle, GearboxLoader, RATIO, N_SM, OR_SM, CENTER_D, TOP_H, GEAR_VIS, RAIL_W, STEP_DEG, OR_LG, PANEL_W, IR_SM, IR_LG, N_LG } from "../components/ui/helpers";
import { ChatLoader } from "../components/ui/chatloader";
import { CosmicInput } from "../components/ui/inputbar";
import { ChatMessageBubble } from "../components/chatmessagebubble";

import { Message, Chat, User as ChatUser, ToastMsg } from "../types";
import { API_URL, MID_CHOICES } from "../config";

const SIDEBAR_W = 280;

// =====================================================================
// WEB CALENDAR MODAL (WITH FULL ADMIN EDIT/DELETE CAPABILITIES)
// =====================================================================
const WebCalendarModal = ({ dark, setShowCalendar, currentUser, API_URL, showToast }: any) => {
  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [isCalFormOpen, setIsCalFormOpen] = useState(false);
  const [calForm, setCalForm] = useState({ id: null as number | null, date: "", endDate: "", title: "", description: "", type: "Special Event" });

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';

  const fetchCalendar = () => {
    fetch(`${API_URL}/calendar`).then(res => res.json()).then(data => { if (Array.isArray(data)) setCalendarData(data); }).catch(e => console.error(e));
  };

  useEffect(() => { fetchCalendar(); }, []);

  const currentYear = calendarDate.getFullYear();
  const currentMonth = calendarDate.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  const prevMonth = () => { setCalendarDate(new Date(currentYear, currentMonth - 1, 1)); setIsCalFormOpen(false); };
  const nextMonth = () => { setCalendarDate(new Date(currentYear, currentMonth + 1, 1)); setIsCalFormOpen(false); };

  const eventsByDay = useMemo(() => {
     const map: Record<number, any[]> = {};
     calendarData.forEach(evt => {
        if (!evt.date) return;
        const start = new Date(evt.date);
        const end = evt.endDate ? new Date(evt.endDate) : new Date(evt.date);
        
        start.setHours(0,0,0,0);
        end.setHours(0,0,0,0);
        
        const monthStart = new Date(currentYear, currentMonth, 1);
        const monthEnd = new Date(currentYear, currentMonth + 1, 0);
        
        if (start <= monthEnd && end >= monthStart) {
           const startDay = start < monthStart ? 1 : start.getDate();
           const endDay = end > monthEnd ? daysInMonth : end.getDate();
           
           for (let d = startDay; d <= endDay; d++) {
              if (!map[d]) map[d] = [];
              if (!map[d].find(e => e.id === evt.id)) {
                  map[d].push(evt);
              }
           }
        }
     });
     return map;
  }, [calendarData, currentYear, currentMonth, daysInMonth]);

  useEffect(() => {
      const today = new Date();
      if (today.getFullYear() === currentYear && today.getMonth() === currentMonth) setSelectedDate(today.getDate());
      else setSelectedDate(1);
  }, [currentYear, currentMonth]);

  const getEventStyle = (evt: any) => {
     const t = (evt.event_type || evt.type || evt.title || '').toLowerCase();
     if (t.includes('exam')) return '#ef4444'; 
     if (t.includes('holiday')) return '#10b981'; 
     return '#3b82f6'; 
  };

  const getEventStyleDetails = (type: string) => {
     const t = (type || '').toLowerCase();
     if (t.includes('exam')) return { color: '#ef4444', label: 'EXAM' };
     if (t.includes('holiday')) return { color: '#10b981', label: 'HOLIDAY' };
     return { color: '#3b82f6', label: 'EVENT' };
  };

  const handleSaveCalEvent = async () => {
    if (!calForm.title || !calForm.date) { 
        if (showToast) showToast("Title and Start Date are required.", "error"); 
        return; 
    }
    const method = calForm.id ? "PUT" : "POST";
    const url = calForm.id ? `${API_URL}/calendar/${calForm.id}` : `${API_URL}/calendar`;
    try {
      const payload = {
          date: calForm.date,
          endDate: calForm.endDate || calForm.date,
          title: calForm.title,
          description: calForm.description,
          type: calForm.type
      };
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Server rejected event.");
      }
      if (showToast) showToast("Event saved successfully!", "success");
      setIsCalFormOpen(false);
      fetchCalendar();
    } catch(e: any) { 
      if (showToast) showToast(e.message, "error"); 
      console.error(e);
    }
  };

  const handleDeleteCalEvent = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      const res = await fetch(`${API_URL}/calendar/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      if (showToast) showToast("Event deleted.", "success");
      fetchCalendar();
    } catch(e: any) { 
      if (showToast) showToast("Failed to delete event.", "error");
    }
  };

  return (
    <div style={{ display: 'flex', width: '100%', maxWidth: 860, background: dark ? '#1e2332' : '#ffffff', borderRadius: 24, boxShadow: '0 24px 60px rgba(0,0,0,0.4)', border: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)'}`, overflow: 'hidden' }}>
      <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
           <CalendarIcon size={24} color="#4285f4" />
           <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: dark ? '#fff' : '#0f172a' }}>Academic Calendar</h2>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: 12, padding: '8px 16px' }}>
           <button onClick={prevMonth} style={{ background: 'transparent', border: 'none', color: dark ? '#fff' : '#000', cursor: 'pointer', display: 'flex', padding: 4 }}><ChevronLeft size={18} /></button>
           <span style={{ fontSize: 16, fontWeight: 800, color: dark ? '#fff' : '#0f172a' }}>{calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
           <button onClick={nextMonth} style={{ background: 'transparent', border: 'none', color: dark ? '#fff' : '#000', cursor: 'pointer', display: 'flex', padding: 4 }}><ChevronRight size={18} /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 8, textAlign: 'center' }}>
           {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <span key={d} style={{ fontSize: 11, fontWeight: 700, color: dark ? '#94a3b8' : '#64748b' }}>{d}</span>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
           {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
           {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const evts = eventsByDay[day] || [];
              const isSelected = selectedDate === day;
              
              let cellBg = dark ? 'rgba(19, 20, 28, 0.6)' : '#f8fafc';
              let cellBorder = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
              
              if (isSelected) {
                  cellBg = dark ? 'rgba(66, 133, 244, 0.15)' : 'rgba(66, 133, 244, 0.1)';
                  cellBorder = '#4285f4';
              }

              return (
                 <div key={day} onClick={() => { setSelectedDate(day); setIsCalFormOpen(false); }} style={{ height: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: cellBg, border: `1px solid ${cellBorder}`, borderRadius: 12, position: 'relative', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: dark ? '#fff' : '#0f172a' }}>{day}</span>
                    {evts.length > 0 && (
                       <div style={{ display: 'flex', gap: 4, position: 'absolute', bottom: 6 }}>
                          {evts.slice(0,3).map((e: any, j: number) => <div key={j} style={{ width: 5, height: 5, borderRadius: '50%', background: getEventStyle(e) }} />)}
                       </div>
                    )}
                 </div>
              )
           })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 16, padding: '12px', background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderRadius: 12 }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} /><span style={{ fontSize: 12, color: dark ? '#94a3b8' : '#64748b', fontWeight: 600 }}>Special Event</span></div>
           <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} /><span style={{ fontSize: 12, color: dark ? '#94a3b8' : '#64748b', fontWeight: 600 }}>Examination</span></div>
           <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} /><span style={{ fontSize: 12, color: dark ? '#94a3b8' : '#64748b', fontWeight: 600 }}>Holiday</span></div>
        </div>
     </div>

     <div style={{ width: 320, background: dark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)', borderLeft: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`, padding: 24, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
           <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: dark ? '#fff' : '#0f172a' }}>
              {selectedDate ? new Date(currentYear, currentMonth, selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : 'Select a date'}
           </h3>
           <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {isAdmin && selectedDate && !isCalFormOpen && (
                 <button onClick={() => {
                    const dateStr = new Date(currentYear, currentMonth, selectedDate).toISOString();
                    setCalForm({ id: null, date: dateStr, endDate: dateStr, title: "", description: "", type: "Special Event" });
                    setIsCalFormOpen(true);
                 }} style={{ background: 'rgba(66, 133, 244, 0.1)', border: '1px solid rgba(66, 133, 244, 0.3)', color: '#4285f4', cursor: 'pointer', borderRadius: 6, display: 'flex', padding: '4px 10px', fontWeight: 800 }}>+ ADD</button>
              )}
              <button onClick={() => setShowCalendar(false)} style={{ background: 'transparent', border: 'none', color: dark ? '#94a3b8' : '#64748b', cursor: 'pointer', display: 'flex', padding: 4, fontWeight: 800 }}><X size={18}/></button>
           </div>
        </div>
        
        {selectedDate ? (
           isCalFormOpen ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                 <span style={{ fontSize: 12, fontWeight: 700, color: '#4285f4' }}>{calForm.id ? 'EDIT EVENT' : 'ADD NEW EVENT'}</span>
                 <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 11, color: dark ? '#94a3b8' : '#64748b' }}>Start Date</span>
                      <input type="date" value={calForm.date ? calForm.date.split('T')[0] : ""} onChange={e => setCalForm({...calForm, date: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: 8, border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, background: dark ? 'rgba(0,0,0,0.2)' : '#fff', color: dark ? '#fff' : '#000', fontSize: 12, outline: 'none' }} />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 11, color: dark ? '#94a3b8' : '#64748b' }}>End Date (Optional)</span>
                      <input type="date" value={calForm.endDate ? calForm.endDate.split('T')[0] : ""} onChange={e => setCalForm({...calForm, endDate: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: 8, border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, background: dark ? 'rgba(0,0,0,0.2)' : '#fff', color: dark ? '#fff' : '#000', fontSize: 12, outline: 'none' }} />
                    </div>
                 </div>
                 <input type="text" placeholder="Event Title" value={calForm.title} onChange={e => setCalForm({...calForm, title: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, background: dark ? 'rgba(0,0,0,0.2)' : '#fff', color: dark ? '#fff' : '#000', fontSize: 14, outline: 'none' }} />
                 <select value={calForm.type} onChange={e => setCalForm({...calForm, type: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, background: dark ? 'rgba(0,0,0,0.2)' : '#fff', color: dark ? '#fff' : '#000', fontSize: 14, outline: 'none' }}>
                    <option value="Special Event" style={{ background: dark ? '#1e1e24' : '#fff' }}>Special Event (Blue)</option>
                    <option value="Examination" style={{ background: dark ? '#1e1e24' : '#fff' }}>Examination (Red)</option>
                    <option value="Holiday" style={{ background: dark ? '#1e1e24' : '#fff' }}>Holiday (Green)</option>
                 </select>
                 <textarea placeholder="Description (Optional)" value={calForm.description} onChange={e => setCalForm({...calForm, description: e.target.value})} rows={3} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, background: dark ? 'rgba(0,0,0,0.2)' : '#fff', color: dark ? '#fff' : '#000', fontSize: 14, outline: 'none', resize: 'vertical' }} />
                 <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                    <button onClick={() => setIsCalFormOpen(false)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'transparent', color: dark ? '#94a3b8' : '#64748b', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                    <button onClick={handleSaveCalEvent} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#4285f4', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Save Event</button>
                 </div>
              </div>
           ) : (
              <div style={{ flex: 1, overflowY: 'auto' }} className="no-scrollbar">
                 {eventsByDay[selectedDate] && eventsByDay[selectedDate].length > 0 ? (
                    eventsByDay[selectedDate].map((evt: any, idx: number) => {
                       const style = getEventStyleDetails(evt.type || evt.event_type || evt.title);
                       return (
                          <div key={idx} style={{ background: dark ? 'rgba(255,255,255,0.05)' : '#fff', borderLeft: `4px solid ${style.color}`, borderRadius: 8, padding: '12px 16px', marginBottom: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                             <div style={{ fontSize: 10, fontWeight: 800, color: style.color, textTransform: 'uppercase', marginBottom: 4 }}>{style.label}</div>
                             <div style={{ fontSize: 14, fontWeight: 700, color: dark ? '#fff' : '#0f172a', lineHeight: 1.3 }}>{evt.title}</div>
                             
                             {evt.endDate && evt.endDate !== evt.date && (
                                <div style={{ fontSize: 11, color: style.color, marginTop: 6, fontWeight: 600 }}>
                                   {new Date(evt.date).toLocaleDateString()} - {new Date(evt.endDate).toLocaleDateString()}
                                </div>
                             )}

                             {evt.description && <div style={{ fontSize: 12, color: dark ? '#94a3b8' : '#64748b', marginTop: 6, lineHeight: 1.4 }}>{evt.description}</div>}
                             
                             {isAdmin && (
                                <div style={{ display: 'flex', gap: 8, marginTop: 12, borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`, paddingTop: 12 }}>
                                   <button onClick={(e) => { e.stopPropagation(); setCalForm({ id: evt.id, date: evt.date, endDate: evt.endDate || evt.date, title: evt.title, description: evt.description || "", type: evt.type || "Special Event" }); setIsCalFormOpen(true); }} style={{ flex: 1, background: dark ? 'rgba(255,255,255,0.1)' : '#f1f5f9', border: 'none', padding: '6px', borderRadius: 6, cursor: 'pointer', color: dark ? '#cbd5e1' : '#475569', fontSize: 12, fontWeight: 600 }}>Edit</button>
                                   <button onClick={(e) => { e.stopPropagation(); handleDeleteCalEvent(evt.id); }} style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', border: 'none', padding: '6px', borderRadius: 6, cursor: 'pointer', color: '#ef4444', fontSize: 12, fontWeight: 600 }}>Delete</button>
                                </div>
                             )}
                          </div>
                       )
                    })
                 ) : (
                    <div style={{ color: dark ? '#94a3b8' : '#64748b', fontSize: 14, textAlign: 'center', marginTop: 40, fontWeight: 500 }}>No events scheduled for this date.</div>
                 )}
              </div>
           )
         ) : (
           <div style={{ color: dark ? '#94a3b8' : '#64748b', fontSize: 14, textAlign: 'center', marginTop: 40, fontWeight: 500 }}>Select a date to view events.</div>
         )}
      </div>
    </div>
  );
};


// =====================================================================
// MAIN APP COMPONENT
// =====================================================================
export default function App() {
  const [simKiosk, setSimKiosk] = useState(false);
  const [simScale, setSimScale] = useState(1);
  const [screenState, setScreenState] = useState<"screensaver" | "kiosk_result" | "chat">("screensaver");
  const [kioskCategory, setKioskCategory] = useState<string | null>(null);
  const [kioskResult, setKioskResult] = useState<any>(null);
  const [kbOpen, setKbOpen] = useState(false);

  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && (window.innerWidth <= 1280));
  const [appLoading, setAppLoading] = useState(true); 
  const [dark, setDark] = useState(true);
  
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const [uiPrompt, setUiPrompt] = useState<{isOpen: boolean, title: string, onSubmit: (val: string) => void} | null>(null);

  const [showAuthPopup, setShowAuthPopup] = useState(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem('chatcit_user');
      if (!savedUser) return true;
      try { const u = JSON.parse(savedUser); if (Number(u.id) === -1) return true; } catch (e) { return true; }
    }
    return false;
  });

  const [guestMessageCount, setGuestMessageCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<ChatUser | null>(null);
  const [viewMode, setViewMode] = useState<"chat" | "admin">("chat"); 
  const [chats, setChats] = useState<Chat[]>([]);
  
  const [directoryMode, setDirectoryMode] = useState<string | null>(null);

  const [adminTab, setAdminTab] = useState<string>('knowledge');
  const [adminCategory, setAdminCategory] = useState("All");
  const [adminDept, setAdminDept] = useState("All");
  
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [dbCategories, setDbCategories] = useState<string[]>([]);
  
  const [dbSubCategories, setDbSubCategories] = useState<Record<string, string[]>>({});
  const [customSubCats, setCustomSubCats] = useState<{cat: string, sub: string}[]>([]);
  
  const [syncTrigger, setSyncTrigger] = useState(0);

  const mergedSubCategoriesMap: Record<string, string[]> = { ...dbSubCategories };
  customSubCats.forEach(({cat, sub}) => {
     if (!mergedSubCategoriesMap[cat]) mergedSubCategoriesMap[cat] = [];
     if (!mergedSubCategoriesMap[cat].includes(sub)) mergedSubCategoriesMap[cat].push(sub);
  });

  const [globalKnowledge, setGlobalKnowledge] = useState<any[]>([]);
  
  const fetchGlobalKnowledge = async () => {
    try {
      const res = await fetch(`${API_URL}/knowledge`);
      if (res.ok) {
        const data = await res.json();
        setGlobalKnowledge(Array.isArray(data) ? data : []);
      }
    } catch (e) { console.error("Global fetch failed", e); }
  };

  useEffect(() => { fetchGlobalKnowledge(); }, []);

  const dynamicCategories = Array.from(new Set(globalKnowledge.map(d => d.category || 'General'))).filter(c => c !== 'General');
  const allSidebarCategories = Array.from(new Set([...dynamicCategories, ...customCategories]));

  const [layoutConfig, setLayoutConfig] = useState<{gear1: string, gear2: string, gear3: string, quickPrompts: string[]}>({
    gear1: "", gear2: "", gear3: "", quickPrompts: []
  });

  useEffect(() => {
    const savedLayout = localStorage.getItem('chatcit_layout');
    if (savedLayout) {
      try { setLayoutConfig(JSON.parse(savedLayout)); } catch (e) {}
    }
  }, []);

  const saveLayoutConfig = (newConfig: any) => {
    setLayoutConfig(newConfig);
    localStorage.setItem('chatcit_layout', JSON.stringify(newConfig));
  };

  const defaultPrompts = ["Facilities", "Industry Partners", "Organizations", "Faculty & Professors", "Magna Carta", "Handbook"];
  const QUICK_PROMPTS = layoutConfig.quickPrompts && layoutConfig.quickPrompts.length > 0 
      ? layoutConfig.quickPrompts 
      : defaultPrompts;

  const gear1Cat = layoutConfig.gear1 || dynamicCategories[0] || 'Organizations';
  const gear2Cat = layoutConfig.gear2 || dynamicCategories[1] || 'Majors';
  const gear3Cat = layoutConfig.gear3 || dynamicCategories[2] || 'Documents';

  const getGearItems = (cat: string) => {
      if (!cat) return ["No Data"];
      const lowerCat = cat.toLowerCase();
      if (lowerCat === 'handbook') return ['Handbook'];
      if (lowerCat === 'magna carta') return ['Magna Carta'];

      const items = globalKnowledge.filter(d => (d.category || '').toLowerCase() === cat.toLowerCase());
      if (items.length === 0) return ["No Data"];
      const subs = Array.from(new Set(items.map(d => d.subcategory))).filter(s => s && s !== 'All');
      if (subs.length > 0) return subs as string[]; 
      return items.map(d => d.display_name || (d.keyword ? d.keyword.split(',')[0] : "Unnamed")); 
  };

  const gear1Items = getGearItems(gear1Cat);
  const gear2Items = getGearItems(gear2Cat);
  const gear3Items = getGearItems(gear3Cat);

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
        try { setChats(JSON.parse(savedChats).map((c: any) => ({ ...c, timestamp: new Date(c.timestamp), messages: c.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })) }))); } catch (e) { }
      }
    } else {
      setCurrentUser({ id: -1, email: "guest@bulsu.edu.ph", role: "student", username: "Guest User" });
      setChats([]); 
    }
    const savedMode = localStorage.getItem('chatcit_viewMode');
    if (savedMode && savedMode !== "auth") setViewMode(savedMode as "chat" | "admin");
    setTimeout(() => setAppLoading(false), 1200);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'k') { e.preventDefault(); setSimKiosk(prev => !prev); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const resetTimer = () => {
      if (!simKiosk) return; 
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setScreenState("screensaver"); setKioskCategory(null); setKioskResult(null); setActiveChatId(null);
        setViewMode("chat"); setSidebarOpen(false); setRightRailOpen(false); setGearMode(false);
      }, 60000); 
    };
    resetTimer();
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(e => document.addEventListener(e, resetTimer));
    return () => { clearTimeout(timeoutId); events.forEach(e => document.removeEventListener(e, resetTimer)); };
  }, [simKiosk]);

  useEffect(() => {
    if (simKiosk) { 
      setScreenState("screensaver"); setKioskCategory(null); setKioskResult(null); setGearMode(false); 
      setSidebarOpen(false); setRightRailOpen(false);
    } else {
      if (window.innerWidth > 1280) setSidebarOpen(true);
    }
  }, [simKiosk]);

  useEffect(() => {
    if (!appLoading) {
      if (currentUser && Number(currentUser.id) !== -1) {
        localStorage.setItem('chatcit_user', JSON.stringify(currentUser));
        localStorage.setItem('chatcit_chats', JSON.stringify(chats));
      } else {
        localStorage.removeItem('chatcit_user'); localStorage.removeItem('chatcit_chats');
      }
      localStorage.setItem('chatcit_viewMode', viewMode);
    }
  }, [currentUser, viewMode, chats, appLoading]);

  useEffect(() => { if (viewMode === 'admin') setGearMode(false); }, [viewMode]);

  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [fullScreenMedia, setFullScreenMedia] = useState<string | null>(null);
  const [fullScreenPdf, setFullScreenPdf] = useState<string | null>(null); 
  
  const [sidebarOpen, setSidebarOpen] = useState(typeof window !== "undefined" && window.innerWidth > 1280);
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
  
  const [gear1Idx, setGear1Idx] = useState(0);
  const [gear2Idx, setGear2Idx] = useState(0);
  const [gear3Idx, setGear3Idx] = useState(0);

  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [topFaqs, setTopFaqs] = useState<{keyword: string, display_name?: string}[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfPage, setPdfPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pdfRef, setPdfRef] = useState<any>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeChat = chats.find((c) => c.id === activeChatId) ?? null;

  const requireAuth = (action: () => void) => {
    if (currentUser && Number(currentUser.id) === -1) {
      setAuthMode("login"); setShowAuthPopup(true);
      if (isMobile && !simKiosk) { setSidebarOpen(false); setRightRailOpen(false); }
    } else { action(); }
  };

  useEffect(() => {
    const handleResize = () => {
      const scaleX = window.innerWidth / 768; const scaleY = window.innerHeight / 1366;
      setSimScale(Math.min(scaleX, scaleY) * 0.95); 
      const mobile = window.innerWidth <= 1280;
      setIsMobile(mobile);
      if (!mobile && !simKiosk) {
         setSidebarOpen(true);
      }
    };
    handleResize(); 
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [simKiosk]); 

  useEffect(() => {
    if (!fullScreenPdf) return;
    let isMounted = true;
    const loadPDF = async () => {
      setPdfLoading(true);
      if (!(window as any).pdfjsLib) {
         await new Promise((resolve) => {
           const script = document.createElement('script'); script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
           script.onload = () => { (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js'; resolve(true); };
           document.body.appendChild(script);
         });
      }
      try {
         const cleanUrl = fullScreenPdf.split('#')[0];
         const pdf = await (window as any).pdfjsLib.getDocument(cleanUrl).promise;
         if(isMounted) { setPdfRef(pdf); setTotalPages(pdf.numPages); setPdfPage(1); }
      } catch(e) { console.error("Failed to load PDF", e); } 
      finally { if(isMounted) setPdfLoading(false); }
    };
    loadPDF();
    return () => { isMounted = false; };
  }, [fullScreenPdf]);

  useEffect(() => {
     const renderPage = async () => {
        if (!pdfRef || !canvasRef.current) return;
        setPdfLoading(true);
        try {
          const canvas = canvasRef.current; const ctx = canvas.getContext('2d'); const page = await pdfRef.getPage(pdfPage);
          const viewport = page.getViewport({ scale: 2.0 }); canvas.height = viewport.height; canvas.width = viewport.width;
          await page.render({ canvasContext: ctx, viewport: viewport }).promise;
        } catch(e) { console.error("Failed to render canvas page", e); }
        setPdfLoading(false);
     };
     renderPage();
  }, [pdfRef, pdfPage]);

  useEffect(() => {
    if (!simKiosk) { setKbOpen(false); return; }
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName) && target.getAttribute('type') !== 'file') { setKbOpen(true); }
    };
    const handleFocusOut = () => { setTimeout(() => { const el = document.activeElement; if (!el || !['INPUT', 'TEXTAREA'].includes(el.tagName)) { setKbOpen(false); } }, 100); };
    window.addEventListener('focusin', handleFocusIn); window.addEventListener('focusout', handleFocusOut);
    return () => { window.removeEventListener('focusin', handleFocusIn); window.removeEventListener('focusout', handleFocusOut); };
  }, [simKiosk]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now(); setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  const scrollToBottom = () => { 
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); 
  };
  
  useEffect(() => { fetch(`${API_URL}/faqs/top`).then(res => res.json()).then(data => setTopFaqs(Array.isArray(data) ? data : [])).catch(() => {}); }, []);

  useEffect(() => {
    scrollToBottom();
    const timeouts = [100, 500, 1000].map(ms => setTimeout(scrollToBottom, ms));
    return () => timeouts.forEach(clearTimeout);
  }, [activeChat?.messages.length, isTyping]);

  useEffect(() => {
    const container = document.getElementById("chat-scroll-container");
    if (!container) return;
    const observer = new MutationObserver(() => { scrollToBottom(); });
    observer.observe(container, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [activeChatId]);

  const handlePasswordReset = async () => {
    if (!newPassword || newPassword.length < 6) { showToast("Password must be at least 6 characters.", "error"); return; }
    setIsResetting(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: resetToken, newPassword }) });
      const data = await res.json(); if (data.error) throw new Error(data.error);
      showToast(data.message || "Password reset successfully!", "success"); setShowResetModal(false); setResetToken(null); setNewPassword(""); setAuthMode("login"); setShowAuthPopup(true);
    } catch (err: any) { showToast(err.message, "error"); } finally { setIsResetting(false); }
  };

  const sendMessage = async (text: string = input) => {
    if (!text.trim() || isTyping) return;
    const content = text.trim(); setInput("");
    setDirectoryMode(null); 
    
    if (simKiosk && (screenState === "screensaver" || screenState === "kiosk_result")) {
      setScreenState("chat"); setKioskCategory(null); setKioskResult(null); setSidebarOpen(false); setRightRailOpen(false);
    }

    if (currentUser && Number(currentUser.id) === -1) {
      const newCount = guestMessageCount + 1; setGuestMessageCount(newCount);
      if (newCount % 3 === 0) { setAuthMode("login"); setShowAuthPopup(true); }
    }
    
    const userMsg: Message = { id: `msg-${Date.now()}`, role: "user", content, timestamp: new Date() };
    let chatId = activeChatId; let messagesToSend: { role: string, content: string }[] = [];

    if (!chatId) {
      const nc: Chat = { id: `c-${Date.now()}`, title: content.length > 40 ? content.slice(0, 40) + "…" : content, lastMessage: content, timestamp: new Date(), messages: [userMsg] };
      setChats((p) => [nc, ...p]); setActiveChatId(nc.id); chatId = nc.id; messagesToSend = [{ role: "user", content }];
    } else {
      const existingChat = chats.find(c => c.id === chatId);
      messagesToSend = existingChat ? [...existingChat.messages, userMsg].map(m => ({ role: m.role, content: m.content })) : [{ role: "user", content }];
      setChats((p) => p.map((c) => c.id === chatId ? { ...c, messages: [...c.messages, userMsg], lastMessage: content } : c));
    }
    
    setIsTyping(true);
    try {
      const response = await fetch(`${API_URL}/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chatId: chatId, message: content, history: messagesToSend }) });
      const data = await response.json(); if (data.error) throw new Error(data.error);
      const mMsg: Message = { id: `msg-${Date.now()}`, role: "model", content: data.reply || "Sorry, I encountered an error communicating with my database.", timestamp: new Date(), pictures: data.pictures };
      setChats((p) => p.map((c) => c.id === chatId ? { ...c, messages: [...c.messages, mMsg] } : c));
    } catch (error: any) {
      const errorMessage = error.message === "Unexpected end of JSON input" || error.message.toLowerCase().includes("failed") || error.message.toLowerCase().includes("network") ? "⚠️ Connection failed. Is the Node.js backend server running or are you offline?" : `⚠️ ${error.message}`;
      const errorMsg: Message = { id: `msg-${Date.now()}`, role: "model", content: errorMessage, timestamp: new Date() };
      setChats((p) => p.map((c) => c.id === chatId ? { ...c, messages: [...c.messages, errorMsg] } : c));
    } finally { setIsTyping(false); }
  };

  const handleKioskSelection = async (category: string, item: string) => {
    const action = async () => {
      let prompt = item;

      const lowerItem = item.toLowerCase();
      const lowerCat = (category || '').toLowerCase();
      const isDoc = lowerItem === "handbook" || lowerItem === "magna carta" || lowerCat === "documents" || lowerItem.includes("form");

      if (simKiosk) {
         setScreenState("kiosk_result");
         if (isDoc) {
           let safeFile = item.replace(/\s+/g, '-').toLowerCase();
           if (lowerItem === "magna carta") safeFile = "magna-carta"; 
           if (lowerItem === "handbook") safeFile = "handbook";
           setKioskResult({ title: item, isPdf: true, pdfUrl: `/${safeFile}.pdf` }); 
           return;
         }

         const isTopCategory = allSidebarCategories.some(c => c.toLowerCase() === lowerItem);
         const isSubFolder = globalKnowledge.some((k: any) => (k.subcategory || '').toLowerCase() === lowerItem && k.subcategory !== 'All');

         if (isTopCategory || isSubFolder || category.includes('Faculty') || category.includes('Industry') || lowerCat.includes('facilities') || category === 'Majors') {
            const hasLeafMatch = globalKnowledge.some((k: any) => (k.display_name === item) || (k.keyword && k.keyword.split(',').map((s: string) => s.trim().toLowerCase()).includes(lowerItem)));
            if (!hasLeafMatch || isTopCategory || isSubFolder) {
               setKioskResult({ title: item, isDirectory: true, category: isTopCategory ? item : category, subcategory: isSubFolder ? item : 'All', loading: false });
               return;
            }
         }

         setKioskResult({ title: item, loading: true });
         try {
            const prompt = `Tell me about ${item} in ${category}`;
            const response = await fetch(`${API_URL}/chat`, { 
               method: "POST", 
               headers: { "Content-Type": "application/json" }, 
               body: JSON.stringify({ chatId: `kiosk-${Date.now()}`, message: prompt, history: [] }) 
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            const imageUrl = (data.pictures && data.pictures.length > 0) ? data.pictures[0] : null;
            setKioskResult({ title: item, loading: false, content: data.reply, image: imageUrl });
         } catch (e) {
            const localRecord = globalKnowledge.find((k: any) => (k.display_name === item) || (k.keyword && k.keyword.split(',').map((s: string) => s.trim().toLowerCase()).includes(lowerItem)));
            if (localRecord) {
               setKioskResult({ title: item, loading: false, content: localRecord.response, image: localRecord.picture_url });
            } else {
               setKioskResult({ title: item, loading: false, content: "Information retrieved successfully." });
            }
         }
      } else {
         const isFolder = allSidebarCategories.some(c => c.toLowerCase() === lowerItem) || globalKnowledge.some((k: any) => (k.subcategory || '').toLowerCase() === lowerItem);
         if (isFolder && !isDoc) {
            setDirectoryMode(item);
         } else {
            sendMessage(item);
         }
      }
    };
    
    if (category === "Majors" || category.toLowerCase().includes("facilities") || kioskResult?.isDirectory || item.toLowerCase() === "handbook" || item.toLowerCase() === "magna carta") { action(); } else { requireAuth(action); }
  };

  const handleRenameCategory = (oldCat: string) => {
    setUiPrompt({
      isOpen: true,
      title: `Rename Category "${oldCat}"`,
      onSubmit: async (newCatName) => {
        if (!newCatName || newCatName.trim() === "" || newCatName === oldCat) return;
        const trimmed = newCatName.trim();
        try {
          const res = await fetch(`${API_URL}/knowledge/manage/category`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ oldCategory: oldCat, newCategory: trimmed })
          });
          if (!res.ok) throw new Error("Server failed to rename category");

          setCustomCategories(prev => prev.map(c => c === oldCat ? trimmed : c));
          if (adminCategory === oldCat) setAdminCategory(trimmed);
          showToast(`Category renamed to "${trimmed}"`, "success");
          fetchGlobalKnowledge(); 
          setSyncTrigger(p => p + 1);
        } catch (e: any) { showToast("Error renaming category in database.", "error"); }
      }
    });
  };

  const handleDeleteCategory = async (catToDelete: string) => {
    if (window.confirm(`Are you sure you want to delete the category "${catToDelete}"?\n\nRecords inside this category will not be deleted, but will be safely moved to 'General'.`)) {
      try {
        const res = await fetch(`${API_URL}/knowledge/manage/category`, {
          method: 'DELETE', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: catToDelete })
        });
        if (!res.ok) throw new Error("Server failed to delete category");

        setCustomCategories(prev => prev.filter(c => c !== catToDelete));
        if (adminCategory === catToDelete) setAdminCategory("All");
        showToast(`Category "${catToDelete}" deleted.`, "info");
        fetchGlobalKnowledge(); 
        setSyncTrigger(p => p + 1);
      } catch (e: any) { showToast("Error deleting category in database.", "error"); }
    }
  };

  const handleRenameSubCategory = (category: string, oldSub: string) => {
    setUiPrompt({
      isOpen: true,
      title: `Rename subcategory "${oldSub}":`,
      onSubmit: async (newSubName) => {
        if (!newSubName || newSubName.trim() === "" || newSubName === oldSub) return;
        const trimmed = newSubName.trim();
        try {
          const res = await fetch(`${API_URL}/knowledge/subcategory`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category, oldSubcategory: oldSub, newSubcategory: trimmed })
          });
          if (!res.ok) throw new Error("Server failed to rename subcategory");

          setCustomSubCats((prev: {cat: string, sub: string}[]) => prev.map(item => (item.cat === category && item.sub === oldSub) ? { cat: category, sub: trimmed } : item));
          setDbSubCategories((prev: Record<string, string[]>) => {
            const list = prev[category] || [];
            return { ...prev, [category]: list.map(s => s === oldSub ? trimmed : s) };
          });
          if (adminDept === oldSub) setAdminDept(trimmed);
          showToast(`Subcategory renamed to "${trimmed}"`, "success");
          fetchGlobalKnowledge(); 
          setSyncTrigger(p => p + 1);
        } catch (e: any) { showToast("Error renaming subcategory in database.", "error"); }
      }
    });
  };

  const handleDeleteSubCategory = async (category: string, subToDelete: string) => {
    if (window.confirm(`Are you sure you want to delete the subcategory "${subToDelete}"?\n\nRecords inside this folder will not be deleted, but will be moved to the main "All" folder.`)) {
      try {
        const res = await fetch(`${API_URL}/knowledge/subcategory`, {
          method: 'DELETE', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category, subcategory: subToDelete })
        });
        if (!res.ok) throw new Error("Server failed to delete subcategory");

        setCustomSubCats((prev: {cat: string, sub: string}[]) => prev.filter(item => !(item.cat === category && item.sub === subToDelete)));
        setDbSubCategories((prev: Record<string, string[]>) => {
          const list = prev[category] || [];
          return { ...prev, [category]: list.filter(s => s !== subToDelete) };
        });
        if (adminDept === subToDelete) setAdminDept("All");
        showToast(`Subcategory "${subToDelete}" deleted.`, "info");
        fetchGlobalKnowledge(); 
        setSyncTrigger(p => p + 1);
      } catch (e: any) { showToast("Error deleting subcategory in database.", "error"); }
    }
  };

  const deleteChat = (idToDelete: string) => { setChats(prev => prev.filter(c => c.id !== idToDelete)); if (activeChatId === idToDelete) { setActiveChatId(null); setViewMode("chat"); } showToast("Chat deleted successfully.", "success"); };
  const handleLogout = () => { setCurrentUser({ id: -1, email: "guest@bulsu.edu.ph", role: "student", username: "Guest User" }); setChats([]); setActiveChatId(null); setViewMode("chat"); localStorage.removeItem('chatcit_user'); localStorage.removeItem('chatcit_chats'); showToast("Logged out successfully.", "info"); setAuthMode("login"); setShowAuthPopup(true); };

  const handleVirtualKeyPress = (key: string, e: React.MouseEvent) => {
    e.preventDefault(); const el = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
    if (!el || !['INPUT', 'TEXTAREA'].includes(el.tagName)) return;
    let newValue = el.value;
    if (key === 'BACK') { newValue = newValue.slice(0, -1); } 
    else if (key === 'ENTER') { const form = el.closest('form'); if (form) { const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement; if (submitBtn && !submitBtn.disabled) submitBtn.click(); } else { el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true })); } return; } 
    else if (key === 'CLOSE') { setKbOpen(false); el.blur(); return; } 
    else if (key === 'SPACE') { newValue += ' '; } 
    else { newValue += key; }
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
    if (el.tagName === 'INPUT' && nativeInputValueSetter) { nativeInputValueSetter.call(el, newValue); } 
    else if (el.tagName === 'TEXTAREA' && nativeTextAreaValueSetter) { nativeTextAreaValueSetter.call(el, newValue); } 
    else { el.value = newValue; }
    el.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const trBtnSize = simKiosk ? 64 : 40; const trIconSize = simKiosk ? 32 : 20; const trRadius = simKiosk ? 20 : 12; const trGap = simKiosk ? 20 : 12;
  const topRightButtons = (
    <div style={{ display: "flex", alignItems: "center", gap: trGap }}>
      <button onClick={() => requireAuth(() => setShowBugModal(true))} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: trBtnSize, height: trBtnSize, borderRadius: trRadius, background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)", color: "#ef4444", cursor: "pointer", transition: "all 0.2s" }} title="Report a Bug"><Bug size={trIconSize} /></button>
      <button onClick={() => requireAuth(() => setShowCalendar(true))} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: trBtnSize, height: trBtnSize, borderRadius: trRadius, background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)", color: "#10b981", cursor: "pointer", transition: "all 0.2s" }} title="Academic Calendar"><CalendarIcon size={trIconSize} /></button>
      <div className="theme-toggle-wrapper" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: trBtnSize, transform: simKiosk ? 'scale(1.3)' : 'scale(0.85)', transformOrigin: 'center' }}><DayNightToggle dark={dark} toggleDark={() => setDark(!dark)} /></div>
    </div>
  );

  const bg = dark ? "#1c1b22" : "#f4f5f7";
  const sbBg = dark ? "#0d2460" : "#1558d6";
  const textPrimary = dark ? "#e8eaed" : "#1a1a2e";
  const textMuted = dark ? "#9aa0a6" : "#6b7280";
  const textFaint = dark ? "#5f6368" : "#9ca3af";
  const sb = { text: "#fff", muted: "rgba(255,255,255,0.70)", faint: "rgba(255,255,255,0.42)", hover: "rgba(255,255,255,0.10)", active: "rgba(255,255,255,0.20)", border: "rgba(255,255,255,0.14)" };

  if (appLoading) {
    return (
      <div className={dark ? "dark-mode" : "light-mode"} style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", background: bg, alignItems: "center", justifyContent: "center", zIndex: 99999 }}>
        <div style={{ width: 100, height: 100, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ position: "absolute", transform: 'scale(1.2)' }}><GearboxLoader /></div></div>
        <div style={{ color: textPrimary, fontSize: 14, fontWeight: 700, letterSpacing: "0.2em", marginTop: 40 }}>INITIALIZING SYSTEM...</div>
      </div>
    );
  }

  const containerStyle: React.CSSProperties = simKiosk ? {
    position: "fixed", top: "50%", left: "50%", width: 768, height: 1366, transform: `translate(-50%, -50%) scale(${simScale})`, transformOrigin: "center center", display: "flex", overflow: "hidden", background: bg, fontFamily: "'Inter', sans-serif", color: textPrimary, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.8), 0 0 0 16px #111", borderRadius: 24, zIndex: 99999
  } : { position: "absolute", top: 0, bottom: 0, left: 0, right: 0, display: "flex", overflow: "hidden", background: bg, fontFamily: "'Inter', sans-serif", color: textPrimary };

  const virtualKeyRows = [
    ['1','2','3','4','5','6','7','8','9','0'],
    ['q','w','e','r','t','y','u','i','o','p'],
    ['a','s','d','f','g','h','j','k','l'],
    ['z','x','c','v','b','n','m', 'BACK'],
    ['SPACE', 'ENTER', 'CLOSE']
  ];

  // =====================================================================
  // ROBUST LAYOUT ENGINE LOGIC
  // =====================================================================
  const isWebMode = !simKiosk;
  const isKioskScreensaver = simKiosk && (screenState === "screensaver" || screenState === "kiosk_result");
  const isKioskChat = simKiosk && screenState === "chat";
  const useMobileLayout = isMobile || simKiosk; 
  
  // Sidebar Visibility Checks
  const showWebLeftSidebar = (isWebMode && !gearMode) || (isKioskChat && !gearMode);
  const showGearLeft = (isWebMode && gearMode && !isMobile) || (isKioskChat && gearMode);

  // Right Rail Visibility Check:
  // Desktop Web (chat/gears mode): Always on right
  // Mobile / KioskChat: Triggered via rightRailOpen overlay
  const showRightRail = (!useMobileLayout && isWebMode) || rightRailOpen; 

  // Main Content Offsets
  let mainLeft = 0;
  let mainRight = 0;

  if (!isKioskScreensaver) {
    if (!useMobileLayout && isWebMode) {
      mainLeft = gearMode ? RAIL_W : (sidebarOpen ? SIDEBAR_W : 0);
      mainRight = RAIL_W;
    }
  }

  return (
    <>
      <style>{`
        ::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; background: transparent !important; }
        *::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; background: transparent !important; }
        * { scrollbar-width: none !important; -ms-overflow-style: none !important; }
        [role="tablist"], .tabs-list { overflow-x: visible !important; flex-wrap: wrap !important; height: auto !important; }
        .kiosk-bug-wrapper [role="dialog"], .kiosk-bug-wrapper [class*="bg-"][class*="rounded-"] { transform: scale(1.4) !important; }
        .kiosk-calendar-wrapper [role="dialog"], .kiosk-calendar-wrapper [class*="bg-"][class*="rounded-"] { display: flex !important; flex-direction: column !important; width: 90vw !important; max-width: 420px !important; height: auto !important; max-height: 85vh !important; overflow-y: auto !important; overflow-x: hidden !important; transform: scale(1.15) !important; }
        .kiosk-calendar-wrapper [role="dialog"] > *, .kiosk-calendar-wrapper [class*="bg-"][class*="rounded-"] > * { width: 100% !important; min-width: 100% !important; border-left: none !important; border-right: none !important; }
        .theme-toggle-wrapper input[type="checkbox"] { display: none !important; opacity: 0 !important; width: 0px !important; height: 0px !important; position: absolute; z-index: -100; }
        .sidebar-btn { width: 100%; padding: 10px 14px; border-radius: 12px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); display: flex; align-items: center; gap: 10px; border: 1px solid transparent; text-align: left; }
        .dark-mode .sidebar-btn { background: rgba(255,255,255,0.03); color: #9aa0a6; border-color: rgba(255,255,255,0.05); }
        .dark-mode .sidebar-btn.primary { background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%); color: #fff; border-color: rgba(255,255,255,0.15); font-weight: 600; box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.05); }
        .dark-mode .sidebar-btn:hover { background: linear-gradient(135deg, rgba(66, 133, 244, 0.2) 0%, rgba(66, 133, 244, 0.05) 100%); border-color: rgba(66, 133, 244, 0.5); color: #fff; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
        .light-mode .sidebar-btn { background: rgba(255,255,255,0.1); color: #ffffff; border-color: rgba(255,255,255,0.2); }
        .light-mode .sidebar-btn.primary { background: linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%); color: #1558d6; border-color: rgba(66, 133, 244, 0.3); font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
        .light-mode .sidebar-btn:hover { background: rgba(255,255,255,0.25); border-color: rgba(255,255,255,0.4); color: #ffffff; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .light-mode .sidebar-btn.primary:hover { background: linear-gradient(135deg, #ffffff 0%, #eef2ff 100%); border-color: rgba(66, 133, 244, 0.6); color: #1558d6; box-shadow: 0 4px 12px rgba(66, 133, 244, 0.15); }
        .sidebar-btn:active { transform: scale(0.98) !important; }
        .gear-panel-btn { width: 100%; padding: 10px 14px; border-radius: 12px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); backdrop-filter: blur(12px); z-index: 10; position: relative; display: flex; }
        .dark-mode .gear-panel-btn { background: linear-gradient(135deg, rgba(30, 35, 50, 0.7) 0%, rgba(15, 18, 25, 0.7) 100%); border: 1px solid rgba(66, 133, 244, 0.2); color: #e8eaed; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.05); }
        .dark-mode .gear-panel-btn:hover { background: linear-gradient(135deg, rgba(40, 50, 75, 0.9) 0%, rgba(20, 25, 35, 0.9) 100%); border-color: rgba(66, 133, 244, 0.9); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6), 0 0 20px rgba(66, 133, 244, 0.4); transform: scale(1.04) translateY(-2px); color: #fff; text-shadow: 0 0 8px rgba(255,255,255,0.3); }
        .light-mode .gear-panel-btn { background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(230, 240, 255, 0.95) 100%); border: 1px solid rgba(66, 133, 244, 0.4); color: #0f172a; box-shadow: 0 4px 12px rgba(66, 133, 244, 0.15), inset 0 2px 4px rgba(255, 255, 255, 1); }
        .light-mode .gear-panel-btn:hover { background: linear-gradient(135deg, #ffffff 0%, rgba(220, 235, 255, 1) 100%); border-color: rgba(66, 133, 244, 0.9); box-shadow: 0 8px 24px rgba(66, 133, 244, 0.3), 0 0 20px rgba(66, 133, 244, 0.35); transform: scale(1.04) translateY(-2px); color: #1558d6; }
        .gear-panel-btn:active { transform: scale(0.98) !important; }
        .gear-panel-btn.is-sub { background: transparent !important; border: 1px dashed rgba(150, 150, 150, 0.3) !important; box-shadow: none !important; padding: 8px 12px; }
        .dark-mode .gear-panel-btn.is-sub:hover { border-color: rgba(66, 133, 244, 0.6) !important; background: rgba(66, 133, 244, 0.1) !important; }
        .light-mode .gear-panel-btn.is-sub:hover { border-color: rgba(66, 133, 244, 0.6) !important; background: rgba(66, 133, 244, 0.05) !important; }

        @media (max-width: 768px) {
          .admin-panel-wrapper { overflow-x: hidden; width: 100%; }
          .admin-panel-wrapper table { display: block; width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; white-space: nowrap; border-collapse: collapse; }
          .admin-panel-wrapper [class*="grid-cols-"] { grid-template-columns: 1fr !important; gap: 12px !important; }
          .admin-panel-wrapper input, .admin-panel-wrapper textarea { max-width: 100%; }
        }
      `}</style>
      
      {/* Background to blackout around the simulated iPad */}
      {simKiosk && <div style={{ position: "fixed", inset: 0, background: "#0a0a0a", zIndex: 99998 }} />}

      <div className={dark ? "dark-mode" : "light-mode"} style={containerStyle}>

        {/* 1. KIOSK SCREENSAVER & DIRECTORY RESULTS */}
        {isKioskScreensaver && (
          <KioskScreen 
            dark={dark} screenState={screenState} setScreenState={setScreenState} kioskCategory={kioskCategory} setKioskCategory={setKioskCategory}
            kioskResult={kioskResult} setKioskResult={setKioskResult} handleKioskSelection={handleKioskSelection} topRightButtons={topRightButtons}
            setFullScreenIframe={() => {}}
            setFullScreenMedia={setFullScreenMedia} 
            gear1={{ label: gear1Cat, items: gear1Items }}
            gear2={{ label: gear2Cat, items: gear2Items }}
            gear3={{ label: gear3Cat, items: gear3Items }}
            quickPrompts={QUICK_PROMPTS}
            currentUser={currentUser}
          />
        )}

        {/* UI PROMPTS */}
        {uiPrompt && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999999, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ background: bg, border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, borderRadius: 12, padding: 24, width: '100%', maxWidth: 400, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 600, color: textPrimary }}>{uiPrompt.title}</h3>
              <input 
                type="text" autoFocus id="ui-prompt-input" 
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, background: dark ? 'rgba(255,255,255,0.05)' : '#f3f4f6', color: textPrimary, outline: 'none', marginBottom: 20 }} 
                onKeyDown={(e) => { if (e.key === 'Enter') { const val = (e.target as HTMLInputElement).value; if(val.trim()){ uiPrompt.onSubmit(val.trim()); setUiPrompt(null); } } }} 
              />
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button onClick={() => setUiPrompt(null)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'transparent', color: textMuted, cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
                <button onClick={() => { const val = (document.getElementById('ui-prompt-input') as HTMLInputElement).value; if(val.trim()){ uiPrompt.onSubmit(val.trim()); setUiPrompt(null); } }} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#4285f4', color: '#fff', cursor: 'pointer', fontWeight: 500 }}>Save</button>
              </div>
            </div>
          </div>
        )}

        {showResetModal && (
          <div style={{ position: simKiosk ? 'absolute' : 'fixed', inset: 0, zIndex: 1000000, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", backdropFilter: "blur(4px)", padding: 20 }}>
             <div style={{ position: "relative", width: "100%", maxWidth: 380, padding: 24, background: dark ? "#1e1e24" : "#ffffff", borderRadius: 20, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", border: dark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)" }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: textPrimary }}>Reset Password</h2>
                <p style={{ fontSize: 13, color: textMuted, marginBottom: 20 }}>Enter your new password below to regain access to your account.</p>
                <input type="password" placeholder="New Password (min 6 chars)" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)", background: dark ? "rgba(0,0,0,0.2)" : "#f9fafb", color: textPrimary, fontSize: 14, marginBottom: 16, outline: "none" }} />
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => { setShowResetModal(false); setResetToken(null); setNewPassword(""); }} style={{ flex: 1, padding: "10px 0", borderRadius: 12, background: "transparent", border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)", color: textPrimary, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                  <button onClick={handlePasswordReset} disabled={isResetting} style={{ flex: 1, padding: "10px 0", borderRadius: 12, background: "#4285f4", border: "none", color: "#fff", fontWeight: 600, cursor: isResetting ? "not-allowed" : "pointer", opacity: isResetting ? 0.7 : 1 }}>{isResetting ? "Saving..." : "Save Password"}</button>
                </div>
             </div>
          </div>
        )}

        {showAuthPopup && (
          <div style={{ position: simKiosk ? 'absolute' : 'fixed', inset: 0, zIndex: 1000000, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", backdropFilter: "blur(4px)", padding: 20 }}>
             <div style={{ position: "relative", width: "100%", maxWidth: 380, background: dark ? "#1e1e24" : "#ffffff", borderRadius: 20, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", border: dark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)" }}>
                <button onClick={() => setShowAuthPopup(false)} style={{ position: "absolute", top: 16, right: 16, zIndex: 50, background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", border: "none", color: textPrimary, width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} onMouseLeave={e => e.currentTarget.style.background = dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}><X size={18} /></button>
                <AuthScreen dark={dark} initialIsLogin={authMode === "login"} onSuccess={(userData: ChatUser, userChats: Chat[]) => { setCurrentUser(userData); setChats(userChats); setViewMode("chat"); setShowAuthPopup(false); showToast(`Welcome back, ${userData.username || 'Bulsuan'}!`, "success"); }} />
             </div>
          </div>
        )}

        {/* TOASTS */}
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

        {/* MOBILE & KIOSK OVERLAYS */}
        {(useMobileLayout) && sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }} />}
        {(useMobileLayout) && rightRailOpen && <div onClick={() => setRightRailOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }} />}

        {/* 2. CHAT & ADMIN INTERFACES (Visible in Web Mode AND Kiosk Chat Mode) */}
        {!isKioskScreensaver && (
          <>
            {/* LEFT SIDEBAR (STANDARD BLUE WEB UI) */}
            {showWebLeftSidebar && (
              <aside style={{ width: SIDEBAR_W, flexShrink: 0, background: sbBg, position: "absolute", top: 0, bottom: 0, left: sidebarOpen ? 0 : -SIDEBAR_W, zIndex: 60, transition: "left 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)", boxShadow: useMobileLayout && sidebarOpen ? "0 0 24px rgba(0,0,0,0.5)" : "none", overflow: "hidden" }}>
                <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", position: "relative", zIndex: 10, background: sbBg }}>
                  
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 16px 12px", flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', color: '#ffffff' }}>
                        Chat<span style={{ color: dark ? '#60a5fa' : '#7dd3fc' }}>CIT</span>
                      </div>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: sb.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ArrowLeft size={18} />
                    </button>
                  </div>

                  <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    <div style={{ padding: "12px 12px 0 12px", display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>
                      
                      {viewMode === "admin" ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24, marginTop: 12 }}>
                          <button onClick={() => { setViewMode("chat"); if(useMobileLayout) setSidebarOpen(false); }} className="sidebar-btn primary"><ArrowLeft size={16} /> Back to Chat</button>
                          
                          {adminTab === 'knowledge' && (
                            <div style={{ marginTop: 8 }}>
                              <div style={{ padding: "0 4px 8px" }}><span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: sb.faint }}>Database Categories</span></div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                                {["All", ...allSidebarCategories].map(cat => (
                                  <div key={cat} style={{ display: "flex", alignItems: "center", gap: 4, width: "100%" }}>
                                    <button onClick={() => { setAdminCategory(cat); setAdminDept("All"); if(useMobileLayout) setSidebarOpen(false); }} className={`sidebar-btn ${adminCategory === cat ? 'primary' : ''}`} style={{ flex: 1, paddingRight: 0 }}>
                                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block", textAlign: "left" }}>
                                        {cat.replace('Teachers', 'Professors')}
                                      </span>
                                    </button>
                                    {cat !== 'All' && cat !== 'General' && (
                                      <div style={{ display: "flex", gap: 2 }}>
                                        <button onClick={() => handleRenameCategory(cat)} style={{ background: "none", border: "none", color: sb.muted, cursor: "pointer", padding: "6px 4px", display: "flex", alignItems: "center" }} title="Rename Category">
                                          <Edit2 size={13} />
                                        </button>
                                        <button onClick={() => handleDeleteCategory(cat)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "6px 4px", display: "flex", alignItems: "center" }} title="Delete Category">
                                          <Trash2 size={13} />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                                <button 
                                   onClick={() => setUiPrompt({ 
                                      isOpen: true, title: "Enter new category name:", 
                                      onSubmit: (val) => { 
                                         setCustomCategories(p => Array.from(new Set([...p, val]))); 
                                         setAdminCategory(val); 
                                         setAdminDept("All"); 
                                         showToast(`Added custom tab: ${val}`, "success"); 
                                      } 
                                   })} 
                                   className="sidebar-btn" style={{ border: `1px dashed ${sb.faint}` }}
                                >
                                   <Plus size={14}/> Add Custom Tab
                                </button>
                              </div>
                            </div>
                          )}
                          
                          {adminTab === 'users' && (
                            <div style={{ marginTop: 8 }}>
                              <div style={{ padding: "0 4px 8px" }}><span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: sb.faint }}>Departments Filter</span></div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                                {["All", "Computer Technology", "Food Processing Technology", "Drafting and Digital Arts Technology", "Welding Technology", "Automotive Technology", "Electrical Technology", "Electronics Technology", "Mechanical Technology", "H/VAC Technology", "Mechatronics Technology"].map(dept => (<button key={dept} onClick={() => { setAdminDept(dept); if(useMobileLayout) setSidebarOpen(false); }} className={`sidebar-btn ${adminDept === dept ? 'primary' : ''}`}>{dept}</button>))}
                              </div>
                            </div>
                          )}
                          {adminTab !== 'knowledge' && adminTab !== 'users' && (
                            <div style={{ padding: "24px 4px", textAlign: "center", color: sb.faint, fontSize: 12 }}>Select 'Database' or 'Users' to view filters.</div>
                          )}
                        </div>
                      ) : (
                        <>
                          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24, marginTop: 12 }}>
                            <button onClick={() => requireAuth(() => {setActiveChatId(null); setDirectoryMode(null); setViewMode("chat"); if(useMobileLayout) setSidebarOpen(false);})} className="sidebar-btn primary" style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 14px", borderRadius: 12, border: "none", cursor: "pointer" }}>
                              <Plus size={16} /> New chat
                            </button>
                            {isWebMode && (
                              <button onClick={() => { setGearMode(true); if(useMobileLayout) setSidebarOpen(false); }} className="sidebar-btn" style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 14px", borderRadius: 12, border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, cursor: "pointer" }}>
                                <Settings size={15} /> Change taskbar mode
                              </button>
                            )}
                          </div>

                          <div style={{ padding: "0 4px 8px" }}><span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: sb.faint }}>Quick Prompts</span></div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 24 }}>
                            {QUICK_PROMPTS.map((lbl: string) => (
                              <button key={lbl} onClick={() => { 
                                 if(useMobileLayout) setSidebarOpen(false);
                                 const lower = lbl.toLowerCase();
                                 const isDoc = lower === 'handbook' || lower === 'magna carta' || lower.includes('form');
                                 
                                 if (isDoc) {
                                    requireAuth(() => { sendMessage(lbl); });
                                 } else if (allSidebarCategories.includes(lbl)) {
                                    setDirectoryMode(lbl); 
                                 } else {
                                    requireAuth(() => { sendMessage(lbl); }); 
                                 }
                              }} className="sidebar-btn">{lbl.replace('Teachers', 'Professors')}</button>
                            ))}
                          </div>
                          
                          {currentUser && Number(currentUser.id) !== -1 && chats.length > 0 && (
                            <>
                              <div style={{ padding: "0 4px 8px" }}><span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: sb.faint }}>Recent</span></div>
                              <div style={{ maxHeight: 250, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
                                {chats.slice(0, 5).map((chat: Chat) => (
                                  <div key={chat.id} className="group" style={{ display: "flex", alignItems: "center", width: "100%", gap: 4 }}>
                                    <button onClick={() => requireAuth(() => { setActiveChatId(chat.id); setDirectoryMode(null); setViewMode("chat"); if(useMobileLayout) setSidebarOpen(false); })} 
                                      className={`sidebar-btn ${activeChatId === chat.id && viewMode === "chat" ? 'primary' : ''}`}
                                      style={{ flex: 1, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}
                                    >
                                      {chat.title}
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); requireAuth(() => deleteChat(chat.id)); }} 
                                      style={{ padding: "10px", background: "transparent", border: "none", color: sb.muted, cursor: "pointer", transition: "color 0.2s" }}
                                      onMouseEnter={e => e.currentTarget.style.color = "#ef4444"} onMouseLeave={e => e.currentTarget.style.color = sb.muted} title="Delete Chat"
                                    >
                                      <Trash2 size={16} />
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
                        <div onClick={() => setShowProfileModal(true)} style={{ cursor: "pointer", transition: "transform 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}><Avatar name={currentUser?.username || currentUser?.email || "User"} size={34} bg="#7c3aed" /></div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: sb.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentUser?.username || currentUser?.email?.split('@')[0]}</div>
                          <div style={{ fontSize: 11, color: sb.faint }}>{currentUser?.role === 'superadmin' ? 'Superadmin' : currentUser?.role === 'admin' ? 'Administrator' : 'Student'}</div>
                        </div>
                        <button onClick={() => setShowProfileModal(true)} style={{ color: sb.muted, background: "none", border: "none", cursor: "pointer", padding: 5 }} title="Edit Profile"><UserCog size={15} /></button>
                        {(currentUser?.role === 'admin' || currentUser?.role === 'superadmin') && <button onClick={() => { setViewMode(viewMode === 'admin' ? 'chat' : 'admin'); if(useMobileLayout) setSidebarOpen(false); }} style={{ color: viewMode === "admin" ? "#fff" : sb.muted, background: "none", border: "none", cursor: "pointer", padding: 5 }} title="Admin Dashboard"><Database size={15} /></button>}
                        <button onClick={handleLogout} style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: 5 }} title="Logout"><LogOut size={15} /></button>
                      </div>
                    )}
                  </div>
                </div>
              </aside>
            )}

            {/* LEFT SIDEBAR (GEAR TASKBAR MODE) */}
            {showGearLeft && (
              <aside style={{ width: RAIL_W, flexShrink: 0, background: bg, position: "absolute", top: 0, bottom: 0, left: sidebarOpen ? 0 : -RAIL_W, zIndex: 60, transition: "left 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)", boxShadow: useMobileLayout && sidebarOpen ? "0 0 24px rgba(0,0,0,0.5)" : "none", overflow: "visible" }}>
                <div style={{ position: "absolute", top: 0, bottom: 0, width: GEAR_VIS, zIndex: 1, left: 0 }}>
                  <GearAbs id="g-left-top" side="left" OR={OR_SM} IR={IR_SM} n={N_SM} tint={dark ? { light: "#9a9aa8", mid: "#5e5e6c", dark: "#333340" } : { light: "#f0f0f4", mid: "#b6b6c4", dark: "#7a7a8a" }} holeColor={bg} centerY={TOP_H + Math.max(OR_SM * 0.2, ((simKiosk ? 1366 : window.innerHeight) - TOP_H - (OR_SM + CENTER_D * 2 + OR_SM)) / 2) + OR_SM} rotation={leftAngle} onClick={() => { setLeftAngle(a => a + STEP_DEG); setQuickIdx(i => i + 1); }} />
                  <GearAbs id="g-left-mid" side="left" OR={OR_LG} IR={IR_LG} n={N_LG} tint={dark ? { light: "#84acf2", mid: "#3f6dc4", dark: "#213c73" } : { light: "#bcd4ff", mid: "#5b8ae6", dark: "#2f5fb0" }} holeColor={bg} centerY={TOP_H + Math.max(OR_SM * 0.2, ((simKiosk ? 1366 : window.innerHeight) - TOP_H - (OR_SM + CENTER_D * 2 + OR_SM)) / 2) + OR_SM + CENTER_D} rotation={-leftAngle * RATIO + (180 / N_LG)} onClick={() => { setLeftAngle(a => a + STEP_DEG); setMidIdx(i => (i + 1) % MID_CHOICES.length); }} />
                  <GearAbs id="g-left-bot" side="left" OR={OR_SM} IR={IR_SM} n={N_SM} tint={dark ? { light: "#9a9aa8", mid: "#5e5e6c", dark: "#333340" } : { light: "#f0f0f4", mid: "#b6b6c4", dark: "#7a7a8a" }} holeColor={bg} centerY={TOP_H + Math.max(OR_SM * 0.2, ((simKiosk ? 1366 : window.innerHeight) - TOP_H - (OR_SM + CENTER_D * 2 + OR_SM)) / 2) + OR_SM + CENTER_D * 2} rotation={leftAngle} onClick={() => { setLeftAngle(a => a + STEP_DEG); if(chats.length) setRecentsIdx(i => i + 1); }} />
                </div>
                
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: TOP_H, display: "flex", alignItems: "center", justifyContent: "flex-start", padding: "14px 16px 0", zIndex: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
                    {currentUser && Number(currentUser.id) !== -1 ? (
                      <>
                        <Avatar name={currentUser?.username || currentUser?.email || "User"} size={30} bg="#7c3aed" />
                        <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentUser?.username || currentUser?.email.split('@')[0]}</div>
                        {!simKiosk && <button onClick={() => setShowProfileModal(true)} style={{ color: textMuted, background: "none", border: "none", cursor: "pointer", padding: 4 }} title="Edit Profile"><UserCog size={15} /></button>}
                        {!simKiosk && (currentUser?.role === 'admin' || currentUser?.role === 'superadmin') && <button onClick={() => { setViewMode(viewMode === 'admin' ? 'chat' : 'admin'); if(useMobileLayout) setSidebarOpen(false); }} style={{ color: viewMode === "admin" ? "#4285f4" : textMuted, background: "none", border: "none", cursor: "pointer", padding: 4 }} title="Admin Panel"><Database size={15} /></button>}
                        {!simKiosk && <button onClick={handleLogout} style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: 4 }} title="Logout"><LogOut size={15} /></button>}
                      </>
                    ) : (
                      <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                        <button onClick={() => { setAuthMode("login"); setShowAuthPopup(true); }} style={{ padding: "6px 16px", borderRadius: 20, background: dark ? "#fff" : "#1a1a2e", color: dark ? "#1a1a2e" : "#fff", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer" }}>Log in to Save Chats</button>
                      </div>
                    )}
                  </div>
                </div>
                
                {[
                  { y: TOP_H + Math.max(OR_SM * 0.2, ((simKiosk ? 1366 : window.innerHeight) - TOP_H - (OR_SM + CENTER_D * 2 + OR_SM)) / 2) + OR_SM, label: "Quick Prompts", value: QUICK_PROMPTS.length > 0 ? QUICK_PROMPTS[quickIdx % QUICK_PROMPTS.length] : "No Data", onPick: () => { 
                    const lbl = QUICK_PROMPTS.length > 0 ? QUICK_PROMPTS[quickIdx % QUICK_PROMPTS.length] : null;
                    if (!lbl || lbl === "No Data") return;
                    
                    if(useMobileLayout) setSidebarOpen(false);
                    const lower = lbl.toLowerCase();
                    if (lower === 'handbook' || lower === 'magna carta' || lower.includes('form')) {
                       requireAuth(() => { sendMessage(lbl); });
                    } else if (allSidebarCategories.includes(lbl)) {
                       setDirectoryMode(lbl); 
                    } else {
                       requireAuth(() => { sendMessage(lbl); }); 
                    }
                  }, onGear: () => { setLeftAngle(a => a + STEP_DEG); setQuickIdx(i => i + 1); } },
                  { y: TOP_H + Math.max(OR_SM * 0.2, ((simKiosk ? 1366 : window.innerHeight) - TOP_H - (OR_SM + CENTER_D * 2 + OR_SM)) / 2) + OR_SM + CENTER_D, label: "", value: MID_CHOICES[midIdx], onPick: () => { if (midIdx === 0) { requireAuth(() => { setActiveChatId(null); setViewMode("chat"); if(useMobileLayout) setSidebarOpen(false); }); } else { setGearMode(false); if(useMobileLayout) setSidebarOpen(false); } }, mid: true },
                  { y: TOP_H + Math.max(OR_SM * 0.2, ((simKiosk ? 1366 : window.innerHeight) - TOP_H - (OR_SM + CENTER_D * 2 + OR_SM)) / 2) + OR_SM + CENTER_D * 2, label: "Recent", value: chats.length > 0 ? chats[recentsIdx % chats.length].title : "No chats", onPick: () => requireAuth(() => { if(chats.length) { setActiveChatId(chats[recentsIdx % chats.length].id); setViewMode("chat"); if(useMobileLayout) setSidebarOpen(false); } }), onGear: () => { setLeftAngle(a => a + STEP_DEG); if(chats.length) setRecentsIdx(i => i + 1); }, sub: chats.length > 0 ? "Past Conversation" : "" },
                ].map((p: any, i: number) => {
                  const isMidBtn = p.mid;
                  return (
                    <div key={i} style={{ position: "absolute", width: PANEL_W, padding: "0 14px", transform: "translateY(-50%)", textAlign: "left", left: GEAR_VIS, top: p.y, zIndex: 10 }}>
                      {p.label && <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: textFaint, marginBottom: 8, textAlign: "left" }}>{p.label}</div>}
                      
                      <button 
                        onClick={p.onPick} 
                        className={`gear-panel-btn ${p.sub ? 'is-sub' : ''}`}
                        style={{
                          flexDirection: isMidBtn ? "row" : "column",
                          alignItems: isMidBtn ? "center" : "flex-start",
                          justifyContent: isMidBtn ? "flex-start" : "center",
                          gap: isMidBtn ? "8px" : "0",
                          textAlign: "left"
                        }}
                      >
                        {isMidBtn && (midIdx === 0 ? <Plus size={16} style={{ flexShrink: 0 }} /> : <Settings size={16} style={{ flexShrink: 0 }} />)}
                        
                        {p.sub ? (
                          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'flex-start' }}>
                            <div style={{ width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.value}</div>
                            <div style={{ fontSize: 10, color: textFaint, marginTop: 4, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>{p.sub}</div>
                          </div>
                        ) : (
                          <span style={{ display: "block", width: "100%", whiteSpace: "normal", wordBreak: "break-word", lineHeight: 1.25 }}>
                            {isMidBtn && midIdx === 0 ? p.value.replace(/^\+\s*/, '') : p.value.replace('Teachers', 'Professors')}
                          </span>
                        )}
                      </button>
                      <div style={{ fontSize: 10, color: textFaint, marginTop: 8, opacity: 0.8, fontWeight: 500, textAlign: "left" }}>click gear to cycle</div>
                    </div>
                  );
                })}
              </aside>
            )}

            {/* MAIN CHAT & ADMIN INTERFACE */}
            <main style={{ 
              flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0, position: "absolute",
              top: 0, bottom: 0, 
              left: mainLeft, 
              right: mainRight, 
              paddingBottom: kbOpen ? 360 : 0, transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            }}>
              <header style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", height: TOP_H, padding: "0 16px", flexShrink: 0, borderBottom: useMobileLayout ? `1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` : "none", background: bg, zIndex: 50 }}>
                
                <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                  {((useMobileLayout) || (!gearMode && !sidebarOpen)) && (
                    <button onClick={() => setSidebarOpen(true)} style={{ padding: '8px 8px 8px 0', color: textMuted, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", zIndex: 60 }}><Menu size={22} /></button>
                  )}
                  
                  {isKioskChat && (
                    <button 
                      onClick={() => { setScreenState("screensaver"); setKioskCategory(null); setKioskResult(null); setActiveChatId(null); setDirectoryMode(null); setSidebarOpen(false); setRightRailOpen(false); }} 
                      style={{ background: dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.05)', border: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)'}`, color: dark ? '#fff' : '#0f172a', padding: '6px 14px', borderRadius: 20, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: "transform 0.1s" }}
                      onMouseEnter={e => e.currentTarget.style.transform = "scale(0.95)"}
                      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                    >
                      <ArrowLeft size={16} /> Home
                    </button>
                  )}

                  {(!isKioskChat && (useMobileLayout || (!gearMode && !sidebarOpen))) && (
                    <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', color: dark ? '#ffffff' : '#0f172a' }}>
                      Chat<span style={{ color: dark ? '#60a5fa' : '#2563eb' }}>CIT</span>
                    </div>
                  )}
                </div>

                {((isKioskChat) || (isWebMode && !useMobileLayout && gearMode)) && (
                  <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', color: dark ? '#ffffff' : '#0f172a' }}>
                      Chat<span style={{ color: dark ? '#60a5fa' : '#2563eb' }}>CIT</span>
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, flex: 1 }}>
                  {useMobileLayout ? (
                    <button onClick={() => setRightRailOpen(true)} style={{ padding: 8, color: textMuted, background: "none", border: "none", cursor: "pointer", zIndex: 60 }}>
                      {viewMode === 'admin' && !simKiosk ? <Folder size={20} color={dark ? "#60a5fa" : "#2563eb"} /> : <MoreVertical size={20} />}
                    </button>
                  ) : (
                     (viewMode === 'admin' && !simKiosk) && (
                        topRightButtons
                     )
                  )}
                </div>
              </header>

              <div id="chat-scroll-container" className="no-scrollbar" style={{ flex: 1, overflowY: "auto", overflowX: "hidden", position: "relative", WebkitOverflowScrolling: "touch", display: "flex", flexDirection: "column" }}>
                {viewMode === "admin" && currentUser && !simKiosk ? (
                  <div className="admin-panel-wrapper" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, paddingBottom: useMobileLayout ? 120 : 24, display: "flex", flexDirection: "column" }}>
                    <div style={{ flex: 1, overflowY: "auto", padding: "16px", WebkitOverflowScrolling: "touch" }}>
                      <AdminPanel 
                         dark={dark} showToast={showToast} currentUser={currentUser} activeTab={adminTab} setActiveTab={setAdminTab} activeCategoryTab={adminCategory} activeDeptTab={adminDept} allCategories={allSidebarCategories} 
                         mergedSubCategoriesMap={mergedSubCategoriesMap} 
                         setDbCategories={setDbCategories} setDbSubCategories={setDbSubCategories} 
                         fetchData={fetchGlobalKnowledge}
                         layoutConfig={layoutConfig}
                         saveLayoutConfig={saveLayoutConfig}
                         syncTrigger={syncTrigger}
                      />
                    </div>
                  </div>
                ) : directoryMode ? (
                  <ChatDirectory 
                     dark={dark} 
                     category={directoryMode} 
                     onClose={() => setDirectoryMode(null)} 
                     onCardClick={(name) => handleKioskSelection(directoryMode, name)} 
                  />
                ) : !activeChat || activeChat.messages.length === 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, padding: "48px 16px" }}>
                    <div style={{ width: 140, height: 140, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}><div style={{ position: "absolute", transform: useMobileLayout ? "scale(0.65)" : "scale(0.85)" }}><GearboxLoader /></div></div>
                    <h1 style={{ fontSize: useMobileLayout ? 24 : 30, fontWeight: 300, color: textPrimary, marginBottom: 8, letterSpacing: "-0.5px", textAlign: "center" }}>Hello, <strong style={{ fontWeight: 700 }}>{currentUser && Number(currentUser.id) === -1 ? "Guest" : currentUser?.username || currentUser?.email?.split('@')[0] || "Bulsuan"}!</strong></h1>
                    <p style={{ color: textMuted, fontSize: 15, marginBottom: 32, textAlign: "center" }}>How can I help you today?</p>
                    
                    {topFaqs.length > 0 && (!currentUser || Number(currentUser.id) !== -1) && (
                      <div className="no-scrollbar" style={{ width: "100%", maxWidth: 700, display: "flex", justifyContent: "center", padding: "4px 16px" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
                          {topFaqs.slice(0, useMobileLayout ? 5 : topFaqs.length).map((faq, idx) => {
                            const primaryTag = faq.display_name || (faq.keyword ? faq.keyword.split(',')[0].trim() : "Question");
                            return (
                              <button 
                                key={idx} 
                                onClick={() => sendMessage(primaryTag)} 
                                style={{ flexShrink: 0, padding: "10px 18px", borderRadius: 24, border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, background: dark ? "rgba(255,255,255,0.03)" : "#fff", color: textPrimary, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s ease", whiteSpace: "normal", wordBreak: "break-word", maxWidth: "100%", lineHeight: 1.4, textAlign: "center" }} 
                                onMouseEnter={e => e.currentTarget.style.background = dark ? "rgba(255,255,255,0.08)" : "#ffffff"} 
                                onMouseLeave={e => e.currentTarget.style.background = dark ? "rgba(255,255,255,0.03)" : "#fff"}
                              >
                                {primaryTag}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ maxWidth: 960, width: "100%", margin: "0 auto", padding: useMobileLayout ? "16px 12px" : "24px 16px", display: "flex", flexDirection: "column", gap: 24, flexShrink: 0 }}>
                    {(() => {
                      const seenPics = new Set<string>();
                      return activeChat.messages.map((msg: Message) => {
                        let displayPics = msg.pictures;
                        if (msg.role === 'model' && msg.pictures) {
                           displayPics = msg.pictures.filter(p => !seenPics.has(p));
                           msg.pictures.forEach(p => seenPics.add(p));
                        }
                        return <ChatMessageBubble key={msg.id} msg={{...msg, pictures: displayPics}} dark={dark} currentUser={currentUser} isMobile={useMobileLayout} onEnlarge={setFullScreenMedia} onOpenIframe={setFullScreenPdf} onLoad={scrollToBottom} />;
                      });
                    })()}
                    {isTyping && (<div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}><div style={{ flexShrink: 0, marginTop: 4, width: 28, height: 28, display: "flex", justifyContent: "center", alignItems: "center" }}><Bot color="#4285f4" size={28} className="animate-pulse" /></div><div style={{ paddingTop: 3 }}><ChatLoader /></div></div>)}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {viewMode === "chat" && !directoryMode && (
                <div style={{ flexShrink: 0, padding: useMobileLayout ? "8px 12px 12px" : "8px 16px 16px" }}>
                  <div style={{ maxWidth: 960, width: "100%", margin: "0 auto" }}>
                    <div onClick={scrollToBottom} onFocus={scrollToBottom}>
                      <CosmicInput input={input} setInput={setInput} onSend={() => sendMessage()} isTyping={isTyping} dark={dark} />
                    </div>
                    <div style={{ textAlign: "center", marginTop: 10, fontSize: 11, color: textFaint, letterSpacing: "0.2px" }}>ChatCIT is AI. By using it, you agree to our <span style={{ textDecoration: "underline", cursor: "pointer", color: textMuted }}>Terms</span> & <span style={{ textDecoration: "underline", cursor: "pointer", color: textMuted }}>Privacy Policy</span>.</div>
                  </div>
                </div>
              )}
            </main>

            {/* RIGHT SIDEBAR (ADMIN OR GEARS) */}
            {showRightRail && (
              <aside style={{ width: RAIL_W, flexShrink: 0, background: (viewMode === 'admin' && !simKiosk) ? sbBg : bg, position: "absolute", top: 0, bottom: 0, right: (useMobileLayout ? (rightRailOpen ? 0 : -RAIL_W) : 0), zIndex: 60, transition: "right 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)", boxShadow: useMobileLayout && rightRailOpen ? "0 0 24px rgba(0,0,0,0.5)" : "none", overflow: "visible" }}>
                {viewMode === 'admin' && !simKiosk ? (
                   <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: sbBg, borderLeft: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 16px 12px", flexShrink: 0 }}>
                         <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                           <Folder size={18} /> Sub-Categories
                         </div>
                      </div>
                      
                      {adminTab === 'knowledge' ? (
                          <div style={{ padding: "12px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                             {['All', ...(mergedSubCategoriesMap[adminCategory] || [])].map(sub => (
                                <div key={sub} style={{ display: "flex", alignItems: "center", gap: 4, width: "100%" }}>
                                  <button onClick={() => { setAdminDept(sub); }} className={`sidebar-btn ${adminDept === sub ? 'primary' : 'is-sub'}`} style={{ flex: 1, paddingLeft: 12 }}>
                                    {sub}
                                  </button>
                                  {sub !== 'All' && (
                                    <div style={{ display: "flex", gap: 2 }}>
                                      <button onClick={() => handleRenameSubCategory(adminCategory, sub)} style={{ background: "none", border: "none", color: sb.muted, cursor: "pointer", padding: 6, display: "flex", alignItems: "center" }} title="Rename Subcategory">
                                        <Edit2 size={13} />
                                      </button>
                                      <button onClick={() => handleDeleteSubCategory(adminCategory, sub)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: 6, display: "flex", alignItems: "center" }} title="Delete Subcategory">
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  )}
                                </div>
                             ))}
                             <button 
                                onClick={() => setUiPrompt({ 
                                   isOpen: true, title: "Enter new sub-category (folder):", 
                                   onSubmit: (val) => { setCustomSubCats((prev: {cat: string, sub: string}[]) => [...prev, {cat: adminCategory, sub: val}]); setAdminDept(val); showToast(`Added sub-category: ${val}`, "success"); } 
                                })} 
                                className="sidebar-btn is-sub" style={{ border: `1px dashed ${sb.faint}`, marginTop: 8 }}
                             >
                                <Plus size={14}/> Add Sub-category
                             </button>
                          </div>
                      ) : (
                          <div style={{ padding: 24, textAlign: "center", color: sb.faint, fontSize: 13, lineHeight: 1.5 }}>
                             Select 'Database' tab on the left to manage folders here.
                          </div>
                      )}
                   </div>
                ) : (
                   <>
                      <div style={{ position: "absolute", top: 0, bottom: 0, width: GEAR_VIS, zIndex: 1, right: 0 }}>
                        <GearAbs id="g-right-top" side="right" OR={OR_SM} IR={IR_SM} n={N_SM} tint={dark ? { light: "#9a9aa8", mid: "#5e5e6c", dark: "#333340" } : { light: "#f0f0f4", mid: "#b6b6c4", dark: "#7a7a8a" }} holeColor={bg} centerY={TOP_H + Math.max(OR_SM * 0.2, ((simKiosk ? 1366 : window.innerHeight) - TOP_H - (OR_SM + CENTER_D * 2 + OR_SM)) / 2) + OR_SM} rotation={rightAngle} onClick={() => { setRightAngle(a => a + STEP_DEG); setGear1Idx(i => i + 1); }} />
                        <GearAbs id="g-right-mid" side="right" OR={OR_LG} IR={IR_LG} n={N_LG} tint={dark ? { light: "#84acf2", mid: "#3f6dc4", dark: "#213c73" } : { light: "#bcd4ff", mid: "#5b8ae6", dark: "#2f5fb0" }} holeColor={bg} centerY={TOP_H + Math.max(OR_SM * 0.2, ((simKiosk ? 1366 : window.innerHeight) - TOP_H - (OR_SM + CENTER_D * 2 + OR_SM)) / 2) + OR_SM + CENTER_D} rotation={-rightAngle * RATIO + (180 / N_LG)} onClick={() => { setRightAngle(a => a + STEP_DEG); setGear2Idx(i => i + 1); }} />
                        <GearAbs id="g-right-bot" side="right" OR={OR_SM} IR={IR_SM} n={N_SM} tint={dark ? { light: "#9a9aa8", mid: "#5e5e6c", dark: "#333340" } : { light: "#f0f0f4", mid: "#b6b6c4", dark: "#7a7a8a" }} holeColor={bg} centerY={TOP_H + Math.max(OR_SM * 0.2, ((simKiosk ? 1366 : window.innerHeight) - TOP_H - (OR_SM + CENTER_D * 2 + OR_SM)) / 2) + OR_SM + CENTER_D * 2} rotation={rightAngle} onClick={() => { setRightAngle(a => a + STEP_DEG); setGear3Idx(i => i + 1); }} />
                      </div>
                      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: TOP_H, display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "14px 16px 0", zIndex: 20 }}>
                        {topRightButtons}
                      </div>
                      {[
                        { y: TOP_H + Math.max(OR_SM * 0.2, ((simKiosk ? 1366 : window.innerHeight) - TOP_H - (OR_SM + CENTER_D * 2 + OR_SM)) / 2) + OR_SM, label: gear1Cat, value: gear1Items.length > 0 ? gear1Items[gear1Idx % gear1Items.length] : "No Data", onPick: () => { 
                            const item = gear1Items.length > 0 ? gear1Items[gear1Idx % gear1Items.length] : null;
                            if(item && item !== "No Data") {
                                requireAuth(() => { handleKioskSelection(gear1Cat, item); });
                            }
                        }, onGear: () => { setRightAngle(a => a + STEP_DEG); setGear1Idx(i => i + 1); } },
                        { y: TOP_H + Math.max(OR_SM * 0.2, ((simKiosk ? 1366 : window.innerHeight) - TOP_H - (OR_SM + CENTER_D * 2 + OR_SM)) / 2) + OR_SM + CENTER_D, label: gear2Cat, value: gear2Items.length > 0 ? gear2Items[gear2Idx % gear2Items.length] : "No Data", onPick: () => { 
                            const item = gear2Items.length > 0 ? gear2Items[gear2Idx % gear2Items.length] : null;
                            if(item && item !== "No Data") {
                                requireAuth(() => { handleKioskSelection(gear2Cat, item); });
                            }
                        }, onGear: () => { setRightAngle(a => a + STEP_DEG); setGear2Idx(i => i + 1); } },
                        { y: TOP_H + Math.max(OR_SM * 0.2, ((simKiosk ? 1366 : window.innerHeight) - TOP_H - (OR_SM + CENTER_D * 2 + OR_SM)) / 2) + OR_SM + CENTER_D * 2, label: gear3Cat, value: gear3Items.length > 0 ? gear3Items[gear3Idx % gear3Items.length] : "No Data", onPick: () => { 
                            const item = gear3Items.length > 0 ? gear3Items[gear3Idx % gear3Items.length] : null;
                            if(item && item !== "No Data") {
                                requireAuth(() => { handleKioskSelection(gear3Cat, item); });
                            }
                        }, onGear: () => { setRightAngle(a => a + STEP_DEG); setGear3Idx(i => i + 1); } },
                      ].map((p: any, i: number) => (
                        <div key={i} style={{ position: "absolute", width: PANEL_W, padding: "0 14px", transform: "translateY(-50%)", textAlign: "right", right: GEAR_VIS, top: p.y, zIndex: 10 }}>
                          {p.label && <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: textFaint, marginBottom: 8, textAlign: "right" }}>{p.label}</div>}
                          <button onClick={p.onPick} className="gear-panel-btn" style={{ flexDirection: "column", alignItems: "flex-end", justifyContent: "center", gap: "0", textAlign: "right" }}>
                            <span style={{ display: "block", width: "100%", whiteSpace: "normal", wordBreak: "break-word", lineHeight: 1.25 }}>{p.value}</span>
                          </button>
                          <div style={{ fontSize: 10, color: textFaint, marginTop: 8, opacity: 0.8, fontWeight: 500, textAlign: "right" }}>click gear to cycle</div>
                        </div>
                      ))}
                   </>
                )}
              </aside>
            )}
          </>
        )}
        
        {/* MODAL TRAP (PROFILE, BUGS, ACADEMIC CALENDAR) */}
        {(showProfileModal || showBugModal || showCalendar) && (
          <div className="kiosk-modal-trap" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999998, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {showProfileModal && currentUser && (
                <div className={simKiosk ? "kiosk-bug-wrapper" : ""} style={{ pointerEvents: 'auto', display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <ProfileModal dark={dark} user={currentUser} onClose={() => setShowProfileModal(false)} onUpdate={(updated: ChatUser) => { setCurrentUser(updated); showToast("Profile updated successfully!", "success"); }} showToast={showToast} />
                </div>
            )}
            {showBugModal && (
                <div className={simKiosk ? "kiosk-bug-wrapper" : ""} style={{ pointerEvents: 'auto', display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <BugModal dark={dark} user={currentUser} onClose={() => setShowBugModal(false)} showToast={showToast} />
                </div>
            )}
            
            {/* WEB CALENDAR MODAL (ADMIN EDITING) */}
            {showCalendar && (
                <div className={simKiosk ? "kiosk-calendar-wrapper" : ""} style={{ pointerEvents: 'auto', display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <WebCalendarModal dark={dark} setShowCalendar={setShowCalendar} currentUser={currentUser} API_URL={API_URL} showToast={showToast} />
                </div>
            )}
          </div>
        )}
        
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

      {/* FULLSCREEN IMAGE MODAL FIX */}
      {fullScreenMedia && (
        <div onClick={() => setFullScreenMedia(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999999, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', padding: 24 }}>
          <img onClick={(e) => { e.stopPropagation(); setFullScreenMedia(null); }} src={fullScreenMedia} alt="Fullscreen View" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 8, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', cursor: 'zoom-out' }} />
          <button onClick={() => setFullScreenMedia(null)} style={{ position: 'absolute', top: 24, right: 24, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}><X size={24} /></button>
        </div>
      )}

      {/* CUSTOM PDF VIEWER MODAL FOR WEB UI */}
      {fullScreenPdf && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999999, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ width: '100%', maxWidth: 1000, height: '90vh', background: dark ? '#1c1b22' : '#fff', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: dark ? '#13141c' : '#f3f4f6', borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`, zIndex: 20, flexShrink: 0 }}>
                 <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: dark ? '#fff' : '#000', display: 'flex', alignItems: 'center', gap: 8 }}><FileText size={20} /> Viewer</h2>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <button onClick={() => setPdfPage((p: number) => Math.max(1, p - 5))} style={{background: dark ? '#1e1e28' : 'rgba(0,0,0,0.05)', border: 'none', color: dark ? '#cbd5e1' : '#000', padding: '6px 12px', borderRadius: 8, fontWeight: 700, cursor: pdfPage <= 1 ? 'not-allowed' : 'pointer', opacity: pdfPage <= 1 ? 0.3 : 1}} disabled={pdfPage <= 1}>-5</button>
                    <button onClick={() => setPdfPage((p: number) => Math.max(1, p - 1))} style={{background: dark ? '#1e1e28' : 'rgba(0,0,0,0.05)', border: 'none', color: dark ? '#cbd5e1' : '#000', padding: '6px 12px', borderRadius: 8, fontWeight: 700, cursor: pdfPage <= 1 ? 'not-allowed' : 'pointer', opacity: pdfPage <= 1 ? 0.3 : 1}} disabled={pdfPage <= 1}><ArrowLeft size={16}/></button>
                    <span style={{ fontSize: 14, fontWeight: 700, color: dark ? '#fff' : '#000', whiteSpace: 'nowrap', margin: '0 8px' }}>{pdfPage} / {totalPages}</span>
                    <button onClick={() => setPdfPage((p: number) => Math.min(totalPages, p + 1))} style={{background: dark ? '#1e1e28' : 'rgba(0,0,0,0.05)', border: 'none', color: dark ? '#cbd5e1' : '#000', padding: '6px 12px', borderRadius: 8, fontWeight: 700, cursor: pdfPage >= totalPages ? 'not-allowed' : 'pointer', opacity: pdfPage >= totalPages ? 0.3 : 1}} disabled={pdfPage >= totalPages}><ArrowRight size={16}/></button>
                    <button onClick={() => setPdfPage((p: number) => Math.min(totalPages, p + 5))} style={{background: dark ? '#1e1e28' : 'rgba(0,0,0,0.05)', border: 'none', color: dark ? '#cbd5e1' : '#000', padding: '6px 12px', borderRadius: 8, fontWeight: 700, cursor: pdfPage >= totalPages ? 'not-allowed' : 'pointer', opacity: pdfPage >= totalPages ? 0.3 : 1}} disabled={pdfPage >= totalPages}>+5</button>
                 </div>
                 <button onClick={() => { setFullScreenPdf(null); setPdfRef(null); }} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginLeft: 16 }}>
                    <X size={20} />
                 </button>
              </div>

              <div className="no-scrollbar" style={{ flex: 1, width: '100%', position: 'relative', background: '#323639', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px', overflow: 'hidden' }}>
                 {pdfLoading && (<div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}><div style={{ position: "relative", width: 60, height: 60, display: "flex", justifyContent: "center", alignItems: "center" }}><div style={{ position: "absolute", transform: 'scale(0.5)' }}><GearboxLoader /></div></div></div>)}
                 <canvas ref={canvasRef} style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain', display: 'block', opacity: pdfLoading ? 0.3 : 1, transition: 'opacity 0.3s', background: '#fff', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} />
              </div>
            </div>
          </div>
      )}
    </>
  );
}