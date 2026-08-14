import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { getIndianVoice, splitSpeechChunks, configureUtterance } from '../utils/speechUtils';

export default function NarrateButton({ lessonId, autoPlay = false }) {
  const [state, setState] = useState('idle'); // idle | fetching | ready | playing | error
  const [errorMsg, setErrorMsg] = useState('');
  const [hinglishText, setHinglishText] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  const utterancesRef = useRef([]);

  // 1. Fetch voices on mount and keep updated
  useEffect(() => {
    const fetchVoices = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          setAvailableVoices(voices);
        }
      }
    };

    fetchVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = fetchVoices;
    }
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
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
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setErrorMsg('Speech synthesis is not supported on this browser.');
      setState('error');
      return;
    }

    if (state === 'playing') {
      window.speechSynthesis.cancel();
      setState('ready');
      return;
    }

    if (!hinglishText) return;

    // Refresh voices list in case mobile engine loaded them late
    const currentVoices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
    setErrorMsg('');
    
    const chunks = splitSpeechChunks(hinglishText);
    utterancesRef.current = [];

    const indianVoice = getIndianVoice(currentVoices);

    const playNextChunk = (index) => {
      if (index >= chunks.length) {
        setState('ready');
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunks[index]);
      configureUtterance(utterance, indianVoice, 0.96, 1.0);

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
    <div className="flex flex-col items-stretch sm:items-end w-full sm:w-auto">
      <button 
        onClick={handlePlay} 
        disabled={state === 'fetching' || state === 'idle'}
        style={{
          fontFamily: 'ui-monospace,monospace',
          border: `1px solid ${state === 'playing' ? '#991b1b' : '#111827'}`,
          background: state === 'playing' ? '#991b1b' : '#111827',
          color: '#ffffff',
          cursor: state === 'fetching' || state === 'idle' ? 'not-allowed' : 'pointer',
        }}
        className="w-full sm:w-auto px-3 py-2 text-[11px] sm:text-xs font-bold tracking-tight whitespace-nowrap flex items-center justify-center gap-1.5 hover:-translate-y-px active:translate-y-0 transition-all shadow-xs"
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
            <svg className="w-3.5 h-3.5 text-white shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
            </svg>
            <span>[ PLAY AUDIO NARRATION ]</span>
          </span>
        )}
      </button>

      {state === 'error' && errorMsg && (
        <span className="text-[10px] text-red-700 font-mono mt-1 text-center sm:text-right">
          {errorMsg}
        </span>
      )}
    </div>
  );
}
