/**
 * Speech Synthesis utilities optimized for Indian English & Hinglish pronunciation
 * with full mobile browser compatibility (Android Chrome, Brave, iOS Safari, etc.).
 */

/**
 * Normalizes a language code or voice identifier string for consistent comparison.
 */
function normalizeLangCode(lang = '') {
  return lang.toLowerCase().replace(/_/g, '-').trim();
}

/**
 * Robustly discovers the best available Indian English or Hindi voice from the speech synthesis engine.
 * Handles Android/iOS naming quirks, case sensitivity, underscores, and regional identifiers.
 */
export function getIndianVoice(voices = []) {
  if (!voices || voices.length === 0) return null;

  // 1. Direct Indian Hindi voices (Best for code-mixed Hinglish in Latin/Roman script on mobile)
  const hindiVoice = voices.find((v) => {
    const lang = normalizeLangCode(v.lang);
    const name = (v.name || '').toLowerCase();
    return (
      lang === 'hi-in' ||
      lang.startsWith('hi-') ||
      lang === 'hi' ||
      lang === 'hin-ind' ||
      name.includes('hindi') ||
      name.includes('हिन्दी') ||
      name.includes('lekha') ||
      name.includes('swara')
    );
  });

  if (hindiVoice) return hindiVoice;

  // 2. Direct Indian English voices (Google English India, Microsoft Ravi, Heera, Veena, Rishi, etc.)
  const indianEnglishVoice = voices.find((v) => {
    const lang = normalizeLangCode(v.lang);
    const name = (v.name || '').toLowerCase();
    return (
      lang === 'en-in' ||
      lang === 'eng-ind' ||
      lang.startsWith('en-in') ||
      name.includes('india') ||
      name.includes('indian') ||
      name.includes('rishi') ||
      name.includes('veena') ||
      name.includes('kavya') ||
      name.includes('neerja') ||
      name.includes('prabhat') ||
      name.includes('heera') ||
      name.includes('ravi')
    );
  });

  if (indianEnglishVoice) return indianEnglishVoice;

  // 3. Fallback to default voice or first available voice
  return voices.find((v) => v.default) || voices[0];
}

/**
 * Splits continuous text into spoken sentence chunks to prevent speech synthesis timeouts on mobile.
 */
export function splitSpeechChunks(text) {
  if (!text || typeof text !== 'string') return [];
  const rawChunks = text.match(/[^.!?\n]+[.!?\n]*/g) || [text];
  return rawChunks.map((c) => c.trim()).filter((c) => c.length > 0);
}

/**
 * Configures an utterance specifically for Hinglish narration on mobile & desktop devices.
 */
export function configureUtterance(utterance, voice, customRate = 0.96, customPitch = 1.0) {
  if (voice) {
    utterance.voice = voice;
    // Explicitly set utterance.lang so the engine applies Indian phoneme rules
    utterance.lang = voice.lang || 'en-IN';
  } else {
    // Force Indian English language tag even if voice object is generic
    utterance.lang = 'en-IN';
  }

  utterance.rate = customRate;
  utterance.pitch = customPitch;
  return utterance;
}
