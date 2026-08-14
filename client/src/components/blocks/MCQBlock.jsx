import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

/**
 * Normalizes raw/bare LaTeX expressions (e.g. |\psi|^2, \psi, \frac{a}{b}, \hbar)
 * into dollar-wrapped $...$ format so remark-math and KaTeX reliably render them.
 */
function normalizeMath(text) {
  if (!text || typeof text !== 'string') return '';
  
  let processed = text;

  // Auto-wrap bare math formulas like |\psi|^2, \psi(x,t), \alpha, \frac{a}{b}, etc. that are not already enclosed in $
  processed = processed.replace(
    /(?<!\$)(?:\|\\?[a-zA-Z]+\|\^\{?[0-9a-zA-Z+-]+\}?|\\(?:psi|alpha|beta|gamma|theta|lambda|sigma|omega|phi|pi|hbar|nabla|partial|infty|sqrt|frac\{[^{}]*\}\{[^{}]*\}|hat\{[^{}]*\}|vec\{[^{}]*\}|text\{[^{}]*\}|ket\{[^{}]*\}|bra\{[^{}]*\}|sum|int|prod)(?:_\{?[^{}\s]*\}?|\^\{?[^{}\s]*\}?)?)(?!\$)/g,
    (match) => `$${match}$`
  );

  return processed;
}

function MathContent({ content, className = '' }) {
  if (!content) return null;
  const processed = normalizeMath(content);

  return (
    <span className={`inline-markdown ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, [remarkMath, { singleDollar: true }]]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: ({ children }) => <span className="inline">{children}</span>,
        }}
      >
        {processed}
      </ReactMarkdown>
    </span>
  );
}

export default function MCQBlock({ question, options, answer, explanation }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const hasAnswered = selectedOption !== null;
  const isCorrect = selectedOption === answer;

  const handleSelect = (idx) => {
    if (hasAnswered) return;
    setSelectedOption(idx);
  };

  return (
    <>
      {/* Interactive UI */}
      <div className="print:hidden p-6 bg-white border border-[#d8d3c7] space-y-4 my-6">
        {/* Header Badge */}
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#2f6f4f] block">
          [KNOWLEDGE CHECK // ASSESSMENT]
        </span>

        {/* Question Text with KaTeX Support */}
        <h4 className="font-extrabold text-[#111827] text-base leading-relaxed m-0">
          <MathContent content={question} />
        </h4>

        {/* Options List with KaTeX Support */}
        <div className="grid grid-cols-1 gap-2.5 pt-1">
          {options.map((option, optIdx) => {
            let btnStyle = 'bg-[#fbfaf6] border-[#d8d3c7] text-[#111827] hover:bg-white hover:border-[#111827]';

            if (hasAnswered) {
              if (optIdx === answer) {
                btnStyle = 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold';
              } else if (selectedOption === optIdx) {
                btnStyle = 'bg-red-50 border-red-500 text-red-950';
              } else {
                btnStyle = 'bg-[#fbfaf6] border-[#e5e7eb] text-gray-400 opacity-60';
              }
            }

            return (
              <button
                key={optIdx}
                disabled={hasAnswered}
                onClick={() => handleSelect(optIdx)}
                className={`px-4 py-3 border text-left text-sm transition-all cursor-pointer font-medium flex items-baseline gap-2 ${btnStyle}`}
              >
                <span className="font-mono font-bold text-xs text-gray-500 shrink-0">
                  [{String.fromCharCode(65 + optIdx)}]
                </span>
                <span className="flex-1">
                  <MathContent content={option} />
                </span>
              </button>
            );
          })}
        </div>

        {/* Feedback Explanation Card with KaTeX Support */}
        {hasAnswered && (
          <div
            className={`p-4 border text-xs sm:text-sm leading-relaxed ${
              isCorrect
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                : 'bg-red-50 border-red-500 text-red-900'
            }`}
          >
            <p className="font-extrabold mb-1">{isCorrect ? '✓ Correct Answer' : '✗ Incorrect'}</p>
            <p className="m-0 text-xs sm:text-sm">
              <MathContent content={explanation} />
            </p>
          </div>
        )}
      </div>

      {/* Static Print UI */}
      <div className="hidden print:block p-4 border border-slate-300 rounded-lg my-4 space-y-2">
        <p className="font-bold text-sm text-slate-900">
          Q: <MathContent content={question} />
        </p>
        <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
          {options.map((opt, i) => (
            <li key={i} className={i === answer ? 'font-bold text-slate-950' : ''}>
              <MathContent content={opt} /> {i === answer && '✓ (Correct)'}
            </li>
          ))}
        </ul>
        {explanation && (
          <p className="text-[11px] text-slate-600 italic mt-2">
            Explanation: <MathContent content={explanation} />
          </p>
        )}
      </div>
    </>
  );
}
