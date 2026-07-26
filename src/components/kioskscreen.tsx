import React, { useRef, useState, useEffect } from "react";
import { Settings, Zap, Users, GraduationCap, FileText, ChevronLeft, ChevronRight, MessageSquare, Bot, Maximize } from "lucide-react";
import { QUICK_PROMPTS, ORGANIZATIONS, MAJORS, DOCUMENTS } from "../config";
import { GearboxLoader } from "./ui/helpers";

const GlobalKioskStyles = ({ dark }: { dark: boolean }) => (
  <style>{`
    .theme-toggle-wrapper input[type="checkbox"] { display: none !important; opacity: 0 !important; width: 0px !important; height: 0px !important; position: absolute; z-index: -100; }
    
    .screensaver-fullscreen {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 999995;
      background: url('/Screensaver.jpg') center/cover no-repeat;
      background-color: ${dark ? '#0f172a' : '#ffffff'};
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      animation: fadeIn 0.3s ease; border-radius: inherit; overflow: hidden;
    }
    .screensaver-overlay {
      position: absolute; inset: 0;
      background: ${dark ? 'linear-gradient(180deg, rgba(15,23,42,0.4) 0%, rgba(15,23,42,0.95) 100%)' : 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.98) 100%)'};
      backdrop-filter: blur(12px);
    }
    
    .screensaver-content {
      position: relative; z-index: 999996; display: flex; flex-direction: column;
      width: 100%; max-width: 1100px; height: 100%; padding: 40px 32px 32px;
    }
    
    .bento-grid {
      display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px;
      width: 100%; max-width: 640px; margin-top: 48px;
    }
    .carousel-track::-webkit-scrollbar { display: none; }
    
    /* TOUCH-OPTIMIZED KIOSK BUTTONS */
    .nav-arrow {
      display: flex; align-items: center; justify-content: center;
      width: 64px; height: 64px; border-radius: 50%; border: none; cursor: pointer;
      background: ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}; color: ${dark ? '#fff' : '#1a1a2e'};
      transition: transform 0.1s; flex-shrink: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .nav-arrow:active { transform: scale(0.92); }

    .bento-card {
      background: ${dark ? 'rgba(30, 35, 50, 0.6)' : 'rgba(240, 245, 255, 0.9)'};
      border: 1px solid ${dark ? 'rgba(66, 133, 244, 0.2)' : 'rgba(66, 133, 244, 0.3)'};
      padding: 32px 24px; border-radius: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px;
      color: ${dark ? '#fff' : '#1a1a2e'}; cursor: pointer; transition: transform 0.1s; box-shadow: 0 8px 32px rgba(0,0,0,0.1); text-align: center;
    }
    .bento-card:active { transform: scale(0.96); background: ${dark ? 'rgba(40, 50, 75, 0.8)' : '#ffffff'}; border-color: rgba(66, 133, 244, 0.8); }
    .bento-card span { font-size: 22px; font-weight: 700; letter-spacing: 0.02em; }

    .chat-cta-btn {
      width: 100%; max-width: 600px; background: linear-gradient(135deg, #4285f4 0%, #1e3a8a 100%);
      color: #fff; border: none; padding: 24px; border-radius: 24px; font-size: 24px; font-weight: 800;
      display: flex; align-items: center; justify-content: center; gap: 16px; cursor: pointer;
      box-shadow: 0 12px 32px rgba(66, 133, 244, 0.4), inset 0 2px 4px rgba(255,255,255,0.2); transition: transform 0.1s; animation: pulseGlow 2.5s infinite;
    }
    .chat-cta-btn:active { transform: scale(0.95); }

    .back-btn {
      display: flex; align-items: center; gap: 12px; background: ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
      border: 1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}; color: ${dark ? '#fff' : '#1a1a2e'};
      padding: 12px 24px; border-radius: 16px; font-size: 16px; font-weight: 700; cursor: pointer; transition: transform 0.1s;
    }
    .back-btn:active { transform: scale(0.92); }

    .pdf-nav-btn {
       background: ${dark ? '#1e1e28' : 'rgba(0,0,0,0.05)'}; border: none; color: ${dark ? '#cbd5e1' : '#000'};
       padding: 8px 16px; border-radius: 8px; font-weight: 700; font-size: 16px; cursor: pointer; transition: transform 0.1s; display: flex; align-items: center; justify-content: center;
    }
    .pdf-nav-btn:active:not(:disabled) { transform: scale(0.92); background: rgba(66, 133, 244, 0.8); color: white; }
    .pdf-nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }

    @keyframes pulseGlow { 0% { box-shadow: 0 0 0 0 rgba(66, 133, 244, 0.6); } 70% { box-shadow: 0 0 0 20px rgba(66, 133, 244, 0); } 100% { box-shadow: 0 0 0 0 rgba(66, 133, 244, 0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `}</style>
);

export const KioskScreen = ({ dark, screenState, setScreenState, kioskCategory, setKioskCategory, kioskResult, setKioskResult, handleKioskSelection, topRightButtons, setFullScreenIframe, setFullScreenMedia }: any) => {
  const carouselRef = useRef<HTMLDivElement>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfPage, setPdfPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pdfRef, setPdfRef] = useState<any>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    if (!kioskResult?.isPdf || !kioskResult?.pdfUrl) return;
    
    let isMounted = true;
    const loadPDF = async () => {
      setPdfLoading(true);
      if (!(window as any).pdfjsLib) {
         await new Promise((resolve) => {
           const script = document.createElement('script');
           script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
           script.onload = () => {
             (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
             resolve(true);
           };
           document.body.appendChild(script);
         });
      }
      
      try {
         const cleanUrl = kioskResult.pdfUrl.split('#')[0];
         const loadingTask = (window as any).pdfjsLib.getDocument(cleanUrl);
         const pdf = await loadingTask.promise;
         
         if(isMounted) {
           setPdfRef(pdf);
           setTotalPages(pdf.numPages);
           setPdfPage(1);
         }
      } catch(e) {
         console.error("Failed to load Kiosk PDF", e);
      } finally {
         if(isMounted) setPdfLoading(false);
      }
    };
    loadPDF();
    return () => { isMounted = false; };
  }, [kioskResult?.pdfUrl]);

  useEffect(() => {
     const renderPage = async () => {
        if (!pdfRef || !canvasRef.current) return;
        setPdfLoading(true);
        try {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          const page = await pdfRef.getPage(pdfPage);
          
          const viewport = page.getViewport({ scale: 2.5 });
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          const renderContext = { canvasContext: ctx, viewport: viewport };
          await page.render(renderContext).promise;
        } catch(e) {
          console.error("Failed to render canvas page", e);
        }
        setPdfLoading(false);
     };
     renderPage();
  }, [pdfRef, pdfPage]);


  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
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

  const formatText = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: dark ? '#fff' : '#000', fontWeight: 800 }}>{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const textMuted = dark ? "#9aa0a6" : "#6b7280";
  const resultCardBg = dark ? '#13141c' : '#ffffff';
  const headerBg = dark ? '#13141c' : '#ffffff';

  const showBackButton = screenState !== "screensaver" || kioskCategory !== null;

  return (
    <>
      <GlobalKioskStyles dark={dark} />
      <div className="screensaver-fullscreen">
        <div className="screensaver-overlay" />
        
        {/* Absolute Top Right Settings */}
        <div style={{ position: "absolute", top: 24, right: 24, zIndex: 999997 }}>
          {topRightButtons}
        </div>

        <div className="screensaver-content">
          
          {/* Top Row: Back Button */}
          <div style={{ width: "100%", height: 48, display: "flex", justifyContent: "flex-start", alignItems: "center", marginBottom: 16, flexShrink: 0 }}>
            {showBackButton && (
              <button className="back-btn" onClick={() => { 
                  if (screenState === "kiosk_result") {
                      setScreenState("screensaver");
                      setKioskResult(null);
                  } else {
                      setKioskCategory(null);
                  }
              }}>
                <ChevronLeft size={24} /> Back
              </button>
            )}
          </div>

          {/* Middle: Expanding & Centered Content Box */}
          <div style={{ flex: 1, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 0 }}>
            
            {/* STATE 1: HOME SCREENSAVER */}
            {screenState === "screensaver" && !kioskCategory && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 80, height: 80, display: "flex", justifyContent: "center", alignItems: "center", background: "rgba(66, 133, 244, 0.1)", borderRadius: "50%", border: "2px solid rgba(66, 133, 244, 0.3)", boxShadow: "0 0 40px rgba(66,133,244,0.3)" }}>
                    <Settings color={dark ? "#60a5fa" : "#38bdf8"} className="animate-spin" style={{ animationDuration: '4s' }} size={44} />
                  </div>
                  {/* FIXED: Dynamic color for "Chat" handles light/dark mode visibility, removed "Kiosk" text */}
                  <h1 style={{ fontSize: 56, fontWeight: 800, color: dark ? '#ffffff' : '#0f172a', letterSpacing: "-1px", margin: 0 }}>
                    Chat<span style={{ color: dark ? '#60a5fa' : '#38bdf8' }}>CIT</span>
                  </h1>
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
              </div>
            )}

            {/* STATE 2: CATEGORY CAROUSEL */}
            {screenState === "screensaver" && kioskCategory && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <h2 style={{ fontSize: 48, fontWeight: 800, color: dark ? '#fff' : '#0f172a', margin: '0 0 12px 0' }}>
                  {kioskCategory}
                </h2>
                <p style={{ color: dark ? '#94a3b8' : '#475569', fontSize: 20, marginBottom: 40 }}>
                  Select an option to view more details.
                </p>

                <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 24 }}>
                  <button onClick={() => scrollCarousel('left')} className="nav-arrow"><ChevronLeft size={36}/></button>
                  
                  <div ref={carouselRef} className="carousel-track" style={{ display: 'flex', gap: 24, overflowX: 'auto', scrollBehavior: 'smooth', scrollSnapType: 'x mandatory', width: '100%', padding: '16px 0' }}>
                    {(kioskCategory === "Quick Prompts" ? QUICK_PROMPTS :
                      kioskCategory === "Organizations" ? ORGANIZATIONS :
                      kioskCategory === "Majors" ? MAJORS : DOCUMENTS).map((item, idx) => (
                      <div 
                        key={idx} 
                        className="bento-card visual-card" 
                        style={{ scrollSnapAlign: 'center', flexShrink: 0, width: 300, height: 420, backgroundImage: `url(${getCardImage(item)})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', overflow: 'hidden', padding: 0 }} 
                        onClick={() => handleKioskSelection(kioskCategory, item)}
                      >
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 20%, rgba(15,23,42,0.98) 100%)', borderRadius: 'inherit' }} />
                        <span style={{ position: 'absolute', bottom: 32, left: 24, right: 24, color: '#fff', fontSize: 26, fontWeight: 800, textAlign: 'left', textShadow: '0 4px 12px rgba(0,0,0,0.6)' }}>{item}</span>
                      </div>
                    ))}
                  </div>

                  <button onClick={() => scrollCarousel('right')} className="nav-arrow"><ChevronRight size={36}/></button>
                </div>
              </div>
            )}

            {/* STATE 3: RESULT CARD (CANVAS PDF OR TEXT) */}
            {screenState === "kiosk_result" && (
              <div style={{ width: '100%', height: '100%', background: resultCardBg, borderRadius: 24, border: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)'}`, display: 'flex', flexDirection: 'column', boxShadow: '0 24px 60px rgba(0,0,0,0.4)', overflow: 'hidden' }}>
                
                {kioskResult?.isPdf ? (
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    
                    {/* Compact Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: headerBg, borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`, zIndex: 20, flexShrink: 0 }}>
                      <h2 style={{ fontSize: 28, fontWeight: 800, margin: 0, color: dark ? '#fff' : '#000', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginRight: 16 }}>
                        {kioskResult.title}
                      </h2>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: dark ? '#fff' : '#000', whiteSpace: 'nowrap', marginRight: 4 }}>
                          {pdfPage} / {totalPages}
                        </span>
                        <button onClick={() => setPdfPage((p: number) => Math.max(1, p - 5))} className="pdf-nav-btn" disabled={pdfPage <= 1}>-5</button>
                        <button onClick={() => setPdfPage((p: number) => Math.max(1, p - 1))} className="pdf-nav-btn" disabled={pdfPage <= 1}><ChevronLeft size={18}/></button>
                        <button onClick={() => setPdfPage((p: number) => Math.min(totalPages, p + 1))} className="pdf-nav-btn" disabled={pdfPage >= totalPages}><ChevronRight size={18}/></button>
                        <button onClick={() => setPdfPage((p: number) => Math.min(totalPages, p + 5))} className="pdf-nav-btn" disabled={pdfPage >= totalPages}>+5</button>
                      </div>
                    </div>
                    
                    {/* PERFECT BORDER-FITTING CANVAS */}
                    <div style={{ flex: 1, width: '100%', position: 'relative', background: '#323639', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px', overflow: 'hidden' }}>
                       
                       {pdfLoading && (
                         <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
                           <div style={{ position: "relative", width: 60, height: 60, display: "flex", justifyContent: "center", alignItems: "center" }}>
                             <div style={{ position: "absolute", transform: 'scale(0.5)' }}><GearboxLoader /></div>
                           </div>
                         </div>
                       )}

                       <canvas 
                         ref={canvasRef} 
                         style={{ 
                            height: '100%', 
                            width: 'auto',
                            maxWidth: '100%',
                            objectFit: 'contain', 
                            display: 'block', 
                            opacity: pdfLoading ? 0.3 : 1, 
                            transition: 'opacity 0.3s',
                            background: '#fff',
                            borderRadius: '8px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                         }} 
                       />

                       {pdfRef && (
                         <button 
                           onClick={() => {
                              if (setFullScreenMedia && canvasRef.current) {
                                  setFullScreenMedia(canvasRef.current.toDataURL('image/png'));
                              }
                           }}
                           style={{ position: 'absolute', bottom: 24, right: 24, zIndex: 20, background: '#4285f4', color: '#fff', border: 'none', borderRadius: '50%', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.1s', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}
                           onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.92)'}
                           onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                           onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                         >
                           <Maximize size={28} />
                         </button>
                       )}
                    </div>
                  </div>
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    
                    <div style={{ padding: '16px 24px', background: headerBg, borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`, flexShrink: 0 }}>
                      <h2 style={{ fontSize: 32, fontWeight: 800, margin: 0, color: dark ? '#fff' : '#000', textTransform: 'uppercase', textAlign: 'center' }}>
                        {kioskResult?.title}
                      </h2>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      
                      {kioskResult?.loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 16, marginTop: 60 }}>
                          <Bot color="#4285f4" size={72} className="animate-pulse" />
                          <span style={{ fontSize: 24, color: textMuted, fontWeight: 600 }}>ChatCIT is fetching details...</span>
                        </div>
                      ) : (
                        <div style={{ width: '100%', maxWidth: 860, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          {kioskResult?.image && (
                            <div style={{ background: '#fff', borderRadius: 40, padding: 16, marginBottom: 40, boxShadow: '0 12px 32px rgba(0,0,0,0.2)' }}>
                              <img src={kioskResult.image} alt={`${kioskResult.title} Logo`} style={{ width: 240, height: 240, objectFit: 'contain' }} />
                            </div>
                          )}

                          <div style={{ fontSize: 22, lineHeight: 1.8, color: dark ? '#cbd5e1' : '#334155', width: '100%', whiteSpace: 'pre-wrap' }}>
                            {formatText(kioskResult?.content)}
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Row: CTA Button */}
          <div style={{ width: "100%", display: "flex", justifyContent: "center", marginTop: 32, flexShrink: 0 }}>
            <button className="chat-cta-btn" onClick={() => { setScreenState("chat"); setKioskCategory(null); setKioskResult(null); }}>
              <MessageSquare size={32} />
              Talk with ChatCIT
            </button>
          </div>

        </div>
      </div>
    </>
  );
};