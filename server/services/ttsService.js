import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY
    ?.replace(/['"\r\n]/g, '')
    .trim();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing from environment variables');
  }
  return new GoogleGenAI({ apiKey });
};

// Strip markdown so it doesn't read asterisks/formulas/code out loud
const stripMarkdownForSpeech = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/\$\$[\s\S]*?\$\$/g, '')      
    .replace(/\$[^$]*\$/g, '')             
    .replace(/```[\s\S]*?```/g, '')        
    .replace(/`([^`]+)`/g, '$1')           
    .replace(/^>\s?/gm, '')                
    .replace(/\*\*(.+?)\*\*/g, '$1')       
    .replace(/\*(.+?)\*/g, '$1')           
    .replace(/^#{1,6}\s/gm, '')            
    .replace(/^[-*]\s/gm, '')              
    .replace(/^\d+\.\s/gm, '');            
};

export const narrateLessonText = async (lessonTitle, lessonContent) => {
  const plainText = lessonContent
    .filter((b) => b && (b.type === 'paragraph' || b.type === 'heading'))
    .map((b) => stripMarkdownForSpeech(b.text))
    .filter((txt) => txt.trim().length > 0)
    .join('. ');

  const ai = getAiClient();  

  // Translate to spoken Hinglish (Hindi-English mix written in Latin/Roman script)
  const translateResponse = await ai.models.generateContent({
    model: 'gemini-3.5-flash-lite',
    contents: `Translate the following English lesson content into natural, spoken Hinglish (Hindi-English code-mixed, written in Roman/Latin script, the way Indian students actually speak — not pure Hindi, not pure English). Keep technical terms in English where that's how they're normally said. Return ONLY the translated text, no preamble or extra text.\n\nLesson: "${lessonTitle}"\n\n${plainText}`,
  });
  
  return translateResponse.text.trim(); 
};
