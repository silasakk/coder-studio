"use client";

import React, { useEffect } from "react";
import { Info, CheckCircle2, AlertTriangle, AlertOctagon, X } from "lucide-react";

interface Toast3DProps {
  isVisible: boolean;
  message: string;
  title?: string;
  type?: "info" | "success" | "warning" | "error";
  onClose: () => void;
  duration?: number; // ms to auto close, set 0 to disable
  position?: "top-right" | "bottom-right" | "bottom-left" | "top-left";
}

export default function Toast3D({
  isVisible,
  message,
  title,
  type = "info",
  onClose,
  duration = 4000,
  position = "bottom-right",
}: Toast3DProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  // Types definitions
  const typeConfigs = {
    info: {
      bg: "bg-blue-50 border-brand-blue",
      borderShadow: "border-[#0043A4]",
      icon: <Info className="w-5 h-5 text-brand-blue" />,
      textTitle: "text-brand-blue",
    },
    success: {
      bg: "bg-emerald-50 border-game-success",
      borderShadow: "border-[#3B8A01]",
      icon: <CheckCircle2 className="w-5 h-5 text-game-success" />,
      textTitle: "text-game-success",
    },
    warning: {
      bg: "bg-amber-50 border-game-warning",
      borderShadow: "border-[#C27200]",
      icon: <AlertTriangle className="w-5 h-5 text-game-warning" />,
      textTitle: "text-game-warning",
    },
    error: {
      bg: "bg-red-50 border-game-danger",
      borderShadow: "border-[#C93535]",
      icon: <AlertOctagon className="w-5 h-5 text-game-danger" />,
      textTitle: "text-game-danger",
    },
  };

  const config = typeConfigs[type];

  // Corner layout coordinates
  const positionStyles = {
    "top-right": "top-6 right-6",
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "top-left": "top-6 left-6",
  };

  return (
    <div
      className={`fixed z-50 max-w-sm w-full font-sans select-none animate-pop-in ${positionStyles[position]}`}
    >
      <div
        className={`w-full bg-white border-2 border-b-[6px] ${config.borderShadow} rounded-2xl p-4 flex gap-3.5 items-start shadow-xl ${config.bg}`}
      >
        <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
        <div className="flex-grow text-left">
          {title && <h4 className={`text-xs font-black uppercase tracking-wider ${config.textTitle}`}>{title}</h4>}
          <p className="text-xs font-bold text-slate-700 mt-0.5 leading-relaxed">{message}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex-shrink-0 text-slate-400 hover:text-slate-600 outline-none p-0.5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
