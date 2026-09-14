import React, { useRef, useState, useEffect } from "react";
import { Zap, Users, GraduationCap, FileText, ChevronLeft, ChevronRight, MessageSquare, Bot, Maximize, Search, UserSquare, Building, Briefcase, ArrowRight, ArrowLeft, Calendar as CalendarIcon, X, Folder, Trash2, Plus } from "lucide-react";
import { API_URL } from "../config";
import { GearboxLoader } from "./ui/helpers";

const GlobalKioskStyles = ({ dark, theme }: { dark: boolean, theme: any }) => (
  <style>{`
    .theme-toggle-wrapper input[type="checkbox"] { display: none !important; opacity: 0 !important; width: 0px !important; height: 0px !important; position: absolute; z-index: -100; }
    
    .screensaver-fullscreen {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 999995;
      background: ${theme.bg};
      display: flex; flex-direction: column; align-items: center;
      animation: fadeIn 0.3s ease; border-radius: inherit; overflow: hidden;
    }

    .bg-blob-1 {
      position: absolute; top: -10%; left: -10%; width: 50vw; height: 50vw;
      background: ${dark ? 'radial-gradient(circle, rgba(18, 87, 172, 0.4) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(166, 1, 18, 0.15) 0%, transparent 70%)'};
      border-radius: 50%; z-index: 0; filter: blur(60px); pointer-events: none;
      animation: floatBg 15s ease-in-out infinite;
    }

    .bg-blob-2 {
      position: absolute; bottom: 20%; right: -10%; width: 60vw; height: 60vw;
      background: ${dark ? 'radial-gradient(circle, rgba(253, 181, 28, 0.15) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(245, 170, 42, 0.15) 0%, transparent 70%)'};
      border-radius: 50%; z-index: 0; filter: blur(80px); pointer-events: none;
      animation: floatBg 20s ease-in-out infinite reverse;
    }

    .kiosk-main-scroll {
      position: relative; z-index: 10; width: 100%; height: 100%;
      display: flex; flex-direction: column; align-items: center;
      padding-top: 80px; overflow-y: auto; overflow-x: hidden; padding-bottom: 220px;
    }
    
    .greeting-box {
      display: flex; align-items: center; gap: 16px; margin-bottom: 24px;
      padding: 24px 32px; border-radius: 32px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.15);
      backdrop-filter: blur(20px); 
      width: 90%; max-width: 640px; flex-shrink: 0;
    }

    .omantel-grid {
      display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;
      width: 100%; max-width: 640px; padding: 0 16px; flex-shrink: 0;
    }
    
    .omantel-card {
      border-radius: 20px; padding: 24px; display: flex; flex-direction: column;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1); 
      cursor: pointer; transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
      position: relative; overflow: hidden; 
      backdrop-filter: blur(10px);
      min-height: 140px;
    }
    .omantel-card:active { transform: scale(0.96); }
    
    .omantel-card.wide { 
      grid-column: span 2; 
      border: none; min-height: 130px;
    }

    .kiosk-pulse-btn {
       animation: pulse-attention 2.5s infinite;
    }

    @keyframes pulse-attention {
       0% { transform: scale(1); box-shadow: 0 0 0 0 ${dark ? 'rgba(18, 87, 172, 0.7)' : 'rgba(166, 1, 18, 0.7)'}; }
       50% { transform: scale(1.02); box-shadow: 0 0 0 20px rgba(253, 181, 28, 0); }
       100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(253, 181, 28, 0); }
    }

    @keyframes floatBg {
       0%, 100% { transform: translateY(0) scale(1); }
       50% { transform: translateY(-30px) scale(1.05); }
    }

    .marquee-container {
       width: 100%; max-width: 640px; overflow: hidden; white-space: nowrap; position: relative;
       background: ${dark ? 'rgba(18, 87, 172, 0.2)' : 'rgba(166, 1, 18, 0.05)'};
       padding: 12px; border-radius: 12px; margin: 16px 0;
       border: 1px solid ${dark ? 'rgba(253, 181, 28, 0.3)' : 'rgba(166, 1, 18, 0.2)'};
    }
    
    .marquee-text {
       display: inline-block;
       animation: marquee 15s linear infinite;
       font-weight: 800; font-size: 18px; color: ${theme.accent};
       letter-spacing: 2px; text-transform: uppercase;
    }

    @keyframes marquee {
       0% { transform: translateX(100%); }
       100% { transform: translateX(-100%); }
    }
    
    .glassy-option-btn {
      background: ${theme.card};
      border: 1px solid ${theme.border};
      border-radius: 16px; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between;
      box-shadow: 0 8px 32px rgba(0,0,0,0.05); cursor: pointer; transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
      backdrop-filter: blur(12px); min-height: 80px;
    }
    .glassy-option-btn:active { transform: scale(0.98); opacity: 0.8; }

    .glassy-dir-card {
      background: ${theme.card};
      border: 1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
      border-radius: 20px; padding: 20px; display: flex; align-items: center; gap: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.05); cursor: pointer; transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
    }
    .glassy-dir-card:active { transform: scale(0.98); opacity: 0.8; }

    .card-arrow { 
      width: 32px; height: 32px; 
      border-radius: 50%; border: 2px solid; 
      display: flex; align-items: center; justify-content: center; 
      position: absolute; bottom: 20px; right: 20px;
    }

    .back-btn-modern {
      display: flex; align-items: center; gap: 8px; background: ${theme.card};
      border: 1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}; color: ${theme.text};
      padding: 10px 18px; border-radius: 20px; font-size: 15px; font-weight: 700; cursor: pointer; 
      transition: transform 0.1s; box-shadow: 0 4px 12px rgba(0,0,0,0.1); backdrop-filter: blur(10px);
    }
    .back-btn-modern:active { transform: scale(0.92); }

    .kiosk-detail-card {
       width: 90%; max-width: 860px; flex: 1 1 auto; min-height: 800px; max-height: 85vh;
       background: ${theme.card};
       border-radius: 32px; border: 1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)'};
       display: flex; flex-direction: column; box-shadow: 0 24px 60px rgba(0,0,0,0.4);
       overflow: hidden; margin-bottom: 24px; z-index: 10; backdrop-filter: blur(24px);
    }
    .kiosk-detail-card.is-pdf {
       height: 1050px !important; 
       max-height: 1050px !important; 
       min-height: 1050px !important; 
       padding: 0 !important;
       flex: 0 0 1050px !important; 
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `}</style>
);

const getIconForCategory = (cat: string, size = 20) => {
  if (!cat) return <Folder size={size} />;
  const lower = cat.toLowerCase();
  if (lower.includes("org")) return <Users size={size} />;
  if (lower.includes("major") || lower.includes("curriculum")) return <GraduationCap size={size} />;
  if (lower.includes("doc") || lower.includes("carta") || lower.includes("handbook")) return <FileText size={size} />;
  if (lower.includes("indust") || lower.includes("partner") || lower.includes("accomp")) return <Briefcase size={size} />;
  if (lower.includes("facil")) return <Building size={size} />;
  if (lower.includes("teach") || lower.includes("prof") || lower.includes("facul")) return <UserSquare size={size} />;
  return <Folder size={size} />;
};

export const KioskScreen = ({ dark, screenState, setScreenState, kioskCategory, setKioskCategory, kioskResult, setKioskResult, handleKioskSelection, topRightButtons, setFullScreenMedia, setShowCalendar, kioskMapping, setKioskMapping, allSidebarCategories, isAdmin }: any) => {
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
  
  // EDIT STATE FOR ADMIN CLUSTER MAPPING
  const [isEditingCluster, setIsEditingCluster] = useState(false);

  // 60-30-10 Palette Implementation
  const theme = dark ? {
    bg: '#1C1D55',        // 60% Dominant Background (Dark Blue)
    card: '#1257AC',      // 30% Secondary Elements (Light Blue)
    accent: '#FDB51C',    // 10% Accents & Highlights (Yellow)
    text: '#ffffff',
    textMuted: 'rgba(255,255,255,0.7)',
    border: 'rgba(255,255,255,0.15)'
  } : {
    bg: '#f8fafc',        // 60% Dominant Neutral (White/Greyish)
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
    { label: "Faculty", icon: <UserSquare size={32} /> },
    { label: "Accomplishment", icon: <Briefcase size={32} /> },
    { label: "Student Affairs", icon: <Users size={32} /> },
    { label: "Curriculum and Extensions", icon: <FileText size={32} /> }
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

  // RESOLVE ITEMS TO RENDER FOR THE CURRENT SUB-MENU
  let itemsToRender: string[] = [];
  const isClusterCategory = clusterItems.some(c => c.label === kioskCategory);
  if (isClusterCategory) {
     itemsToRender = kioskMapping[kioskCategory] || [];
  }

  const goHome = () => {
    setScreenState("screensaver");
    setKioskCategory(null);
    setKioskResult(null);
    setIsEditingCluster(false);
  };

  // HANDLERS FOR DYNAMIC CLUSTER EDITING
  const addCategoryToCluster = (cat: string) => {
     if (!cat || itemsToRender.includes(cat)) return;
     const newMap = { ...kioskMapping, [kioskCategory]: [...(kioskMapping[kioskCategory] || []), cat] };
     setKioskMapping(newMap);
  };
  const removeCategoryFromCluster = (cat: string, e: React.MouseEvent) => {
     e.stopPropagation();
     const newMap = { ...kioskMapping, [kioskCategory]: (kioskMapping[kioskCategory] || []).filter((c: string) => c !== cat) };
     setKioskMapping(newMap);
  };

  return (
    <>
      <GlobalKioskStyles dark={dark} theme={theme} />
      <div className="screensaver-fullscreen">
        <div className="bg-blob-1" />
        <div className="bg-blob-2" />
        
        <div style={{ position: 'absolute', top: 24, left: 32, zIndex: 100, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={goHome}>
            <Bot size={36} color={dark ? "#fff" : theme.cardBorder} />
            <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-1px' }}>
                <span style={{ color: dark ? '#fff' : '#0f172a' }}>Chat</span><span style={{ color: dark ? theme.accent : theme.cardBorder }}>CIT</span>
            </span>
        </div>
        <div style={{ position: "absolute", top: 24, right: 32, zIndex: 100 }}>{topRightButtons}</div>

        {screenState === "screensaver" && !kioskCategory && (
          <div className="kiosk-main-scroll no-scrollbar">
            
            <div className="greeting-box" style={{ background: theme.card, borderColor: dark ? theme.border : theme.cardBorder, borderWidth: dark ? 1 : 2, borderStyle: 'solid' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: dark ? theme.accent : theme.cardBorder, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={36} color={dark ? '#1C1D55' : '#fff'} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: theme.text }}>Good Day CITizen!</h1>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: theme.textMuted, fontWeight: 500 }}>{formattedDate} | {formattedTime}</p>
              </div>
              <button onClick={() => setShowCalendar(true)} style={{ background: theme.accent, color: dark ? '#1C1D55' : '#fff', border: 'none', padding: '12px 20px', borderRadius: 16, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <CalendarIcon size={18} /> View Calendar
              </button>
            </div>

            <div className="omantel-grid">
               {clusterItems.map((item, idx) => (
                  <div key={idx} onClick={() => setKioskCategory(item.label)} className="omantel-card" style={{ background: theme.card, borderColor: dark ? theme.border : theme.cardBorder, borderWidth: dark ? 1 : 2, borderStyle: 'solid' }}>
                     <div style={{ color: dark ? theme.accent : theme.cardBorder, marginBottom: 12 }}>{item.icon}</div>
                     <div style={{ fontSize: 13, color: theme.textMuted, fontWeight: 600 }}>Browse</div>
                     <div style={{ fontSize: 20, color: theme.text, fontWeight: 800, lineHeight: 1.2, marginTop: 4 }}>{item.label}</div>
                     <div className="card-arrow" style={{ borderColor: dark ? theme.accent : theme.cardBorder, color: dark ? theme.accent : theme.cardBorder }}><ArrowRight size={16}/></div>
                  </div>
               ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '32px 0', width: '100%', maxWidth: 640 }}>
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: '50%', width: 120, height: 120, boxShadow: '0 10px 30px rgba(0,0,0,0.2)', marginBottom: 16 }}>
                  <img src="/cit-logo.png" alt="CIT" style={{ width: '80%', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = `<span style="color:#A60112; font-weight:900; font-size:40px;">CIT</span>`; }} />
               </div>
               
               <div className="marquee-container">
                  <div className="marquee-text">
                     #AMPLIFIEDCIT &nbsp; • &nbsp; COMPLIANCE &nbsp; • &nbsp; INTEGRITY &nbsp; • &nbsp; TRANSPARENCY &nbsp; • &nbsp; ALAB BULSU &nbsp; • &nbsp; #AMPLIFIEDCIT &nbsp; • &nbsp; COMPLIANCE &nbsp; • &nbsp; INTEGRITY &nbsp; • &nbsp; TRANSPARENCY &nbsp; • &nbsp; ALAB BULSU &nbsp; • &nbsp; 
                  </div>
               </div>
            </div>

            <div style={{ width: '100%', padding: '0 24px', position: 'absolute', bottom: 32, maxWidth: 640 }}>
               <div className="omantel-card wide kiosk-pulse-btn" onClick={() => { setScreenState("chat"); setKioskCategory(null); setKioskResult(null); }} style={{ background: dark ? theme.card : theme.cardBorder, color: '#fff', margin: 0, padding: 24 }}>
                  <div style={{ fontSize: 16, opacity: 0.9, fontWeight: 600, marginBottom: 4 }}>Interactive AI Assistant</div>
                  <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>Talk with ChatCIT</div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                     <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: 24, fontSize: 15, fontWeight: 600 }}><MessageSquare size={16}/> Ask anything</span>
                     <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: 24, fontSize: 15, fontWeight: 600 }}><Search size={16}/> Search records</span>
                  </div>
                  <Bot size={140} style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.15 }} />
               </div>
            </div>
          </div>
        )}

        {/* SUB-MENU DIRECTORY LISTING MAPS */}
        {screenState === "screensaver" && kioskCategory && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 20px', zIndex: 10, paddingTop: 100 }}>
              <div style={{ width: '100%', maxWidth: 720, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                   <button onClick={() => { setKioskCategory(null); setIsEditingCluster(false); }} className="back-btn-modern"><ArrowLeft size={20}/> Back</button>
                   <h2 style={{ fontSize: 28, fontWeight: 800, color: theme.text, margin: 0, textShadow: dark ? '0 4px 12px rgba(0,0,0,0.3)' : 'none' }}>{kioskCategory}</h2>
                </div>
                
                {isAdmin && isClusterCategory && (
                   <button onClick={() => setIsEditingCluster(!isEditingCluster)} style={{ padding: '8px 16px', borderRadius: 8, background: isEditingCluster ? theme.accent : 'transparent', color: isEditingCluster ? '#1C1D55' : theme.text, border: `1px solid ${theme.border}`, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                      {isEditingCluster ? 'Done Editing' : 'Edit Mapping'}
                   </button>
                )}
              </div>

              {/* ADMIN EDITING CONTROLS */}
              {isEditingCluster && (
                 <div style={{ display: 'flex', gap: 8, marginBottom: 24, width: '100%', maxWidth: 720, padding: 16, background: theme.card, borderRadius: 12, border: `1px solid ${theme.border}`, animation: 'fadeIn 0.3s' }}>
                    <select id="add-cat-select" style={{ flex: 1, padding: '10px', borderRadius: 8, background: dark ? 'rgba(0,0,0,0.2)' : '#f1f5f9', color: theme.text, border: 'none', outline: 'none' }}>
                       <option value="" style={{ color: '#000' }}>-- Select a Databank Category to add --</option>
                       {allSidebarCategories.filter((c:string) => !itemsToRender.includes(c)).map((c:string) => (
                          <option key={c} value={c} style={{ color: '#000' }}>{c}</option>
                       ))}
                    </select>
                    <button onClick={() => {
                       const val = (document.getElementById('add-cat-select') as HTMLSelectElement).value;
                       if (val) { addCategoryToCluster(val); (document.getElementById('add-cat-select') as HTMLSelectElement).value = ''; }
                    }} style={{ padding: '10px 20px', background: theme.accent, color: '#1C1D55', fontWeight: 700, borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Plus size={16}/> Add</button>
                 </div>
              )}
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, width: '100%', maxWidth: 720 }}>
                {itemsToRender.map((item, idx) => (
                  <div key={idx} className="glassy-option-btn" onClick={() => !isEditingCluster && handleKioskSelection(kioskCategory, item)} style={{ cursor: isEditingCluster ? 'default' : 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                       <div style={{ color: dark ? theme.accent : theme.cardBorder, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                         {getIconForCategory(item, 24)}
                       </div>
                       <div style={{ fontSize: 16, fontWeight: 700, color: theme.text, lineHeight: 1.4, wordBreak: 'break-word', textAlign: 'left', display: 'flex', alignItems: 'center' }}>
                         {item.replace('Teachers', 'Professors')}
                       </div>
                    </div>
                    {isEditingCluster ? (
                       <button onClick={(e) => removeCategoryFromCluster(item, e)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: 8, borderRadius: 8, cursor: 'pointer' }}><Trash2 size={18}/></button>
                    ) : (
                       <div className="card-arrow" style={{ width: 26, height: 26, position: 'relative', right: 0, bottom: 0, flexShrink: 0, borderColor: theme.border, color: theme.textMuted }}><ArrowRight size={14}/></div>
                    )}
                  </div>
                ))}
              </div>

              {itemsToRender.length === 0 && <div style={{ color: theme.textMuted, fontSize: 16, marginTop: 40, zIndex: 10 }}>No categories mapped. {isAdmin && "Click 'Edit Mapping' to add some!"}</div>}
            </div>
        )}

        {screenState === "kiosk_result" && (
          <div className="kiosk-main-scroll no-scrollbar" style={{ paddingBottom: 40, paddingTop: 100 }}>
            <div className={`kiosk-detail-card ${kioskResult?.isPdf ? 'is-pdf' : ''}`} style={{ borderColor: dark ? theme.border : theme.cardBorder, borderWidth: dark ? 1 : 2 }}>
              
              {kioskResult?.isPdf ? (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: theme.card, borderBottom: `1px solid ${theme.border}`, zIndex: 20, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                       <button onClick={() => { setKioskResult(null); setScreenState("screensaver"); }} style={{ background: "transparent", border: "none", color: theme.text, cursor: "pointer", display: "flex", alignItems: "center" }}><ArrowLeft size={24} /></button>
                       <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: theme.text, textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{kioskResult.title}</h2>
                    </div>
                  </div>
                  
                  <div className="no-scrollbar" style={{ flex: 1, width: '100%', position: 'relative', background: '#323639', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '12px', overflow: 'auto' }}>
                     {pdfLoading && (<div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}><div style={{ position: "relative", width: 60, height: 60, display: "flex", justifyContent: "center", alignItems: "center" }}><div style={{ position: "absolute", transform: 'scale(0.5)' }}><GearboxLoader /></div></div></div>)}
                     <canvas ref={canvasRef} style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain', display: 'block', opacity: pdfLoading ? 0.3 : 1, transition: 'opacity 0.3s', background: '#fff', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} />
                     
                     {pdfRef && (<button onClick={() => { if (canvasRef.current) { setLocalFullScreen(canvasRef.current.toDataURL('image/png')); } }} style={{ position: 'absolute', bottom: 24, right: 24, zIndex: 20, background: theme.accent, color: dark ? '#1C1D55' : '#fff', border: 'none', borderRadius: '50%', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.1s', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }} onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.92)'} onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}><Maximize size={28} /></button>)}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, padding: '16px 24px', background: theme.bg, borderTop: `1px solid ${theme.border}`, zIndex: 20, flexShrink: 0 }}>
                    <button onClick={() => setPdfPage((p: number) => Math.max(1, p - 5))} className="pdf-nav-btn" disabled={pdfPage <= 1} style={{ background: theme.card, color: theme.text }}>-5</button>
                    <button onClick={() => setPdfPage((p: number) => Math.max(1, p - 1))} className="pdf-nav-btn" disabled={pdfPage <= 1} style={{ background: theme.card, color: theme.text }}><ChevronLeft size={16}/></button>
                    <span style={{ fontSize: 16, fontWeight: 700, color: theme.text, whiteSpace: 'nowrap', margin: '0 12px' }}>Page {pdfPage} of {totalPages}</span>
                    <button onClick={() => setPdfPage((p: number) => Math.min(totalPages, p + 1))} className="pdf-nav-btn" disabled={pdfPage >= totalPages} style={{ background: theme.card, color: theme.text }}><ChevronRight size={16}/></button>
                    <button onClick={() => setPdfPage((p: number) => Math.min(totalPages, p + 5))} className="pdf-nav-btn" disabled={pdfPage >= totalPages} style={{ background: theme.card, color: theme.text }}>+5</button>
                  </div>
                </div>

              ) : kioskResult?.isDirectory ? (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 16, padding: '32px 32px 0 32px', flexShrink: 0 }}>
                    <button onClick={() => { setKioskResult(null); setScreenState("screensaver"); }} className="back-btn-modern" style={{ background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}><ArrowLeft size={20}/> Back</button>
                    <h2 style={{ fontSize: 28, fontWeight: 800, color: theme.text, margin: 0 }}>{kioskResult?.title.replace('Teachers', 'Professors')}</h2>
                  </div>

                  <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column' }}>
                     {!dirMajor && subCategories.length > 0 ? (
                        <>
                          <div style={{ fontSize: 20, fontWeight: 600, color: theme.textMuted, marginBottom: 24, textAlign: 'center' }}>Select a Folder to view {kioskResult.title.replace('Teachers', 'Professors')}</div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 16 }}>
                             {subCategories.map((m, idx) => (
                               <button key={idx} className="glassy-dir-card" style={{ justifyContent: 'center', padding: '24px' }} onClick={() => { setDirMajor(m as string); setDirPage(1); }}>
                                 <span style={{ color: dark ? theme.accent : theme.cardBorder }}>{getIconForCategory(kioskResult.title, 28)}</span>
                                 <span style={{ fontSize: 18, fontWeight: 800, color: theme.text }}>{m as string}</span>
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
                                   <div key={item.id} className="glassy-dir-card" onClick={() => handleKioskSelection(kioskResult.category || kioskResult.title, item.display_name || (item.keyword ? item.keyword.split(',')[0] : ""))}>
                                      <div style={{ width: 64, height: 64, borderRadius: '50%', background: theme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                                         {item.picture_url && !item.picture_url.toLowerCase().includes('.pdf') ? (<img src={item.picture_url} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />) : <span style={{ color: dark ? theme.accent : theme.cardBorder }}>{getIconForCategory(kioskResult.title, 32)}</span>}
                                      </div>
                                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start', textAlign: 'left' }}>
                                         <span style={{ fontSize: 20, fontWeight: 800, color: theme.text }}>{item.display_name || (item.keyword ? item.keyword.split(',')[0] : "")}</span>
                                         {item.subcategory && item.subcategory !== "All" && (<span style={{ fontSize: 16, fontWeight: 600, color: theme.accent }}>{item.subcategory}</span>)}
                                         <span style={{ fontSize: 14, color: theme.textMuted, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.response}</span>
                                      </div>
                                      <ChevronRight size={24} color={theme.textMuted} style={{ flexShrink: 0 }} />
                                   </div>
                                )) : (
                                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: theme.textMuted, fontWeight: 600, padding: 40 }}>No records found.</div>
                                )}
                             </div>
                             
                             {totalDirPages > 1 && (
                               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: 32, padding: '12px 24px', background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}` }}>
                                  <button onClick={() => setDirPage(p => Math.max(1, p - 1))} disabled={dirPage <= 1} style={{ padding: '10px 20px', borderRadius: 12, border: 'none', background: theme.accent, color: dark ? '#1C1D55' : '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', opacity: dirPage <= 1 ? 0.3 : 1 }}>Previous</button>
                                  <span style={{ fontSize: 16, fontWeight: 700, color: theme.text }}>Page {dirPage} of {totalDirPages}</span>
                                  <button onClick={() => setDirPage(p => Math.min(totalDirPages, p + 1))} disabled={dirPage >= totalDirPages} style={{ padding: '10px 20px', borderRadius: 12, border: 'none', background: theme.accent, color: dark ? '#1C1D55' : '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', opacity: dirPage >= totalDirPages ? 0.3 : 1 }}>Next</button>
                               </div>
                             )}
                           </>
                        )
                     )}
                  </div>
                </div>

              ) : (
                <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '40px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 32 }}>
                    <button onClick={() => { setKioskResult(null); setScreenState("screensaver"); }} style={{ background: "transparent", border: "none", color: theme.text, cursor: "pointer", display: "flex", alignItems: "center", marginTop: 4 }}><ArrowLeft size={28} /></button>
                    <h2 style={{ fontSize: 28, fontWeight: 800, margin: 0, color: theme.text, textTransform: 'uppercase', lineHeight: 1.2 }}>{kioskResult?.title}</h2>
                  </div>

                  {kioskResult?.loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 16, marginTop: 60 }}>
                      <Bot color={theme.accent} size={72} className="animate-pulse" />
                      <span style={{ fontSize: 24, color: theme.textMuted, fontWeight: 600 }}>ChatCIT is fetching details...</span>
                    </div>
                  ) : (
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {kioskResult?.image && (<div style={{ background: '#fff', borderRadius: 32, padding: 16, marginBottom: 32, boxShadow: '0 12px 32px rgba(0,0,0,0.2)' }}><img src={kioskResult.image} alt={`${kioskResult.title} Logo`} style={{ width: 200, height: 200, objectFit: 'contain' }} /></div>)}
                      <div style={{ fontSize: 18, lineHeight: 1.6, color: theme.text, width: '100%', whiteSpace: 'pre-wrap', paddingBottom: 40 }}>{formatText(kioskResult?.content)}</div>
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
