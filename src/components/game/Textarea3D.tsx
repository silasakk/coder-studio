"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

interface Textarea3DProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export default function Textarea3D({
  label,
  error,
  disabled,
  className = "",
  rows = 4,
  ...props
}: Textarea3DProps) {
  return (
    <div className={`flex flex-col gap-1.5 w-full text-left font-sans select-none ${className}`}>
      {label && <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">{label}</label>}

      <div className="relative">
        <textarea
          disabled={disabled}
          rows={rows}
          className={`w-full font-bold rounded-2xl px-5 py-3.5 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border-2 border-b-[6px] outline-none transition-all duration-100 placeholder-slate-400 dark:placeholder-slate-500
            ${
              disabled
                ? "bg-slate-200 dark:bg-slate-950 border-slate-300 dark:border-slate-800 border-b-[2px] dark:border-b-slate-900 text-slate-400 dark:text-slate-600 cursor-not-allowed translate-y-[4px]"
                : error
                ? "border-game-danger focus:border-game-danger border-b-[#C93535] focus:ring-0 focus:translate-y-[4px] focus:border-b-[2px] shadow-sm"
                : "border-slate-300 dark:border-slate-750 border-b-slate-400 dark:border-b-slate-950 focus:border-brand-blue dark:focus:border-blue-400 focus:border-b-brand-blue-hover dark:focus:border-b-blue-500 focus:ring-0 focus:translate-y-[4px] focus:border-b-[2px] hover:border-slate-400 dark:hover:border-slate-650 shadow-sm"
            }`}
          {...props}
        />
      </div>

      {error && (
        <div className="flex items-center gap-1 text-game-danger text-xs font-bold px-1 mt-0.5 animate-shake">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
