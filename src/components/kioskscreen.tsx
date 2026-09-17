import React, { useRef, useState, useEffect, useMemo } from "react";
import { Users, GraduationCap, FileText, ChevronLeft, ChevronRight, MessageSquare, Bot, Maximize, Search, UserSquare, Briefcase, ArrowRight, ArrowLeft, Calendar as CalendarIcon, X, LayoutGrid, Building } from "lucide-react";
import { GearboxLoader } from "./ui/helpers";
import { API_URL } from "../config";

const GlobalKioskStyles = ({ dark, theme }: { dark: boolean, theme: any }) => (
  <style>{`
    .theme-toggle-wrapper input[type="checkbox"] { display: none !important; opacity: 0 !important; width: 0px !important; height: 0px !important; position: absolute; z-index: -100; }
    
    .screensaver-fullscreen {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 999995;
      background: ${theme.bg};
      display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
      animation: fadeIn 0.4s ease; border-radius: inherit; overflow: hidden;
    }

    .screensaver-fullscreen.presentation-mode {
      justify-content: center;
      background: #000 !important;
    }

    .bg-blob-1 {
      position: absolute; top: 0%; left: -20%; width: 70vw; height: 70vw;
      background: ${dark ? 'radial-gradient(circle, rgba(18, 87, 172, 0.25) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(166, 1, 18, 0.12) 0%, transparent 70%)'};
      border-radius: 50%; z-index: 0; filter: blur(80px); pointer-events: none;
      animation: floatBg 20s ease-in-out infinite;
    }

    .bg-blob-2 {
      position: absolute; bottom: 0%; right: -20%; width: 80vw; height: 80vw;
      background: ${dark ? 'radial-gradient(circle, rgba(253, 181, 28, 0.15) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(245, 170, 42, 0.15) 0%, transparent 70%)'};
      border-radius: 50%; z-index: 0; filter: blur(100px); pointer-events: none;
      animation: floatBg 25s ease-in-out infinite reverse;
    }

    .kiosk-main-scroll {
      position: relative; z-index: 10; width: 100%; height: 100%; flex: 1 1 auto; min-height: 0;
      display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
      padding-top: 90px; padding-bottom: 60px;
      overflow-y: auto !important; overflow-x: hidden !important;
      -webkit-overflow-scrolling: touch !important;
      touch-action: pan-y !important;
      overscroll-behavior-y: contain;
    }
    
    .greeting-box {
      display: flex; align-items: center; justify-content: space-between;
      padding: 24px 32px; border-radius: 32px;
      background: ${dark ? 'rgba(18, 87, 172, 0.15)' : 'rgba(255, 255, 255, 0.6)'};
      border: 1px solid ${dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(166, 1, 18, 0.2)'};
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
      width: 90%; max-width: 680px; flex-shrink: 0;
      margin-bottom: 32px; animation: slideDown 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    .omantel-grid {
      display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px;
      width: 100%; max-width: 680px; padding: 0 16px; flex-shrink: 0;
      animation: slideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) both;
    }
    
    .glassy-cluster-card {
      border-radius: 28px; padding: 20px; display: flex; flex-direction: column;
      background: ${dark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.7)'};
      border: 1px solid ${dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(166, 1, 18, 0.15)'};
      box-shadow: 0 16px 40px rgba(0,0,0,0.08); 
      backdrop-filter: blur(32px); -webkit-backdrop-filter: blur(32px);
      cursor: pointer; transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
      position: relative; overflow: hidden; min-height: 160px;
    }
    .glassy-cluster-card:active { transform: scale(0.95); background: ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)'}; }

    .kiosk-pulse-btn {
       animation: pulse-attention 2s infinite cubic-bezier(0.4, 0, 0.2, 1);
       background: ${dark ? 'rgba(18, 87, 172, 0.9)' : theme.cardBorder} !important;
       color: #fff !important; border: none !important;
    }

    @keyframes pulse-attention {
       0% { transform: scale(1); box-shadow: 0 0 0 0 ${dark ? 'rgba(18, 87, 172, 0.8)' : 'rgba(166, 1, 18, 0.6)'}; }
       50% { transform: scale(1.02); box-shadow: 0 0 0 25px rgba(253, 181, 28, 0); }
       100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(253, 181, 28, 0); }
    }

    @keyframes floatBg {
       0%, 100% { transform: translateY(0) scale(1); }
       50% { transform: translateY(-40px) scale(1.05); }
    }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    
    .marquee-container {
       width: 100%; overflow: hidden; white-space: nowrap; position: relative;
       padding: 12px; border-radius: 12px; border: 1px solid;
    }
    .marquee-text {
       display: inline-block;
       animation: marquee 35s linear infinite;
       font-weight: 800; font-size: 16px; letter-spacing: 2px; text-transform: uppercase;
    }
    @keyframes marquee { 0% { transform: translateX(50%); } 100% { transform: translateX(-100%); } }
    
    /* INFINITE CAROUSEL ANIMATIONS */
    .carousel-container {
       width: 100%; overflow: hidden; position: relative;
       -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
       mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
    }
    .carousel-track {
       display: flex; gap: 16px; width: max-content;
       animation: scrollCarousel 30s linear infinite;
    }
    @keyframes scrollCarousel { 0% { transform: translateX(0); } 100% { transform: translateX(calc(-50% - 8px)); } }

    .glassy-dir-card {
      background: ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)'}; border: 1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(166, 1, 18, 0.15)'};
      border-radius: 20px; padding: 24px; display: flex; align-items: center; gap: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.05); cursor: pointer; transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
      backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    }
    .glassy-dir-card:active { transform: scale(0.97); opacity: 0.9; }

    .card-arrow { width: 32px; height: 32px; border-radius: 50%; border: 2px solid; display: flex; align-items: center; justify-content: center; position: absolute; bottom: 16px; right: 16px; transition: all 0.3s ease; }
    .glassy-cluster-card:hover .card-arrow { background: ${dark ? theme.accent : theme.cardBorder}; color: ${dark ? '#1C1D55' : '#fff'} !important; }

    .back-btn-modern {
      display: flex; align-items: center; gap: 8px; background: ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)'};
      border: 1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}; color: ${theme.text}; padding: 12px 20px; border-radius: 24px; font-size: 16px; font-weight: 700; cursor: pointer; 
      transition: transform 0.1s; box-shadow: 0 8px 24px rgba(0,0,0,0.1); backdrop-filter: blur(10px);
    }
    .back-btn-modern:active { transform: scale(0.92); }

    .kiosk-detail-card {
       width: 90%; max-width: 860px; height: calc(100% - 20px); max-height: 84vh;
       background: ${dark ? 'rgba(18, 87, 172, 0.15)' : 'rgba(255,255,255,0.85)'};
       border-radius: 32px; border: 1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(166, 1, 18, 0.2)'}; display: flex; flex-direction: column; box-shadow: 0 30px 60px rgba(0,0,0,0.3);
       overflow: hidden; margin-bottom: 24px; z-index: 10; backdrop-filter: blur(32px); -webkit-backdrop-filter: blur(32px);
    }
    .kiosk-detail-card.is-pdf { height: 1050px !important; max-height: 1050px !important; min-height: 1050px !important; padding: 0 !important; flex: 0 0 1050px !important; }
    .slide-enter { animation: fadeIn 1s ease-in-out forwards; }
  `}</style>
);

const getIconForCategory = (cat: string, size = 20) => {
  if (!cat) return <LayoutGrid size={size} />;
  const lower = cat.toLowerCase();
  if (lower.includes("affair") || lower.includes("org")) return <Users size={size} />;
  if (lower.includes("curric") || lower.includes("exten") || lower.includes("major")) return <GraduationCap size={size} />;
  if (lower.includes("doc") || lower.includes("carta") || lower.includes("handbook")) return <FileText size={size} />;
  if (lower.includes("accomp") || lower.includes("indust") || lower.includes("partner")) return <Briefcase size={size} />;
  if (lower.includes("facil")) return <Building size={size} />;
  if (lower.includes("facul") || lower.includes("prof") || lower.includes("teach")) return <UserSquare size={size} />;
  return <LayoutGrid size={size} />;
};

export const KioskScreen = ({ dark, screenState, setScreenState, kioskCategory, setKioskCategory, kioskResult, setKioskResult, handleKioskSelection, topRightButtons, setFullScreenMedia, setShowCalendar, kioskMapping, screensaverSlides, kioskHighlights }: any) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfPage, setPdfPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pdfRef, setPdfRef] = useState<any>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [localFullScreen, setLocalFullScreen] = useState<string | null>(null);

  const [dbDirectoryData, setDbDirectoryData] = useState<any[]>([]);
  const [loadingDir, setLoadingDir] = useState(false);
  const [dirMajor, setDirMajor] = useState<string | null>(null);

  const [currentTime, setCurrentTime] = useState(new Date());
  
  const theme = dark ? {
    bg: '#1C1D55', card: '#1257AC', accent: '#FDB51C', text: '#ffffff', textMuted: 'rgba(255,255,255,0.7)', border: 'rgba(255,255,255,0.15)'
  } : {
    bg: '#f8fafc', card: '#ffffff', cardBorder: '#A60112', accent: '#F5AA2A', text: '#0f172a', textMuted: '#64748b', border: 'rgba(166, 1, 18, 0.2)'
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const clusterItems = [
    { label: "Faculty", alias: "Faculty & Professors", icon: <UserSquare size={36} /> },
    { label: "Accomplishment", alias: "Accomplishments", icon: <Briefcase size={36} /> },
    { label: "Student Affairs", alias: "Organizations", icon: <Users size={36} /> },
    { label: "Curriculum", alias: "Majors", icon: <GraduationCap size={36} /> },
    { label: "Extensions", alias: "Extensions", icon: <FileText size={36} /> }
  ];

  const defaultSlides = [
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80"
  ];
  
  let activeSlides = defaultSlides;
  if (screensaverSlides && screensaverSlides.length > 0) {
      activeSlides = screensaverSlides.map((s: any) => typeof s === 'string' ? s : s.img).filter(Boolean);
      if (activeSlides.length === 0) activeSlides = defaultSlides;
  }
  const [currentSlide, setCurrentSlide] = useState(0);

  const defaultHighlights = [
    { title: 'CIT Week 2026', img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=400&q=80', date: 'Sept 20-25' },
    { title: 'Tech Symposium', img: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=400&q=80', date: 'Sept 28' },
    { title: 'Automotive Expo', img: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=400&q=80', date: 'Oct 5' },
    { title: 'Innovation Fair', img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80', date: 'Oct 12' }
  ];
  const activeHighlights = (kioskHighlights && kioskHighlights.length > 0) ? kioskHighlights : defaultHighlights;
  const infiniteHighlights = [...activeHighlights, ...activeHighlights];

  useEffect(() => {
    if (screenState === 'presentation') {
      const timer = setInterval(() => setCurrentSlide(s => (s + 1) % activeSlides.length), 6000);
      return () => clearInterval(timer);
    }
  }, [screenState, activeSlides.length]);

  // Fetch Directory or Gallery items directly
  useEffect(() => {
     if (kioskResult?.isPdf) setPdfPage(1);
     if (kioskResult?.isDirectory || kioskResult?.isGallery) {
         setDirMajor(kioskResult.subcategory && kioskResult.subcategory !== 'All' ? kioskResult.subcategory : null); 
         setLoadingDir(true);
         
         fetch(`${API_URL}/knowledge`).then(res => res.json()).then(data => {
             const rawData = Array.isArray(data) ? data : [];
             const searchTitle = (kioskResult.title || "").toLowerCase();
             
             const directoryItems = rawData.filter((item: any) => {
                 const itemCat = (item.category || "").toLowerCase();
                 const itemSub = (item.subcategory || "").toLowerCase();
                 return itemCat === searchTitle || itemSub === searchTitle;
             });
             
             setDbDirectoryData(directoryItems);
           }).catch(err => console.error(err)).finally(() => setLoadingDir(false));
     }
  }, [kioskResult?.title, kioskResult?.isDirectory, kioskResult?.isGallery]);

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

  const filteredDirectory = useMemo(() => {
      return dbDirectoryData.filter(item => {
            const major = item.subcategory || "All";
            return dirMajor ? major.toLowerCase() === dirMajor.toLowerCase() : true;
        }).sort((a, b) => {
            const nameA = a.display_name || (a.keyword ? a.keyword.split(',')[0] : "") || "";
            const nameB = b.display_name || (b.keyword ? b.keyword.split(',')[0] : "") || "";
            return nameA.localeCompare(nameB);
        });
  }, [dbDirectoryData, dirMajor]);

  const subCategories = Array.from(new Set(dbDirectoryData.map((d: any) => d.subcategory))).filter(s => s && s !== 'All');

  let itemsToRender: string[] = [];
  if (clusterItems.some(c => c.label === kioskCategory)) {
     itemsToRender = kioskMapping[kioskCategory] || [];
  }

  const handleKioskSelectionInternal = async (category: string, item: string) => {
      const lowerCat = (category || '').toLowerCase();
      const isGallery = lowerCat.includes('accomp') || lowerCat.includes('exten');

      if (isGallery) {
          setScreenState("kiosk_result");
          setKioskResult({ title: item, isGallery: true, category: category });
          return;
      }
      
      if (handleKioskSelection) {
          handleKioskSelection(category, item);
      }
  };

  const goHome = () => { setScreenState("home"); setKioskCategory(null); setKioskResult(null); };

  if (screenState === "presentation") {
     return (
       <>
         <GlobalKioskStyles dark={dark} theme={theme} />
         <div className="screensaver-fullscreen presentation-mode">
            <img key={currentSlide} src={activeSlides[currentSlide]} className="slide-enter" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 300, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', zIndex: 10, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: 120, zIndex: 20 }}>
               <button onClick={goHome} className="kiosk-pulse-btn" style={{ padding: '24px 64px', borderRadius: 100, fontSize: 32, fontWeight: 900, cursor: 'pointer', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>Interact with inCITe</button>
            </div>
         </div>
       </>
     );
  }

  return (
    <>
      <GlobalKioskStyles dark={dark} theme={theme} />
      <div className="screensaver-fullscreen">
        <div className="bg-blob-1" />
        <div className="bg-blob-2" />
        
        {/* TOP INCITE BRANDING */}
        <div style={{ position: 'absolute', top: 24, left: 32, zIndex: 100, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={goHome}>
            <Bot size={40} color={dark ? "#fff" : theme.cardBorder} />
            <span style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-1px' }}><span style={{ color: theme.text }}>in</span><span style={{ color: '#1257AC' }}>CIT</span><span style={{ color: theme.text }}>e</span></span>
        </div>
        <div style={{ position: "absolute", top: 24, right: 32, zIndex: 100 }}>{topRightButtons}</div>

        {screenState === "home" && !kioskCategory && (
          <div className="kiosk-main-scroll no-scrollbar">
            
            <div className="greeting-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                 <div style={{ width: 64, height: 64, borderRadius: '50%', background: dark ? theme.accent : theme.cardBorder, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}><Bot size={36} color={dark ? '#1C1D55' : '#fff'} /></div>
                 <div style={{ display: 'flex', flexDirection: 'column' }}><h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: theme.text, letterSpacing: '-0.5px' }}>Good Day CITizen!</h1><p style={{ margin: '4px 0 0', fontSize: 13, color: theme.textMuted, fontWeight: 600 }}>{formattedDate} | {formattedTime}</p></div>
              </div>
              <button onClick={() => setShowCalendar(true)} style={{ background: theme.accent, color: dark ? '#1C1D55' : '#fff', border: 'none', padding: '14px 24px', borderRadius: 16, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }} onMouseDown={e => e.currentTarget.style.transform='scale(0.95)'} onMouseUp={e => e.currentTarget.style.transform='scale(1)'}><CalendarIcon size={18} /> View Calendar</button>
            </div>

            {/* 5-BUTTON CLUSTER GRID */}
            <div className="omantel-grid">
               {clusterItems.map((item, idx) => (
                  <div key={idx} onClick={() => setKioskCategory(item.label)} className="glassy-cluster-card" style={{ gridColumn: idx < 3 ? 'span 2' : 'span 3' }}>
                     <div style={{ color: dark ? theme.accent : theme.cardBorder, marginBottom: 12 }}>{item.icon}</div>
                     <div style={{ fontSize: 12, color: theme.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Browse</div>
                     <div style={{ fontSize: item.label.length > 12 ? 16 : 20, color: theme.text, fontWeight: 800, lineHeight: 1.2, marginTop: 4, paddingRight: 24, wordBreak: 'break-word' }}>{item.label}</div>
                     <div className="card-arrow" style={{ borderColor: dark ? theme.accent : theme.cardBorder, color: dark ? theme.accent : theme.cardBorder }}><ArrowRight size={16}/></div>
                  </div>
               ))}
            </div>

            {/* MARQUEE SANDWICH & HIGHLIGHTS OF THE MONTH */}
            <div style={{ width: '100%', maxWidth: 680, marginTop: 40, marginBottom: 20, padding: '0 16px' }}>
               
               <div className="marquee-container" style={{ background: dark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(166, 1, 18, 0.05)', borderColor: dark ? '#3b82f6' : 'rgba(166, 1, 18, 0.2)', marginBottom: 24 }}>
                  <div className="marquee-text" style={{ color: dark ? '#60a5fa' : '#A60112' }}>#ALABULSU &nbsp; • &nbsp; COMPLIANCE &nbsp; • &nbsp; INTEGRITY &nbsp; • &nbsp; TRANSPARENCY &nbsp; • &nbsp; #ALABULSU &nbsp; • &nbsp; COMPLIANCE &nbsp; • &nbsp; INTEGRITY &nbsp; • &nbsp; TRANSPARENCY &nbsp; • &nbsp;</div>
               </div>

               <h3 style={{ color: theme.text, fontSize: 20, fontWeight: 800, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 10 }}><CalendarIcon size={22} color={theme.accent} /> Highlights of the Month</h3>
               
               <div className="carousel-container" style={{ marginBottom: 24 }}>
                  <div className="carousel-track">
                     {infiniteHighlights.map((h, i) => (
                        <div key={i} style={{ minWidth: 260, height: 160, borderRadius: 20, background: theme.card, border: `1px solid ${theme.border}`, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                           <img src={h.img} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
                           <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}><div style={{ color: '#fff', fontSize: 16, fontWeight: 800 }}>{h.title}</div><div style={{ color: theme.accent, fontSize: 12, fontWeight: 700 }}>{h.date}</div></div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="marquee-container" style={{ background: dark ? 'rgba(253, 181, 28, 0.15)' : 'rgba(245, 170, 42, 0.1)', borderColor: dark ? '#FDB51C' : 'rgba(245, 170, 42, 0.3)', marginTop: 0 }}>
                  <div className="marquee-text" style={{ animationDirection: 'reverse', color: dark ? '#FDB51C' : '#F5AA2A' }}>#AMPLIFIEDCIT &nbsp; • &nbsp; COMPLIANCE &nbsp; • &nbsp; INTEGRITY &nbsp; • &nbsp; TRANSPARENCY &nbsp; • &nbsp; #AMPLIFIEDCIT &nbsp; • &nbsp; COMPLIANCE &nbsp; • &nbsp; INTEGRITY &nbsp; • &nbsp; TRANSPARENCY &nbsp; • &nbsp;</div>
               </div>
            </div>

            {/* INTEGRATED NATURAL SCROLL FLOW BANNER */}
            <div style={{ width: '100%', maxWidth: 680, padding: '0 16px', marginTop: 12, marginBottom: 40 }}>
               <div className="glassy-cluster-card kiosk-pulse-btn" onClick={() => { setScreenState("chat"); setKioskCategory(null); setKioskResult(null); }} style={{ margin: 0, padding: 32, minHeight: 180, display: 'flex', justifyContent: 'center', border: 'none' }}>
                  <div style={{ fontSize: 16, opacity: 0.9, fontWeight: 700, marginBottom: 4 }}>Interactive AI Assistant</div>
                  <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 20 }}>Talk with ChatCIT</div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                     <span style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: 24, fontSize: 15, fontWeight: 700 }}><MessageSquare size={18}/> Ask anything</span>
                     <span style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: 24, fontSize: 15, fontWeight: 700 }}><Search size={18}/> Search records</span>
                  </div>
                  <Bot size={160} style={{ position: 'absolute', right: -10, bottom: -20, opacity: 0.15 }} />
               </div>
            </div>
          </div>
        )}

        {/* SUB-MENU DIRECTORY LISTING MAPS */}
        {screenState === "home" && kioskCategory && (
            <div className="kiosk-main-scroll no-scrollbar">
              <div style={{ width: '100%', maxWidth: 720, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}><button onClick={goHome} className="back-btn-modern"><ArrowLeft size={20}/> Back</button><h2 style={{ fontSize: 32, fontWeight: 800, color: theme.text, margin: 0, textShadow: dark ? '0 4px 12px rgba(0,0,0,0.3)' : 'none' }}>{kioskCategory}</h2></div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, width: '100%', maxWidth: 720 }}>
                {itemsToRender.map((item, idx) => (
                  <div key={idx} className="glassy-dir-card" onClick={() => handleKioskSelectionInternal(kioskCategory, item)}>
                    <div style={{ color: dark ? theme.accent : theme.cardBorder, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{getIconForCategory(item, 32)}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: theme.text, lineHeight: 1.4, wordBreak: 'break-word', textAlign: 'left', display: 'flex', alignItems: 'center' }}>{item.replace('Teachers', 'Professors')}</div>
                    <div className="card-arrow" style={{ width: 32, height: 32, position: 'absolute', right: 24, bottom: 24, flexShrink: 0, borderColor: dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)', color: theme.textMuted }}><ArrowRight size={16}/></div>
                  </div>
                ))}
              </div>
              {itemsToRender.length === 0 && <div style={{ color: theme.textMuted, fontSize: 18, fontWeight: 600, marginTop: 60, zIndex: 10 }}>No categories mapped. Admin must add them via Dashboard!</div>}
            </div>
        )}

        {/* DETAILED RESULTS, GALLERY & FACULTY DIRECTORY */}
        {screenState === "kiosk_result" && (
          <div className="kiosk-main-scroll no-scrollbar" style={{ paddingTop: 90, paddingBottom: 40 }}>
            <div className={`kiosk-detail-card ${kioskResult?.isPdf ? 'is-pdf' : ''}`}>
              {kioskResult?.isPdf ? (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 32px', background: dark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.8)', borderBottom: `1px solid ${theme.border}`, zIndex: 20, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}><button onClick={() => { setKioskResult(null); setScreenState("home"); }} style={{ background: "transparent", border: "none", color: theme.text, cursor: "pointer", display: "flex", alignItems: "center" }}><ArrowLeft size={28} /></button><h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: theme.text, textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{kioskResult.title}</h2></div>
                  </div>
                  <div className="no-scrollbar" style={{ flex: 1, minHeight: 0, width: '100%', position: 'relative', background: '#323639', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px', overflow: 'auto', touchAction: 'pan-y' }}>
                     {pdfLoading && (<div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}><div style={{ position: "relative", width: 60, height: 60, display: "flex", justifyContent: "center", alignItems: "center" }}><div style={{ position: "absolute", transform: 'scale(0.5)' }}><GearboxLoader /></div></div></div>)}
                     <canvas ref={canvasRef} style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain', display: 'block', opacity: pdfLoading ? 0.3 : 1, transition: 'opacity 0.3s', background: '#fff', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} />
                     {pdfRef && (<button onClick={() => { if (canvasRef.current) { setLocalFullScreen(canvasRef.current.toDataURL('image/png')); } }} style={{ position: 'absolute', bottom: 24, right: 24, zIndex: 20, background: theme.accent, color: dark ? '#1C1D55' : '#fff', border: 'none', borderRadius: '50%', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.1s', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }} onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.92)'} onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}><Maximize size={28} /></button>)}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, padding: '20px 32px', background: dark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.8)', borderTop: `1px solid ${theme.border}`, zIndex: 20, flexShrink: 0 }}>
                    <button onClick={() => setPdfPage((p: number) => Math.max(1, p - 5))} className="back-btn-modern" disabled={pdfPage <= 1} style={{ padding: '8px 16px' }}>-5</button>
                    <button onClick={() => setPdfPage((p: number) => Math.max(1, p - 1))} className="back-btn-modern" disabled={pdfPage <= 1} style={{ padding: '8px 16px' }}><ChevronLeft size={16}/></button>
                    <span style={{ fontSize: 18, fontWeight: 800, color: theme.text, whiteSpace: 'nowrap', margin: '0 16px' }}>Page {pdfPage} of {totalPages}</span>
                    <button onClick={() => setPdfPage((p: number) => Math.min(totalPages, p + 1))} className="back-btn-modern" disabled={pdfPage >= totalPages} style={{ padding: '8px 16px' }}><ChevronRight size={16}/></button>
                    <button onClick={() => setPdfPage((p: number) => Math.min(totalPages, p + 5))} className="back-btn-modern" disabled={pdfPage >= totalPages} style={{ padding: '8px 16px' }}>+5</button>
                  </div>
                </div>
              ) : kioskResult?.isGallery ? (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 16, padding: '32px 40px 16px 40px', flexShrink: 0 }}>
                    <button onClick={() => { setKioskResult(null); setScreenState("home"); }} className="back-btn-modern" style={{ background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}><ArrowLeft size={20}/> Back</button>
                    <h2 style={{ fontSize: 32, fontWeight: 800, color: theme.text, margin: 0 }}>{kioskResult?.title.replace('Teachers', 'Professors')} Gallery</h2>
                  </div>
                  {/* SMOOTH SCROLLABLE GALLERY - NO PAGINATION BUTTONS */}
                  <div className="no-scrollbar" style={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', touchAction: 'pan-y', padding: '24px 40px 48px' }}>
                     {loadingDir ? ( <div style={{ display: 'flex', height: 300, alignItems: 'center', justifyContent: 'center' }}><div style={{ transform: 'scale(0.8)' }}><GearboxLoader /></div></div>
                     ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24, width: '100%' }}>
                           {filteredDirectory.length > 0 ? filteredDirectory.map((item) => (
                              <div key={item.id} className="glassy-dir-card" style={{ padding: 16, flexDirection: 'column', alignItems: 'flex-start', cursor: item.picture_url && !item.picture_url.toLowerCase().includes('.pdf') ? 'zoom-in' : 'default' }} onClick={() => { if (item.picture_url && !item.picture_url.toLowerCase().includes('.pdf')) setFullScreenMedia(item.picture_url); else if (item.picture_url && item.picture_url.toLowerCase().includes('.pdf')) window.open(item.picture_url, '_blank'); }}>
                                 <div style={{ width: '100%', height: 220, borderRadius: 12, background: dark ? 'rgba(0,0,0,0.3)' : '#fff', border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', marginBottom: 12 }}>
                                    {item.picture_url && !item.picture_url.toLowerCase().includes('.pdf') ? (<img src={item.picture_url} alt="Gallery" style={{ width: "100%", height: "100%", objectFit: "cover" }} />) : <span style={{ color: dark ? theme.accent : theme.cardBorder }}><FileText size={40} /></span>}
                                 </div>
                                 <span style={{ fontSize: 18, fontWeight: 800, color: theme.text, lineHeight: 1.3 }}>{item.display_name || (item.keyword ? item.keyword.split(',')[0] : "")}</span>
                                 {item.response && <span style={{ fontSize: 14, color: theme.textMuted, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.5, marginTop: 4 }}>{item.response}</span>}
                              </div>
                           )) : (<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: theme.textMuted, fontWeight: 600, padding: 40, gridColumn: '1 / -1' }}>No images found in this gallery.</div>)}
                        </div>
                     )}
                  </div>
                </div>
              ) : kioskResult?.isDirectory ? (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 16, padding: '32px 40px 16px 40px', flexShrink: 0 }}>
                    <button onClick={() => { setKioskResult(null); setScreenState("home"); }} className="back-btn-modern" style={{ background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}><ArrowLeft size={20}/> Back</button>
                    <h2 style={{ fontSize: 32, fontWeight: 800, color: theme.text, margin: 0 }}>{kioskResult?.title.replace('Teachers', 'Professors')}</h2>
                  </div>
                  {/* SMOOTH SCROLLABLE FACULTY DIRECTORY - NO NEXT/PREV BUTTONS */}
                  <div className="no-scrollbar" style={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', touchAction: 'pan-y', padding: '20px 40px 48px', display: 'flex', flexDirection: 'column' }}>
                     {!dirMajor && subCategories.length > 0 ? (
                        <>
                          <div style={{ fontSize: 22, fontWeight: 700, color: theme.textMuted, marginBottom: 24, textAlign: 'center' }}>Select a Folder to view {kioskResult.title.replace('Teachers', 'Professors')}</div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 16 }}>
                             {subCategories.map((m, idx) => (
                               <button key={idx} className="glassy-dir-card" style={{ justifyContent: 'center', padding: '28px', border: 'none', background: dark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)' }} onClick={() => { setDirMajor(m as string); }}>
                                 <span style={{ color: dark ? theme.accent : theme.cardBorder }}>{getIconForCategory(kioskResult.title, 32)}</span><span style={{ fontSize: 22, fontWeight: 800, color: theme.text }}>{m as string}</span>
                               </button>
                             ))}
                          </div>
                        </>
                     ) : (
                        loadingDir ? ( <div style={{ display: 'flex', height: 300, alignItems: 'center', justifyContent: 'center' }}><div style={{ transform: 'scale(0.8)' }}><GearboxLoader /></div></div>
                        ) : (
                           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 16, width: '100%' }}>
                              {filteredDirectory.length > 0 ? filteredDirectory.map((item) => (
                                 <div key={item.id} className="glassy-dir-card" style={{ padding: 24 }} onClick={() => handleKioskSelection(kioskResult.category || kioskResult.title, item.display_name || (item.keyword ? item.keyword.split(',')[0] : ""))}>
                                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: dark ? 'rgba(0,0,0,0.3)' : '#fff', border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                                       {item.picture_url && !item.picture_url.toLowerCase().includes('.pdf') ? (<img src={item.picture_url} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />) : <span style={{ color: dark ? theme.accent : theme.cardBorder }}>{getIconForCategory(kioskResult.title, 40)}</span>}
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start', textAlign: 'left' }}>
                                       <span style={{ fontSize: 22, fontWeight: 800, color: theme.text }}>{item.display_name || (item.keyword ? item.keyword.split(',')[0] : "")}</span>
                                       {item.subcategory && item.subcategory !== "All" && (<span style={{ fontSize: 16, fontWeight: 700, color: dark ? theme.accent : theme.cardBorder }}>{item.subcategory}</span>)}
                                       <span style={{ fontSize: 15, color: theme.textMuted, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.5 }}>{item.response}</span>
                                    </div>
                                    <ChevronRight size={28} color={theme.textMuted} style={{ flexShrink: 0 }} />
                                 </div>
                              )) : (<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: theme.textMuted, fontWeight: 600, padding: 40 }}>No records found.</div>)}
                           </div>
                        )
                     )}
                  </div>
                </div>
              ) : (
                <div className="no-scrollbar" style={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', touchAction: 'pan-y', padding: '48px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 40 }}>
                    <button onClick={() => { setKioskResult(null); setScreenState("home"); }} style={{ background: "transparent", border: "none", color: theme.text, cursor: "pointer", display: "flex", alignItems: "center", marginTop: 4 }}><ArrowLeft size={32} /></button>
                    <h2 style={{ fontSize: 36, fontWeight: 800, margin: 0, color: theme.text, textTransform: 'uppercase', lineHeight: 1.2 }}>{kioskResult?.title}</h2>
                  </div>
                  {kioskResult?.loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 20, marginTop: 60 }}><Bot color={theme.accent} size={80} className="animate-pulse" /><span style={{ fontSize: 26, color: theme.textMuted, fontWeight: 700 }}>inCITe is fetching details...</span></div>
                  ) : (
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {kioskResult?.image && (<div style={{ background: '#fff', borderRadius: 32, padding: 24, marginBottom: 40, boxShadow: '0 12px 32px rgba(0,0,0,0.2)' }}><img src={kioskResult.image} alt={`${kioskResult.title} Logo`} style={{ width: 240, height: 240, objectFit: 'contain' }} /></div>)}
                      <div style={{ fontSize: 20, lineHeight: 1.7, color: theme.text, width: '100%', whiteSpace: 'pre-wrap', paddingBottom: 20, fontWeight: 500 }}>{formatText(kioskResult?.content)}</div>
                      
                      {(() => {
                         const urlMatch = kioskResult?.content?.match(/(https?:\/\/[^\s]+[^.,;:"'\s])/);
                         if (urlMatch) {
                             return (
                                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 20, padding: '32px 48px', background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', borderRadius: 24, border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, boxShadow: '0 12px 40px rgba(0,0,0,0.1)' }}>
                                     <span style={{ fontSize: 18, fontWeight: 800, color: theme.textMuted, marginBottom: 20, textTransform: 'uppercase', letterSpacing: '1px' }}>Scan for more info</span>
                                     <div style={{ background: '#fff', padding: 12, borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                                         <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(urlMatch[0])}`} alt="QR Code" style={{ display: 'block', borderRadius: 8 }} />
                                     </div>
                                 </div>
                             )
                         }
                         return null;
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
