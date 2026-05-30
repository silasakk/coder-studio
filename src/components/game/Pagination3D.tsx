"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Pagination3DProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination3D({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: Pagination3DProps) {
  const getPages = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  return (
    <div className={`flex items-center gap-2 font-sans select-none justify-center ${className}`}>
      {/* Prev Button */}
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={handlePrev}
        className={`w-9 h-9 rounded-xl transition-all duration-100 flex items-center justify-center outline-none border-2
          ${
            currentPage === 1
              ? "bg-slate-100 border-slate-200 border-b-[2px] text-slate-300 cursor-not-allowed translate-y-[2px]"
              : "bg-white border-slate-300 border-b-[5px] text-slate-600 hover:text-slate-900 hover:border-slate-400 active:border-b-[2px] active:translate-y-[3px]"
          }`}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Page Numbers */}
      {getPages().map((page) => {
        const isActive = page === currentPage;

        return (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`w-9 h-9 font-black text-xs rounded-xl transition-all duration-100 flex items-center justify-center outline-none border-2
              ${
                isActive
                  ? "bg-blue-50 border-brand-blue border-b-[2px] text-brand-blue translate-y-[3px] shadow-inner"
                  : "bg-white border-slate-300 border-b-[5px] text-slate-500 hover:text-slate-800 hover:border-slate-400 active:border-b-[2px] active:translate-y-[3px]"
              }`}
          >
            {page}
          </button>
        );
      })}

      {/* Next Button */}
      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={handleNext}
        className={`w-9 h-9 rounded-xl transition-all duration-100 flex items-center justify-center outline-none border-2
          ${
            currentPage === totalPages
              ? "bg-slate-100 border-slate-200 border-b-[2px] text-slate-300 cursor-not-allowed translate-y-[2px]"
              : "bg-white border-slate-300 border-b-[5px] text-slate-600 hover:text-slate-900 hover:border-slate-400 active:border-b-[2px] active:translate-y-[3px]"
          }`}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
