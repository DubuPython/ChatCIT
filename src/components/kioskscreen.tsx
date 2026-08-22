import React, { useRef, useState, useEffect, useMemo } from "react";
import { Settings, Zap, Users, GraduationCap, FileText, ChevronLeft, ChevronRight, MessageSquare, Bot, Maximize, Search, UserSquare, Building, FilterX, Folder, Briefcase, ArrowRight, ArrowLeft, Calendar as CalendarIcon, X } from "lucide-react";
import { API_URL } from "../config";
import { GearboxLoader } from "./ui/helpers";

const GlobalKioskStyles = ({ dark }: { dark: boolean }) => (
  <style>{`
    .theme-toggle-wrapper input[type="checkbox"] { display: none !important; opacity: 0 !important; width: 0px !important; height: 0px !important; position: absolute; z-index: -100; }
    
    .screensaver-fullscreen {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 999995;
      background: ${dark ? 'linear-gradient(145deg, #0f172a 0%, #172554 100%)' : 'linear-gradient(145deg, #f0f9ff 0%, #e0f2fe 100%)'};
      display: flex; flex-direction: column; align-items: center;
      animation: fadeIn 0.3s ease; border-radius: inherit; overflow: hidden;
    }

    .bg-blob-1 {
      position: absolute; top: -10%; left: -10%; width: 50vw; height: 50vw;
      background: ${dark ? 'radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(56,189,248,0.4) 0%, transparent 70%)'};
      border-radius: 50%; z-index: 0; filter: blur(60px); pointer-events: none;
    }

    .bg-blob-2 {
      position: absolute; bottom: -10%; right: -10%; width: 60vw; height: 60vw;
      background: ${dark ? 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)'};
      border-radius: 50%; z-index: 0; filter: blur(60px); pointer-events: none;
    }
    
    /* CURVED BANNER AT THE BOTTOM - USING STRICT PX TO FIX SCALING BUG */
    .curved-banner-img {
      position: absolute; bottom: 0; left: 0; width: 100%; height: 320px;
      object-fit: cover;
      border-radius: 50% 50% 0 0 / 40px 40px 0 0;
      box-shadow: 0 -10px 30px rgba(0,0,0,0.15);
      z-index: 1; pointer-events: none;
    }
    
    .curved-banner-overlay {
      position: absolute; bottom: 0; left: 0; right: 0; height: 320px;
      background: ${dark ? 'linear-gradient(to top, rgba(15,23,42,1) 0%, rgba(15,23,42,0.1) 100%)' : 'linear-gradient(to top, rgba(240,249,255,1) 0%, rgba(240,249,255,0.1) 100%)'};
      border-radius: 50% 50% 0 0 / 40px 40px 0 0;
      z-index: 2; pointer-events: none;
    }

    .kiosk-main-scroll {
      position: relative; z-index: 10; width: 100%; height: 100%;
      display: flex; flex-direction: column; align-items: center;
      padding-top: 100px; overflow-y: auto; overflow-x: hidden; padding-bottom: 20px;
    }
    
    .greeting-box {
      display: flex; align-items: center; gap: 16px; margin-bottom: 16px;
      background: ${dark ? 'rgba(30, 35, 50, 0.95)' : 'rgba(255,255,255,0.95)'};
      padding: 16px 32px; border-radius: 100px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      backdrop-filter: blur(20px); border: 1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)'};
      width: 90%; max-width: 640px; flex-shrink: 0;
    }

    /* COMPACT CALENDAR */
    .calendar-widget {
      width: 90%; max-width: 640px; margin-bottom: 16px; flex-shrink: 0;
      background: ${dark ? 'rgba(30, 35, 50, 0.7)' : 'rgba(255, 255, 255, 0.9)'};
      border-radius: 24px; padding: 16px 24px;
      box-shadow: ${dark ? '0 10px 30px rgba(0,0,0,0.2)' : '0 10px 30px rgba(0,0,0,0.05)'};
      border: 1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)'};
      backdrop-filter: blur(10px);
    }
    
    .calendar-cell {
      height: 44px; display: flex; flex-direction: column; align-items: center; justify-content: center;
      background: ${dark ? 'rgba(19, 20, 28, 0.8)' : '#f8fafc'}; 
      border: 1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
      border-radius: 10px; position: relative; cursor: default; transition: background 0.2s;
    }
    
    .calendar-cell.today {
      border: 2px solid #4285f4 !important;
    }

    .omantel-grid {
      display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;
      width: 100%; max-width: 640px; padding: 0 16px; flex-shrink: 0;
    }
    
    .omantel-card {
      background: ${dark ? 'rgba(30, 35, 50, 0.7)' : 'rgba(255, 255, 255, 0.9)'};
      border-radius: 20px; padding: 16px; display: flex; flex-direction: column;
      box-shadow: ${dark ? '0 10px 30px rgba(0,0,0,0.2)' : '0 10px 30px rgba(0,0,0,0.05)'}; 
      cursor: pointer; transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
      position: relative; overflow: hidden; 
      border: 1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)'};
      backdrop-filter: blur(10px);
      min-height: 110px;
    }
    .omantel-card:active { transform: scale(0.96); background: ${dark ? '#2a3143' : '#f8fafc'}; }
    
    .omantel-card.wide { 
      grid-column: span 2; 
      background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%); 
      color: white; border: none; min-height: 130px;
    }
    
    /* GLASSY BUTTONS FOR SUBMENUS */
    .glassy-option-btn {
      background: ${dark ? 'rgba(30, 35, 50, 0.4)' : 'rgba(255, 255, 255, 0.7)'};
      border: 1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
      border-radius: 16px; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between;
      box-shadow: 0 8px 32px rgba(0,0,0,0.05); cursor: pointer; transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
      backdrop-filter: blur(12px); min-height: 80px;
    }
    .glassy-option-btn:active { transform: scale(0.98); background: ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}; }

    .glassy-dir-card {
      background: ${dark ? 'rgba(30, 35, 50, 0.4)' : 'rgba(255, 255, 255, 0.7)'};
      border: 1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
      border-radius: 20px; padding: 20px; display: flex; align-items: center; gap: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.05); cursor: pointer; transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
      backdrop-filter: blur(12px);
    }
    .glassy-dir-card:active { transform: scale(0.98); background: ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}; }

    .card-icon-wrapper { 
      width: 36px; height: 36px; border-radius: 12px; 
      display: flex; align-items: center; justify-content: center; margin-bottom: 8px; 
    }
    
    .card-arrow { 
      width: 28px; height: 28px; 
      border-radius: 50%; border: 1.5px solid ${dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}; 
      display: flex; align-items: center; justify-content: center; 
      color: ${dark ? '#a1a1aa' : '#64748b'}; flex-shrink: 0;
    }
    .omantel-card.wide .card-arrow { position: absolute; bottom: 16px; right: 16px; border-color: rgba(255,255,255,0.3); color: white; }
    .omantel-card:not(.wide) .card-arrow { position: absolute; bottom: 16px; right: 16px; }

    .back-btn-modern {
      display: flex; align-items: center; gap: 8px; background: ${dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.05)'};
      border: 1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)'}; color: ${dark ? '#fff' : '#0f172a'};
      padding: 10px 18px; border-radius: 20px; font-size: 15px; font-weight: 700; cursor: pointer; 
      transition: transform 0.1s; box-shadow: 0 4px 12px rgba(0,0,0,0.1); backdrop-filter: blur(10px);
    }
    .back-btn-modern:active { transform: scale(0.92); }

    .pdf-nav-btn {
       background: ${dark ? '#1e1e28' : 'rgba(0,0,0,0.05)'}; border: none; color: ${dark ? '#cbd5e1' : '#000'};
       padding: 6px 12px; border-radius: 8px; font-weight: 700; font-size: 14px; cursor: pointer; transition: transform 0.1s; display: flex; align-items: center; justify-content: center;
    }
    .pdf-nav-btn:active:not(:disabled) { transform: scale(0.92); background: rgba(66, 133, 244, 0.8); color: white; }
    .pdf-nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }

    /* DETAIL VIEW CARD */
    .kiosk-detail-card {
       width: 90%; max-width: 860px; flex: 1 0 auto; min-height: 0; max-height: 800px;
       background: ${dark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255,255,255,0.9)'};
       border-radius: 32px; border: 1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)'};
       display: flex; flex-direction: column; box-shadow: 0 24px 60px rgba(0,0,0,0.4);
       overflow: hidden; margin-bottom: 24px; z-index: 10; backdrop-filter: blur(24px);
    }
    /* THIS ENSURES PDFS ALWAYS STAY TALL AND DON'T SQUISH BY USING EXACT PIXELS */
    .kiosk-detail-card.is-pdf {
       height: 1050px !important; 
       max-height: 1050px !important; 
       min-height: 1050px !important; 
       padding: 0 !important;
       flex: 0 0 1050px !important; 
    }

    .pagination-bar {
      display: flex; justify-content: space-between; align-items: center; 
      width: 100%; max-width: 720px; margin-top: 16px; padding: 12px 24px; 
      background: ${dark ? 'rgba(30, 35, 50, 0.4)' : 'rgba(255, 255, 255, 0.6)'}; 
      border-radius: 16px; border: 1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}; 
      backdrop-filter: blur(12px); z-index: 10; flex-shrink: 0;
    }
    .pagination-btn {
      padding: 10px 20px; border-radius: 12px; border: none; 
      background: #4285f4; color: #fff; font-size: 15px; font-weight: 700; cursor: pointer; transition: transform 0.1s;
    }
    .pagination-btn:active:not(:disabled) { transform: scale(0.95); }
    .pagination-btn:disabled { background: transparent; color: ${dark ? '#64748b' : '#94a3b8'}; cursor: default; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `}</style>
);

const getIconForCategory = (cat: string, size = 20) => {
  if (!cat) return <Folder size={size} />;
  const lower = cat.toLowerCase();
  if (lower.includes("org")) return <Users size={size} />;
  if (lower.includes("major")) return <GraduationCap size={size} />;
  if (lower.includes("doc") || lower.includes("carta") || lower.includes("handbook")) return <FileText size={size} />;
  if (lower.includes("indust") || lower.includes("partner")) return <Briefcase size={size} />;
  if (lower.includes("facil")) return <Building size={size} />;
  if (lower.includes("teach") || lower.includes("prof") || lower.includes("facul")) return <UserSquare size={size} />;
  return <Folder size={size} />;
};

export const KioskScreen = ({ dark, screenState, setScreenState, kioskCategory, setKioskCategory, kioskResult, setKioskResult, handleKioskSelection, topRightButtons, setFullScreenIframe, setFullScreenMedia, gear1, gear2, gear3, quickPrompts }: any) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfPage, setPdfPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pdfRef, setPdfRef] = useState<any>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Local fullscreen handler strictly for PDF zooms
  const [localFullScreen, setLocalFullScreen] = useState<string | null>(null);

  const [dbDirectoryData, setDbDirectoryData] = useState<any[]>([]);
  const [loadingDir, setLoadingDir] = useState(false);
  const [dirMajor, setDirMajor] = useState<string | null>(null);
  const [dirSearch, setDirSearch] = useState("");
  const [dirPage, setDirPage] = useState(1);
  const ITEMS_PER_PAGE = 8; 

  // Calendar State
  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Sub-Category Pagination State
  const [subMenuPage, setSubMenuPage] = useState(1);
  const SUBMENU_ITEMS_PER_PAGE = 10; 

  useEffect(() => {
     fetch(`${API_URL}/calendar`)
       .then(res => res.json())
       .then(data => { if (Array.isArray(data)) setCalendarData(data); })
       .catch(err => console.error("Failed to load calendar", err));
  }, []);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const currentYear = calendarDate.getFullYear();
  const currentMonth = calendarDate.getMonth();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => setCalendarDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () => setCalendarDate(new Date(currentYear, currentMonth + 1, 1));

  // Determine Box Style Colors for Events
  const getEventStyle = (evt: any) => {
     const t = (evt.event_type || evt.type || evt.title || '').toLowerCase();
     if (t.includes('exam')) return { bg: 'rgba(239, 68, 68, 0.25)', border: 'rgba(239, 68, 68, 0.5)', text: '#fca5a5' }; // Red
     if (t.includes('holiday')) return { bg: 'rgba(16, 185, 129, 0.25)', border: 'rgba(16, 185, 129, 0.5)', text: '#6ee7b7' }; // Green
     return { bg: 'rgba(59, 130, 246, 0.25)', border: 'rgba(59, 130, 246, 0.5)', text: '#93c5fd' }; // Blue (Special Event)
  };

  const eventsByDay = useMemo(() => {
     const map: Record<number, any[]> = {};
     calendarData.forEach(evt => {
        const d = new Date(evt.date);
        if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
           const day = d.getDate();
           if (!map[day]) map[day] = [];
           map[day].push(evt);
        }
     });
     return map;
  }, [calendarData, currentYear, currentMonth]);

  useEffect(() => {
     if (kioskResult?.isPdf) setPdfPage(1);
     if (kioskResult?.isDirectory) {
         setDirMajor(kioskResult.subcategory && kioskResult.subcategory !== 'All' ? kioskResult.subcategory : null); 
         setDirSearch(""); 
         setDirPage(1);
         setLoadingDir(true);
         fetch(`${API_URL}/knowledge`).then(res => res.json()).then(data => {
             const rawData = Array.isArray(data) ? data : [];
             const targetName = (kioskResult.category || kioskResult.title || "").toLowerCase();
             const directoryItems = rawData.filter((item: any) => {
                 const itemCat = (item.category || "").toLowerCase();
                 const itemSub = (item.subcategory || "").toLowerCase();
                 return itemCat === targetName || itemSub === targetName;
             });
             setDbDirectoryData(directoryItems);
           }).catch(err => console.error(err)).finally(() => setLoadingDir(false));
     }
  }, [kioskResult?.title, kioskResult?.isDirectory]);

  useEffect(() => {
    if (!kioskResult?.isPdf || !kioskResult?.pdfUrl) return;
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
         const cleanUrl = kioskResult.pdfUrl.split('#')[0];
         const pdf = await (window as any).pdfjsLib.getDocument(cleanUrl).promise;
         if(isMounted) { setPdfRef(pdf); setTotalPages(pdf.numPages); setPdfPage(1); }
      } catch(e) { console.error("Failed to load Kiosk PDF", e); } 
      finally { if(isMounted) setPdfLoading(false); }
    };
    loadPDF();
    return () => { isMounted = false; };
  }, [kioskResult?.pdfUrl]);

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

  const formatText = (text: string) => {
    if (!text) return null; const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) { return <strong key={i} style={{ color: dark ? '#fff' : '#000', fontWeight: 800 }}>{part.slice(2, -2)}</strong>; }
      return <span key={i}>{part}</span>;
    });
  };

  const filteredDirectory = React.useMemo(() => {
      return dbDirectoryData.filter(item => {
            const name = item.display_name || (item.keyword ? item.keyword.split(',')[0] : "") || "";
            const major = item.subcategory || "All";
            const matchesSearch = name.toLowerCase().includes(dirSearch.toLowerCase()) || major.toLowerCase().includes(dirSearch.toLowerCase()) || (item.response || '').toLowerCase().includes(dirSearch.toLowerCase());
            const matchesMajor = dirMajor ? major.toLowerCase() === dirMajor.toLowerCase() : true;
            return matchesSearch && matchesMajor;
        }).sort((a, b) => {
            const nameA = a.display_name || (a.keyword ? a.keyword.split(',')[0] : "") || "";
            const nameB = b.display_name || (b.keyword ? b.keyword.split(',')[0] : "") || "";
            return nameA.localeCompare(nameB);
        });
  }, [dbDirectoryData, dirSearch, dirMajor]);

  const totalDirPages = Math.ceil(filteredDirectory.length / ITEMS_PER_PAGE) || 1;
  const currentDirData = filteredDirectory.slice((dirPage - 1) * ITEMS_PER_PAGE, dirPage * ITEMS_PER_PAGE);

  const textMuted = dark ? "#94a3b8" : "#64748b"; 
  const resultCardBg = dark ? '#13141c' : '#ffffff'; 
  const headerBg = dark ? '#13141c' : '#ffffff';

  let itemsToRender: string[] = [];
  if (kioskCategory === "Quick Prompts") itemsToRender = quickPrompts;
  else if (kioskCategory === gear1?.label) itemsToRender = gear1.items;
  else if (kioskCategory === gear2?.label) itemsToRender = gear2.items;
  else if (kioskCategory === gear3?.label) itemsToRender = gear3.items;

  // Submenu Pagination logic
  useEffect(() => { setSubMenuPage(1); }, [kioskCategory]);
  const totalSubMenuPages = Math.ceil(itemsToRender.length / SUBMENU_ITEMS_PER_PAGE) || 1;
  const currentSubMenuData = itemsToRender.slice((subMenuPage - 1) * SUBMENU_ITEMS_PER_PAGE, subMenuPage * SUBMENU_ITEMS_PER_PAGE);

  const subCategories = Array.from(new Set(dbDirectoryData.map((d: any) => d.subcategory))).filter(s => s && s !== 'All');

  // Helper to completely reset Kiosk and go Home
  const goHome = () => {
    setScreenState("screensaver");
    setKioskCategory(null);
    setKioskResult(null);
  };

  return (
    <>
      <GlobalKioskStyles dark={dark} />
      <div className="screensaver-fullscreen">
        <div className="bg-blob-1" />
        <div className="bg-blob-2" />
        
        {/* CUSTOMIZABLE IMAGE PLACEHOLDER (BOTTOM POSITION) */}
        <img 
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=80" 
            alt="University Placeholder" 
            className="curved-banner-img" 
        />
        <div className="curved-banner-overlay" />

        {/* ABSOLUTE TOP HEADER - CLICKABLE TO GO HOME */}
        <div 
          style={{ position: 'absolute', top: 24, left: 32, zIndex: 100, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
          onClick={goHome}
        >
            <Bot size={36} color={dark ? "#fff" : "#0f172a"} />
            <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-1px' }}>
                <span style={{ color: dark ? '#fff' : '#0f172a' }}>Chat</span><span style={{ color: '#4285f4' }}>CIT</span>
            </span>
        </div>
        <div style={{ position: "absolute", top: 24, right: 32, zIndex: 100 }}>{topRightButtons}</div>

        <div className="kiosk-main-scroll no-scrollbar">

          {/* MAIN MENU STATE */}
          {screenState === "screensaver" && !kioskCategory && (
            <>
              {/* 1. COMPACT GREETING BOX */}
              <div className="greeting-box">
                <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', border: '4px solid #fff', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', flexShrink: 0, background: '#4285f4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={44} color="#fff" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: dark ? '#fff' : '#0f172a' }}>Good Day!</h1>
                  <p style={{ margin: '4px 0 0', fontSize: 14, color: dark ? '#94a3b8' : '#64748b', lineHeight: 1.4 }}>Welcome to Bulacan State University.<br/>How can I help you today?</p>
                </div>
              </div>

              {/* 2. COMPACT WIDE GRID CALENDAR */}
              <div className="calendar-widget">
                 {/* Header Nav */}
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <button onClick={prevMonth} style={{ background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', border: 'none', padding: 8, borderRadius: 10, color: dark ? '#fff' : '#000', cursor: 'pointer', display: 'flex' }}><ChevronLeft size={16}/></button>
                    <span style={{ fontSize: 16, fontWeight: 800, color: dark ? '#fff' : '#0f172a' }}>{calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                    <button onClick={nextMonth} style={{ background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', border: 'none', padding: 8, borderRadius: 10, color: dark ? '#fff' : '#000', cursor: 'pointer', display: 'flex' }}><ChevronRight size={16}/></button>
                 </div>
                 
                 {/* Weekdays */}
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 8, textAlign: 'center' }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <span key={d} style={{ fontSize: 10, fontWeight: 700, color: textMuted }}>{d}</span>)}
                 </div>
                 
                 {/* Grid Cells (Solid colors for Events) */}
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
                    {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                       const day = i + 1;
                       const evts = eventsByDay[day] || [];
                       const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString();
                       
                       // Default styling
                       let cellBg = dark ? 'rgba(19, 20, 28, 0.8)' : '#f8fafc';
                       let cellBorder = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
                       let textColor = dark ? '#fff' : '#0f172a';
                       
                       // Event styling (Whole box colored)
                       if (evts.length > 0) {
                          const style = getEventStyle(evts[0]);
                          cellBg = style.bg;
                          cellBorder = style.border;
                          textColor = dark ? style.text : style.border;
                       }

                       return (
                          <div key={day} className={`calendar-cell ${isToday ? 'today' : ''}`} style={{ background: cellBg, border: `1px solid ${cellBorder}` }}>
                             <span style={{ fontSize: 13, fontWeight: 700, color: textColor }}>{day}</span>
                          </div>
                       )
                    })}
                 </div>
                 
                 {/* Legend */}
                 <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 12, padding: '8px', background: dark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)', borderRadius: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 12, height: 12, borderRadius: 4, background: 'rgba(59, 130, 246, 0.8)' }} /><span style={{ fontSize: 11, color: textMuted, fontWeight: 600 }}>Special Event</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 12, height: 12, borderRadius: 4, background: 'rgba(239, 68, 68, 0.8)' }} /><span style={{ fontSize: 11, color: textMuted, fontWeight: 600 }}>Examination</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 12, height: 12, borderRadius: 4, background: 'rgba(16, 185, 129, 0.8)' }} /><span style={{ fontSize: 11, color: textMuted, fontWeight: 600 }}>Holiday</span></div>
                 </div>
              </div>

              {/* 3. COMPACT OMANTEL GRID */}
              <div className="omantel-grid">
                <div className="omantel-card" onClick={() => setKioskCategory(gear1?.label)}>
                  <div className="card-icon-wrapper" style={{ background: 'rgba(66, 133, 244, 0.1)', color: '#4285f4' }}>{getIconForCategory(gear1?.label, 20)}</div>
                  <div style={{ fontSize: 12, color: textMuted, fontWeight: 600 }}>Browse</div>
                  <div style={{ fontSize: 18, color: dark ? '#fff' : '#0f172a', fontWeight: 800 }}>{gear1?.label || "No Data"}</div>
                  <div className="card-arrow"><ArrowRight size={14}/></div>
                </div>
                
                <div className="omantel-card" onClick={() => setKioskCategory(gear2?.label)}>
                  <div className="card-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>{getIconForCategory(gear2?.label, 20)}</div>
                  <div style={{ fontSize: 12, color: textMuted, fontWeight: 600 }}>Explore</div>
                  <div style={{ fontSize: 18, color: dark ? '#fff' : '#0f172a', fontWeight: 800 }}>{gear2?.label || "No Data"}</div>
                  <div className="card-arrow"><ArrowRight size={14}/></div>
                </div>

                <div className="omantel-card wide" onClick={() => { setScreenState("chat"); setKioskCategory(null); setKioskResult(null); }}>
                  <div style={{ fontSize: 14, opacity: 0.9, fontWeight: 600, marginBottom: 4 }}>Interactive AI Assistant</div>
                  <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Talk with ChatCIT</div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}><MessageSquare size={14}/> Ask anything</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}><Search size={14}/> Search records</span>
                  </div>
                  <Bot size={100} style={{ position: 'absolute', right: -15, bottom: -15, opacity: 0.2 }} />
                </div>

                <div className="omantel-card" onClick={() => setKioskCategory(gear3?.label)}>
                  <div className="card-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>{getIconForCategory(gear3?.label, 20)}</div>
                  <div style={{ fontSize: 12, color: textMuted, fontWeight: 600 }}>Discover</div>
                  <div style={{ fontSize: 18, color: dark ? '#fff' : '#0f172a', fontWeight: 800 }}>{gear3?.label || "No Data"}</div>
                  <div className="card-arrow"><ArrowRight size={14}/></div>
                </div>

                <div className="omantel-card" onClick={() => setKioskCategory("Quick Prompts")}>
                  <div className="card-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}><Zap size={20} /></div>
                  <div style={{ fontSize: 12, color: textMuted, fontWeight: 600 }}>Frequent</div>
                  <div style={{ fontSize: 18, color: dark ? '#fff' : '#0f172a', fontWeight: 800 }}>Quick Prompts</div>
                  <div className="card-arrow"><ArrowRight size={14}/></div>
                </div>
              </div>
            </>
          )}

          {/* CATEGORY SUB-MENU STATE (GLASSY CARDS WITH PAGINATION) */}
          {screenState === "screensaver" && kioskCategory && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 20px', zIndex: 10 }}>
              <div style={{ width: '100%', maxWidth: 720, display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <button onClick={() => setKioskCategory(null)} className="back-btn-modern"><ArrowLeft size={20}/> Back</button>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: dark ? '#fff' : '#000', margin: 0, textShadow: dark ? '0 4px 12px rgba(0,0,0,0.3)' : 'none' }}>{kioskCategory}</h2>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, width: '100%', maxWidth: 720 }}>
                {currentSubMenuData.map((item, idx) => (
                  <div key={idx} className="glassy-option-btn" onClick={() => handleKioskSelection(kioskCategory === 'Quick Prompts' ? 'General' : kioskCategory, item)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                       {/* LEFT-ALIGNED ICON ADDED NEXT TO TEXT */}
                       <div style={{ color: '#4285f4', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.8, flexShrink: 0 }}>
                         {getIconForCategory(kioskCategory === 'Quick Prompts' ? item : kioskCategory, 20)}
                       </div>
                       <div style={{ fontSize: 15, fontWeight: 700, color: dark ? '#fff' : '#0f172a', lineHeight: 1.4, wordBreak: 'break-word', textAlign: 'left', display: 'flex', alignItems: 'center' }}>
                         {item.replace('Teachers', 'Professors')}
                       </div>
                    </div>
                    <div className="card-arrow" style={{ width: 26, height: 26, position: 'relative', right: 0, bottom: 0, flexShrink: 0 }}><ArrowRight size={14}/></div>
                  </div>
                ))}
              </div>

              {totalSubMenuPages > 1 && (
                <div className="pagination-bar">
                  <button onClick={() => setSubMenuPage(p => Math.max(1, p - 1))} disabled={subMenuPage === 1} className="pagination-btn">Previous</button>
                  <span style={{ fontSize: 16, fontWeight: 700, color: dark ? '#fff' : '#0f172a' }}>Page {subMenuPage} of {totalSubMenuPages}</span>
                  <button onClick={() => setSubMenuPage(p => Math.min(totalSubMenuPages, p + 1))} disabled={subMenuPage === totalSubMenuPages} className="pagination-btn">Next</button>
                </div>
              )}

              {itemsToRender.length === 0 && <div style={{ color: textMuted, fontSize: 18, marginTop: 40, zIndex: 10 }}>No items available.</div>}
            </div>
          )}

          {/* KIOSK RESULT STATE (PDF / DIRECTORY / CHAT) */}
          {screenState === "kiosk_result" && (
            
            // Forces PDF view to stretch to 1050px exactly so it doesn't get squished by flexbox
            <div className={`kiosk-detail-card ${kioskResult?.isPdf ? 'is-pdf' : ''}`} style={ kioskResult?.isPdf ? {} : {}}>
              
              {/* PDF VIEWER LAYOUT */}
              {kioskResult?.isPdf ? (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: headerBg, borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`, zIndex: 20, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                       {/* UN-TRAPPED BACK BUTTON */}
                       <button onClick={() => { setKioskResult(null); setScreenState("screensaver"); }} style={{ background: "transparent", border: "none", color: dark ? '#fff' : '#000', cursor: "pointer", display: "flex", alignItems: "center" }}><ArrowLeft size={24} /></button>
                       <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: dark ? '#fff' : '#000', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{kioskResult.title}</h2>
                    </div>
                    {/* TOP DOCKED PDF PAGINATION FOOTER */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: dark ? '#fff' : '#000', whiteSpace: 'nowrap', marginRight: 12 }}>{pdfPage} / {totalPages}</span>
                      <button onClick={() => setPdfPage((p: number) => Math.max(1, p - 5))} className="pdf-nav-btn" disabled={pdfPage <= 1}>-5</button>
                      <button onClick={() => setPdfPage((p: number) => Math.max(1, p - 1))} className="pdf-nav-btn" disabled={pdfPage <= 1}><ChevronLeft size={16}/></button>
                      <button onClick={() => setPdfPage((p: number) => Math.min(totalPages, p + 1))} className="pdf-nav-btn" disabled={pdfPage >= totalPages}><ChevronRight size={16}/></button>
                      <button onClick={() => setPdfPage((p: number) => Math.min(totalPages, p + 5))} className="pdf-nav-btn" disabled={pdfPage >= totalPages}>+5</button>
                    </div>
                  </div>
                  
                  {/* Canvas Container */}
                  <div className="no-scrollbar" style={{ flex: 1, width: '100%', position: 'relative', background: '#323639', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '12px', overflow: 'auto' }}>
                     {pdfLoading && (<div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}><div style={{ position: "relative", width: 60, height: 60, display: "flex", justifyContent: "center", alignItems: "center" }}><div style={{ position: "absolute", transform: 'scale(0.5)' }}><GearboxLoader /></div></div></div>)}
                     <canvas ref={canvasRef} style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain', display: 'block', opacity: pdfLoading ? 0.3 : 1, transition: 'opacity 0.3s', background: '#fff', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} />
                     
                     {/* Local Fullscreen Trigger */}
                     {pdfRef && (<button onClick={() => { if (canvasRef.current) { setLocalFullScreen(canvasRef.current.toDataURL('image/png')); } }} style={{ position: 'absolute', bottom: 24, right: 24, zIndex: 20, background: '#4285f4', color: '#fff', border: 'none', borderRadius: '50%', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.1s', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }} onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.92)'} onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}><Maximize size={28} /></button>)}
                  </div>
                </div>

              /* DIRECTORY VIEW (Subfolders / Groups like General Guidelines) */
              ) : kioskResult?.isDirectory ? (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  
                  {/* Glassy Top Header */}
                  <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 16, padding: '24px 32px 0 32px', flexShrink: 0 }}>
                    <button onClick={() => { setKioskResult(null); setScreenState("screensaver"); }} className="back-btn-modern" style={{ background: 'rgba(255,255,255,0.1)' }}><ArrowLeft size={20}/> Back</button>
                    <h2 style={{ fontSize: 28, fontWeight: 800, color: dark ? '#fff' : '#000', margin: 0 }}>{kioskResult?.title.replace('Teachers', 'Professors')}</h2>
                  </div>

                  <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column' }}>
                     {!dirMajor && dirSearch === "" && subCategories.length > 0 ? (
                        <>
                          <div style={{ fontSize: 20, fontWeight: 600, color: textMuted, marginBottom: 24, textAlign: 'center' }}>Select a Folder to view {kioskResult.title.replace('Teachers', 'Professors')}</div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 16 }}>
                             {subCategories.map((m, idx) => (
                               <button key={idx} className="dir-major-btn" onClick={() => { setDirMajor(m as string); setDirPage(1); }}>
                                 {getIconForCategory(kioskResult.title, 28)}
                                 <span style={{ flex: 1, textAlign: 'left' }}>{m as string}</span>
                               </button>
                             ))}
                          </div>
                        </>
                     ) : (
                        loadingDir ? (
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ transform: 'scale(0.8)' }}><GearboxLoader /></div></div>
                        ) : (
                           <>
                             {/* Re-use the Glassy Buttons for clean Directory lists */}
                             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 16, width: '100%' }}>
                                {currentDirData.length > 0 ? currentDirData.map((item) => (
                                   <div key={item.id} className="glassy-dir-card" onClick={() => handleKioskSelection(kioskResult.category || kioskResult.title, item.display_name || (item.keyword ? item.keyword.split(',')[0] : ""))}>
                                      <div style={{ width: 64, height: 64, borderRadius: '50%', background: dark ? '#1e293b' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                                         {item.picture_url && !item.picture_url.toLowerCase().includes('.pdf') ? (<img src={item.picture_url} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />) : getIconForCategory(kioskResult.title, 32)}
                                      </div>
                                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start', textAlign: 'left' }}>
                                         <span style={{ fontSize: 20, fontWeight: 800, color: dark ? '#fff' : '#0f172a' }}>{item.display_name || (item.keyword ? item.keyword.split(',')[0] : "")}</span>
                                         {item.subcategory && item.subcategory !== "All" && (<span style={{ fontSize: 16, fontWeight: 600, color: '#4285f4' }}>{item.subcategory}</span>)}
                                         <span style={{ fontSize: 14, color: textMuted, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.response}</span>
                                      </div>
                                      <ChevronRight size={24} color={textMuted} style={{ flexShrink: 0 }} />
                                   </div>
                                )) : (
                                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: textMuted, fontWeight: 600, padding: 40 }}>No records found.</div>
                                )}
                             </div>
                             
                             {/* Identical pagination style */}
                             {totalDirPages > 1 && (
                               <div className="pagination-bar" style={{ maxWidth: '100%', marginTop: 32 }}>
                                  <button onClick={() => setDirPage(p => Math.max(1, p - 1))} disabled={dirPage <= 1} className="pagination-btn">Previous</button>
                                  <span style={{ fontSize: 16, fontWeight: 700, color: dark ? '#fff' : '#0f172a' }}>Page {dirPage} of {totalDirPages}</span>
                                  <button onClick={() => setDirPage(p => Math.min(totalDirPages, p + 1))} disabled={dirPage >= totalDirPages} className="pagination-btn">Next</button>
                               </div>
                             )}
                           </>
                        )
                     )}
                  </div>
                </div>

              /* DETAIL VIEW (Specific Org / Policy / Profile text display) */
              ) : (
                <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '40px', display: 'flex', flexDirection: 'column' }}>
                  
                  {/* Clean un-trapped inline header inside the card */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 32 }}>
                    <button onClick={() => { setKioskResult(null); setScreenState("screensaver"); }} style={{ background: "transparent", border: "none", color: dark ? '#fff' : '#000', cursor: "pointer", display: "flex", alignItems: "center", marginTop: 4 }}><ArrowLeft size={28} /></button>
                    <h2 style={{ fontSize: 28, fontWeight: 800, margin: 0, color: dark ? '#fff' : '#000', textTransform: 'uppercase', lineHeight: 1.2 }}>{kioskResult?.title}</h2>
                  </div>

                  {kioskResult?.loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 16, marginTop: 60 }}>
                      <Bot color="#4285f4" size={72} className="animate-pulse" />
                      <span style={{ fontSize: 24, color: textMuted, fontWeight: 600 }}>ChatCIT is fetching details...</span>
                    </div>
                  ) : (
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {kioskResult?.image && (<div style={{ background: '#fff', borderRadius: 32, padding: 16, marginBottom: 32, boxShadow: '0 12px 32px rgba(0,0,0,0.2)' }}><img src={kioskResult.image} alt={`${kioskResult.title} Logo`} style={{ width: 200, height: 200, objectFit: 'contain' }} /></div>)}
                      <div style={{ fontSize: 18, lineHeight: 1.6, color: dark ? '#cbd5e1' : '#334155', width: '100%', whiteSpace: 'pre-wrap', paddingBottom: 40 }}>{formatText(kioskResult?.content)}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* LOCAL FULLSCREEN TRAP FIX: Click anywhere to close! */}
      {localFullScreen && (
        <div onClick={() => setLocalFullScreen(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999999, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', padding: 24 }}>
          <img src={localFullScreen} alt="Fullscreen View" onClick={(e) => { e.stopPropagation(); setLocalFullScreen(null); }} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 8, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', cursor: 'zoom-out' }} />
          <button onClick={() => setLocalFullScreen(null)} style={{ position: 'absolute', top: 24, right: 24, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}><X size={24} /></button>
        </div>
      )}
    </>
  );
};