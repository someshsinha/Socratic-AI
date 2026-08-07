import React from 'react';

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulsing ring */}
        <div className="absolute h-16 w-16 rounded-full border-4 border-violet-500/10 animate-pulse" />
        {/* Inner high-speed spinning track */}
        <div className="h-12 w-12 rounded-full border-4 border-slate-800 border-t-violet-500 animate-spin" />
      </div>
      {message && (
        <span className="text-slate-400 text-sm font-semibold tracking-wider uppercase animate-pulse">
          {message}
        </span>
      )}
    </div>
  );
}
