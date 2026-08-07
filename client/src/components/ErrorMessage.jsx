import React from 'react';

export default function ErrorMessage({ message = 'An error occurred', onRetry }) {
  return (
    <div className="w-full max-w-md mx-auto p-6 bg-red-950/40 border border-red-500/20 rounded-2xl shadow-xl flex flex-col items-center text-center space-y-4">
      <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center text-red-400">
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div className="space-y-1">
        <h4 className="font-bold text-red-200">Something went wrong</h4>
        <p className="text-red-300/80 text-sm leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 py-2 bg-red-900/40 hover:bg-red-900/60 text-red-250 text-xs font-bold uppercase tracking-wider rounded-xl border border-red-500/20 hover:border-red-500/40 transition duration-200 cursor-pointer"
        >
          Retry
        </button>
      )}
    </div>
  );
}
