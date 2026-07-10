import React, { useState } from "react";
import { UserCog, Eye, EyeOff, X } from "lucide-react";
import { User } from "../../types";
import { API_URL } from "../../config";

export function ProfileModal({ dark, user, onClose, onUpdate, showToast }: { dark: boolean; user: User; onClose: () => void; onUpdate: (user: User) => void; showToast: (msg: string, type: 'success'|'error'|'info') => void }) {
  const [username, setUsername] = useState(user.username || "");
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const bg = dark ? "#1c1b22" : "#fff";
  const textPrimary = dark ? "#e8eaed" : "#1a1a2e";
  const textMuted = dark ? "#9aa0a6" : "#6b7280";
  const inputBg = dark ? "#25242c" : "#f8f9fa";
  const inputBorder = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  const handleSave = async () => {
    if (!currentPassword.trim()) {
      showToast("Current password is required to save changes.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users/${user.id}`, {
        method: "PUT", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username, 
          currentPassword, 
          newPassword: newPassword || undefined 
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile.");
      
      onUpdate(data.user);
      onClose();
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
      <div style={{ background: bg, padding: 32, borderRadius: 16, width: "100%", maxWidth: 400, border: `1px solid ${inputBorder}`, boxShadow: "0 12px 40px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: textPrimary, display: "flex", alignItems: "center", gap: 8 }}>
            <UserCog size={20} color="#4285f4" /> Edit Profile
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: textMuted, cursor: "pointer" }}><X size={20} /></button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: textMuted, marginBottom: '4px' }}>
              <span>Username</span><span style={{ color: username.length >= 16 ? "#ef4444" : textMuted }}>{username.length}/16</span>
            </div>
            <input type="text" maxLength={16} value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%', padding: '12px', background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: '8px', color: textPrimary, fontSize: '14px', outline: 'none' }} />
          </div>
          
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: textMuted, marginBottom: '4px' }}>
              <span>New Password (Optional)</span><span style={{ color: newPassword.length >= 16 ? "#ef4444" : textMuted }}>{newPassword.length}/16</span>
            </div>
            <div style={{ position: 'relative' }}>
              <input type={showNewPassword ? "text" : "password"} maxLength={16} placeholder="Leave blank to keep current" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ width: '100%', padding: '12px 40px 12px 12px', background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: '8px', color: textPrimary, fontSize: '14px', outline: 'none' }} />
              <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: textMuted, display: 'flex', padding: 0 }}>
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ paddingTop: 8, borderTop: `1px solid ${inputBorder}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: textMuted, marginBottom: '4px' }}>
              <span>Current Password (Required)</span>
            </div>
            <div style={{ position: 'relative' }}>
              <input type={showCurrentPassword ? "text" : "password"} placeholder="Enter current password to save" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} style={{ width: '100%', padding: '12px 40px 12px 12px', background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: '8px', color: textPrimary, fontSize: '14px', outline: 'none' }} />
              <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: textMuted, display: 'flex', padding: 0 }}>
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button onClick={handleSave} disabled={loading || !username.trim() || !currentPassword.trim()} style={{ width: '100%', padding: '12px', borderRadius: '8px', marginTop: '8px', background: (!username.trim() || !currentPassword.trim()) ? (dark ? "rgba(255,255,255,0.1)" : "#e5e7eb") : "#4285f4", color: (!username.trim() || !currentPassword.trim()) ? textMuted : "#fff", border: "none", fontWeight: 600, fontSize: '15px', cursor: (loading || !username.trim() || !currentPassword.trim()) ? "not-allowed" : "pointer", transition: "background 0.2s" }}>
            {loading ? "Verifying & Saving..." : "Verify & Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}