"use client";

import React from "react";

interface Toggle3DProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export default function Toggle3D({
  checked,
  onChange,
  label,
  disabled = false,
}: Toggle3DProps) {
  const handleClick = () => {
    if (disabled) return;
    onChange(!checked);
  };

  // Outer container styles
  const baseContainerStyle =
    "w-14 h-8 flex-shrink-0 rounded-full border-2 border-b-[5px] transition-all duration-200 select-none cursor-pointer outline-none relative focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-blue";

  // State color configurations
  const stateStyle = checked
    ? "bg-game-success border-game-success border-b-[#3B8A01] active:border-b-2 active:translate-y-[3px]"
    : "bg-slate-100 dark:bg-slate-850 border-slate-200 dark:border-slate-700 border-b-slate-300 dark:border-b-slate-950 hover:border-slate-300 dark:hover:border-slate-650 active:border-b-2 active:translate-y-[3px]";

  // Disabled style
  const disabledStyle =
    "bg-slate-200 dark:bg-slate-900 border-slate-300 dark:border-slate-800 border-b-[2px] cursor-not-allowed translate-y-[3px] active:translate-y-[3px]";

  return (
    <div
      role="switch"
      aria-checked={checked}
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === " " && (e.preventDefault(), handleClick())}
      className={`flex items-center gap-3 select-none text-left ${
        disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      {/* 3D Switch Container */}
      <div className={`${baseContainerStyle} ${disabled ? disabledStyle : stateStyle}`}>
        {/* Sliding Knob */}
        <div
          className={`w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-b-2 border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-200 absolute top-[1px] ${
            checked ? "left-[24px]" : "left-[2px]"
          } ${disabled ? "bg-slate-100 border-slate-200 shadow-none" : ""}`}
        >
          {/* Subtle inside center indicator */}
          <div className={`w-1.5 h-1.5 rounded-full mx-auto mt-2 transition-colors ${checked ? "bg-game-success" : "bg-slate-350 dark:bg-slate-600"}`} />
        </div>
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
