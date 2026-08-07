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
    <div className="p-6 bg-slate-850 border border-slate-800 rounded-2xl space-y-4 shadow-sm">
      {/* Header Badge */}
      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/15 w-max block">
        Knowledge Check
      </span>

      {/* Question Text */}
      <h4 className="font-bold text-white text-base leading-relaxed">
        {question}
      </h4>

      {/* Options List */}
      <div className="grid grid-cols-1 gap-2">
        {options.map((option, optIdx) => {
          let btnStyle = 'bg-slate-900 border-slate-800 text-slate-350 hover:bg-slate-800/40 hover:border-slate-700';

          if (hasAnswered) {
            if (optIdx === answer) {
              btnStyle = 'bg-emerald-500/10 border-emerald-500/35 text-emerald-350 font-bold';
            } else if (selectedOption === optIdx) {
              btnStyle = 'bg-red-500/10 border-red-500/35 text-red-350';
            } else {
              btnStyle = 'bg-slate-900 border-slate-800 text-slate-550 opacity-60';
            }
          }

          return (
            <button
              key={optIdx}
              disabled={hasAnswered}
              onClick={() => handleSelect(optIdx)}
              className={`px-4 py-3 border rounded-xl text-left text-sm transition-all duration-200 cursor-pointer ${btnStyle}`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {/* Feedback Explanation Card */}
      {hasAnswered && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm leading-relaxed border ${
            isCorrect
              ? 'bg-emerald-950/20 border-emerald-500/15 text-emerald-300'
              : 'bg-red-950/20 border-red-500/15 text-red-350'
          }`}
        >
          <p className="font-bold mb-1">{isCorrect ? '✓ Correct!' : '✗ Incorrect'}</p>
          <p>{explanation}</p>
        </div>
      )}
    </div>
  );
}
