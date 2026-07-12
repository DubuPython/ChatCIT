import React, { useState, useRef, useEffect } from "react";
import { GearboxLoader } from "./helpers";

export function CanvasPDFViewer({ fileUrl, dark, onEnlarge, onLoad, isMobile }: { fileUrl: string, dark: boolean, onEnlarge: (url: string) => void, onLoad: () => void, isMobile: boolean }) {
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
         const cleanUrl = fileUrl.split('#')[0];
         const loadingTask = (window as any).pdfjsLib.getDocument(cleanUrl);
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
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
            <div style={{ position: "relative", width: 40, height: 40, display: "flex", justifyContent: "center", alignItems: "center", filter: dark ? 'none' : 'brightness(0.1) opacity(0.7)' }}>
              <div style={{ position: "absolute", transform: 'scale(0.3)' }}><GearboxLoader /></div>
            </div>
          </div>
        )}
        <canvas ref={canvasRef} onClick={() => { if(canvasRef.current) { try { onEnlarge(canvasRef.current.toDataURL()); } catch(e) {} } }} style={{ width: '100%', height: 'auto', display: 'block', opacity: loading ? 0.3 : 1, transition: 'opacity 0.3s', cursor: 'zoom-in' }} />
      </div>
    </div>
  );
}