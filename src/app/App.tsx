import React, { useState, useRef, useEffect, useMemo } from "react";
import { Plus, Settings, Database, Trash2, LogOut, Bug, AlertCircle, CheckCircle, Info, ArrowLeft, ArrowRight, Menu, UserCog, X, MoreVertical, Bot, Calendar as CalendarIcon, Folder, User as UserIcon, Briefcase, Smartphone, Edit2, FileText, Maximize, ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";

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

  const parseLocal = (dStr: string) => {
     if (!dStr) return new Date();
     const [y, m, d] = dStr.split('T')[0].split('-');
     return new Date(Number(y), Number(m) - 1, Number(d));
  };

  const eventsByDay = useMemo(() => {
     const map: Record<number, any[]> = {};
     calendarData.forEach(evt => {
        if (!evt.date) return;
        const start = parseLocal(evt.date);
        const endStr = evt.endDate || evt.end_date || evt.date;
        const end = parseLocal(endStr);
        
        start.setHours(0,0,0,0);
        end.setHours(0,0,0,0);
        
        const monthStart = new Date(currentYear, currentMonth, 1);
        const monthEnd = new Date(currentYear, currentMonth + 1, 0);
        
        if (start <= monthEnd && end >= monthStart) {
           const startDay = start < monthStart ? 1 : start.getDate();
           const endDay = end > monthEnd ? daysInMonth : end.getDate();
           
           for (let d = startDay; d <= endDay; d++) {
              if (!map[d]) map[d] = [];
              const eventId = evt.id || evt.event_id || evt._id || evt.title;
              if (!map[d].find(e => (e.id || e.event_id || e._id || e.title) === eventId)) {
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
          end_date: calForm.endDate || calForm.date,
          title: calForm.title,
          description: calForm.description,
          type: calForm.type,
          event_type: calForm.type,
          userId: currentUser?.id
      };
      
      const res = await fetch(url, { 
          method, 
          headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify(payload) 
      });
      
      if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || errData.message || "Server rejected event.");
      }
      
      if (showToast) showToast("Event saved successfully!", "success");
      setIsCalFormOpen(false);
      fetchCalendar();
    } catch(e: any) { 
      if (showToast) showToast(`Save failed: ${e.message}`, "error"); 
      console.error(e);
    }
  };

  const handleDeleteCalEvent = async (id: any) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      const res = await fetch(`${API_URL}/calendar/${id}?userId=${currentUser?.id}`, { 
          method: "DELETE",
          headers: { "Content-Type": "application/json" }
      });

      if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || errData.message || "Failed to delete.");
      }
      if (showToast) showToast("Event deleted.", "success");
      fetchCalendar();
    } catch(e: any) { 
      if (showToast) showToast(`Delete failed: ${e.message}`, "error");
      console.error(e);
    }
  };

  return (
    <div style={{ display: 'flex', width: '100%', maxWidth: 860, background: dark ? '#1C1D55' : '#ffffff', borderRadius: 24, boxShadow: '0 24px 60px rgba(0,0,0,0.4)', border: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)'}`, overflow: 'hidden' }}>
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
              
              let cellBg = dark ? 'rgba(18, 87, 172, 0.3)' : '#f8fafc';
              let cellBorder = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
              
              if (isSelected) {
                  cellBg = dark ? 'rgba(253, 181, 28, 0.2)' : 'rgba(166, 1, 18, 0.1)';
                  cellBorder = dark ? '#FDB51C' : '#A60112';
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
                    const dateStr = new Date(currentYear, currentMonth, selectedDate).toLocaleDateString('en-CA');
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
                      <input type="date" value={calForm.date} onChange={e => {
                         const newStart = e.target.value;
                         let newEnd = calForm.endDate;
                         if (newStart && newEnd && newStart > newEnd) newEnd = newStart;
                         setCalForm({...calForm, date: newStart, endDate: newEnd});
                      }} style={{ width: '100%', padding: '8px', borderRadius: 8, border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, background: dark ? 'rgba(0,0,0,0.2)' : '#fff', color: dark ? '#fff' : '#000', fontSize: 12, outline: 'none' }} />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 11, color: dark ? '#94a3b8' : '#64748b' }}>End Date (Optional)</span>
                      <input type="date" value={calForm.endDate} onChange={e => setCalForm({...calForm, endDate: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: 8, border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, background: dark ? 'rgba(0,0,0,0.2)' : '#fff', color: dark ? '#fff' : '#000', fontSize: 12, outline: 'none' }} />
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
                       const eventId = evt.id || evt.event_id || evt._id;

                       return (
                          <div 
                             key={idx} 
                             onClick={() => {
                                const startDt = parseLocal(evt.date);
                                setCalendarDate(new Date(startDt.getFullYear(), startDt.getMonth(), 1));
                                setSelectedDate(startDt.getDate());
                             }}
                             style={{ background: dark ? 'rgba(255,255,255,0.05)' : '#fff', borderLeft: `4px solid ${style.color}`, borderRadius: 8, padding: '12px 16px', marginBottom: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'transform 0.2s' }}
                             onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                             onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                          >
                             <div style={{ fontSize: 10, fontWeight: 800, color: style.color, textTransform: 'uppercase', marginBottom: 4 }}>{style.label}</div>
                             <div style={{ fontSize: 14, fontWeight: 700, color: dark ? '#fff' : '#0f172a', lineHeight: 1.3 }}>{evt.title}</div>
                             
                             {(evt.endDate || evt.end_date) && (evt.endDate || evt.end_date) !== evt.date && (
                                <div style={{ fontSize: 11, color: style.color, marginTop: 6, fontWeight: 600 }}>
                                   {parseLocal(evt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric'})} - {parseLocal(evt.endDate || evt.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric'})}
                                </div>
                             )}

                             {evt.description && <div style={{ fontSize: 12, color: dark ? '#94a3b8' : '#64748b', marginTop: 6, lineHeight: 1.4 }}>{evt.description}</div>}
                             
                             {isAdmin && (
                                <div style={{ display: 'flex', gap: 8, marginTop: 12, borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`, paddingTop: 12 }}>
                                   <button onClick={(e) => { 
                                       e.stopPropagation();
                                       const startDt = parseLocal(evt.date);
                                       setCalendarDate(new Date(startDt.getFullYear(), startDt.getMonth(), 1));
                                       setSelectedDate(startDt.getDate());
                                       
                                       setCalForm({ 
                                          id: eventId, 
                                          date: evt.date.split('T')[0], 
                                          endDate: (evt.endDate || evt.end_date || evt.date).split('T')[0], 
                                          title: evt.title, 
                                          description: evt.description || "", 
                                          type: evt.type || evt.event_type || "Special Event" 
                                       }); 
                                       setIsCalFormOpen(true); 
                                   }} style={{ flex: 1, background: dark ? 'rgba(255,255,255,0.1)' : '#f1f5f9', border: 'none', padding: '6px', borderRadius: 6, cursor: 'pointer', color: dark ? '#cbd5e1' : '#475569', fontSize: 12, fontWeight: 600 }}>Edit</button>
                                   <button onClick={(e) => { e.stopPropagation(); handleDeleteCalEvent(eventId); }} style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', border: 'none', padding: '6px', borderRadius: 6, cursor: 'pointer', color: '#ef4444', fontSize: 12, fontWeight: 600 }}>Delete</button>
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
  const [simKiosk, setSimKiosk] = useState(() => {
     if (typeof window !== 'undefined') {
        if (localStorage.getItem("permanent_kiosk") === "true") return true;
        
        // Auto-detect large portrait displays (Android Kiosk profiles)
        const isPortrait = window.innerHeight > window.innerWidth;
        const isLargeScreen = window.innerWidth >= 600; 
        if (isPortrait && isLargeScreen) return true;
     }
     return false;
  });
  
  const [simScale, setSimScale] = useState(1);
  const [screenState, setScreenState] = useState<"presentation" | "home" | "kiosk_result" | "chat">(simKiosk ? "presentation" : "chat");
  const [kioskCategory, setKioskCategory] = useState<string | null>(null);
  const [kioskResult, setKioskResult] = useState<any>(null);
  const [kbOpen, setKbOpen] = useState(false); // Retained for the custom keyboard logic

  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && (window.innerWidth <= 1280));
  
  // Physically lock to full view if it is a real kiosk device
  const isPhysicalKiosk = useMemo(() => {
     if (typeof window === "undefined") return false;
     return window.innerHeight >= window.innerWidth;
  }, []);

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

  // --- SMART CATEGORY RESOLVER ALIAS MATCHER ---
  const getCategoryMatch = (name: string): string | null => {
    if (!name) return null;
    const lower = name.toLowerCase().trim();

    const exact = allSidebarCategories.find(c => c.toLowerCase() === lower);
    if (exact) return exact;

    if (lower.includes("faculty") || lower.includes("professor") || lower.includes("teacher")) {
      const match = allSidebarCategories.find(c => {
        const cl = c.toLowerCase();
        return cl.includes("faculty") || cl.includes("professor") || cl.includes("teacher");
      });
      if (match) return match;
    }

    if (lower.includes("partner") || lower.includes("industry") || lower.includes("accomp")) {
      const match = allSidebarCategories.find(c => {
        const cl = c.toLowerCase();
        return cl.includes("partner") || cl.includes("industry") || cl.includes("accomp");
      });
      if (match) return match;
    }

    if (lower.includes("facilit")) {
      const match = allSidebarCategories.find(c => c.toLowerCase().includes("facilit"));
      if (match) return match;
    }

    if (lower.includes("organ") || lower.includes("org") || lower.includes("affair")) {
      const match = allSidebarCategories.find(c => c.toLowerCase().includes("organ") || c.toLowerCase().includes("org"));
      if (match) return match;
    }

    if (lower.includes("major") || lower.includes("curriculum") || lower.includes("exten")) {
      const match = allSidebarCategories.find(c => c.toLowerCase().includes("major"));
      if (match) return match;
    }

    const subMatch = globalKnowledge.find((k: any) => (k.subcategory || '').toLowerCase() === lower && k.subcategory !== 'All');
    if (subMatch) return subMatch.subcategory;

    return null;
  };

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

  // STATE FOR MAPPING ADMIN KIOSK CLUSTERS
  const [kioskMapping, setKioskMapping] = useState<Record<string, string[]>>({});
  
  useEffect(() => {
    const savedMap = localStorage.getItem('chatcit_kiosk_mapping');
    if (savedMap) {
      try { setKioskMapping(JSON.parse(savedMap)); } catch(e){}
    } else {
      // Default initial mapping if empty
      setKioskMapping({
         "Faculty": ["Faculty & Professors"],
         "Accomplishment": ["Industry Partners"],
         "Student Affairs": ["Organizations", "Handbook", "Magna Carta"],
         "Curriculum": ["Majors"],
         "Extensions": []
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chatcit_kiosk_mapping', JSON.stringify(kioskMapping));
  }, [kioskMapping]);

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
    let timeoutId: ReturnType<typeof setTimeout>;
    const resetTimer = () => {
      if (!simKiosk) return; 
      clearTimeout(timeoutId);
      // 5 Minute Idle -> Presentation Mode
      timeoutId = setTimeout(() => {
        setScreenState("presentation"); 
        setKioskCategory(null); setKioskResult(null); setActiveChatId(null);
        setViewMode("chat"); setSidebarOpen(false); setRightRailOpen(false); setGearMode(false);
      }, 300000); 
    };
    resetTimer();
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(e => document.addEventListener(e, resetTimer));
    return () => { clearTimeout(timeoutId); events.forEach(e => document.removeEventListener(e, resetTimer)); };
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

  // KIOSK VIRTUAL KEYBOARD INJECTION & NATIVE KEYBOARD BLOCKER
  useEffect(() => {
    if (!simKiosk) { setKbOpen(false); return; }
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName) && target.getAttribute('type') !== 'file') { 
         // Force inputmode="none" to prevent Android native keyboard from squishing the layout
         target.setAttribute('inputmode', 'none'); 
         setKbOpen(true); 
      }
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
    
    if (simKiosk && (screenState === "presentation" || screenState === "home" || screenState === "kiosk_result")) {
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
            const prompt = `Tell me about ${item} in${category}`;
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
         const matchedCat = getCategoryMatch(item);
         if (matchedCat && !isDoc) {
            setDirectoryMode(matchedCat);
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

  // ADMIN MAP HELPERS
  const addCategoryToCluster = (cluster: string, cat: string) => {
     if (!cat || (kioskMapping[cluster] || []).includes(cat)) return;
     setKioskMapping(prev => ({ ...prev, [cluster]: [...(prev[cluster] || []), cat] }));
     showToast(`Added ${cat} to${cluster}`, "success");
  };
  const removeCategoryFromCluster = (cluster: string, cat: string) => {
     setKioskMapping(prev => ({ ...prev, [cluster]: (prev[cluster] || []).filter((c: string) => c !== cat) }));
     showToast(`Removed ${cat} from${cluster}`, "info");
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
  
  const isAdminUser = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';

  const topRightButtons = (
    <div style={{ display: "flex", alignItems: "center", gap: trGap }}>
      {/* Hide manual kiosk toggle if permanent mode is detected via localStorage UNLESS they are an admin trying to exit! */}
      {(isAdminUser && simKiosk) && (
         <button onClick={() => { setSimKiosk(false); localStorage.removeItem('permanent_kiosk'); }} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: trBtnSize, height: trBtnSize, borderRadius: trRadius, background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)", color: "#a855f7", cursor: "pointer", transition: "all 0.2s" }} title="Exit Kiosk Mode"><Smartphone size={trIconSize} /></button>
      )}
      {(!simKiosk) && (
         <button onClick={() => { setSimKiosk(true); localStorage.setItem('permanent_kiosk', 'true'); setScreenState("presentation"); }} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: trBtnSize, height: trBtnSize, borderRadius: trRadius, background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)", color: "#a855f7", cursor: "pointer", transition: "all 0.2s" }} title="Enter Kiosk Mode"><Smartphone size={trIconSize} /></button>
      )}

      <button onClick={() => requireAuth(() => setShowBugModal(true))} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: trBtnSize, height: trBtnSize, borderRadius: trRadius, background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)", color: "#ef4444", cursor: "pointer", transition: "all 0.2s" }} title="Report a Bug"><Bug size={trIconSize} /></button>
      <button onClick={() => requireAuth(() => setShowCalendar(true))} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: trBtnSize, height: trBtnSize, borderRadius: trRadius, background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)", color: "#10b981", cursor: "pointer", transition: "all 0.2s" }} title="Academic Calendar"><CalendarIcon size={trIconSize} /></button>
      <div className="theme-toggle-wrapper" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: trBtnSize, transform: simKiosk ? 'scale(1.3)' : 'scale(0.85)', transformOrigin: 'center' }}><DayNightToggle dark={dark} toggleDark={() => setDark(!dark)} /></div>
    </div>
  );

  const isKioskScreensaver = simKiosk && (screenState === "presentation" || screenState === "home" || screenState === "kiosk_result");
  const bg = isKioskScreensaver ? (dark ? "#1C1D55" : "#f8fafc") : (dark ? "#1c1b22" : "#f4f5f7");
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

  // PHYSICAL KIOSK DETECTION OVERRIDE TO FIX WHITE SPACES
  const containerStyle: React.CSSProperties = simKiosk ? {
    position: "fixed", 
    top: isPhysicalKiosk ? 0 : "50%", 
    left: isPhysicalKiosk ? 0 : "50%", 
    width: isPhysicalKiosk ? "100vw" : 768, 
    height: isPhysicalKiosk ? "100vh" : 1366, 
    transform: isPhysicalKiosk ? "none" : `translate(-50%, -50%) scale(${simScale})`, 
    transformOrigin: "center center", display: "flex", overflow: "hidden", 
    background: bg, fontFamily: "'Inter', sans-serif", color: textPrimary, 
    boxShadow: isPhysicalKiosk ? "none" : "0 25px 50px -12px rgba(0,0,0,0.8), 0 0 0 16px #111", 
    borderRadius: isPhysicalKiosk ? 0 : 24, zIndex: 99999
  } : { position: "absolute", top: 0, bottom: 0, left: 0, right: 0, display: "flex", overflow: "hidden", background: bg, fontFamily: "'Inter', sans-serif", color: textPrimary };

  // =====================================================================
  // ROBUST LAYOUT ENGINE LOGIC
  // =====================================================================
  const isWebMode = !simKiosk;
  const isKioskChat = simKiosk && screenState === "chat";
  
  // Mobile layout separation: Mobile screens OR Kiosk mode
  const useMobileLayout = isMobile || simKiosk; 
  
  // Left Sidebar Logic
  const showWebLeftSidebar = (isWebMode && !gearMode) || (isKioskChat && !gearMode);
  const showGearLeft = (isWebMode && gearMode && !isMobile) || (isKioskChat && gearMode);

  // Right Sidebar Logic
  const showRightRail = (!useMobileLayout && isWebMode) || rightRailOpen || isKioskChat; 

  // Main Content Offsets
  let mainLeft = 0;
  let mainRight = 0;

  if (isKioskChat) {
     mainLeft = 0;
     mainRight = RAIL_W; // Force gears sidebar on the right for kiosk chat
  } else if (!isKioskScreensaver) {
    if (!useMobileLayout && isWebMode) {
      mainLeft = gearMode ? RAIL_W : (sidebarOpen ? SIDEBAR_W : 0);
      mainRight = showRightRail ? RAIL_W : 0; 
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
        .kiosk-calendar-wrapper [role="dialog"], .kiosk-calendar-To get the kiosk UI running smoothly and looking polished for the BulSU students, we can fix these layout and scaling issues using some targeted HTML and CSS adjustments. 

### Fixing the Accomplishment Card Overlap
In **image_cd1d2f.png**, the word "Accomplishment" is too long and bleeds into the yellow arrow button. You can fix this by enforcing text wrapping and adjusting the layout of the card so the text and button are separated. 
* Add `overflow-wrap: break-word;` to the text element so it wraps to a new line instead of overflowing.
* Use a flexbox layout on the card container to keep the text and button properly spaced.

```css
.browse-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px; /* Creates breathing room between text and button */
}

.browse-title {
  overflow-wrap: break-word;
  word-wrap: break-word;
  max-width: 70%; /* Prevents text from reaching the button */
}
