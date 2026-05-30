"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export interface DropdownOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface Dropdown3DProps {
  label?: string;
  options: DropdownOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  align?: "left" | "right";
  disabled?: boolean;
  className?: string;
}

export default function Dropdown3D({
  label,
  options,
  value,
  onChange,
  placeholder = "เลือกรายการ...",
  align = "left",
  disabled = false,
  className = "",
}: Dropdown3DProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (option: DropdownOption) => {
    if (option.disabled) return;
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative flex flex-col gap-1.5 text-left font-sans select-none ${className}`}>
      {label && <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">{label}</label>}

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full font-bold rounded-2xl transition-all duration-100 flex items-center justify-between gap-2 px-5 py-3 outline-none border-2 border-b-[6px] text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900
            ${
              disabled
                ? "bg-slate-200 dark:bg-slate-950 border-slate-300 dark:border-slate-800 border-b-[2px] dark:border-b-slate-900 text-slate-400 dark:text-slate-600 cursor-not-allowed translate-y-[4px]"
                : isOpen
                ? "border-brand-blue dark:border-blue-400 border-b-[2px] translate-y-[4px] shadow-sm"
                : "border-slate-300 dark:border-slate-750 border-b-slate-400 dark:border-b-slate-950 hover:border-slate-400 dark:hover:border-slate-650 hover:bg-slate-50 dark:hover:bg-slate-800 active:border-b-[2px] active:translate-y-[4px] shadow-sm"
            }`}
        >
          <span className="flex items-center gap-2 truncate">
            {selectedOption?.icon}
            <span>{selectedOption ? selectedOption.label : placeholder}</span>
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && !disabled && (
          <div
            className={`absolute z-30 mt-2 w-full min-w-[200px] bg-white dark:bg-slate-900 border-2 border-b-[6px] border-slate-300 dark:border-slate-800 rounded-2xl shadow-xl animate-pop-in overflow-hidden
              ${align === "right" ? "right-0" : "left-0"}`}
          >
            <ul className="py-2 max-h-60 overflow-y-auto">
              {options.length === 0 ? (
                <li className="px-4 py-2.5 text-xs font-bold text-slate-400 dark:text-slate-500 text-center">ไม่มีข้อมูลให้เลือก</li>
              ) : (
                options.map((opt) => (
                  <li key={opt.value}>
                    <button
                      type="button"
                      disabled={opt.disabled}
                      onClick={() => handleSelect(opt)}
                      className={`w-full text-left px-4 py-2.5 text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer
                        ${
                          opt.disabled
                            ? "text-slate-300 dark:text-slate-600 cursor-not-allowed bg-slate-50/50 dark:bg-slate-950/30"
                            : opt.value === value
                            ? "bg-blue-50 dark:bg-slate-800 text-brand-blue dark:text-blue-400"
                            : "text-slate-500 dark:text-slate-350 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                    >
                      {opt.icon && <span className="flex-shrink-0">{opt.icon}</span>}
                      <span className="truncate">{opt.label}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
