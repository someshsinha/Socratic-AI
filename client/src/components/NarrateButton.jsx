import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';

export default function NarrateButton({ lessonId, autoPlay = false }) {
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
          setErrorMsg("Failed to load audio from server.");
          setState('error');
        }
      }
    };
    loadTranslation();
    return () => { isMounted = false; };
  }, [lessonId]);

  // 2b. Auto-play: if autoPlay prop is true, trigger playback once translation is ready
  const autoPlayFired = useRef(false);
  useEffect(() => {
    if (autoPlay && state === 'ready' && hinglishText && !autoPlayFired.current) {
      autoPlayFired.current = true;
      // Small delay to ensure voices are loaded and DOM is settled
      const timer = setTimeout(() => {
        handlePlay();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, state, hinglishText]);

  const handlePlay = () => {
    if (state === 'playing') {
      window.speechSynthesis.cancel();
      setState('ready');
      return;
    }

    if (!hinglishText) return;

    if (availableVoices.length === 0) {
      setErrorMsg('No speech engine found in browser.');
      setState('error');
      return;
    }

    setErrorMsg('');
    
    const rawChunks = hinglishText.match(/[^.!?]+[.!?]*/g) || [hinglishText];
    const chunks = rawChunks.map(c => c.trim()).filter(c => c.length > 0);
    
    utterancesRef.current = [];

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
        style={{
          fontFamily: 'ui-monospace,monospace',
          fontSize: '0.76rem',
          fontWeight: 700,
          border: `1px solid ${state === 'playing' ? '#991b1b' : '#111827'}`,
          background: state === 'playing' ? '#991b1b' : '#111827',
          color: '#ffffff',
          padding: '7px 14px',
          cursor: state === 'fetching' || state === 'idle' ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
        className="hover:-translate-y-px active:translate-y-0 transition-transform shadow-sm"
      >
        {state === 'playing' ? (
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>[ STOP NARRATION ]</span>
          </span>
        ) : state === 'fetching' || state === 'idle' ? (
          <span className="flex items-center gap-1.5 opacity-70">
            <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
            <span>[ LOADING AUDIO... ]</span>
          </span>
        ) : state === 'error' ? (
          <span>[ RETRY AUDIO ⚠️ ]</span>
        ) : (
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
            </svg>
            <span>[ PLAY AUDIO NARRATION ]</span>
          </span>
        )}
      </button>

      {state === 'error' && errorMsg && (
        <span className="text-[10px] text-red-700 font-mono mt-1">
          {errorMsg}
        </span>
      )}
    </div>
  );
}
