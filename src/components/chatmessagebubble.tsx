import React, { useState } from "react";
import { Bot, CheckCircle, Copy } from "lucide-react";
import { Avatar, MarkdownText } from "./ui/helpers";
import { CanvasPDFViewer } from "./ui/canvaspdfviewer";
import { Message, User } from "../types";

interface Props {
  msg: Message;
  dark: boolean;
  currentUser: User | null;
  isMobile: boolean;
  onEnlarge: (url: string) => void;
  onOpenIframe: (url: string) => void; 
  onLoad: () => void;
}

export function ChatMessageBubble({ msg, dark, currentUser, isMobile, onEnlarge, onOpenIframe, onLoad }: Props) {
  const [copied, setCopied] = useState(false);
  const textMuted = dark ? "#9aa0a6" : "#6b7280";
  const isUser = msg.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // MAGIC QR GENERATOR: Auto-extracts the first URL it finds in the response text
  const urlMatch = !isUser && msg.content ? msg.content.match(/(https?:\/\/[^\s]+[^.,;:"'\s])/) : null;

  return (
    <div className="group" style={{ display: "flex", gap: 10, flexDirection: msg.role === "user" ? "row-reverse" : "row", alignItems: "flex-start" }}>
      {msg.role === "model" && (
        <div style={{ flexShrink: 0, marginTop: 4, width: 28, height: 28, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Bot color="#4285f4" size={28} />
        </div>
      )}
      {msg.role === "user" && (
        <div style={{ flexShrink: 0, marginTop: 2 }}>
          <Avatar name={currentUser?.id === -1 ? "G" : currentUser?.username || currentUser?.email || "U"} size={28} bg={currentUser?.id === -1 ? "#6b7280" : "#7c3aed"} />
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: isMobile ? "90%" : "82%", width: "100%", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
        {msg.role === "user" ? (
          <div style={{ padding: "10px 16px", borderRadius: "18px 4px 18px 18px", background: dark ? "rgba(255,255,255,0.07)" : "#dce8fc", border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(21,88,214,0.2)"}`, color: dark ? "#e8eaed" : "#1a1a2e", fontSize: 14, lineHeight: 1.65 }}>
            {msg.content}
          </div>
        ) : ( 
          <>
            <div style={{ paddingTop: 2 }}><MarkdownText text={msg.content} dark={dark} /></div>
            
            {msg.pictures && msg.pictures.length > 0 && (
              <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 12, marginTop: 8, width: "100%", flexWrap: "wrap" }}>
                {msg.pictures.map((picUrl, index) => (
                  <div key={index} style={{ flex: 1, minWidth: isMobile ? "100%" : "calc(50% - 6px)", maxWidth: msg.pictures!.length === 1 ? (isMobile ? '100%' : 380) : "100%" }}>
                    {picUrl.toLowerCase().includes('.pdf') ? (
                      <CanvasPDFViewer fileUrl={picUrl} dark={dark} onEnlarge={onEnlarge} onLoad={onLoad} isMobile={isMobile} />
                    ) : (
                      <img src={picUrl} alt={`Reference Document ${index + 1}`} onClick={() => onEnlarge(picUrl)} onLoad={onLoad} style={{ width: "100%", maxHeight: 480, objectFit: 'contain', borderRadius: 8, border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`, cursor: 'zoom-in' }} />
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* AUTO QR CODE RENDERER */}
            {urlMatch && (
               <div style={{ marginTop: 16, padding: 16, background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}` }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: dark ? '#94a3b8' : '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '1px' }}>Scan Link</span>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(urlMatch[0])}`} alt="QR Code" style={{ borderRadius: 8, background: '#fff', padding: 8 }} onLoad={onLoad} />
               </div>
            )}

            <div style={{ marginTop: 6, display: "flex" }}>
              <button onClick={handleCopy} style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", color: textMuted, fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "color 0.2s" }}>
                {copied ? <CheckCircle size={14} color="#10b981" /> : <Copy size={14} />}
                {copied ? <span style={{ color: "#10b981" }}>Copied!</span> : "Copy"}
              </button>
            </div>
          </> 
        )}
      </div>
    </div>
  );
}
