"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

interface Input3DProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input3D({
  label,
  error,
  className = "",
  disabled,
  ...props
}: Input3DProps) {
  // Base 3D styles
  const baseInputStyle =
    "w-full px-5 py-3 font-medium rounded-2xl border-2 border-b-[6px] transition-all duration-100 select-none bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 outline-none focus:translate-y-[2px] focus:border-b-[4px]";

  // Color theme states
  const stateStyle = error
    ? "border-game-danger focus:border-game-danger border-b-game-danger-hover focus:border-b-game-danger-hover"
    : "border-slate-200 dark:border-slate-800 focus:border-brand-blue border-b-slate-300 dark:border-b-slate-950 focus:border-b-brand-blue-hover text-slate-700 dark:text-slate-200";

  // Disabled style
  const disabledStyle =
    "bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 border-b-[2px] dark:border-b-slate-900 text-slate-400 dark:text-slate-600 cursor-not-allowed translate-y-[2px] active:translate-y-[2px]";

  return (
    <div className="w-full flex flex-col gap-1.5 text-left select-none">
      {/* Optional Top Label */}
      {label && (
        <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
          {label}
        </label>
      )}

      {/* 3D Input */}
      <input
        disabled={disabled}
        className={`${baseInputStyle} ${disabled ? disabledStyle : stateStyle} ${className}`}
        {...props}
      />

      {/* Optional Error message with AlertTriangle Lucide icon */}
      {error && (
        <span className="text-xs font-bold text-game-danger px-1 flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5 text-game-danger" />
          <span>{error}</span>
        </span>
      )}
    </div>
  );
}
