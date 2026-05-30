"use client";

import React from "react";
import { Check } from "lucide-react";

interface Checkbox3DProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export default function Checkbox3D({
  checked,
  onChange,
  label,
  disabled = false,
}: Checkbox3DProps) {
  const handleClick = () => {
    if (disabled) return;
    onChange(!checked);
  };

  // Base 3D styles
  const baseBoxStyle =
    "w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-xl border-2 border-b-[5px] transition-all duration-100 select-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand-blue";

  // Check state colors
  const stateStyle = checked
    ? "bg-game-success border-game-success border-b-[#3B8A01] text-white active:border-b-2 active:translate-y-[3px]"
    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-750 border-b-slate-300 dark:border-b-slate-950 hover:border-slate-300 dark:hover:border-slate-650 hover:bg-slate-50 dark:hover:bg-slate-700 active:border-b-2 active:translate-y-[3px]";

  // Disabled style
  const disabledStyle =
    "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 border-b-[2px] dark:border-b-slate-900 text-slate-300 dark:text-slate-600 cursor-not-allowed translate-y-[3px] active:translate-y-[3px]";

  return (
    <div
      role="checkbox"
      aria-checked={checked}
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === " " && (e.preventDefault(), handleClick())}
      className={`flex items-center gap-3 select-none text-left ${
        disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      {/* 3D Check Box */}
      <div className={`${baseBoxStyle} ${disabled ? disabledStyle : stateStyle}`}>
        {checked && (
          <Check className="w-4 h-4 text-white stroke-[4] animate-pop-in" />
        )}
      </div>

      {/* Optional Label */}
      {label && (
        <span
          className={`font-black text-sm transition-colors duration-150 ${
            checked ? "text-slate-800 dark:text-slate-100" : "text-slate-500 dark:text-slate-400"
          } ${disabled ? "text-slate-300 dark:text-slate-600" : ""}`}
        >
          {label}
        </span>
      )}
    </div>
  );
}
