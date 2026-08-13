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
      console.error('Failed to copy text', err);
    }
  };

  return (
    <div className="relative group rounded-xl overflow-hidden border border-slate-850 shadow-md my-4">
      {/* Code Header Bar - hidden during print */}
      <div className="print:hidden bg-slate-900 px-4 py-2 flex items-center justify-between text-xs text-slate-400 border-b border-slate-850">
        <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-500">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:text-white transition duration-150 cursor-pointer"
        >
          {copied ? (
            <span className="text-emerald-400 font-bold">Copied!</span>
          ) : (
            <span>Copy</span>
          )}
        </button>
      </div>

      {/* Code Area with Syntax Highlighting */}
      <div className="print:bg-slate-50 print:text-slate-900 print:border print:border-slate-300 print:rounded-xl">
        <SyntaxHighlighter
          language={language ? language.toLowerCase() : 'javascript'}
          style={tomorrow}
          customStyle={{
            margin: 0,
            padding: '1.25rem',
            background: '#030712',
            fontSize: '0.8rem',
            lineHeight: '1.5',
          }}
        >
          {text}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
