"use client";

import React from "react";

interface Kbd3DProps {
  children: React.ReactNode;
  size?: "sm" | "md";
  className?: string;
}

export default function Kbd3D({ children, size = "md", className = "" }: Kbd3DProps) {
  const sizeStyles = {
    sm: "px-1.5 py-0.5 text-[9px] border-b-[3px] rounded-lg",
    md: "px-2.5 py-1 text-xs border-b-[5px] rounded-xl",
  };

  return (
    <kbd
      className={`inline-flex items-center justify-center font-mono font-black text-slate-600 bg-white border-2 border-slate-300 shadow-sm leading-none translate-y-[-2px] select-none
        ${sizeStyles[size]} ${className}`}
    >
      {children}
    </kbd>
  );
}
