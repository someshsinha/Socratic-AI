import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import api, { setAuthToken } from '../utils/api';

export default function PromptForm({ onCourseGenerated }) {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [topic, setTopic] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      if (isAuthenticated) {
        const token = await getAccessTokenSilently();
        setAuthToken(token);
      } else {
        setAuthToken(null);
      }
      const response = await api.post('/courses', { topic: topic.trim() });
      setData(response.data);
      if (onCourseGenerated && response.data?.success) {
        onCourseGenerated(response.data.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-2xl space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">
          AI Course Generator Skeleton
        </h2>
        <p className="text-slate-400 text-sm">
          Enter a topic below to generate a structured course via our AI model.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., Learn Advanced React, Quantum Computing..."
          className="flex-1 px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 text-white placeholder-slate-500 transition duration-200"
          disabled={loading}
          required
        />
        <button
          type="submit"
          disabled={loading || !topic.trim()}
          className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-violet-500/20 active:scale-[0.98] disabled:scale-100 disabled:cursor-not-allowed transition duration-200"
        >
          {loading ? (
            <div className="flex items-center gap-2 justify-center">
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Generating...</span>
            </div>
          ) : (
            'Generate'
          )}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-xl text-red-300 text-sm">
          <p className="font-semibold">Error generating course:</p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {data && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Response JSON</span>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20">Success</span>
          </div>
          <pre className="p-4 bg-slate-900 border border-slate-700/50 rounded-xl text-slate-300 text-xs overflow-x-auto max-h-96 font-mono scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
