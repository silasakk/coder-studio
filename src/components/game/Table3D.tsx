"use client";

import React from "react";

interface Table3DProps {
  headers: string[];
  rows: Array<Array<React.ReactNode>>;
  className?: string;
}

export default function Table3D({ headers, rows, className = "" }: Table3DProps) {
  return (
    <div
      className={`overflow-hidden border-2 border-b-[6px] border-slate-300 bg-white rounded-2xl shadow-sm font-sans select-none ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b-2 border-slate-200">
              {headers.map((header, idx) => (
                <th
                  key={idx}
                  className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-slate-100 last:border-r-0"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm font-bold text-slate-700">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="px-6 py-8 text-center text-slate-400 font-bold">
                  ไม่มีข้อมูลในตาราง
                </td>
              </tr>
            ) : (
              rows.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="transition-colors hover:bg-slate-50/50 odd:bg-white even:bg-slate-50/20"
                >
                  {row.map((cell, cellIdx) => (
                    <td
                      key={cellIdx}
                      className="px-6 py-4 border-r border-slate-100 last:border-r-0 max-w-xs truncate"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
