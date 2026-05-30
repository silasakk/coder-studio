"use client";

import React from "react";

interface Card3DProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export default function Card3D({
  title,
  children,
  className = "",
  hoverable = true,
}: Card3DProps) {
  // Base 3D styles
  const baseStyle =
    "w-full bg-white dark:bg-slate-900 border-2 border-b-[8px] border-slate-200 dark:border-slate-800 rounded-[28px] p-6 select-none transition-all duration-150 relative shadow-sm";

  // Bouncy hover lifting style
  const hoverStyle =
    "hover:translate-y-[-4px] hover:border-b-[12px] hover:border-slate-300 dark:hover:border-slate-950";

  return (
    <div className={`${baseStyle} ${hoverable ? hoverStyle : ""} ${className}`}>
      {/* Optional Card Title */}
      {title && (
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-4 text-left">
          <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg sm:text-xl">
            {title}
          </h3>
        </div>
      )}

      {/* Card Body */}
      <div className="text-slate-500 dark:text-slate-400 font-medium text-sm sm:text-base leading-relaxed text-left">
        {children}
      </div>
    </div>
  );
}
