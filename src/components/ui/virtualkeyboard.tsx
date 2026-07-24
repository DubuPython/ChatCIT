import React from "react";

interface VirtualKeyboardProps {
  dark: boolean;
  onKeyPress: (k: string, e: React.MouseEvent) => void;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ dark, onKeyPress }) => {
  const virtualKeyRows = [
    ['1','2','3','4','5','6','7','8','9','0'],
    ['q','w','e','r','t','y','u','i','o','p'],
    ['a','s','d','f','g','h','j','k','l'],
    ['z','x','c','v','b','n','m', 'BACK'],
    ['SPACE', 'ENTER', 'CLOSE']
  ];

  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 8px 24px", background: dark ? "rgba(28, 27, 34, 0.98)" : "rgba(229, 231, 235, 0.98)", backdropFilter: "blur(20px)", borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, zIndex: 999999, display: "flex", flexDirection: "column", gap: 10, boxShadow: "0 -10px 40px rgba(0,0,0,0.5)", animation: "slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}>
      {virtualKeyRows.map((row, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "center", gap: 8 }}>
          {row.map(k => (
            <button 
              key={k} 
              onMouseDown={(e) => onKeyPress(k, e)} 
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
  );
};