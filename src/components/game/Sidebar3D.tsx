"use client";

import React from "react";

export interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

interface Sidebar3DProps {
  brandName?: string;
  logo?: React.ReactNode;
  items: SidebarItem[];
  footer?: React.ReactNode;
  className?: string;
}

export default function Sidebar3D({
  brandName = "Coder Studio",
  logo,
  items,
  footer,
  className = "",
}: Sidebar3DProps) {
  return (
    <aside
      className={`w-64 border-r-2 border-slate-200 bg-white p-5 flex flex-col justify-between font-sans select-none text-left flex-shrink-0 h-full min-h-[500px] shadow-sm ${className}`}
    >
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 px-2">
          {logo ? (
            logo
          ) : (
            <span className="w-7 h-7 rounded-lg bg-brand-blue flex items-center justify-center text-white text-xs font-black shadow-md">
              C
            </span>
          )}
          <span className="font-black text-slate-800 text-sm tracking-tight uppercase">
            {brandName}
          </span>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex flex-col gap-2">
          {items.map((item) => {
            const isActive = item.active;
            const isDisabled = item.disabled;

            return (
              <button
                key={item.id}
                type="button"
                disabled={isDisabled}
                onClick={item.onClick}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-black transition-all duration-100 flex items-center gap-3 outline-none border-2
                  ${
                    isDisabled
                      ? "bg-slate-50 border-slate-100 border-b-[2px] text-slate-300 cursor-not-allowed translate-y-[2px]"
                      : isActive
                      ? "bg-blue-50 border-brand-blue border-b-[2px] text-brand-blue translate-y-[4px] shadow-inner"
                      : "bg-white border-slate-300 border-b-[6px] text-slate-500 hover:text-slate-800 hover:border-slate-400 active:border-b-[2px] active:translate-y-[4px] shadow-sm"
                  }`}
              >
                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer slot */}
      {footer && <div className="border-t-2 border-slate-100 pt-4 mt-6">{footer}</div>}
    </aside>
  );
}
