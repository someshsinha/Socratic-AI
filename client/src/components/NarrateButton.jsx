import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';

export default function NarrateButton({ lessonId }) {
  const [state, setState] = useState('idle'); // idle | fetching | ready | playing | error
  const [errorMsg, setErrorMsg] = useState('');
  const [hinglishText, setHinglishText] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  const utterancesRef = useRef([]);

  // 1. Fetch voices on mount
  useEffect(() => {
    const fetchVoices = () => {
      if (window.speechSynthesis) {
        setAvailableVoices(window.speechSynthesis.getVoices());
      }
    };
    fetchVoices();
    if (window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = fetchVoices;
    }
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // 2. Pre-fetch the translation BEFORE the user clicks "Play"
  useEffect(() => {
    let isMounted = true;
    const loadTranslation = async () => {
      setState('fetching');
      try {
        const res = await api.post(`/lessons/${lessonId}/narrate`);
        if (isMounted && res.data?.success && res.data?.data?.text) {
          setHinglishText(res.data.data.text);
          setState('ready');
        } else if (isMounted) {
          setErrorMsg("Failed to parse translated text.");
          setState('error');
        }
      } catch (err) {
        console.error("Translation fetch failed:", err);
        if (isMounted) {
          setErrorMsg("Failed to load translation from server.");
          setState('error');
        }
      }
    };
    loadTranslation();
    return () => { isMounted = false; };
  }, [lessonId]);

  const handlePlay = () => {
    if (state === 'playing') {
      window.speechSynthesis.cancel();
      setState('ready');
      return;
    }

    if (!hinglishText) return;

    // LINUX SAFEGUARD: Check if the OS/Browser actually has a TTS engine installed
    if (availableVoices.length === 0) {
        setErrorMsg('No speech voices found on your operating system. Install speech-dispatcher.');
        setState('error');
        return;
    }

    setErrorMsg('');
    
    // Split the text and strictly remove any empty chunks that cause charLength: 0 crashes
    const rawChunks = hinglishText.match(/[^.!?]+[.!?]*/g) || [hinglishText];
    const chunks = rawChunks.map(c => c.trim()).filter(c => c.length > 0);
    
    utterancesRef.current = [];

    // Prioritize Indian accents, fallback to default
    const indianVoice = availableVoices.find(v => v.lang === 'hi-IN') 
      || availableVoices.find(v => v.lang === 'en-IN') 
      || availableVoices.find(v => v.default) 
      || availableVoices[0];

        const playNextChunk = (index) => {
      if (index >= chunks.length) {
        setState('ready');
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunks[index]);
      if (indianVoice) utterance.voice = indianVoice;

      utterance.onend = () => playNextChunk(index + 1);
      
      utterance.onerror = (e) => {
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          console.error("Chunk playback error:", e);
          setErrorMsg(`Playback error: ${e.error}`);
          setState('error');
        }
      };

      utterancesRef.current.push(utterance);
      window.speechSynthesis.speak(utterance);
    };

    setState('playing');
    playNextChunk(0);
  };

  return (
    <div className="flex flex-col items-center sm:items-end">
      <button 
        onClick={handlePlay} 
        disabled={state === 'fetching' || state === 'idle'}
        className={`flex items-center justify-center gap-2.5 px-5 py-2.5 font-semibold text-sm rounded-xl transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 border ${
          state === 'playing' 
            ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20 text-red-400' 
            : state === 'fetching' || state === 'idle'
              ? 'bg-slate-800/80 border-slate-700 text-slate-400 cursor-not-allowed'
              : state === 'error'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 border-violet-500/20 text-white'
        }`}
      >
        {state === 'playing' ? (
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        ) : state === 'fetching' || state === 'idle' ? (
          <svg className="animate-spin h-4 w-4 text-violet-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
          </svg>
        )}

        <span>
          {state === 'fetching' ? 'Translating to Hinglish…' : 
           state === 'playing' ? 'Stop Narration' : 
           state === 'error' ? 'Retry Narration ⚠️' :
           'Play Hinglish Audio 🎧'}
        </span>
      </button>
      {state === 'error' && errorMsg && (
        <span className="text-[10px] text-red-400 font-medium max-w-[220px] text-center sm:text-right mt-1.5 break-words">
          {errorMsg}
        </span>
      )}
    </div>
  );
}
