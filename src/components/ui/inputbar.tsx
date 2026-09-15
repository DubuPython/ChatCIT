import React, { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';

const getCosmicStyles = (dark: boolean) => `
.cosmic-wrapper { position: relative; width: 100%; border-radius: 10px; isolation: isolate; }
.cosmic-galaxy {
  height: 100%; width: 100%;
  background-image: radial-gradient(${dark ? '#ffffff' : '#94a3b8'} 1px, transparent 1px), radial-gradient(${dark ? '#ffffff' : '#94a3b8'} 1px, transparent 1px);
  background-size: 50px 50px; background-position: 0 0, 25px 25px; position: absolute; inset: 0; z-index: -1; animation: cosmicTwinkle 5s infinite; border-radius: 10px; opacity: ${dark ? 0.15 : 0.3};
}
@keyframes cosmicTwinkle { 0%, 100% { opacity: ${dark ? 0.1 : 0.2}; } 50% { opacity: ${dark ? 0.3 : 0.5}; } }
.cosmic-stardust, .cosmic-ring, .cosmic-starfield, .cosmic-nebula { height: 100%; width: 100%; position: absolute; inset: 0; overflow: hidden; z-index: -1; border-radius: 12px; filter: blur(3px); }
.cosmic-input { background-color: ${dark ? '#05071b' : '#ffffff'}; border: ${dark ? 'none' : '1px solid rgba(0,0,0,0.15)'}; width: 100%; height: 56px; border-radius: 10px; color: ${dark ? '#a9c7ff' : '#1a1a2e'}; padding-left: 59px; padding-right: 100px; font-size: 15px; font-family: inherit; transition: background-color 0.3s, border-color 0.3s; }
.cosmic-search-container { display: flex; align-items: center; justify-content: center; width: 100%; position: relative; }
.cosmic-input::placeholder { color: ${dark ? '#6e8cff' : '#64748b'}; }
.cosmic-input:focus { outline: none; border-color: #4285f4; }
.cosmic-main { width: 100%; position: relative; }

.cosmic-stardust { border-radius: 10px; filter: blur(2px); }
.cosmic-stardust::before {
  content: ""; z-index: -2; text-align: center; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(83deg); position: absolute; width: 2000px; height: 2000px; background-repeat: no-repeat; background-position: 0 0; filter: brightness(1.4);
  background-image: conic-gradient(rgba(0, 0, 0, 0) 0%, ${dark ? '#4d6dff' : '#2563eb'}, rgba(0, 0, 0, 0) 8%, rgba(0, 0, 0, 0) 50%, ${dark ? '#6e8cff' : '#60a5fa'}, rgba(0, 0, 0, 0) 58%); transition: all 2s;
}
.cosmic-ring { border-radius: 11px; filter: blur(0.5px); }
.cosmic-ring::before {
  content: ""; z-index: -2; text-align: center; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(70deg); position: absolute; width: 2000px; height: 2000px; filter: brightness(1.3); background-repeat: no-repeat; background-position: 0 0;
  background-image: conic-gradient(${dark ? '#05071b' : '#ffffff'}, ${dark ? '#4d6dff' : '#3b82f6'} 5%, ${dark ? '#05071b' : '#ffffff'} 14%, ${dark ? '#05071b' : '#ffffff'} 50%, ${dark ? '#6e8cff' : '#2563eb'} 60%, ${dark ? '#05071b' : '#ffffff'} 64%); transition: all 2s;
}
.cosmic-starfield::before {
  content: ""; z-index: -2; text-align: center; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(82deg); position: absolute; width: 2000px; height: 2000px; background-repeat: no-repeat; background-position: 0 0;
  background-image: conic-gradient(rgba(0, 0, 0, 0), ${dark ? '#1c2452' : '#93c5fd'}, rgba(0, 0, 0, 0) 10%, rgba(0, 0, 0, 0) 50%, ${dark ? '#2a3875' : '#3b82f6'}, rgba(0, 0, 0, 0) 60%); transition: all 2s;
}
.cosmic-search-container:hover > .cosmic-starfield::before { transform: translate(-50%, -50%) rotate(-98deg); }
.cosmic-search-container:hover > .cosmic-nebula::before { transform: translate(-50%, -50%) rotate(-120deg); }
.cosmic-search-container:hover > .cosmic-stardust::before { transform: translate(-50%, -50%) rotate(-97deg); }
.cosmic-search-container:hover > .cosmic-ring::before { transform: translate(-50%, -50%) rotate(-110deg); }
.cosmic-search-container:focus-within > .cosmic-starfield::before { transform: translate(-50%, -50%) rotate(442deg); transition: all 4s; }
.cosmic-search-container:focus-within > .cosmic-nebula::before { transform: translate(-50%, -50%) rotate(420deg); transition: all 4s; }
.cosmic-search-container:focus-within > .cosmic-stardust::before { transform: translate(-50%, -50%) rotate(443deg); transition: all 4s; }
.cosmic-search-container:focus-within > .cosmic-ring::before { transform: translate(-50%, -50%) rotate(430deg); transition: all 4s; }
.cosmic-nebula { overflow: hidden; filter: blur(30px); opacity: ${dark ? 0.4 : 0.6}; }
.cosmic-nebula:before {
  content: ""; z-index: -2; text-align: center; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(60deg); position: absolute; width: 2000px; height: 2000px; background-repeat: no-repeat; background-position: 0 0;
  background-image: conic-gradient(${dark ? '#000' : '#fff'}, ${dark ? '#4d6dff' : '#3b82f6'} 5%, ${dark ? '#000' : '#fff'} 38%, ${dark ? '#000' : '#fff'} 50%, ${dark ? '#6e8cff' : '#2563eb'} 60%, ${dark ? '#000' : '#fff'} 87%); transition: all 2s;
}
.cosmic-wormhole-icon {
  position: absolute; top: 8px; right: 8px; display: flex; align-items: center; justify-content: center; z-index: 2; height: 40px; width: 38px; isolation: isolate; overflow: hidden; border-radius: 10px;
  background: ${dark ? 'linear-gradient(180deg, #1c2452, #05071b, #2a3875)' : 'linear-gradient(180deg, #eff6ff, #f8fafc, #dbeafe)'}; border: ${dark ? 'none' : '1px solid rgba(59, 130, 246, 0.2)'}; cursor: pointer; padding: 0; outline: none; transition: opacity 0.2s;
}
.cosmic-wormhole-icon:disabled { opacity: 0.5; cursor: not-allowed; }
.cosmic-wormhole-border { height: 42px; width: 40px; position: absolute; overflow: hidden; top: 7px; right: 7px; border-radius: 10px; }
.cosmic-wormhole-border::before {
  content: ""; text-align: center; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(90deg); position: absolute; width: 2000px; height: 2000px; background-repeat: no-repeat; background-position: 0 0; filter: brightness(1.35);
  background-image: conic-gradient(rgba(0, 0, 0, 0), ${dark ? '#4d6dff' : '#2563eb'}, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0) 50%, ${dark ? '#6e8cff' : '#60a5fa'}, rgba(0, 0, 0, 0) 100%); animation: cosmicRotate 4s linear infinite;
}
.cosmic-search-icon { position: absolute; left: 20px; top: 16px; pointer-events: none; }
@keyframes cosmicRotate { 100% { transform: translate(-50%, -50%) rotate(450deg); } }

/* VOICE TYPING MIC STYLES */
.cosmic-mic-icon { position: absolute; right: 52px; top: 8px; display: flex; align-items: center; justify-content: center; z-index: 2; height: 40px; width: 40px; border-radius: 10px; background: transparent; border: none; cursor: pointer; color: ${dark ? '#a9c7ff' : '#2563eb'}; transition: all 0.2s; }
.cosmic-mic-icon:hover { background: ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}; }
.cosmic-mic-listening { color: #ef4444 !important; animation: cosmicPulse 1.5s infinite; }
@keyframes cosmicPulse { 0% { transform: scale(1); } 50% { transform: scale(1.15); } 100% { transform: scale(1); } }
`;

interface Props { input: string; setInput: (val: string) => void; onSend: () => void; isTyping: boolean; dark: boolean; }

export function CosmicInput({ input, setInput, onSend, isTyping, dark }: Props) {
  const [isListening, setIsListening] = useState(false);

  const handleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Voice typing is not supported in this browser.");

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US'; 
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      const toast = document.createElement('div');
      toast.id = 'voice-prompt-toast';
      toast.innerHTML = '🎙️ <strong>Listening...</strong><br/>Please speak clearly in English.';
      toast.style.cssText = `position: fixed; bottom: 120px; left: 50%; transform: translateX(-50%); background: #ef4444; color: white; padding: 16px 24px; border-radius: 16px; font-size: 15px; text-align: center; line-height: 1.4; box-shadow: 0 10px 25px rgba(239, 68, 68, 0.4); z-index: 999999; animation: slideUp 0.3s ease; pointer-events: none; font-family: 'Inter', sans-serif;`;
      document.body.appendChild(toast);
    };

    recognition.onresult = (event: any) => setInput((prev: string) => (prev + " " + event.results[0][0].transcript).trim());
    recognition.onerror = (event: any) => console.error("Speech error:", event.error);
    recognition.onend = () => { setIsListening(false); document.getElementById('voice-prompt-toast')?.remove(); };
    recognition.start();
  };

  return (
    <div className="cosmic-wrapper">
      <style>{getCosmicStyles(dark)}</style>
      <div className="cosmic-galaxy" />
      <div className="cosmic-search-container">
        <div className="cosmic-nebula" />
        <div className="cosmic-starfield" />
        <div className="cosmic-dust" />
        <div className="cosmic-dust" />
        <div className="cosmic-dust" />
        <div className="cosmic-stardust" />
        <div className="cosmic-ring" />
        <div className="cosmic-main">
          <input
            className="cosmic-input"
            name="text"
            type="text"
            placeholder="Explore ChatCIT..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }}
            disabled={isTyping}
          />
          
          <button className={`cosmic-mic-icon ${isListening ? 'cosmic-mic-listening' : ''}`} onClick={handleVoice} title="Voice Typing (English)">
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <div className="cosmic-wormhole-border" />
          <button
            className="cosmic-wormhole-icon"
            onClick={onSend}
            disabled={!input.trim() || isTyping}
            style={{ opacity: (!input.trim() || isTyping) ? 0.5 : 1, cursor: (!input.trim() || isTyping) ? 'not-allowed' : 'pointer' }}
          >
            <svg strokeLinejoin="round" strokeLinecap="round" strokeWidth={2} stroke={dark ? "#a9c7ff" : "#2563eb"} fill="none" height={20} width={20} viewBox="0 0 24 24" className={isTyping ? "animate-spin" : ""}>
              {isTyping ? ( <circle cx="12" cy="12" r="10" stroke={dark ? "#a9c7ff" : "#2563eb"} strokeWidth="4" strokeDasharray="32" strokeLinecap="round" /> ) : ( <> <circle r={10} cy={12} cx={12} /> <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /> <path d="M2 12h20" /> </> )}
            </svg>
          </button>
          
          <div className="cosmic-search-icon">
            <svg strokeLinejoin="round" strokeLinecap="round" strokeWidth={2} stroke={dark ? "url(#cosmic-search)" : "#3b82f6"} fill="none" height={24} width={24} viewBox="0 0 24 24">
              <circle r={8} cy={11} cx={11} />
              <line y2="16.65" x2="16.65" y1={21} x1={21} />
              <defs>
                <linearGradient gradientTransform="rotate(45)" id="cosmic-search">
                  <stop stopColor={dark ? "#a9c7ff" : "#3b82f6"} offset="0%" />
                  <stop stopColor={dark ? "#6e8cff" : "#1d4ed8"} offset="100%" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
