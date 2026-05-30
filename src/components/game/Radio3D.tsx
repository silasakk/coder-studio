"use client";

import React from "react";

interface Radio3DProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export default function Radio3D({
  label,
  checked,
  onChange,
  disabled = false,
  className = "",
}: Radio3DProps) {
  const handleToggle = () => {
    if (disabled) return;
    onChange(!checked);
  };

  return (
    <label
      onClick={handleToggle}
      className={`inline-flex items-center gap-3.5 cursor-pointer font-sans select-none text-left
        ${disabled ? "cursor-not-allowed opacity-75" : ""} ${className}`}
    >
      {/* 3D Round Radio Container */}
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-100 flex-shrink-0
          ${
            disabled
              ? "bg-slate-200 border-slate-300 border-b-[2px] translate-y-[2px]"
              : checked
              ? "bg-blue-50 dark:bg-slate-800/80 border-brand-blue dark:border-blue-400 border-b-[2px] translate-y-[4px] shadow-inner"
              : "bg-white dark:bg-slate-850 border-slate-300 dark:border-slate-700 border-b-[6px] dark:border-b-slate-950 hover:border-slate-400 dark:hover:border-slate-600 active:border-b-[2px] active:translate-y-[4px]"
          }`}
      >
        {checked && (
          <div
            className={`w-2.5 h-2.5 rounded-full bg-brand-blue dark:bg-blue-400 animate-pop-in`}
          />
        )}
      </div>

      {label && (
        <span
          className={`text-xs font-black transition-colors
            ${
              disabled
                ? "text-slate-400"
                : checked
                ? "text-brand-blue dark:text-blue-400"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white"
            }`}
        >
          {label}
        </span>
      )}
    </label>
  );
}
