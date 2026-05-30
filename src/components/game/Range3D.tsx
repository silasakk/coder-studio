"use client";

import React from "react";

interface Range3DProps {
  min?: number;
  max?: number;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  disabled?: boolean;
  className?: string;
  label?: string;
}

export default function Range3D({
  min = 0,
  max = 100,
  value,
  onChange,
  step = 1,
  disabled = false,
  className = "",
  label,
}: Range3DProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    onChange(Number(e.target.value));
  };

  return (
    <div className={`flex flex-col gap-1.5 w-full text-left font-sans select-none ${className}`}>
      {label && (
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{label}</span>
          <span className="text-xs font-black text-brand-blue">{value}</span>
        </div>
      )}

      {/* 3D Track Container */}
      <div className="relative flex items-center h-8">
        <div className="absolute left-0 right-0 h-4 bg-slate-200 border-2 border-slate-300 rounded-full shadow-inner overflow-hidden flex">
          {/* Active portion highlight */}
          <div
            className={`h-full transition-all duration-75 rounded-l-full
              ${disabled ? "bg-slate-300" : "bg-brand-blue"}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Input element layer over top */}
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          step={step}
          disabled={disabled}
          onChange={handleSliderChange}
          className="absolute w-full h-8 cursor-pointer opacity-0 z-20 disabled:cursor-not-allowed"
        />

        {/* Custom Tactile 3D Knob indicator */}
        <div
          className={`absolute w-7 h-7 rounded-full border-2 border-b-[5px] bg-white transition-all duration-75 flex-shrink-0 flex items-center justify-center pointer-events-none z-10
            ${
              disabled
                ? "border-slate-300 bg-slate-100 border-b-[2px] translate-y-[2px]"
                : "border-slate-400 shadow-md translate-y-[-2px] active:border-b-[2px] active:translate-y-[2px]"
            }`}
          style={{
            left: `calc(${percentage}% - 14px)`,
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
        </div>
      </div>
    </div>
  );
}
