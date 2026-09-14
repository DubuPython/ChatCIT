import React, { useRef, useState, useEffect } from "react";
import { Zap, Users, GraduationCap, FileText, ChevronLeft, ChevronRight, MessageSquare, Bot, Maximize, Search, UserSquare, Building, Briefcase, ArrowRight, ArrowLeft, Calendar as CalendarIcon, X, Folder, LayoutGrid } from "lucide-react";
import { GearboxLoader } from "./ui/helpers";

const GlobalKioskStyles = ({ dark, theme }: { dark: boolean, theme: any }) => (
  <style>{`
    .theme-toggle-wrapper input[type="checkbox"] { display: none !important; opacity: 0 !important; width: 0px !important; height: 0px !important; position: absolute; z-index: -100; }
    
    .screensaver-fullscreen {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 999995;
      background: ${theme.bg};
      display: flex; flex-direction: column; align-items: center;
      animation: fadeIn 0.4s ease; border-radius: inherit; overflow: hidden;
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
      position: relative; z-index: 10; width: 100%; height: 100%;
      display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
      padding-top: 100px; overflow-y: auto; overflow-x: hidden; padding-bottom: 220px;
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
      display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;
      width: 100%; max-width: 680px; padding: 0 16px; flex-shrink: 0;
      animation: slideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) both;
    }
    
    .glassy-cluster-card {
      border-radius: 28px; padding: 32px 24px; display: flex; flex-direction: column;
      background: ${dark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.6)'};
      border: 1px solid ${dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(166, 1, 18, 0.15)'};
      box-shadow: 0 10px 40px rgba(0,0,0,0.05); 
      backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
      cursor: pointer; transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
      position: relative; overflow: hidden; min-height: 180px;
    }
    .glassy-cluster-card:hover { transform: translateY(-4px); background: ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)'}; }
    .glassy-cluster-card:active { transform: scale(0.96); }

    .kiosk-pulse-btn {
       animation: pulse-attention 3s infinite cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes pulse-attention {
       0% { transform: scale(1); box-shadow: 0 0 0 0 ${dark ? 'rgba(18, 87, 172, 0.6)' : 'rgba(166, 1, 18, 0.5)'}; }
       50% { transform: scale(1.02); box-shadow: 0 0 0 30px rgba(253, 181, 28, 0); }
       100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(253, 181, 28, 0); }
    }

    @keyframes floatBg {
       0%, 100% { transform: translateY(0) scale(1); }
       50% { transform: translateY(-40px) scale(1.05); }
    }
    @keyframes slideDown {
       from { opacity: 0; transform: translateY(-30px); }
       to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideUp {
       from { opacity: 0; transform: translateY(30px); }
       to { opacity: 1; transform: translateY(0); }
    }

    .marquee-container {
       width: 100%; overflow: hidden; white-space: nowrap; position: relative;
       background: ${dark ? 'rgba(18, 87, 172, 0.2)' : 'rgba(166, 1, 18, 0.05)'};
       padding: 12px; border-radius: 12px; margin-top: -30px;
       border: 1px solid ${dark ? 'rgba(253, 181, 28, 0.3)' : 'rgba(166, 1, 18, 0.2)'};
       z-index: 1;
    }
    
    .marquee-text {
       display: inline-block;
       animation: marquee 20s linear infinite;
       font-weight: 800; font-size: 16px; color: ${theme.accent};
       letter-spacing: 2px; text-transform: uppercase;
    }

    @keyframes marquee {
       0% { transform: translateX(50%); }
       100% { transform: translateX(-100%); }
    }

    .glassy-dir-card {
      background: ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)'};
      border: 1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(166, 1, 18, 0.15)'};
      border-radius: 20px; padding: 24px; display: flex; align-items: center; gap: 20px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.05); cursor: pointer; transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
      backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    }
    .glassy-dir-card:active { transform: scale(0.97); opacity: 0.9; }

    .card-arrow { 
      width: 36px; height: 36px; 
      border-radius: 50%; border: 2px solid; 
      display: flex; align-items: center; justify-content: center; 
      position: absolute; bottom: 24px; right: 24px; transition: all 0.3s ease;
    }
    .glassy-cluster-card:hover .card-arrow {
       background: ${dark ? theme.accent : theme.cardBorder};
       color: ${dark ? '#1C1D55' : '#fff'} !important;
    }

    .back-btn-modern {
      display: flex; align-items: center; gap: 8px; 
      background: ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)'};
      border: 1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}; color: ${theme.text};
      padding: 12px 20px; border-radius: 24px; font-size: 16px; font-weight: 700; cursor: pointer; 
      transition: transform 0.1s; box-shadow: 0 8px 24px rgba(0,0,0,0.1); backdrop-filter: blur(12px);
    }
    .back-btn-modern:active { transform: scale(0.92); }

    .kiosk-detail-card {
       width: 90%; max-width: 860px; flex: 1 1 auto; min-height: 800px; max-height: 85vh;
       background: ${dark ? 'rgba(18, 87, 172, 0.15)' : 'rgba(255,255,255,0.85)'};
       border-radius: 32px; border: 1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(166, 1, 18, 0.2)'};
       display: flex; flex-direction: column; box-shadow: 0 30px 60px rgba(0,0,0,0.3);
       overflow: hidden; margin-bottom: 24px; z-index: 10; backdrop-filter: blur(32px); -webkit-backdrop-filter: blur(32px);
    }
    .kiosk-detail-card.is-pdf {
       height: 1050px !important; max-height: 1050px !important; min-height: 1050px !important; 
       padding: 0 !important; flex: 0 0 1050px !important; 
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
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

export const KioskScreen = ({ dark, screenState, setScreenState, kioskCategory, setKioskCategory, kioskResult, setKioskResult, handleKioskSelection, topRightButtons, setFullScreenMedia, setShowCalendar, kioskMapping }: any) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfPage, setPdfPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pdfRef, setPdfRef] = useState<any>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [localFullScreen, setLocalFullScreen] = useState<string | null>(null);

  const [dbDirectoryData, setDbDirectoryData] = useState<any[]>([]);
  const [loadingDir, setLoadingDir] = useState(false);
  const [dirMajor, setDirMajor] = useState<string | null>(null);
  const [dirPage, setDirPage] = useState(1);
  const ITEMS_PER_PAGE = 8; 

  const [currentTime, setCurrentTime] = useState(new Date());

  // 60-30-10 Palette Implementation
  const theme = dark ? {
    bg: '#1C1D55',        // 60% Background (Dark Blue)
    card: '#1257AC',      // 30% Secondary Elements
    accent: '#FDB51C',    // 10% Highlights (Yellow)
    text: '#ffffff',
    textMuted: 'rgba(255,255,255,0.7)',
    border: 'rgba(255,255,255,0.15)'
  } : {
    bg: '#f8fafc',        // 60% Neutral Background
    card: '#ffffff',      // Secondary surface
    cardBorder: '#A60112',// 30% Primary ALAB Red
    accent: '#F5AA2A',    // 10% Yellow Accent
    text: '#0f172a',
    textMuted: '#64748b',
    border: 'rgba(166, 1, 18, 0.2)'
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // THE 4 MAIN KIOSK CLUSTERS
  const clusterItems = [
    { label: "Faculty", icon: <UserSquare size={36} /> },
    { label: "Accomplishment", icon: <Briefcase size={36} /> },
    { label: "Student Affairs", icon: <Users size={36} /> },
    { label: "Curriculum and Extensions", icon: <FileText size={36} /> }
  ];

  useEffect(() => {
     if (kioskResult?.isPdf) setPdfPage(1);
     if (kioskResult?.isDirectory) {
         setDirMajor(kioskResult.subcategory && kioskResult.subcategory !== 'All' ? kioskResult.subcategory : null); 
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
            const major = item.subcategory || "All";
            const matchesMajor = dirMajor ? major.toLowerCase() === dirMajor.toLowerCase() : true;
            return matchesMajor;
        }).sort((a, b) => {
            const nameA = a.display_name || (a.keyword ? a.keyword.split(',')[0] : "") || "";
            const nameB = b.display_name || (b.keyword ? b.keyword.split(',')[0] : "") || "";
            return nameA.localeCompare(nameB);
        });
  }, [dbDirectoryData, dirMajor]);

  const totalDirPages = Math.ceil(filteredDirectory.length / ITEMS_PER_PAGE) || 1;
  const currentDirData = filteredDirectory.slice((dirPage - 1) * ITEMS_PER_PAGE, dirPage * ITEMS_PER_PAGE);
  const subCategories = Array.from(new Set(dbDirectoryData.map((d: any) => d.subcategory))).filter(s => s && s !== 'All');

  // RESOLVE ITEMS TO RENDER FOR THE CURRENT SUB-MENU FROM ADMIN MAPPING
  let itemsToRender: string[] = [];
  const isClusterCategory = clusterItems.some(c => c.label === kioskCategory);
  if (isClusterCategory) {
     itemsToRender = kioskMapping[kioskCategory] || [];
  }

  const goHome = () => {
    setScreenState("screensaver");
    setKioskCategory(null);
    setKioskResult(null);
  };

  return (
    <>
      <GlobalKioskStyles dark={dark} theme={theme} />
      <div className="screensaver-fullscreen">
        <div className="bg-blob-1" />
        <div className="bg-blob-2" />
        
        {/* TOP INCITE BRANDING */}
        <div style={{ position: 'absolute', top: 24, left: 32, zIndex: 100, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={goHome}>
            <Bot size={36} color={dark ? "#fff" : theme.cardBorder} />
            <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-1px' }}>
                <span style={{ color: theme.text }}>in</span>
                <span style={{ color: '#1257AC' }}>CIT</span>
                <span style={{ color: theme.text }}>e</span>
            </span>
        </div>
        <div style={{ position: "absolute", top: 24, right: 32, zIndex: 100 }}>{topRightButtons}</div>

        {screenState === "screensaver" && !kioskCategory && (
          <div className="kiosk-main-scroll no-scrollbar">
            
            {/* GREETING CARD */}
            <div className="greeting-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                 <div style={{ width: 64, height: 64, borderRadius: '50%', background: dark ? theme.accent : theme.cardBorder, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                   <Bot size={36} color={dark ? '#1C1D55' : '#fff'} />
                 </div>
                 <div style={{ display: 'flex', flexDirection: 'column' }}>
                   <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: theme.text, letterSpacing: '-0.5px' }}>Good Day CITizen!</h1>
                   <p style={{ margin: '4px 0 0', fontSize: 13, color: theme.textMuted, fontWeight: 600 }}>{formattedDate} | {formattedTime}</p>
                 </div>
              </div>
              <button onClick={() => setShowCalendar(true)} style={{ background: theme.accent, color: dark ? '#1C1D55' : '#fff', border: 'none', padding: '14px 24px', borderRadius: 16, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', transition: 'transform 0.1s' }} onMouseDown={e => e.currentTarget.style.transform='scale(0.95)'} onMouseUp={e => e.currentTarget.style.transform='scale(1)'}>
                <CalendarIcon size={18} /> View Calendar
              </button>
            </div>

            {/* CLUSTER BUTTONS */}
            <div className="omantel-grid">
               {clusterItems.map((item, idx) => (
                  <div key={idx} onClick={() => setKioskCategory(item.label)} className="glassy-cluster-card">
                     <div style={{ color: dark ? theme.accent : theme.cardBorder, marginBottom: 12 }}>{item.icon}</div>
                     <div style={{ fontSize: 13, color: theme.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Browse</div>
                     <div style={{ fontSize: 24, color: theme.text, fontWeight: 800, lineHeight: 1.2, marginTop: 4 }}>{item.label}</div>
                     <div className="card-arrow" style={{ borderColor: dark ? theme.accent : theme.cardBorder, color: dark ? theme.accent : theme.cardBorder }}><ArrowRight size={16}/></div>
                  </div>
               ))}
            </div>

            {/* MARQUEE & CENTER LOGO */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '48px 0', width: '100%', maxWidth: 680, position: 'relative' }}>
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: '50%', width: 120, height: 120, boxShadow: '0 10px 30px rgba(0,0,0,0.2)', zIndex: 2 }}>
                  <img src="/cit-logo.png" alt="CIT" style={{ width: '80%', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = `<span style="color:#A60112; font-weight:900; font-size:40px;">CIT</span>`; }} />
               </div>
               <div className="marquee-container">
                  <div className="marquee-text">
                     #AMPLIFIEDCIT &nbsp; • &nbsp; COMPLIANCE &nbsp; • &nbsp; INTEGRITY &nbsp; • &nbsp; TRANSPARENCY &nbsp; • &nbsp; ALAB BULSU &nbsp; • &nbsp; #AMPLIFIEDCIT &nbsp; • &nbsp; COMPLIANCE &nbsp; • &nbsp; INTEGRITY &nbsp; • &nbsp; TRANSPARENCY &nbsp; • &nbsp; ALAB BULSU &nbsp; • &nbsp; 
                  </div>
               </div>
            </div>

            {/* BOTTOM AI BUTTON */}
            <div style={{ width: '100%', padding: '0 24px', position: 'absolute', bottom: 32, maxWidth: 680 }}>
               <div className="glassy-cluster-card kiosk-pulse-btn" onClick={() => { setScreenState("chat"); setKioskCategory(null); setKioskResult(null); }} style={{ background: dark ? 'rgba(18, 87, 172, 0.85)' : theme.cardBorder, color: '#fff', margin: 0, padding: 32, minHeight: 180, display: 'flex', justifyContent: 'center', border: 'none' }}>
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
        {screenState === "screensaver" && kioskCategory && (
            <div className="kiosk-main-scroll no-scrollbar">
              <div style={{ width: '100%', maxWidth: 720, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                   <button onClick={goHome} className="back-btn-modern"><ArrowLeft size={20}/> Back</button>
                   <h2 style={{ fontSize: 32, fontWeight: 800, color: theme.text, margin: 0, textShadow: dark ? '0 4px 12px rgba(0,0,0,0.3)' : 'none' }}>{kioskCategory}</h2>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, width: '100%', maxWidth: 720 }}>
                {itemsToRender.map((item, idx) => (
                  <div key={idx} className="glassy-dir-card" onClick={() => handleKioskSelection(kioskCategory, item)}>
                    <div style={{ color: dark ? theme.accent : theme.cardBorder, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                       {getIconForCategory(item, 32)}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: theme.text, lineHeight: 1.4, wordBreak: 'break-word', textAlign: 'left', display: 'flex', alignItems: 'center' }}>
                       {item.replace('Teachers', 'Professors')}
                    </div>
                    <div className="card-arrow" style={{ width: 32, height: 32, position: 'absolute', right: 24, bottom: 24, flexShrink: 0, borderColor: dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)', color: theme.textMuted }}><ArrowRight size={16}/></div>
                  </div>
                ))}
              </div>

              {itemsToRender.length === 0 && <div style={{ color: theme.textMuted, fontSize: 18, fontWeight: 600, marginTop: 60, zIndex: 10 }}>No categories mapped. Admin must add them via Dashboard!</div>}
            </div>
        )}

        {/* DETAILED RESULTS & DIRECTORY MODALS */}
        {screenState === "kiosk_result" && (
          <div className="kiosk-main-scroll no-scrollbar" style={{ paddingBottom: 40, paddingTop: 100 }}>
            <div className={`kiosk-detail-card ${kioskResult?.isPdf ? 'is-pdf' : ''}`}>
              
              {kioskResult?.isPdf ? (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 32px', background: dark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.8)', borderBottom: `1px solid ${theme.border}`, zIndex: 20, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                       <button onClick={() => { setKioskResult(null); setScreenState("screensaver"); }} style={{ background: "transparent", border: "none", color: theme.text, cursor: "pointer", display: "flex", alignItems: "center" }}><ArrowLeft size={28} /></button>
                       <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: theme.text, textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{kioskResult.title}</h2>
                    </div>
                  </div>
                  
                  <div className="no-scrollbar" style={{ flex: 1, width: '100%', position: 'relative', background: '#323639', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px', overflow: 'auto' }}>
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

              ) : kioskResult?.isDirectory ? (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 16, padding: '40px 40px 0 40px', flexShrink: 0 }}>
                    <button onClick={() => { setKioskResult(null); setScreenState("screensaver"); }} className="back-btn-modern"><ArrowLeft size={20}/> Back</button>
                    <h2 style={{ fontSize: 32, fontWeight: 800, color: theme.text, margin: 0 }}>{kioskResult?.title.replace('Teachers', 'Professors')}</h2>
                  </div>

                  <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '40px', display: 'flex', flexDirection: 'column' }}>
                     {!dirMajor && subCategories.length > 0 ? (
                        <>
                          <div style={{ fontSize: 22, fontWeight: 700, color: theme.textMuted, marginBottom: 24, textAlign: 'center' }}>Select a Folder to view {kioskResult.title.replace('Teachers', 'Professors')}</div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 16 }}>
                             {subCategories.map((m, idx) => (
                               <button key={idx} className="glassy-dir-card" style={{ justifyContent: 'center', padding: '28px', border: 'none', background: dark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)' }} onClick={() => { setDirMajor(m as string); setDirPage(1); }}>
                                 <span style={{ color: dark ? theme.accent : theme.cardBorder }}>{getIconForCategory(kioskResult.title, 32)}</span>
                                 <span style={{ fontSize: 22, fontWeight: 800, color: theme.text }}>{m as string}</span>
                               </button>
                             ))}
                          </div>
                        </>
                     ) : (
                        loadingDir ? (
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ transform: 'scale(0.8)' }}><GearboxLoader /></div></div>
                        ) : (
                           <>
                             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 16, width: '100%' }}>
                                {currentDirData.length > 0 ? currentDirData.map((item) => (
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
                                )) : (
                                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: theme.textMuted, fontWeight: 600, padding: 40 }}>No records found.</div>
                                )}
                             </div>
                             
                             {totalDirPages > 1 && (
                               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: 32, padding: '16px 24px', background: dark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.8)', borderRadius: 24, border: `1px solid ${theme.border}` }}>
                                  <button onClick={() => setDirPage(p => Math.max(1, p - 1))} disabled={dirPage <= 1} style={{ padding: '12px 24px', borderRadius: 16, border: 'none', background: theme.accent, color: dark ? '#1C1D55' : '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer', opacity: dirPage <= 1 ? 0.3 : 1, transition: 'transform 0.1s' }} onMouseDown={e => e.currentTarget.style.transform='scale(0.95)'} onMouseUp={e => e.currentTarget.style.transform='scale(1)'}>Previous</button>
                                  <span style={{ fontSize: 18, fontWeight: 800, color: theme.text }}>Page {dirPage} of {totalDirPages}</span>
                                  <button onClick={() => setDirPage(p => Math.min(totalDirPages, p + 1))} disabled={dirPage >= totalDirPages} style={{ padding: '12px 24px', borderRadius: 16, border: 'none', background: theme.accent, color: dark ? '#1C1D55' : '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer', opacity: dirPage >= totalDirPages ? 0.3 : 1, transition: 'transform 0.1s' }} onMouseDown={e => e.currentTarget.style.transform='scale(0.95)'} onMouseUp={e => e.currentTarget.style.transform='scale(1)'}>Next</button>
                               </div>
                             )}
                           </>
                        )
                     )}
                  </div>
                </div>

              ) : (
                <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '48px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 40 }}>
                    <button onClick={() => { setKioskResult(null); setScreenState("screensaver"); }} style={{ background: "transparent", border: "none", color: theme.text, cursor: "pointer", display: "flex", alignItems: "center", marginTop: 4 }}><ArrowLeft size={32} /></button>
                    <h2 style={{ fontSize: 36, fontWeight: 800, margin: 0, color: theme.text, textTransform: 'uppercase', lineHeight: 1.2 }}>{kioskResult?.title}</h2>
                  </div>

                  {kioskResult?.loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 20, marginTop: 60 }}>
                      <Bot color={theme.accent} size={80} className="animate-pulse" />
                      <span style={{ fontSize: 26, color: theme.textMuted, fontWeight: 700 }}>inCITe is fetching details...</span>
                    </div>
                  ) : (
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {kioskResult?.image && (<div style={{ background: '#fff', borderRadius: 32, padding: 24, marginBottom: 40, boxShadow: '0 12px 32px rgba(0,0,0,0.2)' }}><img src={kioskResult.image} alt={`${kioskResult.title} Logo`} style={{ width: 240, height: 240, objectFit: 'contain' }} /></div>)}
                      <div style={{ fontSize: 20, lineHeight: 1.7, color: theme.text, width: '100%', whiteSpace: 'pre-wrap', paddingBottom: 40, fontWeight: 500 }}>{formatText(kioskResult?.content)}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {localFullScreen && (
        <div onClick={() => setLocalFullScreen(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999999, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', padding: 24 }}>
          <img src={localFullScreen} alt="Fullscreen View" onClick={(e) => { e.stopPropagation(); setLocalFullScreen(null); }} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 8, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', cursor: 'zoom-out' }} />
          <button onClick={() => setLocalFullScreen(null)} style={{ position: 'absolute', top: 24, right: 24, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}><X size={24} /></button>
        </div>
      )}
    </>
  );
};
