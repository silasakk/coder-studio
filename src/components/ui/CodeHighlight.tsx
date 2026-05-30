"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CodeHighlightProps {
  code: string;
  language?: string;
  filename?: string;
}

export function CodeHighlight({ code, language = "tsx", filename }: CodeHighlightProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code: ", err);
    }
  };

  // Custom high-fidelity tokenizer/highlighter for JSX/TSX
  const highlightCode = (rawCode: string) => {
    // 1. Clean the code and trim trailing newlines
    const lines = rawCode.trimEnd().split("\n");

    // 2. We will parse line by line
    return lines.map((line, lineIdx) => {
      // If the line is empty, render an empty line
      if (line.trim() === "") {
        return (
          <div key={lineIdx} className="h-5 select-none" />
        );
      }

      // Safe escaping function
      const parts: { type: string; text: string }[] = [];
      let currentIdx = 0;

      // Regexes for matching tokens in TSX
      // Match comments first, strings, tags, keywords, numbers, attributes
      const tokenRegex = new RegExp(
        [
          // 1. Comments
          "(\\/\\/.*)",
          // 2. Strings
          "(\"(?:\\\\.|[^\"\\\\])*\"|'(?:\\\\.|[^'\\\\])*'|`(?:\\\\.|[^`\\\\])*`)",
          // 3. JSX Tags opening/closing
          "(<\\/?[A-Z][a-zA-Z0-9_]*|&lt;\\/?[A-Z][a-zA-Z0-9_]*|<\\/?[a-z][a-zA-Z0-9_]*|&lt;\\/?[a-z][a-zA-Z0-9_]*)",
          // 4. Closing bracket of JSX tags
          "(\\/?>|\\/?[a-zA-Z0-9_]*>)",
          // 5. Attributes (only if before =)
          "(\\b[a-zA-Z0-9_\\-:]+\\s*(?==))",
          // 6. Keywords
          "\\b(import|export|default|const|let|var|function|return|from|class|interface|type|extends|implements|true|false|null|undefined|as|use|client|public|private|protected|async|await|typeof|void|any|string|number|boolean)\\b",
          // 7. Core custom components references inside braces/types
          "\\b(Button3D|Badge3D|Card3D|Input3D|Checkbox3D|Toggle3D|Combobox3D|Breadcrumb3D|Navbar3D|Dialog3D|Popup3D|Alert3D|Carousel3D|Collapse3D|ProgressBar3D|Avatar3D|MascotBubble|OptionCard3D)\\b"
        ].join("|"),
        "g"
      );

      let match;
      let lastIndex = 0;

      while ((match = tokenRegex.exec(line)) !== null) {
        const matchStart = match.index;
        const matchText = match[0];

        // Push plain text preceding this token
        if (matchStart > lastIndex) {
          parts.push({
            type: "plain",
            text: line.substring(lastIndex, matchStart)
          });
        }

        // Determine token class
        if (match[1]) {
          // Comment
          parts.push({ type: "comment", text: matchText });
        } else if (match[2]) {
          // String
          parts.push({ type: "string", text: matchText });
        } else if (match[3]) {
          // JSX Tag opening or self-closing
          if (matchText.startsWith("</") || matchText.startsWith("<")) {
            const isComponent = /^[<|</][A-Z]/.test(matchText);
            parts.push({ type: isComponent ? "component-tag" : "tag", text: matchText });
          } else {
            parts.push({ type: "tag", text: matchText });
          }
        } else if (match[4]) {
          // Closing tag bracket
          parts.push({ type: "tag-bracket", text: matchText });
        } else if (match[5]) {
          // JSX Attribute
          parts.push({ type: "attr", text: matchText });
        } else if (match[6]) {
          // JS Keyword
          parts.push({ type: "keyword", text: matchText });
        } else if (match[7]) {
          // Component Class/Type name
          parts.push({ type: "component-name", text: matchText });
        } else {
          parts.push({ type: "plain", text: matchText });
        }

        lastIndex = tokenRegex.lastIndex;
      }

      // Add remaining line segment
      if (lastIndex < line.length) {
        parts.push({
          type: "plain",
          text: line.substring(lastIndex)
        });
      }

      return (
        <div key={lineIdx} className="flex hover:bg-slate-800/40 px-4 transition-colors duration-150 py-0.5 font-mono text-sm leading-relaxed">
          {/* Line number */}
          <span className="w-9 text-slate-600 select-none pr-4 text-right border-r border-slate-800/80 mr-4 font-mono text-xs flex items-center justify-end">
            {lineIdx + 1}
          </span>
          {/* Line tokens */}
          <span className="flex-1 whitespace-pre">
            {parts.map((part, partIdx) => {
              switch (part.type) {
                case "keyword":
                  return <span key={partIdx} className="text-pink-400 font-semibold">{part.text}</span>;
                case "comment":
                  return <span key={partIdx} className="text-slate-500 italic">{part.text}</span>;
                case "string":
                  return <span key={partIdx} className="text-emerald-400 font-medium">{part.text}</span>;
                case "component-tag":
                case "component-name":
                  return <span key={partIdx} className="text-purple-400 font-bold">{part.text}</span>;
                case "tag":
                  return <span key={partIdx} className="text-sky-400">{part.text}</span>;
                case "tag-bracket":
                  return <span key={partIdx} className="text-slate-400">{part.text}</span>;
                case "attr":
                  return <span key={partIdx} className="text-amber-300 italic">{part.text}</span>;
                default:
                  return <span key={partIdx} className="text-slate-100">{part.text}</span>;
              }
            })}
          </span>
        </div>
      );
    });
  };

  return (
    <div className="w-full flex flex-col rounded-2xl overflow-hidden border-3 border-[#091E42] bg-[#0A1128] shadow-[0_8px_0_0_#091E42] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_0_0_#091E42]">
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#091E42]/80 border-b-3 border-[#091E42] select-none">
        <div className="flex items-center gap-3">
          {/* macOS window bullets */}
          <div className="flex gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border border-[#E0443E] block" />
            <span className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[#DEA123] block" />
            <span className="w-3.5 h-3.5 rounded-full bg-[#27C93F] border border-[#1AAB29] block" />
          </div>
          {filename && (
            <span className="ml-2 font-mono text-xs font-bold text-slate-300 bg-slate-900/60 px-2.5 py-1 rounded-md border border-slate-800">
              {filename}
            </span>
          )}
          {!filename && language && (
            <span className="ml-2 font-mono text-xs font-bold text-slate-400 bg-slate-900/40 px-2 py-0.5 rounded border border-slate-800/40 uppercase">
              {language}
            </span>
          )}
        </div>

        {/* Copy trigger */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold font-sans text-slate-300 bg-slate-900/60 border-2 border-slate-850 hover:bg-[#0747A6] hover:text-white hover:border-[#0052CC] active:scale-95 transition-all duration-150 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400 animate-pop-in" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code body */}
      <div className="w-full py-4 overflow-x-auto bg-[#070D1E]/95 max-h-[450px] scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        <code className="block min-w-max select-text font-mono">
          {highlightCode(code)}
        </code>
      </div>
    </div>
  );
}
