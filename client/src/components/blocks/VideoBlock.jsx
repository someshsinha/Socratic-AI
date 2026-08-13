import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function VideoBlock({ query }) {
  const [state, setState] = useState({ status: 'loading', videoId: null, error: null });

  useEffect(() => {
    let cancelled = false;
    // Axios baseURL already appends '/api', so we request '/youtube/search'
    api.get('/youtube/search', { params: { q: query } })
      .then(({ data }) => {
        if (cancelled) return;
        // Standardized envelope: { success: true, data: { ok: boolean, videoId?: string, error?: string } }
        if (data.success && data.data) {
          const payload = data.data;
          if (payload.ok) {
            setState({ status: 'ready', videoId: payload.videoId, error: null });
          } else {
            setState({ status: 'error', videoId: null, error: payload.error || 'No video results found' });
          }
        } else {
          setState({ status: 'error', videoId: null, error: 'Malformed response structure' });
        }
      })
      .catch((err) => {
        if (cancelled) return;
        const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Request failed';
        setState({ status: 'error', videoId: null, error: msg });
      });
    return () => { cancelled = true; };
  }, [query]);

  if (state.status === 'loading') {
    return <div className="no-print p-5 bg-slate-900 border border-slate-850 rounded-2xl text-slate-400 text-sm animate-pulse">Loading video…</div>;
  }
  if (state.status === 'error') {
    // Fail gracefully — a missing video shouldn't break the lesson, just show the query and error as a fallback
    return (
      <div className="no-print p-5 bg-slate-900 border border-slate-850 rounded-2xl text-slate-450 text-sm">
        Couldn't load a video for <code className="text-violet-400 font-semibold">"{query}"</code>: <span className="text-red-400 font-medium">{state.error}</span>
      </div>
    );
  }
  return (
    <div className="no-print rounded-2xl overflow-hidden border border-slate-800 aspect-video shadow-lg">
      <iframe
        className="w-full h-full"
        src={`https://www.youtube.com/embed/${state.videoId}`}
        title={query}
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}
