import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function CodeBlock({ text, language }) {
  const [copied, setCopied] = useState(false);
  const [wrapLines, setWrapLines] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code', err);
    }
  };

  return (
    <div className="relative border border-[#d8d3c7] my-5 sm:my-6 shadow-sm overflow-hidden bg-[#111827]">
      {/* Code Header Bar */}
      <div className="print:hidden bg-[#1f2937] px-3 sm:px-4 py-2 flex items-center justify-between border-b border-[#374151]">
        <div className="flex items-center gap-2">
          {/* Terminal Dots */}
          <div className="flex items-center gap-1.5 mr-1">
            <span className="w-2 h-2 rounded-full bg-[#ef4444] opacity-80" />
            <span className="w-2 h-2 rounded-full bg-[#f59e0b] opacity-80" />
            <span className="w-2 h-2 rounded-full bg-[#10b981] opacity-80" />
          </div>
          <span className="font-mono font-bold uppercase tracking-wider text-[10.5px] sm:text-[11px] text-[#9ca3af]">
            {language || 'CODE'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Wrap / Scroll Toggle */}
          <button
            type="button"
            onClick={() => setWrapLines(!wrapLines)}
            className={`font-mono text-[10.5px] sm:text-xs font-bold transition-all cursor-pointer px-2 py-0.5 rounded border ${
              wrapLines
                ? 'bg-purple-900/60 text-purple-300 border-purple-500/50 shadow-xs'
                : 'text-gray-400 hover:text-white border-transparent hover:bg-gray-800'
            }`}
            title={wrapLines ? "Switch to horizontal scroll" : "Wrap code lines"}
          >
            {wrapLines ? '✓ [ WRAPPED ]' : '[ WRAP ]'}
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="font-mono text-[10.5px] sm:text-xs font-bold text-gray-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-gray-800"
          >
            {copied ? (
              <span className="text-emerald-400">✓ [COPIED]</span>
            ) : (
              <span>[ COPY ]</span>
            )}
          </button>
        </div>
      </div>

      {/* Code Area with Syntax Highlighting & Line Numbers */}
      <div className="print:bg-white print:text-black overflow-x-auto">
        <SyntaxHighlighter
          language={language ? language.toLowerCase() : 'javascript'}
          style={tomorrow}
          showLineNumbers={true}
          wrapLines={wrapLines}
          wrapLongLines={wrapLines}
          lineProps={{
            style: {
              wordBreak: wrapLines ? 'break-all' : 'normal',
              whiteSpace: wrapLines ? 'pre-wrap' : 'pre',
            },
          }}
          customStyle={{
            margin: 0,
            padding: '0.75rem 0.85rem',
            background: '#111827',
            fontSize: 'clamp(0.70rem, 2.7vw, 0.82rem)',
            lineHeight: '1.6',
            fontFamily: 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace',
            whiteSpace: wrapLines ? 'pre-wrap' : 'pre',
            wordBreak: wrapLines ? 'break-all' : 'normal',
            overflowWrap: wrapLines ? 'anywhere' : 'normal',
            overflowX: wrapLines ? 'hidden' : 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
          codeTagProps={{
            style: {
              whiteSpace: wrapLines ? 'pre-wrap' : 'pre',
              wordBreak: wrapLines ? 'break-all' : 'normal',
              overflowWrap: wrapLines ? 'anywhere' : 'normal',
              fontFamily: 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace',
            },
          }}
          lineNumberStyle={{
            color: '#4b5563',
            minWidth: '1.8em',
            paddingRight: '0.65em',
            textAlign: 'right',
            userSelect: 'none',
          }}
        >
          {text}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}


