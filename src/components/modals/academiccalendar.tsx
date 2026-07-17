import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Plus, Trash } from "lucide-react";
import { API_URL } from "../../config"; 
import { User } from "../../types";   

interface CalendarEvent {
  id: number;
  title: string;
  date: string; // YYYY-MM-DD
  event_type: 'exam' | 'holiday' | 'special'; 
}

export function AcademicCalendar({ dark, user, onClose }: { dark: boolean; user: User | null; onClose: () => void }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Admin Add Event States
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<'exam' | 'holiday' | 'special'>('special');
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // STRICT UI CHECK: Only users with the 'admin' role can see editing features
  const isAdmin = user?.role === 'admin';

  // Theming
  const bg = dark ? "#1c1b22" : "#ffffff";
  const textPrimary = dark ? "#e8eaed" : "#1a1a2e";
  const textMuted = dark ? "#9aa0a6" : "#6b7280";
  const border = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  // 👈 NEW: Calculate actual "Today" string formatted as YYYY-MM-DD
  const todayObj = new Date();
  const todayFormatted = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    fetchEvents();
    // Auto-select today's date if they haven't clicked anything yet
    if (!selectedDate) setSelectedDate(todayFormatted);
  }, []);

  // Sync admin form dates with the calendar click
  useEffect(() => {
    if (selectedDate) {
      setNewStartDate(selectedDate);
      setNewEndDate(selectedDate);
    }
  }, [selectedDate]);

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_URL}/calendar`);
      const data = await res.json();
      setEvents(data);
    } catch (e) {
      console.error("Failed to fetch calendar", e);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to generate an array of all dates between Start and End
  const getDatesInRange = (startDate: string, endDate: string) => {
    const dates = [];
    let current = new Date(startDate);
    const end = new Date(endDate);
    
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const addEvent = async () => {
    if (!newStartDate || !newTitle.trim() || !isAdmin || !user) return;
    setErrorMsg("");
    setIsSaving(true);
    
    try {
      // 1. Calculate all days spanning the event
      const datesToSave = getDatesInRange(newStartDate, newEndDate || newStartDate);
      
      // 2. Fire off saves for every day in the range simultaneously
      const savePromises = datesToSave.map(dateStr => 
        fetch(`${API_URL}/calendar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newTitle, date: dateStr, type: newType, userId: user.id })
        })
      );

      await Promise.all(savePromises);
      
      setNewTitle("");
      fetchEvents(); // Refresh the grid
    } catch (e) {
      setErrorMsg("An error occurred while saving the events.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEvent = async (id: number) => {
    if (!isAdmin || !user) return;
    try {
      const res = await fetch(`${API_URL}/calendar/${id}?userId=${user.id}`, { method: "DELETE" });
      if (res.ok) fetchEvents();
    } catch (e) {
      console.error("Failed to delete event", e);
    }
  };

  // Calendar Math Engine
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(year, month + offset, 1));
  };

  const handleDayClick = (day: number) => {
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(formattedDate);
    setErrorMsg("");
  };

  const getEventColor = (type: string) => {
    if (type === 'exam') return '#ef4444'; 
    if (type === 'holiday') return '#10b981'; 
    return '#4285f4'; 
  };

  const selectedDayEvents = events.filter(e => e.date === selectedDate);

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
      <div style={{ background: bg, padding: 24, borderRadius: 16, width: "100%", maxWidth: 840, border: `1px solid ${border}`, boxShadow: "0 12px 40px rgba(0,0,0,0.3)", display: "flex", gap: 24, flexDirection: window.innerWidth < 768 ? "column" : "row" }}>
        
        {/* LEFT SIDE: CALENDAR GRID & LEGEND */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: textPrimary, display: "flex", alignItems: "center", gap: 8 }}>
              <CalendarIcon size={22} color="#4285f4" /> Academic Calendar
            </h2>
            <button onClick={onClose} style={{ background: "none", border: "none", color: textMuted, cursor: "pointer", display: window.innerWidth < 768 ? 'block' : 'none' }}><X size={20} /></button>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, background: dark ? "rgba(255,255,255,0.05)" : "#f3f4f6", padding: "8px 12px", borderRadius: 8 }}>
            <button onClick={() => changeMonth(-1)} style={{ background: "none", border: "none", color: textPrimary, cursor: "pointer", padding: 4 }}><ChevronLeft size={20} /></button>
            <span style={{ fontWeight: 600, color: textPrimary, fontSize: 16 }}>{monthNames[month]} {year}</span>
            <button onClick={() => changeMonth(1)} style={{ background: "none", border: "none", color: textPrimary, cursor: "pointer", padding: 4 }}><ChevronRight size={20} /></button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
            {dayNames.map(d => (
              <div key={d} style={{ textAlign: "center", fontSize: 12, fontWeight: 600, color: textMuted }}>{d}</div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} style={{ padding: 10 }} />
            ))}
            
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayEvents = events.filter(e => e.date === formattedDate);
              const isSelected = selectedDate === formattedDate;
              const isToday = todayFormatted === formattedDate; // 👈 Check if cell is exactly today
              
              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  style={{
                    padding: "10px 4px",
                    // 👈 NEW HIGHLIGHTING LOGIC
                    background: isSelected ? (dark ? "rgba(255,255,255,0.1)" : "#e5e7eb") : (isToday ? (dark ? "rgba(66, 133, 244, 0.15)" : "rgba(66, 133, 244, 0.1)") : "transparent"),
                    border: isToday ? `2px solid #4285f4` : (isSelected ? `1px solid ${textMuted}` : `1px solid ${border}`),
                    borderRadius: 8,
                    color: isToday ? "#4285f4" : textPrimary,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    minHeight: 56,
                    transition: "all 0.2s"
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: (isSelected || isToday) ? 700 : 500 }}>{day}</span>
                  <div style={{ display: "flex", gap: 2, marginTop: 4, flexWrap: "wrap", justifyContent: "center" }}>
                    {dayEvents.map(e => (
                      <div key={e.id} style={{ width: 6, height: 6, borderRadius: "50%", background: getEventColor(e.event_type) }} title={e.title} />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 24, padding: "12px", background: dark ? "rgba(255,255,255,0.02)" : "#f9fafb", borderRadius: 8, border: `1px solid ${border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: textMuted, fontWeight: 500 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#4285f4" }} /> Special Event
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: textMuted, fontWeight: 500 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} /> Examination
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: textMuted, fontWeight: 500 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981" }} /> Holiday
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: EVENT DETAILS */}
        <div style={{ width: window.innerWidth < 768 ? "100%" : 300, borderLeft: window.innerWidth < 768 ? "none" : `1px solid ${border}`, borderTop: window.innerWidth < 768 ? `1px solid ${border}` : "none", paddingLeft: window.innerWidth < 768 ? 0 : 24, paddingTop: window.innerWidth < 768 ? 20 : 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
             <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: textPrimary }}>
               {selectedDate ? new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }) : "Select a date"}
             </h3>
             <button onClick={onClose} style={{ background: "none", border: "none", color: textMuted, cursor: "pointer", display: window.innerWidth < 768 ? 'none' : 'block' }}><X size={20} /></button>
          </div>

          {!selectedDate ? (
            <p style={{ color: textMuted, fontSize: 14, fontStyle: "italic" }}>Click on any date in the calendar to view or manage events.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {selectedDayEvents.length === 0 ? (
                <p style={{ color: textMuted, fontSize: 14 }}>No events scheduled.</p>
              ) : (
                selectedDayEvents.map(e => (
                  <div key={e.id} style={{ background: dark ? "rgba(255,255,255,0.05)" : "#f9fafb", padding: 12, borderRadius: 8, borderLeft: `4px solid ${getEventColor(e.event_type)}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: getEventColor(e.event_type), marginBottom: 2 }}>{e.event_type}</div>
                      <div style={{ fontSize: 14, color: textPrimary, fontWeight: 500 }}>{e.title}</div>
                    </div>
                    {isAdmin && (
                      <button onClick={() => deleteEvent(e.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: 4 }}><Trash size={14} /></button>
                    )}
                  </div>
                ))
              )}

              {/* ADMIN ONLY UI: Multi-Day Date Picker */}
              {isAdmin && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${border}` }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: textMuted, marginBottom: 8, textTransform: "uppercase" }}>Add New Event</div>
                  
                  {errorMsg && <div style={{ color: "#ef4444", fontSize: 12, marginBottom: 8 }}>{errorMsg}</div>}
                  
                  <input 
                    type="text" 
                    placeholder="Event Title..." 
                    value={newTitle} 
                    onChange={e => setNewTitle(e.target.value)} 
                    style={{ width: "100%", padding: "10px", background: dark ? "#25242c" : "#fff", border: `1px solid ${border}`, borderRadius: 6, color: textPrimary, fontSize: 13, marginBottom: 8, outline: "none" }}
                  />
                  
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: textMuted, marginBottom: 4 }}>Start Date</div>
                      <input type="date" value={newStartDate} onChange={e => setNewStartDate(e.target.value)} style={{ width: "100%", padding: "8px", background: dark ? "#25242c" : "#fff", border: `1px solid ${border}`, borderRadius: 6, color: textPrimary, fontSize: 12, outline: "none" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: textMuted, marginBottom: 4 }}>End Date</div>
                      <input type="date" min={newStartDate} value={newEndDate} onChange={e => setNewEndDate(e.target.value)} style={{ width: "100%", padding: "8px", background: dark ? "#25242c" : "#fff", border: `1px solid ${border}`, borderRadius: 6, color: textPrimary, fontSize: 12, outline: "none" }} />
                    </div>
                  </div>

                  <select 
                    value={newType} 
                    onChange={e => setNewType(e.target.value as any)} 
                    style={{ width: "100%", padding: "10px", background: dark ? "#25242c" : "#fff", border: `1px solid ${border}`, borderRadius: 6, color: textPrimary, fontSize: 13, marginBottom: 12, outline: "none" }}
                  >
                    <option value="special">Special Event</option>
                    <option value="exam">Examination</option>
                    <option value="holiday">Holiday</option>
                  </select>
                  
                  <button onClick={addEvent} disabled={!newTitle.trim() || isSaving} style={{ width: "100%", padding: "10px", background: "#4285f4", color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: newTitle.trim() && !isSaving ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    {isSaving ? "Saving..." : <><Plus size={16} /> Save to Calendar</>}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}