import React, { useState, useEffect } from "react";
import { Database, HelpCircle, Bug, Plus, Save, Edit2, Trash2, CheckCircle, UploadCloud, Users, Key, Search, X, TrendingUp, RotateCcw, RefreshCw } from "lucide-react";
import { GearboxLoader } from "./ui/helpers";
import { Knowledge, Unanswered, BugReport, User } from "../types";
import { API_URL } from "../config";

const defaultCategoryColors: Record<string, string> = {
  "All": "#6b7280", 
  "Organizations": "#8b5cf6", 
  "Majors": "#3b82f6", 
  "Documents": "#10b981", 
  "Handbook": "#f59e0b",
  "Industry Partners": "#ef4444",
  "Facilities": "#14b8a6",
  "Faculty & Teachers": "#ec4899",
  "Magna Carta": "#eab308", 
  "General": "#ef4444"
};

const getColorForCategory = (cat: string) => {
  if (defaultCategoryColors[cat]) return defaultCategoryColors[cat];
  let hash = 0;
  for (let i = 0; i < cat.length; i++) hash = cat.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${hash % 360}, 70%, 55%)`;
}

export function AdminPanel({
  dark, showToast, currentUser,
  activeTab, setActiveTab,
  activeCategoryTab, activeDeptTab,
  allCategories, setDbCategories
}: {
  dark: boolean; showToast: (msg: string, type: 'success' | 'error' | 'info') => void; currentUser: User;
  activeTab: 'knowledge'|'faq'|'unanswered'|'bugs'|'users';
  setActiveTab: (t: 'knowledge'|'faq'|'unanswered'|'bugs'|'users') => void;
  activeCategoryTab: string;
  activeDeptTab: string;
  allCategories: string[];
  setDbCategories: (cats: string[]) => void;
}) {
  
  const [data, setData] = useState<Knowledge[]>([]);
  const [unanswered, setUnanswered] = useState<Unanswered[]>([]);
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [users, setUsers] = useState<User[]>([]); 

  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [form, setForm] = useState({ keyword: "", response: "", picture_url: "", category: "Handbook" });
  const [keywordInput, setKeywordInput] = useState(""); 
  
  const [uploadingImage, setUploadingImage] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); 
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false); 

  const [fullScreenMedia, setFullScreenMedia] = useState<string | null>(null);

  const [modal, setModal] = useState<{
    isOpen: boolean, 
    type: 'confirm' | 'prompt', 
    title: string, 
    message: string, 
    inputValue: string,
    onConfirm: (val?: string) => void
  }>({ isOpen: false, type: 'confirm', title: '', message: '', inputValue: '', onConfirm: () => {} });

  const CLOUD_NAME = "xjzuq0fq";       
  const UPLOAD_PRESET = "chatcit_preset"; 

  const fetchData = async () => {
    setIsSyncing(true);
    try {
      const [kRes, uRes, bRes, userRes] = await Promise.all([
        fetch(`${API_URL}/knowledge`),
        fetch(`${API_URL}/unanswered`),
        fetch(`${API_URL}/bugs`),
        fetch(`${API_URL}/users`) 
      ]);
      const kData = await kRes.json();
      setData(kData);
      setUnanswered(await uRes.json());
      setBugs(await bRes.json());
      setUsers(await userRes.json());
      
      // Send the dynamic db categories UP to App.tsx for the Sidebar
      setDbCategories(Array.from(new Set(kData.map((d: any) => d.category || "Handbook"))));
    } catch (e) { 
      showToast("Failed to fetch dashboard data.", "error"); 
    } finally { 
      setLoading(false); 
      setIsSyncing(false);
    }
  };
  
  useEffect(() => { fetchData(); }, []);
  useEffect(() => { setSearchQuery(""); }, [activeTab]);

  const keywordsList = form.keyword ? form.keyword.split(',').map(k => k.trim()).filter(Boolean) : [];

  const handleAddKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = keywordInput.trim().replace(/,/g, '');
      if (val && !keywordsList.includes(val)) {
        setForm({ ...form, keyword: [...keywordsList, val].join(', ') });
      }
      setKeywordInput("");
    }
  };

  const removeKeyword = (toRemove: string) => {
    setForm({ ...form, keyword: keywordsList.filter(k => k !== toRemove).join(', ') });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("cloud_name", CLOUD_NAME);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData
      });
      const uploadedData = await res.json();
      
      if (uploadedData.secure_url) {
        setForm({ ...form, picture_url: uploadedData.secure_url });
        showToast("Image uploaded successfully!", "success");
      } else {
        showToast(`Upload failed: ${uploadedData.error?.message || "Check Console"}`, "error");
      }
    } catch (err) {
      showToast("Network error. Check your connection or Cloudinary API URL.", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveKnowledge = async (id?: number) => {
    if (!form.keyword.trim() || !form.response.trim()) { 
      showToast("At least one Keyword and a Response are required.", "error"); 
      return; 
    }
    try {
      const method = id ? "PUT" : "POST";
      const url = id ? `${API_URL}/knowledge/${id}` : `${API_URL}/knowledge`;
      await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      setEditingId(null); 
      setForm({ keyword: "", response: "", picture_url: "", category: "Handbook" }); 
      setKeywordInput("");
      fetchData();
      showToast(id ? "Record updated!" : "New record added!", "success");
    } catch (e) { 
      showToast("Error saving record.", "error"); 
    }
  };

  const handleDelete = (type: 'knowledge'|'unanswered'|'bugs'|'users', id: number) => {
    setModal({
      isOpen: true,
      type: 'confirm',
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete this ${type === 'users' ? 'user account' : 'entry'}? This action cannot be undone.`,
      inputValue: '',
      onConfirm: async () => {
        try { 
          await fetch(`${API_URL}/${type}/${id}`, { method: "DELETE" }); 
          fetchData(); 
          showToast("Deleted successfully.", "info");
        } catch (e) { 
          showToast("Error deleting item.", "error"); 
        }
      }
    });
  };

  const handleResetPassword = (userId: number, currentEmail: string) => {
    setModal({
      isOpen: true,
      type: 'prompt',
      title: 'Reset Password',
      message: `Enter a new temporary password for student: ${currentEmail}`,
      inputValue: '',
      onConfirm: async (newPassword) => {
        if (!newPassword || newPassword.trim() === "") {
          showToast("Password cannot be empty.", "error");
          return;
        }
        try {
          const res = await fetch(`${API_URL}/users/${userId}/reset-password`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ newPassword })
          });
          if (res.ok) {
            showToast("Password successfully reset!", "success");
          } else {
            showToast("Failed to reset password.", "error");
          }
        } catch (e) {
          showToast("Error resetting password.", "error");
        }
      }
    });
  };

  const handleResetFaqCounters = () => {
    setModal({
      isOpen: true,
      type: 'confirm',
      title: 'Reset FAQ Analytics',
      message: 'Are you sure you want to completely reset all "Times Asked" counters back to zero? This action cannot be undone.',
      inputValue: '',
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_URL}/faqs/reset`, { method: "PUT" });
          if (res.ok) {
            showToast("FAQ counters have been reset to zero.", "success");
            fetchData();
          } else {
            showToast("Failed to reset counters.", "error");
          }
        } catch (e) {
          showToast("Error resetting counters.", "error");
        }
      }
    });
  };

  const convertToKnowledge = (question: string, id: number) => {
    fetch(`${API_URL}/unanswered/${id}`, { method: "DELETE" }).then(fetchData);
    setActiveTab('knowledge');
    setEditingId(0);
    setForm({ keyword: question, response: "", picture_url: "", category: "Handbook" });
    setKeywordInput("");
    showToast("Moved to Knowledge Base draft.", "info");
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      const res = await fetch(`${API_URL}/users/${userId}/role`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole, requesterRole: currentUser?.role })
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to update role");
      showToast("Role updated!", "success");
      fetchData();
    } catch (e: any) { 
      showToast(e.message, "error"); 
    }
  };

  const q = searchQuery.toLowerCase();
  
  // Apply Filters based on props from Sidebar
  const filteredData = data.filter(d => 
    (activeCategoryTab === "All" || (d as any).category === activeCategoryTab) &&
    (d.keyword.toLowerCase().includes(q) || d.response.toLowerCase().includes(q))
  );

  const filteredUnanswered = unanswered.filter(u => u.question.toLowerCase().includes(q));
  const filteredBugs = bugs.filter(b => b.user_info.toLowerCase().includes(q) || b.description.toLowerCase().includes(q));
  
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(q) || (u.username && u.username.toLowerCase().includes(q));
    const matchesDept = activeDeptTab === "All" || (u.department || "Others") === activeDeptTab;
    return matchesSearch && matchesDept;
  });

  const departmentCounts = users.reduce((acc, u) => {
    const dept = (u as any).department || "Others";
    acc[dept] = (acc[dept] || 0) + 1;
    acc["Total Users"] = (acc["Total Users"] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const bg = dark ? "#25242c" : "#fff";
  const border = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const textMuted = dark ? "#9aa0a6" : "#6b7280";

  if (loading) {
    return (
      <div style={{ display: "flex", height: "80vh", width: "100%", alignItems: "center", justifyContent: "center" }}>
        <div style={{ transform: "scale(0.8)" }}>
          <GearboxLoader />
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600, display: "flex", alignItems: "center", gap: 10 }}>
          <Database size={24} color="#4285f4" /> Admin Dashboard
        </h2>
        <div style={{ display: "flex", background: dark ? "rgba(255,255,255,0.05)" : "#f3f4f6", borderRadius: 10, padding: 4, flexWrap: "nowrap", overflowX: "auto", maxWidth: "100%" }}>
          <button onClick={() => setActiveTab('knowledge')} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, border: "none", background: activeTab === 'knowledge' ? "#4285f4" : "transparent", color: activeTab === 'knowledge' ? "#fff" : textMuted, fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}>
            <Database size={14} /> Database
          </button>
          <button onClick={() => setActiveTab('faq')} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, border: "none", background: activeTab === 'faq' ? "#4285f4" : "transparent", color: activeTab === 'faq' ? "#fff" : textMuted, fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}>
            <TrendingUp size={14} /> FAQ Analytics
          </button>
          <button onClick={() => setActiveTab('unanswered')} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, border: "none", background: activeTab === 'unanswered' ? "#4285f4" : "transparent", color: activeTab === 'unanswered' ? "#fff" : textMuted, fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}>
            <HelpCircle size={14} /> Unanswered <span style={{ background: activeTab === 'unanswered' ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.1)", padding: "2px 6px", borderRadius: 12, fontSize: 11 }}>{unanswered.length}</span>
          </button>
          <button onClick={() => setActiveTab('bugs')} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, border: "none", background: activeTab === 'bugs' ? "#4285f4" : "transparent", color: activeTab === 'bugs' ? "#fff" : textMuted, fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}>
            <Bug size={14} /> Bugs <span style={{ background: activeTab === 'bugs' ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.1)", padding: "2px 6px", borderRadius: 12, fontSize: 11 }}>{bugs.length}</span>
          </button>
          <button onClick={() => setActiveTab('users')} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, border: "none", background: activeTab === 'users' ? "#4285f4" : "transparent", color: activeTab === 'users' ? "#fff" : textMuted, fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}>
            <Users size={14} /> Users
          </button>
        </div>
      </div>

      {activeTab === 'users' && (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
          {Object.entries(departmentCounts)
            .filter(([dept]) => dept === "Total Users" || dept === "Others") // KEEP ONLY THESE AT THE TOP
            .sort((a,b) => b[1]-a[1])
            .map(([dept, count]) => (
            <div key={dept} style={{ padding: "12px 16px", borderRadius: 8, border: `1px solid ${border}`, background: dark ? "rgba(255,255,255,0.02)" : "#f9fafb", display: "flex", flexDirection: "column", minWidth: 140 }}>
              <span style={{ fontSize: 11, color: textMuted, textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>{dept}</span>
              <span style={{ fontSize: 22, color: dept === "Total Users" ? "#4285f4" : (dark ? "#fff" : "#000"), fontWeight: 700 }}>{count}</span>
            </div>
          ))}
        </div>
      )}

      {/* SEARCH AND NEW ENTRY BUTTONS */}
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: bg, border: `1px solid ${border}`, padding: "8px 14px", borderRadius: 8, flex: 1, minWidth: 250 }}>
          <Search size={16} color={textMuted} />
          <input 
            type="text" 
            placeholder={`Search ${activeTab}...`} 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            style={{ border: "none", background: "transparent", outline: "none", width: "100%", color: "inherit", fontSize: 14 }}
          />
        </div>

        <button onClick={() => { fetchData(); showToast("Dashboard Synced!", "success"); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'transparent', border: `1px solid ${border}`, color: dark ? '#fff' : '#000', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}>
          <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} /> Sync Data
        </button>

        {activeTab === 'knowledge' && editingId !== 0 && (
          <button onClick={() => { setEditingId(0); setForm({ keyword: "", response: "", picture_url: "", category: "Handbook" }); setKeywordInput(""); }} style={{ display: "flex", alignItems: "center", gap: 6, background: "#4285f4", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 500, whiteSpace: "nowrap" }}>
            <Plus size={16} /> Add Entry
          </button>
        )}
      </div>

      {activeTab === 'knowledge' && (
        <>
          {editingId !== null && (
            <div style={{ background: bg, padding: 20, borderRadius: 12, border: `1px solid ${border}`, marginBottom: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{editingId === 0 ? "Add New Knowledge" : "Edit Entry"}</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 12, color: textMuted }}>Category</span>
                <select 
                  value={form.category} 
                  onChange={e => setForm({ ...form, category: e.target.value })} 
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${border}`, background: dark ? "rgba(255,255,255,0.05)" : "#f3f4f6", color: "inherit", outline: "none" }}
                >
                  {/* FIX: Set option background strictly so it isn't white text on white background */}
                  {allCategories.filter(c => c !== "All").map(c => (
                    <option key={c} value={c} style={{ background: dark ? '#1e1e24' : '#fff', color: dark ? '#fff' : '#000' }}>{c}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 12, color: textMuted }}>Trigger Keywords (Press Enter or Comma to add)</span>
                <div style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${border}`, background: "transparent", display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                  {keywordsList.map(kw => (
                    <span key={kw} style={{ background: "#4285f4", color: "#fff", padding: "4px 10px", borderRadius: 16, fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                      {kw} <X size={12} cursor="pointer" onClick={() => removeKeyword(kw)} style={{ opacity: 0.8 }} />
                    </span>
                  ))}
                  <input 
                    value={keywordInput} 
                    onChange={e => setKeywordInput(e.target.value)} 
                    onKeyDown={handleAddKeyword}
                    placeholder={keywordsList.length === 0 ? "e.g. grading system, passing score" : "Add another..."}
                    style={{ flex: 1, minWidth: 150, border: "none", background: "transparent", color: "inherit", outline: "none", fontSize: 14 }}
                  />
                </div>
              </div>

              <textarea value={form.response} onChange={(e) => setForm({ ...form, response: e.target.value })} placeholder="Bot Response / Factual Rules..." rows={4} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${border}`, background: "transparent", color: "inherit", outline: "none", resize: "vertical" }} />
              
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <input value={form.picture_url} onChange={(e) => setForm({ ...form, picture_url: e.target.value })} placeholder="Picture URL (Upload or paste link)" style={{ flex: 1, minWidth: 200, padding: "10px 12px", borderRadius: 8, border: `1px solid ${border}`, background: "transparent", color: "inherit", outline: "none" }} />
                <label style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 8, background: dark ? "rgba(255,255,255,0.1)" : "#f3f4f6", border: `1px solid ${border}`, cursor: uploadingImage ? "wait" : "pointer", fontWeight: 500, fontSize: 14, whiteSpace: "nowrap" }}>
                  <UploadCloud size={16} /> {uploadingImage ? "Uploading..." : "Upload Image"}
                  <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} style={{ display: "none" }} />
                </label>
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button onClick={() => { setEditingId(null); setKeywordInput(""); }} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "transparent", color: textMuted, cursor: "pointer", fontWeight: 500 }}>Cancel</button>
                <button onClick={() => handleSaveKnowledge(editingId === 0 ? undefined : editingId)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, border: "none", background: "#4285f4", color: "#fff", cursor: "pointer", fontWeight: 500 }}><Save size={14} /> Save to Database</button>
              </div>
            </div>
          )}

          <div style={{ background: bg, borderRadius: 12, border: `1px solid ${border}`, overflowX: "auto" }}>
            {filteredData.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", opacity: 0.5 }}>No results found.</div>
            ) : (
              <table style={{ width: "100%", minWidth: 600, borderCollapse: "collapse", textAlign: "left", fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${border}`, background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}>
                    <th style={{ padding: "14px 16px", fontWeight: 600, width: "30%" }}>Keywords</th>
                    <th style={{ padding: "14px 16px", fontWeight: 600 }}>Factual Response</th>
                    <th style={{ padding: "14px 16px", fontWeight: 600, width: 100, textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row: any) => (
                    <tr key={row.id} style={{ borderBottom: `1px solid ${border}` }}>
                      <td style={{ padding: "14px 16px", verticalAlign: "top" }}>
                        <div style={{ fontSize: 10, color: getColorForCategory(row.category || "Handbook"), fontWeight: 700, marginBottom: 6, textTransform: "uppercase" }}>{row.category || "Handbook"}</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {row.keyword.split(',').map((kw: string, idx: number) => kw.trim() ? (
                            <span key={idx} style={{ background: dark ? "rgba(255,255,255,0.08)" : "#f1f5f9", color: dark ? "#e2e8f0" : "#334155", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 500, border: `1px solid ${border}`, whiteSpace: "nowrap" }}>
                              {kw.trim()}
                            </span>
                          ) : null)}
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", verticalAlign: "top", opacity: 0.9, lineHeight: 1.5 }}>
                        <div style={{ marginBottom: row.picture_url ? 8 : 0 }}>{row.response}</div>
                        {row.picture_url && (
                          row.picture_url.toLowerCase().includes('.pdf') ? (
                            <a href={row.picture_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#4285f4", textDecoration: "none", display: "inline-flex", alignItems: "center", padding: "4px 8px", background: dark ? "rgba(255,255,255,0.08)" : "#f3f4f6", borderRadius: 6, fontWeight: 500 }}>📄 Attached PDF</a>
                          ) : (
                            <button onClick={() => setFullScreenMedia(row.picture_url!)} style={{ display: "inline-block", background: "none", border: "none", padding: 0, cursor: "zoom-in", marginTop: 4 }} title="Click to enlarge">
                               <img src={row.picture_url} alt="Attached" style={{ height: 48, borderRadius: 6, border: `1px solid ${border}`, objectFit: 'cover' }} />
                            </button>
                          )
                        )}
                      </td>
                      <td style={{ padding: "14px 16px", verticalAlign: "top", textAlign: "right", whiteSpace: "nowrap" }}>
                        <button onClick={() => { setForm({ keyword: row.keyword, response: row.response, picture_url: row.picture_url || "", category: row.category || "Handbook" }); setKeywordInput(""); setEditingId(row.id); }} style={{ background: "none", border: "none", color: "#4285f4", cursor: "pointer", padding: 6 }} title="Edit"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete('knowledge', row.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: 6 }} title="Delete"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {activeTab === 'faq' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handleResetFaqCounters} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, border: "none", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
              <RotateCcw size={14} /> Reset All Counters
            </button>
          </div>
          <div style={{ background: bg, borderRadius: 12, border: `1px solid ${border}`, overflowX: "auto" }}>
            {data.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", opacity: 0.5 }}>No data found.</div>
            ) : (
              <table style={{ width: "100%", minWidth: 600, borderCollapse: "collapse", textAlign: "left", fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${border}`, background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}>
                    <th style={{ padding: "14px 16px", fontWeight: 600, width: 60 }}>Rank</th>
                    <th style={{ padding: "14px 16px", fontWeight: 600 }}>Keywords</th>
                    <th style={{ padding: "14px 16px", fontWeight: 600 }}>Factual Response</th>
                    <th style={{ padding: "14px 16px", fontWeight: 600, textAlign: "right" }}>Times Asked</th>
                  </tr>
                </thead>
                <tbody>
                  {[...data].sort((a: any, b: any) => (b.usage_count || 0) - (a.usage_count || 0)).map((row: any, index) => (
                    <tr key={row.id} style={{ borderBottom: `1px solid ${border}` }}>
                      <td style={{ padding: "14px 16px", verticalAlign: "top", fontWeight: 700, color: "#4285f4" }}>#{index + 1}</td>
                      <td style={{ padding: "14px 16px", verticalAlign: "top", fontWeight: 500 }}>{row.keyword}</td>
                      <td style={{ padding: "14px 16px", verticalAlign: "top", opacity: 0.9, lineHeight: 1.5 }}>
                         <div style={{ maxHeight: 42, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                           {row.response}
                         </div>
                      </td>
                      <td style={{ padding: "14px 16px", verticalAlign: "top", textAlign: "right", fontWeight: 600, fontSize: 16 }}>{row.usage_count || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === 'unanswered' && (
        <div style={{ background: bg, borderRadius: 12, border: `1px solid ${border}`, overflowX: "auto" }}>
          {filteredUnanswered.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: textMuted }}>No unanswered queries found.</div>
          ) : (
            <table style={{ width: "100%", minWidth: 600, borderCollapse: "collapse", textAlign: "left", fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${border}`, background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}>
                  <th style={{ padding: "14px 16px", fontWeight: 600 }}>Unanswered Question from User</th>
                  <th style={{ padding: "14px 16px", fontWeight: 600, width: 200, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUnanswered.map((row) => (
                  <tr key={row.id} style={{ borderBottom: `1px solid ${border}` }}>
                    <td style={{ padding: "14px 16px", verticalAlign: "middle", fontWeight: 500 }}>"{row.question}"</td>
                    <td style={{ padding: "14px 16px", verticalAlign: "middle", textAlign: "right", whiteSpace: "nowrap" }}>
                      <button onClick={() => convertToKnowledge(row.question, row.id)} style={{ background: "none", border: "none", color: "#10b981", cursor: "pointer", padding: "6px 12px", fontWeight: 600, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}><Plus size={14} /> Add to DB</button>
                      <button onClick={() => handleDelete('unanswered', row.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: 6, marginLeft: 8 }} title="Delete"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'bugs' && (
        <div style={{ background: bg, borderRadius: 12, border: `1px solid ${border}`, overflowX: "auto" }}>
          {filteredBugs.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: textMuted }}>No bug reports found.</div>
          ) : (
            <table style={{ width: "100%", minWidth: 600, borderCollapse: "collapse", textAlign: "left", fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${border}`, background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}>
                  <th style={{ padding: "14px 16px", fontWeight: 600, width: 150 }}>Reported By</th>
                  <th style={{ padding: "14px 16px", fontWeight: 600 }}>Issue Description</th>
                  <th style={{ padding: "14px 16px", fontWeight: 600, width: 80, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBugs.map((row) => (
                  <tr key={row.id} style={{ borderBottom: `1px solid ${border}` }}>
                    <td style={{ padding: "14px 16px", verticalAlign: "top", color: textMuted, fontSize: 13 }}>{row.user_info}</td>
                    <td style={{ padding: "14px 16px", verticalAlign: "top", opacity: 0.9, lineHeight: 1.5 }}>{row.description}</td>
                    <td style={{ padding: "14px 16px", verticalAlign: "top", textAlign: "right" }}>
                      <button onClick={() => handleDelete('bugs', row.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: 6 }} title="Resolve / Delete"><CheckCircle size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div style={{ background: bg, borderRadius: 12, border: `1px solid ${border}`, overflowX: "auto" }}>
          {filteredUsers.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: textMuted }}>No users found.</div>
          ) : (
            <table style={{ width: "100%", minWidth: 600, borderCollapse: "collapse", textAlign: "left", fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${border}`, background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}>
                  <th style={{ padding: "14px 16px", fontWeight: 600 }}>Username / Email</th>
                  <th style={{ padding: "14px 16px", fontWeight: 600 }}>Department</th>
                  <th style={{ padding: "14px 16px", fontWeight: 600 }}>Role</th>
                  <th style={{ padding: "14px 16px", fontWeight: 600, width: 140, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user: any) => (
                  <tr key={user.id} style={{ borderBottom: `1px solid ${border}` }}>
                    <td style={{ padding: "14px 16px", verticalAlign: "middle", fontWeight: 500 }}>
                      {user.username || "—"} <br />
                      <span style={{ fontSize: 12, color: textMuted, fontWeight: 400 }}>{user.email}</span>
                    </td>
                    <td style={{ padding: "14px 16px", verticalAlign: "middle", color: dark ? "#fff" : "#000" }}>{user.department || "Others"}</td>
                    <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                      
                      {/* FIX: Strictly disabled for Admins trying to edit Superadmins, 
                               but allows Admins to change roles of Students. */}
                      <select 
                        value={user.role}
                        disabled={currentUser?.role !== 'superadmin' && user.role === 'superadmin'}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        style={{ 
                          padding: "6px 8px", 
                          borderRadius: 6, 
                          background: dark ? 'rgba(255,255,255,0.05)' : '#f3f4f6', 
                          color: user.role === 'admin' || user.role === 'superadmin' ? '#4285f4' : textMuted, 
                          border: `1px solid ${border}`, 
                          outline: "none", 
                          cursor: (currentUser?.role !== 'superadmin' && user.role === 'superadmin') ? "not-allowed" : "pointer",
                          fontWeight: 600 
                        }}
                      >
                        <option value="student" style={{ background: dark ? '#1e1e24' : '#fff', color: dark ? '#fff' : '#000' }}>Student</option>
                        <option value="admin" style={{ background: dark ? '#1e1e24' : '#fff', color: dark ? '#fff' : '#000' }}>Admin</option>
                        {(currentUser?.role === 'superadmin' || user.role === 'superadmin') && (
                          <option value="superadmin" style={{ background: dark ? '#1e1e24' : '#fff', color: dark ? '#fff' : '#000' }}>Superadmin</option>
                        )}
                      </select>

                    </td>
                    <td style={{ padding: "14px 16px", verticalAlign: "middle", textAlign: "right", whiteSpace: "nowrap" }}>
                      <button onClick={() => handleResetPassword(user.id, user.email)} style={{ background: "none", border: "none", color: "#f59e0b", cursor: "pointer", padding: 6 }} title="Generate New Password"><Key size={16} /></button>
                      <button onClick={() => handleDelete('users', user.id)} disabled={user.role === 'admin' || user.role === 'superadmin'} style={{ background: "none", border: "none", color: (user.role === 'admin' || user.role === 'superadmin') ? textMuted : "#ef4444", cursor: (user.role === 'admin' || user.role === 'superadmin') ? "not-allowed" : "pointer", padding: 6, marginLeft: 4 }} title={(user.role === 'admin' || user.role === 'superadmin') ? "Cannot delete admins" : "Delete User Account"}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {modal.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: 24, width: '100%', maxWidth: 400, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 600, color: dark ? '#fff' : '#000' }}>{modal.title}</h3>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: textMuted, lineHeight: 1.5 }}>{modal.message}</p>
            
            {modal.type === 'prompt' && (
              <input 
                type="text" 
                autoFocus
                placeholder="Type new password..." 
                onChange={e => setModal({...modal, inputValue: e.target.value})}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${border}`, background: dark ? 'rgba(255,255,255,0.05)' : '#f3f4f6', color: 'inherit', outline: 'none', marginBottom: 20 }}
              />
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setModal({ ...modal, isOpen: false })} 
                style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'transparent', color: textMuted, cursor: 'pointer', fontWeight: 500 }}
              >
                Cancel
              </button>
              <button 
                onClick={() => { modal.onConfirm(modal.inputValue); setModal({ ...modal, isOpen: false }); }} 
                style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: "#4285f4", color: "#fff", cursor: 'pointer', fontWeight: 500 }}
              >
                {modal.type === 'prompt' ? 'Save Password' : 'Yes, Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {fullScreenMedia && (
        <div onClick={() => setFullScreenMedia(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999999, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', padding: 24 }}>
          <img src={fullScreenMedia} alt="Fullscreen View" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 8, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }} />
          <button onClick={() => setFullScreenMedia(null)} style={{ position: 'absolute', top: 24, right: 24, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
            <X size={24} />
          </button>
        </div>
      )}

    </div>
  );
}