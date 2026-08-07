import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function LessonViewer() {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mcqState, setMcqState] = useState({}); // Stores selected answers per MCQ index

  const fetchLesson = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/lessons/${id}`);
      setLesson(response.data.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Failed to load lesson content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLesson();
  }, [id]);

  const handleMcqSelect = (mcqIdx, optionIdx) => {
    setMcqState((prev) => ({
      ...prev,
      [mcqIdx]: optionIdx,
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner message="AI is generating detailed lesson content..." />
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <ErrorMessage message={error || 'Lesson not found'} onRetry={fetchLesson} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Back to course / outline */}
      <div>
        {lesson.module && (
          <Link
            to={`/course/${typeof lesson.module === 'object' ? lesson.module._id : lesson.module}`}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition duration-200"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Course Outline
          </Link>
        )}
      </div>

      {/* Lesson Header */}
      <div className="space-y-4 border-b border-slate-800 pb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {lesson.title || 'Untitled Lesson'}
        </h1>

        {/* Learning Objectives */}
        {lesson.objectives && lesson.objectives.length > 0 && (
          <div className="p-5 bg-violet-950/10 border border-violet-500/10 rounded-2xl space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-violet-400">
              Learning Objectives
            </h3>
            <ul className="list-disc list-inside space-y-1 text-slate-300 text-sm">
              {lesson.objectives.map((obj, index) => (
                <li key={index} className="leading-relaxed">
                  {obj}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Dynamic Content Blocks */}
      <div className="space-y-6">
        {lesson.content && lesson.content.length > 0 ? (
          lesson.content.map((block, idx) => {
            switch (block.type) {
              case 'heading':
                return (
                  <h2 key={idx} className="text-xl font-bold text-white pt-4 mt-6 first:mt-0">
                    {block.text}
                  </h2>
                );

              case 'paragraph':
                return (
                  <p key={idx} className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    {block.text}
                  </p>
                );

              case 'code':
                return (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-850">
                    <div className="bg-slate-900 px-4 py-2 flex items-center justify-between text-xs text-slate-400 border-b border-slate-850">
                      <span>{block.language || 'Code Snippet'}</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(block.text)}
                        className="hover:text-white transition duration-150 cursor-pointer"
                      >
                        Copy
                      </button>
                    </div>
                    <pre className="p-4 bg-slate-950 text-violet-300 font-mono text-xs overflow-x-auto">
                      <code>{block.text}</code>
                    </pre>
                  </div>
                );

              case 'video':
                return (
                  <div
                    key={idx}
                    className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.522 3.543 12 3.543 12 3.543s-7.522 0-9.388.513a3.003 3.003 0 0 0-2.11 2.107C0 8.029 0 12 0 12s0 3.972.502 5.837a3.003 3.003 0 0 0 2.11 2.107C4.478 20.457 12 20.457 12 20.457s7.522 0 9.388-.513a3.003 3.003 0 0 0 2.11-2.107c.502-1.865.502-5.837.502-5.837s0-3.971-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-white font-bold text-sm block">Video Lecture Resource</span>
                        <span className="text-slate-400 text-xs">
                          Query: <code className="text-violet-400 font-semibold">"{block.query}"</code>
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-550 uppercase tracking-widest bg-slate-950 border border-slate-850 px-3 py-1.5 rounded-xl">
                      Integration Pending
                    </span>
                  </div>
                );

              case 'mcq':
                const selectedOption = mcqState[idx];
                const isCorrect = selectedOption === block.answer;
                const hasAnswered = selectedOption !== undefined;

                return (
                  <div key={idx} className="p-6 bg-slate-850 border border-slate-800 rounded-2xl space-y-4">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/15 w-max block">
                      Knowledge Check
                    </span>
                    <h4 className="font-bold text-white text-base leading-relaxed">
                      {block.question}
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {block.options.map((option, optIdx) => {
                        let btnStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/40 hover:border-slate-700';

                        if (hasAnswered) {
                          if (optIdx === block.answer) {
                            btnStyle = 'bg-emerald-500/10 border-emerald-500/35 text-emerald-300 font-semibold';
                          } else if (selectedOption === optIdx) {
                            btnStyle = 'bg-red-500/10 border-red-500/35 text-red-300';
                          } else {
                            btnStyle = 'bg-slate-900 border-slate-800 text-slate-500 opacity-60';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={hasAnswered}
                            onClick={() => handleMcqSelect(idx, optIdx)}
                            className={`px-4 py-3 border rounded-xl text-left text-sm transition-all duration-200 cursor-pointer ${btnStyle}`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>

                    {hasAnswered && (
                      <div
                        className={`p-4 rounded-xl text-xs sm:text-sm leading-relaxed border ${
                          isCorrect
                            ? 'bg-emerald-950/20 border-emerald-500/15 text-emerald-350'
                            : 'bg-red-950/20 border-red-500/15 text-red-350'
                        }`}
                      >
                        <p className="font-bold mb-1">{isCorrect ? '✓ Correct!' : '✗ Incorrect'}</p>
                        <p>{block.explanation}</p>
                      </div>
                    )}
                  </div>
                );

              default:
                return null;
            }
          })
        ) : (
          <div className="p-8 bg-slate-800/20 border border-slate-750 rounded-2xl text-center">
            <p className="text-slate-400 text-sm">No structured content generated for this lesson.</p>
          </div>
        )}
      </div>
    </div>
  );
}
