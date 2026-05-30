"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, ChevronUp, Check } from "lucide-react";

interface Combobox3DProps {
  options: Array<{ label: string; value: string }>;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
}

export default function Combobox3D({
  options,
  value,
  onChange,
  placeholder = "เลือกรายการ...",
  label,
  disabled = false,
}: Combobox3DProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleInputFocus = () => {
    if (disabled) return;
    setIsOpen(true);
  };

  const handleSelectOption = (val: string) => {
    onChange(val);
    const selectedOption = options.find((opt) => opt.value === val);
    if (selectedOption) {
      setSearchQuery(selectedOption.label);
    }
    setIsOpen(false);
  };

  // Sync selected value with search input query on load/change
  useEffect(() => {
    const selectedOption = options.find((opt) => opt.value === value);
    if (selectedOption) {
      setSearchQuery(selectedOption.label);
    } else {
      setSearchQuery("");
    }
  }, [value, options]);

  // Filter options based on typed query
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      ref={containerRef}
      className={`w-full flex flex-col gap-1.5 text-left select-none relative ${
        disabled ? "opacity-60 cursor-not-allowed" : ""
      }`}
    >
      {/* Optional Top Label */}
      {label && (
        <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
          {label}
        </label>
      )}

      {/* Main Search Input box with 3D styling */}
      <div className="relative">
        <input
          disabled={disabled}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-3 font-bold rounded-2xl border-2 border-b-[6px] transition-all duration-100 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 outline-none ${
            isOpen
              ? "border-brand-blue dark:border-blue-400 border-b-[4px] translate-y-[2px]"
              : "border-slate-200 dark:border-slate-800 border-b-slate-300 dark:border-b-slate-950 hover:border-slate-300 dark:hover:border-slate-700"
          } ${disabled ? "bg-slate-100 dark:bg-slate-950 cursor-not-allowed translate-y-[2px] border-b-[2px] dark:border-b-slate-900" : ""}`}
        />

        {/* Search Icon on left */}
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 flex items-center">
          <Search className="w-4 h-4" />
        </span>

        {/* Chevron Dropdown Arrow on right */}
        <button
          disabled={disabled}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 focus:outline-none flex items-center"
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* 3D Expandable Option List overlay */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border-2 border-b-[6px] border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden animate-pop-in z-50 max-h-48 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectOption(opt.value)}
                  className={`w-full text-left px-5 py-2.5 text-xs sm:text-sm font-black transition-colors flex items-center justify-between border-b border-slate-100 dark:border-slate-800 last:border-b-0 cursor-pointer ${
                    isSelected
                      ? "bg-blue-50 dark:bg-slate-800 text-brand-blue dark:text-blue-400"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white"
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <span className="text-brand-blue dark:text-blue-400">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            <div className="px-5 py-4 text-xs text-slate-400 dark:text-slate-500 font-bold text-center flex flex-col items-center gap-1.5">
              <Search className="w-5 h-5 text-slate-350 dark:text-slate-600" />
              <span>ไม่พบรายการที่ค้นหา...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
