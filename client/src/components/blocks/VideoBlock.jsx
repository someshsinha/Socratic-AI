import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function VideoBlock({ query }) {
  const [state, setState] = useState({ status: 'loading', videoId: null, error: null });

  useEffect(() => {
    let cancelled = false;
    if (!query) {
      setState({ status: 'idle', videoId: null, error: null });
      return;
    }

    api.get('/youtube/search', { params: { q: query } })
      .then(({ data }) => {
        if (cancelled) return;
        if (data.success && data.data && data.data.ok && data.data.videoId) {
          setState({ status: 'ready', videoId: data.data.videoId, error: null });
        } else {
          setState({
            status: 'error',
            videoId: null,
            error: data.data?.error || 'Video stream temporarily unavailable',
          });
        }
      })
      .catch((err) => {
        if (cancelled) return;
        const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Stream temporarily unavailable';
        setState({ status: 'error', videoId: null, error: msg });
      });

    return () => { cancelled = true; };
  }, [query]);

  if (!query) return null;

  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

  return (
    <div className="print:hidden border border-[#d8d3c7] my-6 bg-[#fbfaf6] shadow-xs">
      {/* Editorial Video Header Strip */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-[#d8d3c7] text-xs font-mono">
        <span className="font-bold text-[#2f6f4f] text-[11px] tracking-wide">
          [VIDEO LECTURE // {query.toUpperCase()}]
        </span>
        <span className="text-[10px] text-gray-400 font-mono">
          {state.status === 'ready' ? '16:9 HD' : 'YOUTUBE RESOURCE'}
        </span>
      </div>

      {/* Exact 16:9 Video Container */}
      <div className="aspect-video w-full relative bg-[#fbfaf6] flex items-center justify-center overflow-hidden">
        {state.status === 'loading' ? (
          /* Loading State within 16:9 frame */
          <div className="flex flex-col items-center justify-center space-y-2.5 text-center p-6 select-none">
            <span className="w-8 h-8 rounded-full border-2 border-gray-300 border-t-gray-900 animate-spin" />
            <p className="font-mono text-xs text-[#5f6673] m-0">
              Loading video stream for "{query}"...
            </p>
          </div>
        ) : state.status === 'ready' && state.videoId ? (
          /* Embedded Player */
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${state.videoId}`}
            title={query}
            allowFullScreen
            loading="lazy"
          />
        ) : (
          /* Branded 16:9 Academic Fallback State (Never shows raw broken iframe) */
          <div className="flex flex-col items-center justify-center text-center p-6 sm:p-8 space-y-3 max-w-md select-none">
            {/* Play/Video Icon Badge */}
            <div className="w-12 h-12 flex items-center justify-center border border-[#d8d3c7] bg-white text-gray-800 shadow-xs">
              <svg className="w-6 h-6 text-[#111827] ml-0.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            {/* Error / Unavailable Notice */}
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-[#111827] m-0">
                Video temporarily unavailable
              </h4>
              <p className="text-xs text-[#5f6673] m-0 leading-relaxed">
                Recommended topic: <span className="font-semibold text-gray-800">"{query}"</span>
              </p>
            </div>

            {/* Watch on YouTube Action */}
            <div className="pt-1">
              <a
                href={searchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border border-[#111827] bg-[#111827] text-white text-xs font-mono font-bold hover:-translate-y-px active:translate-y-0 transition-transform shadow-xs"
                style={{ textDecoration: 'none' }}
              >
                <svg className="w-3.5 h-3.5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span>[ WATCH ON YOUTUBE ↗ ]</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
