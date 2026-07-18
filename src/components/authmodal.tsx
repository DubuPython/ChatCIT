import React, { useState } from "react";
import { User as UserIcon, Mail, Lock, Eye, EyeOff, Check, X, LogIn, UserPlus, Briefcase } from "lucide-react";
import { SpinningGear } from "./ui/helpers";
import { User, Chat } from "../types";
import { API_URL } from "../config";

const departmentsList = [
  "Computer Technology", "Food Processing Technology", "Drafting and Digital Arts Technology", 
  "Welding Technology", "Automotive Technology", "Electrical Technology", 
  "Electronics Technology", "Mechanical Technology", "H/VAC Technology",
  "Mechatronics Technology", "Electronics and Communication Technology", 
  "Faculty", "Others"
];

export function AuthScreen({ dark, onSuccess, initialIsLogin = true }: { dark: boolean, onSuccess: (u: User, c: Chat[]) => void, initialIsLogin?: boolean }) {
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [department, setDepartment] = useState("Computer Technology");
  
  // NEW: Privacy Consent State
  const [consentGiven, setConsentGiven] = useState(false);
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const [pwdFocused, setPwdFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);

  // Forgot Password States
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  const textPrimary = dark ? "#e8eaed" : "#1a1a2e";
  const textMuted = dark ? "#9aa0a6" : "#6b7280";
  const border = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  const reqs = {
    length: password.length >= 8,
    capital: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    match: password === confirmPassword && password.length > 0
  };

  // UPDATED: isFormValid now strictly requires consentGiven when registering
  const isFormValid = isLogin 
    ? email.trim() && password.trim()
    : email.trim() && username.trim() && Object.values(reqs).every(Boolean) && consentGiven;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setError("");
    setLoading(true);

    const endpoint = isLogin ? "/auth/login" : "/auth/register";
    const payload = isLogin ? { email, password } : { username, email, password, department };

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Authentication failed.");
      onSuccess(data.user, data.chats || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setResetMessage("Please enter your email address.");
      return;
    }
    setIsSendingReset(true);
    setResetMessage("");
    setError("");
    
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send reset email.");
      
      setResetMessage("Success! Check your email for the reset link.");
    } catch (err: any) {
      setResetMessage(err.message);
    } finally {
      setIsSendingReset(false);
    }
  };

  const showSecurityPopup = !isLogin && !isForgotPassword && (pwdFocused || confirmFocused);

  // --- FORGOT PASSWORD VIEW ---
  if (isForgotPassword) {
    return (
      <div style={{ position: 'relative', padding: "32px 24px 24px", width: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 600, color: textPrimary }}>
            Reset Password
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: textMuted }}>
            Enter your BulSU email and we'll send you a reset link.
          </p>
        </div>

        {resetMessage && (
          <div style={{ background: resetMessage.includes("Success") ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: resetMessage.includes("Success") ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)', color: resetMessage.includes("Success") ? '#10b981' : '#ef4444', padding: '12px 16px', borderRadius: 8, fontSize: 14, marginBottom: 20, textAlign: 'center', fontWeight: 500 }}>
            {resetMessage}
          </div>
        )}

        <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: textMuted, marginBottom: 6 }}>Email</div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={18} color={textMuted} style={{ position: 'absolute', left: 12 }} />
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="student@bulsu.edu.ph"
                style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'transparent', border: `1px solid ${border}`, borderRadius: 8, color: textPrimary, fontSize: 14, outline: 'none' }} 
              />
            </div>
          </div>

          <button 
            disabled={isSendingReset || !email.trim()}
            type="submit" 
            style={{ width: '100%', padding: '12px', marginTop: 8, borderRadius: 8, border: 'none', background: (isSendingReset || !email.trim()) ? (dark ? 'rgba(255,255,255,0.1)' : '#e5e7eb') : '#4285f4', color: (isSendingReset || !email.trim()) ? textMuted : '#fff', fontSize: 15, fontWeight: 600, cursor: (isSendingReset || !email.trim()) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.2s' }}
          >
            {isSendingReset ? <SpinningGear size={18} color="currentColor" /> : "Send Reset Link"}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: textMuted }}>
          <button onClick={() => { setIsForgotPassword(false); setResetMessage(""); setError(""); }} style={{ background: 'none', border: 'none', color: '#4285f4', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // --- STANDARD LOGIN / REGISTER VIEW ---
  return (
    <div style={{ position: 'relative', padding: "32px 24px 24px", width: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* FLOATING SECURITY REQUIREMENTS (Desktop) */}
      {showSecurityPopup && (
        <div style={{
          position: 'absolute',
          right: 'calc(100% + 16px)', 
          top: 24,
          width: 260,
          background: dark ? '#25242c' : '#ffffff',
          border: `1px solid ${border}`,
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
          display: window.innerWidth > 800 ? 'block' : 'none',
          animation: 'badgePop 0.2s ease-out forwards'
        }}>
          <h4 style={{ margin: '0 0 16px', fontSize: 11, fontWeight: 700, color: textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>Security Requirements</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <RequirementItem met={reqs.length} text="At least 8 characters" />
            <RequirementItem met={reqs.capital} text="Contains 1 capital letter" />
            <RequirementItem met={reqs.number} text="Contains 1 number" />
            <RequirementItem met={reqs.special} text="Contains 1 special character" />
            <RequirementItem met={reqs.match} text="Passwords match" />
          </ul>
        </div>
      )}

      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 600, color: textPrimary }}>
          {isLogin ? "Welcome to ChatCIT" : "Create an account"}
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: textMuted }}>
          {isLogin ? "Log in to access your ChatCIT history." : "Register with your BulSU student email."}
        </p>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '12px 16px', borderRadius: 8, fontSize: 14, marginBottom: 20, textAlign: 'center', fontWeight: 500 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {!isLogin && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: textMuted }}>Username</span>
              <span style={{ fontSize: 12, color: username.length >= 16 ? '#ef4444' : textMuted }}>{username.length}/16</span>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <UserIcon size={18} color={textMuted} style={{ position: 'absolute', left: 12 }} />
              <input 
                type="text" 
                maxLength={16}
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                placeholder="E.g. Dubu"
                style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'transparent', border: `1px solid ${border}`, borderRadius: 8, color: textPrimary, fontSize: 14, outline: 'none' }} 
              />
            </div>
          </div>
        )}

        {/* NEW DEPARTMENT DROPDOWN */}
        {!isLogin && (
          <div>
            <div style={{ fontSize: 12, color: textMuted, marginBottom: 6 }}>Department</div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Briefcase size={18} color={textMuted} style={{ position: 'absolute', left: 12 }} />
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                style={{ width: '100%', padding: '12px 12px 12px 40px', background: dark ? '#1e1e24' : '#fff', border: `1px solid ${border}`, borderRadius: 8, color: textPrimary, outline: 'none', appearance: 'none', fontSize: 14 }}
              >
                {departmentsList.map(dept => <option key={dept} value={dept}>{dept}</option>)}
              </select>
            </div>
          </div>
        )}

        <div>
          <div style={{ fontSize: 12, color: textMuted, marginBottom: 6 }}>Email</div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Mail size={18} color={textMuted} style={{ position: 'absolute', left: 12 }} />
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="student@bulsu.edu.ph"
              style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'transparent', border: `1px solid ${border}`, borderRadius: 8, color: textPrimary, fontSize: 14, outline: 'none' }} 
            />
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: textMuted }}>Password</span>
            {!isLogin && <span style={{ fontSize: 12, color: password.length >= 16 ? '#ef4444' : textMuted }}>{password.length}/16</span>}
          </div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Lock size={18} color={textMuted} style={{ position: 'absolute', left: 12 }} />
            <input 
              type={showPwd ? "text" : "password"} 
              maxLength={16}
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              onFocus={() => setPwdFocused(true)}
              onBlur={() => setPwdFocused(false)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '12px 40px', background: 'transparent', border: `1px solid ${border}`, borderRadius: 8, color: textPrimary, fontSize: 14, outline: 'none' }} 
            />
            <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, background: 'none', border: 'none', padding: 0, color: textMuted, cursor: 'pointer' }}>
              {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* FORGOT PASSWORD LINK */}
        {isLogin && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -8 }}>
            <button 
              type="button" 
              onClick={() => { setIsForgotPassword(true); setError(""); setResetMessage(""); }} 
              style={{ background: 'none', border: 'none', color: '#4285f4', fontSize: 12, cursor: 'pointer', padding: 0, fontWeight: 500 }}
            >
              Forgot Password?
            </button>
          </div>
        )}

        {!isLogin && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: textMuted }}>Confirm Password</span>
              <span style={{ fontSize: 12, color: confirmPassword.length >= 16 ? '#ef4444' : textMuted }}>{confirmPassword.length}/16</span>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={18} color={textMuted} style={{ position: 'absolute', left: 12 }} />
              <input 
                type={showPwd ? "text" : "password"} 
                maxLength={16}
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                onFocus={() => setConfirmFocused(true)}
                onBlur={() => setConfirmFocused(false)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '12px 40px', background: 'transparent', border: `1px solid ${border}`, borderRadius: 8, color: textPrimary, fontSize: 14, outline: 'none' }} 
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, background: 'none', border: 'none', padding: 0, color: textMuted, cursor: 'pointer' }}>
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        )}

        {/* Mobile Fallback for Security Requirements */}
        {showSecurityPopup && window.innerWidth <= 800 && (
          <div style={{ background: dark ? 'rgba(255,255,255,0.03)' : '#f3f4f6', padding: 16, borderRadius: 8, marginTop: 8, animation: 'badgePop 0.2s ease-out forwards' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, color: textMuted, textTransform: 'uppercase' }}>Requirements</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <RequirementItem met={reqs.length} text="At least 8 characters" />
              <RequirementItem met={reqs.capital} text="Contains 1 capital letter" />
              <RequirementItem met={reqs.number} text="Contains 1 number" />
              <RequirementItem met={reqs.special} text="Contains 1 special character" />
              <RequirementItem met={reqs.match} text="Passwords match" />
            </ul>
          </div>
        )}

        {/* Data Privacy Checkbox */}
        {!isLogin && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '4px', padding: '0 4px' }}>
            <input
              type="checkbox"
              id="privacy-consent"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              style={{ marginTop: '3px', cursor: 'pointer' }}
            />
            <label htmlFor="privacy-consent" style={{ fontSize: '12.5px', color: textMuted, lineHeight: '1.4', textAlign: 'left', cursor: 'pointer' }}>
              ChatCIT is AI. By registering, you agree to our <a href="/terms" style={{ color: '#4285f4', textDecoration: 'none' }}>Terms</a> & <a href="/privacy" style={{ color: '#4285f4', textDecoration: 'none' }}>Privacy Policy</a>, and consent to the processing of your data under the Data Privacy Act of 2012.
            </label>
          </div>
        )}

        <button 
          disabled={loading || !isFormValid}
          type="submit" 
          style={{ width: '100%', padding: '12px', marginTop: 8, borderRadius: 8, border: 'none', background: (!isFormValid || loading) ? (dark ? 'rgba(255,255,255,0.1)' : '#e5e7eb') : '#4285f4', color: (!isFormValid || loading) ? textMuted : '#fff', fontSize: 15, fontWeight: 600, cursor: (!isFormValid || loading) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.2s' }}
        >
          {loading ? <SpinningGear size={18} color="currentColor" /> : isLogin ? <><LogIn size={18} /> Log In</> : <><UserPlus size={18} /> Register</>}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: textMuted }}>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button onClick={() => { setIsLogin(!isLogin); setError(""); setConsentGiven(false); }} style={{ background: 'none', border: 'none', color: '#4285f4', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
          {isLogin ? "Sign up" : "Log in"}
        </button>
      </div>

    </div>
  );
}

function RequirementItem({ met, text }: { met: boolean, text: string }) {
  return (
    <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: met ? '#10b981' : '#ef4444', fontWeight: 500 }}>
      {met ? <Check size={16} /> : <X size={16} />}
      <span>{text}</span>
    </li>
  );
}