import React from "react";
import { Settings } from "lucide-react";

// === CONSTANTS ===
export const M = 13, N_SM = 10, N_LG = 16; 
export const PITCH_SM = (N_SM * M) / 2, PITCH_LG = (N_LG * M) / 2;     
export const CENTER_D = PITCH_SM + PITCH_LG; 
export const OR_SM = PITCH_SM + M, IR_SM = PITCH_SM - M * 1.25;   
export const OR_LG = PITCH_LG + M, IR_LG = PITCH_LG - M * 1.25;   
export const RATIO = N_LG / N_SM, STEP_DEG = 360 / N_SM;         
export const GEAR_VIS = OR_LG + 6, PANEL_W = 160, RAIL_W = GEAR_VIS + PANEL_W, TOP_H = 76;

// === UI COMPONENTS ===
export function SpinningGear({ size = 22, color = "#4285f4" }: { size?: number; color?: string }) {
  return <Settings size={size} className="animate-spin" style={{ animationDuration: "6s", color }} />;
}

export function ChatCITLogo({ dark, onBlue = false, size = 22 }: { dark: boolean; onBlue?: boolean; size?: number }) {
  return (
    <span style={{ fontSize: size, fontWeight: 800, letterSpacing: "-0.5px", userSelect: "none", lineHeight: 1 }}>
      <span style={{ color: onBlue ? "#fff" : dark ? "#fff" : "#1a1a2e" }}>Chat</span>
      <span style={{ color: onBlue ? "#c0dcff" : dark ? "#4285f4" : "#1558d6" }}>CIT</span>
    </span>
  );
}

export function Avatar({ name, size = 32, bg = "#7c3aed" }: { name: string; size?: number; bg?: string }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: size * 0.38, fontWeight: 700, flexShrink: 0, textTransform: 'uppercase' }}>
      {name.charAt(0)}
    </div>
  );
}

export function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 px-1">
      {[0, 1, 2].map((i) => (
        <span key={i} className="inline-block size-1.5 rounded-full animate-bounce" style={{ background: "#4285f4", opacity: 0.7, animationDelay: `${i * 0.15}s`, animationDuration: "0.8s" }} />
      ))}
    </span>
  );
}

export function MarkdownText({ text, dark }: { text: string; dark: boolean }) {
  const primary = dark ? "#e8eaed" : "#1a1a2e";
  const body = dark ? "#c4c7cc" : "#4b5563";
  const lines = text.split("\n");
  
  return (
    <div>
      {lines.map((line, i) => (
        <p key={i} style={{ margin: "3px 0", lineHeight: 1.65, color: line === "" ? "transparent" : body, fontSize: 14 }}>
          {line === "" ? <div style={{ height: 6 }} /> : line.split("**").map((part, idx) => idx % 2 === 1 ? <strong key={idx} style={{ color: primary }}>{part}</strong> : part)}
        </p>
      ))}
    </div>
  );
}

export function GearAbs({ id, side, OR, IR, n, tint, holeColor, centerY, rotation, onClick }: any) {
  const pad = 8, S = (OR + pad) * 2, cx = S / 2, cy = S / 2;
  const hubR = Math.round(IR * 0.80), holeR = Math.round(IR * 0.40);
  const ff = (num: number) => num.toFixed(2);
  
  const buildGearPath = (cx: number, cy: number, OR: number, IR: number, n: number): string => {
    const step = (2 * Math.PI) / n;
    const hw = step * 0.20, sl = step * 0.08;
    let d = "";
    for (let i = 0; i < n; i++) {
        const a = i * step - Math.PI / 2;
        const a1 = a - hw - sl, a2 = a - hw, a3 = a + hw, a4 = a + hw + sl;
        if (i === 0) d += `M ${ff(cx + IR * Math.cos(a1))},${ff(cy + IR * Math.sin(a1))} `;
        else d += `A ${IR},${IR} 0 0,1 ${ff(cx + IR * Math.cos(a1))},${ff(cy + IR * Math.sin(a1))} `;
        d += `L ${ff(cx + OR * Math.cos(a2))},${ff(cy + OR * Math.sin(a2))} `;
        d += `A ${OR},${OR} 0 0,1 ${ff(cx + OR * Math.cos(a3))},${ff(cy + OR * Math.sin(a3))} `;
        d += `L ${ff(cx + IR * Math.cos(a4))},${ff(cy + IR * Math.sin(a4))} `;
    }
    return d + "Z";
  };
  
  const gPath = buildGearPath(cx, cy, OR, IR, n);
  
  return (
    <div onClick={onClick} style={{ position: "absolute", [side === "right" ? "right" : "left"]: -(OR + pad), top: centerY - (OR + pad), width: S, height: S, cursor: "pointer", transformOrigin: `${OR + pad}px ${OR + pad}px`, transform: `rotate(${rotation}deg)`, transition: "transform 0.6s cubic-bezier(0.34, 0.1, 0.2, 1)" }}>
      <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
        <defs>
          <radialGradient id={`${id}-body`} cx="36%" cy="30%" r="80%">
            <stop offset="0%" stopColor={tint.light} />
            <stop offset="52%" stopColor={tint.mid} />
            <stop offset="100%" stopColor={tint.dark} />
          </radialGradient>
        </defs>
        <path d={gPath} fill={`url(#${id}-body)`} stroke={tint.dark} strokeWidth={1} strokeOpacity={0.5} />
        <circle cx={cx} cy={cy} r={hubR} fill={tint.mid} stroke={tint.dark} strokeWidth={1} strokeOpacity={0.4} />
        <circle cx={cx} cy={cy} r={holeR + 8} fill={tint.dark} fillOpacity={0.6} />
        <circle cx={cx} cy={cy} r={holeR} fill={holeColor} stroke={tint.dark} strokeWidth={2} strokeOpacity={0.6} />
      </svg>
    </div>
  );
}

export function DayNightToggle({ dark, toggleDark }: { dark: boolean, toggleDark: () => void }) {
  return (
    <div className="toggleWrapper">
      <input 
        className="input" 
        id="dn" 
        type="checkbox" 
        checked={dark} 
        onChange={toggleDark} 
      />
      <label className="toggle" htmlFor="dn">
        <span className="toggle__handler">
          <span className="crater crater--1"></span>
          <span className="crater crater--2"></span>
          <span className="crater crater--3"></span>
        </span>
        <span className="star star--1"></span>
        <span className="star star--2"></span>
        <span className="star star--3"></span>
        <span className="star star--4"></span>
        <span className="star star--5"></span>
        <span className="star star--6"></span>
      </label>
    </div>
  );
}
export function GearboxLoader() {
  return (
    <div className="gearbox">
      <div className="overlay"></div>
      <div className="gear one">
        <div className="gear-inner">
          <div className="bar"></div><div className="bar"></div><div className="bar"></div>
        </div>
      </div>
      <div className="gear two">
        <div className="gear-inner">
          <div className="bar"></div><div className="bar"></div><div className="bar"></div>
        </div>
      </div>
      <div className="gear three">
        <div className="gear-inner">
          <div className="bar"></div><div className="bar"></div><div className="bar"></div>
        </div>
      </div>
      <div className="gear four large">
        <div className="gear-inner">
          <div className="bar"></div><div className="bar"></div><div className="bar"></div>
          <div className="bar"></div><div className="bar"></div><div className="bar"></div>
        </div>
      </div>
    </div>
  );
}