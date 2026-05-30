"use client";

import React from "react";

interface Hero3DProps {
  title: React.ReactNode;
  subtitle?: string;
  actions?: React.ReactNode;
  mascot?: React.ReactNode;
  className?: string;
}

export default function Hero3D({ title, subtitle, actions, mascot, className = "" }: Hero3DProps) {
  return (
    <div
      className={`relative w-full border-2 border-b-[8px] border-slate-300 bg-white rounded-3xl p-8 sm:p-12 md:p-16 flex flex-col md:flex-row items-center gap-8 md:gap-12 overflow-hidden shadow-sm font-sans select-none ${className}`}
    >
      {/* Decorative Grid Lines Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

      {/* Main Content Area */}
      <div className="flex-1 text-left space-y-6 relative z-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-none uppercase">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm sm:text-base md:text-lg text-slate-500 font-medium leading-relaxed max-w-xl">
            {subtitle}
          </p>
        )}
        {actions && <div className="flex flex-wrap gap-4 pt-2">{actions}</div>}
      </div>

      {/* Mascot / Asset display panel */}
      {mascot && (
        <div className="flex-shrink-0 relative z-10 w-44 sm:w-56 md:w-64 flex justify-center animate-float">
          <div className="relative">
            {/* Visual halo effect behind mascot */}
            <div className="absolute inset-0 bg-blue-100/55 blur-2xl rounded-full scale-110 pointer-events-none" />
            <div className="relative pointer-events-none flex items-center justify-center">
              {mascot}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
