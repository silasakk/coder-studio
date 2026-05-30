"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, CheckCircle2, X } from "lucide-react";

interface FileInput3DProps {
  label?: string;
  onChange?: (files: FileList | null) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function FileInput3D({
  label,
  onChange,
  accept,
  multiple = false,
  disabled = false,
  className = "",
}: FileInput3DProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    if (disabled) return;
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileList = e.dataTransfer.files;
      const fileArray = Array.from(fileList);
      const filtered = multiple ? fileArray : [fileArray[0]];
      setSelectedFiles(filtered);
      if (onChange) onChange(fileList);
    }
  };

  const handleClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.target.files && e.target.files.length > 0) {
      const fileList = e.target.files;
      const fileArray = Array.from(fileList);
      setSelectedFiles(fileArray);
      if (onChange) onChange(fileList);
    }
  };

  const clearFiles = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (onChange) onChange(null);
  };

  return (
    <div className={`flex flex-col gap-1.5 w-full text-left font-sans select-none ${className}`}>
      {label && <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">{label}</label>}

      {/* 3D Drag Zone Container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all duration-100 cursor-pointer text-center bg-white
          ${
            disabled
              ? "bg-slate-200 border-slate-300 border-b-[2px] cursor-not-allowed translate-y-[4px]"
              : isDragOver
              ? "border-brand-blue bg-blue-50/50 scale-102 border-b-[2px] translate-y-[4px]"
              : "border-slate-300 hover:border-slate-400 hover:bg-slate-50 border-b-[6px] active:border-b-[2px] active:translate-y-[4px]"
          }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          className="hidden"
        />

        {selectedFiles.length > 0 ? (
          <div className="flex flex-col items-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-game-success animate-pop-in" />
            <span className="text-xs font-black text-slate-700 max-w-[200px] truncate">
              {selectedFiles.length === 1 ? selectedFiles[0].name : `${selectedFiles.length} ไฟล์ถูกเลือก`}
            </span>
            <button
              type="button"
              onClick={clearFiles}
              className="mt-1 flex items-center gap-1.5 px-3 py-1 bg-red-50 text-game-danger border border-red-100 rounded-full text-[10px] font-black hover:bg-red-100 transition-colors outline-none"
            >
              <X className="w-3 h-3" />
              <span>ล้างไฟล์</span>
            </button>
          </div>
        ) : (
          <>
            <UploadCloud className={`w-8 h-8 text-slate-400 ${isDragOver ? "animate-float" : ""}`} />
            <div className="flex flex-col">
              <span className="text-xs font-black text-slate-600">คลิกหรือลากไฟล์มาวางที่นี่</span>
              <span className="text-[10px] font-bold text-slate-400 mt-1">ไฟล์เดียวหรือหลายไฟล์ตามที่รองรับ</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
