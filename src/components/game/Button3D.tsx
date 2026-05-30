"use client";

import React from "react";

interface Button3DProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "success" | "danger" | "warning" | "secondary";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export default function Button3D({
  variant = "primary",
  size = "md",
  children,
  className = "",
  disabled,
  ...props
}: Button3DProps) {
  // Base classes for playful rounded 3D buttons
  const baseStyle =
    "font-bold rounded-2xl transition-all duration-100 select-none flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-blue";

  // Size configurations
  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg md:text-xl",
  };

  // Color variants (standard colors and their matching 3D dark borders)
  const variantStyles = {
    primary:
      "bg-brand-blue hover:bg-[#0747A6] border-b-[6px] border-[#0043A4] text-white active:border-b-[2px] active:translate-y-[4px]",
    success:
      "bg-game-success hover:bg-[#46A302] border-b-[6px] border-[#3B8A01] text-white active:border-b-[2px] active:translate-y-[4px]",
    danger:
      "bg-game-danger hover:bg-[#EA2B2B] border-b-[6px] border-[#C93535] text-white active:border-b-[2px] active:translate-y-[4px]",
    warning:
      "bg-game-warning hover:bg-[#E08500] border-b-[6px] border-[#C27200] text-white active:border-b-[2px] active:translate-y-[4px]",
    secondary:
      "bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border-2 border-b-[6px] border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 active:border-b-[2px] active:translate-y-[4px]",
  };

  // Disabled pressed-down flat state
  const disabledStyle =
    "bg-slate-200 dark:bg-slate-900 border-slate-300 dark:border-slate-800 border-2 border-b-[2px] text-slate-400 dark:text-slate-600 cursor-not-allowed translate-y-[4px] active:translate-y-[4px]";

  const currentVariantStyle = disabled ? disabledStyle : variantStyles[variant];

  return (
    <button
      disabled={disabled}
      className={`${baseStyle} ${sizeStyles[size]} ${currentVariantStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
