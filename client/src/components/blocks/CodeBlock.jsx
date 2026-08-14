import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function CodeBlock({ text, language }) {
  const [copied, setCopied] = useState(false);

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
    <div className="relative border border-[#d8d3c7] my-6 shadow-sm overflow-hidden bg-[#111827]">
      {/* Code Header Bar */}
      <div className="print:hidden bg-[#1f2937] px-4 py-2 flex items-center justify-between border-b border-[#374151]">
        <span className="font-mono font-bold uppercase tracking-wider text-[11px] text-[#9ca3af]">
          {language || 'CODE'}
        </span>
        <button
          onClick={handleCopy}
          className="font-mono text-xs font-bold text-gray-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
        >
          {copied ? (
            <span className="text-emerald-400">✓ [COPIED]</span>
          ) : (
            <span>[ COPY ]</span>
          )}
        </button>
      </div>

      {/* Code Area with Syntax Highlighting & Line Numbers */}
      <div className="print:bg-white print:text-black">
        <SyntaxHighlighter
          language={language ? language.toLowerCase() : 'javascript'}
          style={tomorrow}
          showLineNumbers={true}
          customStyle={{
            margin: 0,
            padding: '1rem 1.25rem',
            background: '#111827',
            fontSize: '0.84rem',
            lineHeight: '1.6',
            fontFamily: 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace',
          }}
          lineNumberStyle={{
            color: '#4b5563',
            minWidth: '2.5em',
            paddingRight: '1em',
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
