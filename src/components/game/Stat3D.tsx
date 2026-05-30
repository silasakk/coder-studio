"use client";

import React from "react";

interface Stat3DProps {
  value: React.ReactNode;
  label: string;
  icon?: React.ReactNode;
  variant?: "primary" | "success" | "danger" | "warning" | "gold" | "secondary";
  className?: string;
}

export default function Stat3D({
  value,
  label,
  icon,
  variant = "secondary",
  className = "",
}: Stat3DProps) {
  const variantStyles = {
    primary: "border-[#0043A4] bg-blue-50/50 text-slate-800",
    success: "border-[#3B8A01] bg-emerald-50/50 text-slate-800",
    danger: "border-[#C93535] bg-red-50/50 text-slate-800",
    warning: "border-[#C27200] bg-amber-50/50 text-slate-800",
    gold: "border-[#D4B200] bg-yellow-50/30 text-slate-800",
    secondary: "border-slate-300 bg-white text-slate-800",
  };

  const highlightTextColors = {
    primary: "text-brand-blue",
    success: "text-game-success",
    danger: "text-game-danger",
    warning: "text-game-warning",
    gold: "text-[#B48C00]",
    secondary: "text-slate-800",
  };

  return (
    <div
      className={`border-2 border-b-[6px] rounded-2xl p-5 flex items-center justify-between gap-4 font-sans select-none shadow-sm transition-all duration-150 hover:translate-y-[-2px] hover:border-b-[8px]
        ${variantStyles[variant]} ${className}`}
    >
      <div className="text-left flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
        <span className={`text-xl sm:text-2xl font-black mt-1 leading-none ${highlightTextColors[variant]}`}>
          {value}
        </span>
      </div>
      {icon && (
        <div className={`p-2.5 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-inner flex-shrink-0`}>
          {icon}
        </div>
      )}
    </div>
  );
}
