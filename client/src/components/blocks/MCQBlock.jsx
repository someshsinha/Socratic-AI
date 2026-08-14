import React, { useState } from 'react';

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

        {/* Question Text */}
        <h4 className="font-extrabold text-[#111827] text-base leading-relaxed m-0">
          {question}
        </h4>

        {/* Options List */}
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
                className={`px-4 py-3 border text-left text-sm transition-all cursor-pointer font-medium ${btnStyle}`}
              >
                <span className="font-mono font-bold mr-2 text-xs text-gray-500">
                  [{String.fromCharCode(65 + optIdx)}]
                </span>
                {option}
              </button>
            );
          })}
        </div>

        {/* Feedback Explanation Card */}
        {hasAnswered && (
          <div
            className={`p-4 border text-xs sm:text-sm leading-relaxed ${
              isCorrect
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                : 'bg-red-50 border-red-500 text-red-900'
            }`}
          >
            <p className="font-extrabold mb-1">{isCorrect ? '✓ Correct Answer' : '✗ Incorrect'}</p>
            <p className="m-0 text-xs sm:text-sm">{explanation}</p>
          </div>
        )}
      </div>

      {/* Static Print UI */}
      <div className="hidden print:block p-4 border border-slate-300 rounded-lg my-4 space-y-2">
        <p className="font-bold text-sm text-slate-900">Q: {question}</p>
        <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
          {options.map((opt, i) => (
            <li key={i} className={i === answer ? 'font-bold text-slate-950' : ''}>
              {opt} {i === answer && '✓ (Correct)'}
            </li>
          ))}
        </ul>
        {explanation && (
          <p className="text-[11px] text-slate-600 italic mt-2">
            Explanation: {explanation}
          </p>
        )}
      </div>
    </>
  );
}
