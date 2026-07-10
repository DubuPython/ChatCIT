import React, { useState } from "react";
import { Bug, X } from "lucide-react";
import { User } from "../../types";
import { API_URL } from "../../config";

export function BugModal({ dark, user, onClose, showToast }: { dark: boolean; user: User | null; onClose: () => void; showToast: (msg: string, type: 'success'|'error'|'info') => void }) {
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const bg = dark ? "#1c1b22" : "#fff";
  const textPrimary = dark ? "#e8eaed" : "#1a1a2e";
  const textMuted = dark ? "#9aa0a6" : "#6b7280";
  const inputBg = dark ? "#25242c" : "#f8f9fa";
  const inputBorder = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  const handleSubmit = async () => {
    if (!desc.trim()) return;
    setLoading(true);
    try {
      await fetch(`${API_URL}/bugs`, {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_info: user ? (user.username || user.email) : "Guest", description: desc })
      });
      showToast("Bug report submitted successfully! Thank you.", "success");
      onClose();
    } catch (e: any) {
      showToast("Failed to submit bug report.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
      <div style={{ background: bg, padding: 32, borderRadius: 16, width: "100%", maxWidth: 450, border: `1px solid ${inputBorder}`, boxShadow: "0 12px 40px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: "#ef4444", display: "flex", alignItems: "center", gap: 8 }}>
            <Bug size={20} /> Report a Bug
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: textMuted, cursor: "pointer" }}><X size={20} /></button>
        </div>
        <p style={{ fontSize: 13, color: textMuted, marginBottom: 20 }}>Found an issue with ChatCIT? Describe it below and our admins will investigate.</p>

        <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="What went wrong?" rows={5} style={{ width: '100%', padding: '12px', background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: '8px', color: textPrimary, fontSize: '14px', outline: 'none', resize: 'vertical', marginBottom: 16 }} />
        
        <button onClick={handleSubmit} disabled={loading || !desc.trim()} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: !desc.trim() ? (dark ? "rgba(255,255,255,0.1)" : "#e5e7eb") : "#ef4444", color: !desc.trim() ? textMuted : "#fff", border: "none", fontWeight: 600, fontSize: '15px', cursor: loading || !desc.trim() ? "not-allowed" : "pointer" }}>
          {loading ? "Submitting..." : "Submit Report"}
        </button>
      </div>
    </div>
  );
}