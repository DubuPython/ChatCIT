import React, { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, User, Briefcase, MapPin, X } from "lucide-react";
import { API_URL } from "../config";
import { Knowledge } from "../types";
import { GearboxLoader } from "./ui/helpers";

export function ChatDirectory({ dark, category, onClose }: { dark: boolean; category: string; onClose: () => void }) {
  const [data, setData] = useState<Knowledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/knowledge`)
      .then(res => res.json())
      .then(d => {
        const filtered = d.filter((item: any) => item.category === category);
        setData(filtered);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [category]);

  useEffect(() => { setPage(1); }, [search]);

  const q = search.toLowerCase();
  const filteredData = data.filter(d => 
    d.keyword.toLowerCase().includes(q) || 
    d.response.toLowerCase().includes(q) || 
    (d as any).subcategory?.toLowerCase().includes(q)
  );

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE) || 1;
  const currentData = filteredData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const bg = dark ? "#1e1e24" : "#ffffff";
  const border = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const textPrimary = dark ? "#ffffff" : "#111827";
  const textMuted = dark ? "#9ca3af" : "#6b7280";

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 16px", display: "flex", flexDirection: "column", height: "100%", animation: "fadeIn 0.3s ease" }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: textPrimary, margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
            {category === "Industry Partners" ? <Briefcase size={24} color="#4285f4"/> : <User size={24} color="#4285f4"/>}
            {category.toUpperCase()}
          </h2>
          <p style={{ fontSize: 14, color: textMuted, margin: "4px 0 0 0" }}>Browse and search official {category.toLowerCase()} records.</p>
        </div>
        <button onClick={onClose} style={{ background: dark ? "rgba(255,255,255,0.05)" : "#f3f4f6", border: "none", color: textPrimary, width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = dark ? "rgba(255,255,255,0.1)" : "#e5e7eb"} onMouseLeave={e => e.currentTarget.style.background = dark ? "rgba(255,255,255,0.05)" : "#f3f4f6"}>
          <X size={18} />
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, background: dark ? "rgba(0,0,0,0.2)" : "#f9fafb", border: `1px solid ${border}`, padding: "12px 16px", borderRadius: 12, marginBottom: 24 }}>
        <Search size={18} color={textMuted} />
        <input 
          type="text" 
          placeholder={`Search ${category} by name or department...`} 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          style={{ border: "none", background: "transparent", outline: "none", width: "100%", color: textPrimary, fontSize: 15 }}
        />
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
        {loading ? (
          <div style={{ padding: 40, display: "flex", justifyContent: "center" }}><div style={{ transform: "scale(0.6)" }}><GearboxLoader /></div></div>
        ) : currentData.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: textMuted, background: dark ? "rgba(255,255,255,0.02)" : "#f9fafb", borderRadius: 12, border: `1px dashed ${border}` }}>
            No records found.
          </div>
        ) : (
          currentData.map(item => (
            <div key={item.id} style={{ display: "flex", gap: 16, background: bg, border: `1px solid ${border}`, padding: 20, borderRadius: 16, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: dark ? "rgba(255,255,255,0.05)" : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0, border: `1px solid ${border}` }}>
                {item.picture_url && !item.picture_url.toLowerCase().includes('.pdf') ? (
                  <img src={item.picture_url} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  category === "Industry Partners" ? <Briefcase size={28} color="#4285f4" /> : <User size={28} color="#4285f4" />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: textPrimary, margin: "0 0 4px 0" }}>{item.keyword.split(',')[0]}</h3>
                {(item as any).subcategory && (item as any).subcategory !== "All" && (
                  <div style={{ fontSize: 13, color: "#4285f4", fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
                    <MapPin size={12} /> {(item as any).subcategory}
                  </div>
                )}
                <div style={{ fontSize: 14, color: textMuted, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {item.response}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {!loading && filteredData.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 0 0 0", marginTop: "auto" }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: dark ? "rgba(255,255,255,0.05)" : "#f3f4f6", border: "none", color: page === 1 ? textMuted : textPrimary, cursor: page === 1 ? "not-allowed" : "pointer", fontWeight: 600, transition: "background 0.2s" }} onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.background = dark ? "rgba(255,255,255,0.1)" : "#e5e7eb")} onMouseLeave={e => !e.currentTarget.disabled && (e.currentTarget.style.background = dark ? "rgba(255,255,255,0.05)" : "#f3f4f6")}>
            <ChevronLeft size={16} /> Previous
          </button>
          <div style={{ fontSize: 14, color: textPrimary, fontWeight: 700 }}>Page {page} of {totalPages}</div>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: dark ? "rgba(255,255,255,0.05)" : "#f3f4f6", border: "none", color: page === totalPages ? textMuted : textPrimary, cursor: page === totalPages ? "not-allowed" : "pointer", fontWeight: 600, transition: "background 0.2s" }} onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.background = dark ? "rgba(255,255,255,0.1)" : "#e5e7eb")} onMouseLeave={e => !e.currentTarget.disabled && (e.currentTarget.style.background = dark ? "rgba(255,255,255,0.05)" : "#f3f4f6")}>
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}