import React, { useState, useEffect, useMemo } from "react";
import { Search, X, MapPin, User, ChevronRight } from "lucide-react";
import { GearboxLoader } from "./ui/helpers";
import { API_URL } from "../config";

export function ChatDirectory({ dark, category, onClose, onCardClick }: any) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  
  const isFac = (category || "").toLowerCase().includes("facul") || (category || "").toLowerCase().includes("prof") || (category || "").toLowerCase().includes("committee");
  const [sortMode, setSortMode] = useState<"hierarchy" | "az" | "za">(isFac ? "hierarchy" : "az");

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/knowledge`)
      .then(res => res.json())
      .then(fetchedData => {
        const raw = Array.isArray(fetchedData) ? fetchedData : [];
        const filtered = raw.filter((item: any) => (item.category || "").toLowerCase() === (category || "").toLowerCase());
        setData(filtered);
      })
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, [category]);

  const subCategories = useMemo(() => {
    const subs = new Set(data.map(d => d.subcategory).filter(s => s && s !== "All"));
    return ["All", ...Array.from(subs)];
  }, [data]);

  const getHierarchyRank = (item: any) => {
      const text = (item.response || "").toLowerCase();
      const title = (item.display_name || item.keyword || "").toLowerCase();
      
      if (text.includes("chancellor") || title.includes("chancellor")) return 1;
      if ((text.includes("dean") && !text.includes("associate")) || (title.includes("dean") && !title.includes("associate"))) return 2;
      if (text.includes("associate dean") || title.includes("associate dean")) return 3;
      if (text.includes("chairman") || text.includes("chairperson") || text.includes("head")) return 4;
      if (text.includes("coordinator")) return 5;
      if (text.includes("part-time") || text.includes("part time") || text.includes("guest")) return 7;
      if (text.includes("faculty") || text.includes("instructor") || text.includes("professor")) return 6;
      return 8;
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchFilter = activeFilter === "All" || item.subcategory === activeFilter;
      const q = searchQuery.toLowerCase();
      const matchSearch = (item.display_name || "").toLowerCase().includes(q) || 
                          (item.keyword || "").toLowerCase().includes(q) || 
                          (item.subcategory || "").toLowerCase().includes(q);
      return matchFilter && matchSearch;
    }).sort((a, b) => {
       const nameA = a.display_name || (a.keyword ? a.keyword.split(',')[0] : "") || "";
       const nameB = b.display_name || (b.keyword ? b.keyword.split(',')[0] : "") || "";
       
       if (sortMode === "hierarchy" && isFac) {
           const rankA = getHierarchyRank(a);
           const rankB = getHierarchyRank(b);
           if (rankA !== rankB) return rankA - rankB;
           return nameA.localeCompare(nameB); // Same rank -> A-Z
       } else if (sortMode === "za") {
           return nameB.localeCompare(nameA);
       } else {
           return nameA.localeCompare(nameB);
       }
    });
  }, [data, activeFilter, searchQuery, sortMode, isFac]);

  const bg = dark ? "#1c1b22" : "#f4f5f7";
  const textPrimary = dark ? "#fff" : "#0f172a";
  const textMuted = dark ? "#94a3b8" : "#64748b";
  const cardBg = dark ? "rgba(255,255,255,0.03)" : "#fff";
  const border = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  const sortBtnStyle = (active: boolean) => ({
      padding: "6px 14px", borderRadius: 16, fontSize: 12, fontWeight: 700, cursor: "pointer", border: "none",
      background: active ? "#4285f4" : "transparent", color: active ? "#fff" : textMuted, transition: "all 0.2s"
  });

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: bg, minHeight: "100%", width: "100%", padding: 60 }}>
        <div style={{ transform: "scale(0.8)" }}><GearboxLoader /></div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", background: bg, minHeight: "100%", width: "100%", position: "relative" }}>
      {/* Header */}
      <div style={{ padding: "32px 32px 16px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: textPrimary, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 10 }}>
            <User size={26} color="#4285f4" /> {category.replace('Teachers', 'Professors')}
          </h2>
          <span style={{ fontSize: 14, color: textMuted }}>Browse and search within this category</span>
        </div>
        <button onClick={onClose} style={{ background: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)", border: "none", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: textPrimary, cursor: "pointer" }}>
          <X size={18} />
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ padding: "0 32px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", background: dark ? "rgba(255,255,255,0.05)" : "#fff", border: `1px solid ${border}`, borderRadius: 12, padding: "12px 16px", gap: 12 }}>
          <Search size={18} color={textMuted} />
          <input 
            type="text" 
            placeholder={`Search ${category.replace('Teachers', 'Professors')} by name...`} 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            style={{ flex: 1, background: "transparent", border: "none", color: textPrimary, outline: "none", fontSize: 15 }} 
          />
        </div>
      </div>

      {/* Filter Pills */}
      {subCategories.length > 1 && (
        <div style={{ padding: "0 32px 16px", display: "flex", flexWrap: "wrap", gap: 8 }}>
          {subCategories.map(sub => (
            <button 
              key={sub} 
              onClick={() => setActiveFilter(sub)} 
              style={{ 
                padding: "8px 16px", borderRadius: 20, 
                border: `1px solid ${activeFilter === sub ? "#4285f4" : border}`, 
                background: activeFilter === sub ? "#4285f4" : dark ? "rgba(255,255,255,0.05)" : "#e2e8f0", 
                color: activeFilter === sub ? "#fff" : textPrimary, 
                fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "normal", 
                textAlign: "left", lineHeight: 1.3, transition: "all 0.2s" 
              }}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {/* Sorting Controls */}
      <div style={{ padding: "0 32px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: textMuted, fontWeight: 600 }}>{filteredData.length} records</span>
          <div style={{ display: "flex", gap: 4, background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", padding: 4, borderRadius: 20 }}>
              {isFac && <button onClick={() => setSortMode("hierarchy")} style={sortBtnStyle(sortMode === "hierarchy")}>Hierarchy</button>}
              <button onClick={() => setSortMode("az")} style={sortBtnStyle(sortMode === "az")}>A-Z</button>
              <button onClick={() => setSortMode("za")} style={sortBtnStyle(sortMode === "za")}>Z-A</button>
          </div>
      </div>

      {/* INFINITE SCROLLABLE LIST */}
      <div className="no-scrollbar" style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: "0 32px 40px", display: "flex", flexDirection: "column", gap: 12, touchAction: "pan-y", WebkitOverflowScrolling: "touch" }}>
        {filteredData.length === 0 ? (
          <div style={{ textAlign: "center", color: textMuted, padding: 40, fontSize: 15, fontWeight: 500 }}>No results found.</div>
        ) : (
          filteredData.map(item => (
            <div 
              key={item.id} 
              onClick={() => onCardClick(item.display_name || (item.keyword ? item.keyword.split(',')[0] : ""))}
              style={{ display: "flex", alignItems: "center", gap: 16, padding: 16, background: cardBg, border: `1px solid ${border}`, borderRadius: 16, cursor: "pointer", transition: "all 0.2s" }}
            >
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                {item.picture_url && !item.picture_url.toLowerCase().includes(".pdf") ? (
                  <img src={item.picture_url} alt="Profile" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                  <User size={24} color="#4285f4" />
                )}
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: textPrimary }}>{item.display_name || (item.keyword ? item.keyword.split(',')[0] : "")}</span>
                {item.subcategory && item.subcategory !== "All" && (
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#4285f4", display: "flex", alignItems: "center", gap: 4 }}>
                    <MapPin size={12} /> {item.subcategory}
                  </span>
                )}
                <span style={{ fontSize: 13, color: textMuted, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.response}</span>
              </div>
              <ChevronRight size={20} color={textMuted} style={{ flexShrink: 0 }} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
