import React, { useState, useEffect, useRef } from "react";
export default function Timer({ durationMinutes, onTimeUp, onTick }) {
  const total = durationMinutes * 60;
  const [left, setLeft] = useState(total);
  const ref = useRef(null);
  useEffect(() => {
    ref.current = setInterval(() => {
      setLeft(prev => {
        const next = prev - 1;
        if (onTick) onTick(total - next);
        if (next <= 0) { clearInterval(ref.current); onTimeUp && onTimeUp(); return 0; }
        return next;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, []);
  const mins = Math.floor(left / 60);
  const secs = left % 60;
  const pct = (left / total) * 100;
  const urgent = left <= 60;
  return (
    <div className={`timer-widget ${urgent ? "timer-urgent" : ""}`}>
      <div className="timer-label">⏱ Time Left</div>
      <div className="timer-display">{String(mins).padStart(2,"0")}:{String(secs).padStart(2,"0")}</div>
      <div className="timer-bar-track"><div className="timer-bar-fill" style={{width:`${pct}%`,background:urgent?"#ef4444":"#4f46e5"}}/></div>
    </div>
  );
}
