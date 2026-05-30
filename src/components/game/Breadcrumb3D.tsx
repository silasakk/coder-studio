"use client";

import React from "react";
import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface Breadcrumb3DProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb3D({ items }: Breadcrumb3DProps) {
  return (
    <nav className="flex flex-wrap items-center gap-2 select-none text-left">
      {/* Home Badge */}
      <Link href="/" className="inline-flex items-center">
        <div className="px-3.5 py-1.5 bg-white border-2 border-b-[4px] border-slate-200 rounded-full font-black text-xs text-slate-500 hover:text-slate-800 hover:translate-y-[-2px] hover:border-b-[5px] hover:border-slate-300 transition-all duration-150 flex items-center gap-1.5 shadow-sm">
          <Home className="w-3.5 h-3.5 text-slate-400" />
          <span>หน้าแรก</span>
        </div>
      </Link>

      {/* Separator and Path items */}
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        const itemClass = item.active || isLast
          ? "bg-blue-50 border-brand-blue text-brand-blue border-b-[#0043A4]"
          : "bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 hover:translate-y-[-2px] hover:border-b-[5px]";

        return (
          <React.Fragment key={idx}>
            {/* Arrow separator that wiggles on hover */}
            <span className="text-slate-300 flex items-center animate-float">
              <ChevronRight className="w-3.5 h-3.5" />
            </span>

            {/* Path Pill */}
            {item.href && !isLast ? (
              <Link href={item.href} className="inline-flex">
                <div
                  className={`px-3.5 py-1.5 border-2 border-b-[4px] rounded-full font-black text-xs transition-all duration-150 flex items-center shadow-sm ${itemClass}`}
                >
                  {item.label}
                </div>
              </Link>
            ) : (
              <div
                className={`px-3.5 py-1.5 border-2 border-b-[4px] rounded-full font-black text-xs transition-all duration-150 flex items-center shadow-sm ${itemClass}`}
              >
                {item.label}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
