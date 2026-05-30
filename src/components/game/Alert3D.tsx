"use client";

import React, { useState } from "react";
import { Info, CheckCircle2, AlertOctagon, AlertTriangle, X } from "lucide-react";

interface Alert3DProps {
  title?: string;
  type?: "info" | "success" | "error" | "warning";
  onClose?: () => void;
  children: React.ReactNode;
}

export default function Alert3D({
  title,
  type = "info",
  onClose,
  children,
}: Alert3DProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    onClose?.();
  };

  // Color theme mappings
  const themeStyles = {
    info: {
      box: "bg-blue-50/60 dark:bg-blue-950/30 border-brand-blue border-b-[#0043A4] dark:border-b-blue-900 text-brand-blue dark:text-blue-400",
      badge: "bg-blue-100 dark:bg-blue-900/40 text-brand-blue dark:text-blue-400 border-brand-blue dark:border-blue-800",
      icon: <Info className="w-4 h-4" />,
    },
    success: {
      box: "bg-emerald-50/60 dark:bg-emerald-950/30 border-game-success border-b-[#3B8A01] dark:border-b-emerald-900 text-game-success-hover dark:text-game-success",
      badge: "bg-emerald-100 dark:bg-emerald-900/40 text-game-success-hover dark:text-game-success border-game-success dark:border-emerald-800",
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    error: {
      box: "bg-red-50/60 dark:bg-red-950/30 border-game-danger border-b-[#C93535] dark:border-b-red-900 text-game-danger-hover dark:text-game-danger",
      badge: "bg-red-100 dark:bg-red-900/40 text-game-danger-hover dark:text-game-danger border-game-danger dark:border-red-800",
      icon: <AlertOctagon className="w-4 h-4" />,
    },
    warning: {
      box: "bg-orange-50/60 dark:bg-orange-950/30 border-game-warning border-b-[#C27200] dark:border-b-orange-900 text-amber-700 dark:text-game-warning",
      badge: "bg-orange-100 dark:bg-orange-900/40 text-amber-850 dark:text-game-warning border-game-warning dark:border-orange-850",
      icon: <AlertTriangle className="w-4 h-4" />,
    },
  };

  const currentTheme = themeStyles[type];

  return (
    <div
      className={`w-full p-5 rounded-2xl border-2 border-b-[6px] transition-all select-none shadow-sm flex items-start gap-4 text-left relative animate-pop-in ${currentTheme.box}`}
    >
      {/* Icon Badge */}
      <div
        className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center font-black text-sm flex-shrink-0 bg-white dark:bg-slate-900 shadow-inner ${currentTheme.badge}`}
      >
        {currentTheme.icon}
      </div>

      {/* Main Content Area */}
      <div className="flex-grow">
        {title && (
          <h4 className="font-extrabold text-sm sm:text-base uppercase tracking-wider mb-1">
            {title}
          </h4>
        )}
        <div className="text-xs sm:text-sm font-medium leading-relaxed opacity-95 font-sans">
          {children}
        </div>
      </div>

      {/* Dismiss Button with X Lucide Icon */}
      <button
        onClick={handleDismiss}
        className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-opacity focus:outline-none flex items-center justify-center"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
