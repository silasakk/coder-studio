"use client";

import React, { useState } from "react";
import { ChevronRight } from "lucide-react";

interface Collapse3DProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function Collapse3D({
  title,
  children,
  defaultOpen = false,
}: Collapse3DProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="w-full bg-white border-2 border-b-[6px] border-slate-200 rounded-2xl overflow-hidden select-none shadow-sm mb-3 text-left">
      {/* Accordion clickable header button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between font-black text-slate-800 text-sm sm:text-base cursor-pointer hover:bg-slate-50 transition-colors focus:outline-none"
      >
        <span>{title}</span>
        
        {/* Rotating 3D Chevron with Lucide Icon */}
        <ChevronRight
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-90 text-brand-blue" : "rotate-0"
          }`}
        />
      </button>

      {/* Slide-open Collapsed Area */}
      {isOpen && (
        <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/50 text-slate-600 font-medium text-xs sm:text-sm leading-relaxed animate-pop-in">
          {children}
        </div>
      )}
    </div>
  );
}
