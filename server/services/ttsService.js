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
    contents: `You are an expert technical content adapter and native Hindi-English speaker in India. Translate the following English lesson content into natural, spoken Hinglish (code-mixed Hindi and English, written in Roman/Latin script, exactly the way engineering students and developers in India talk during tech discussions).

    CRITICAL RULES FOR TRANSLATION:
    1. Conversational Flow: Use natural phrasing and everyday technical slang (e.g., "to basically yaha pe kya hota hai ki..."). Avoid overly formal textbook Hindi or stiff corporate phrasing.
    2. Technical Terms & Tool Names: ALL software names, frameworks, libraries, protocols, and technical acronyms (such as Nginx, Kubernetes, API, etcd, PostgreSQL, Node.js, JSON, JWT, Docker, Redis) MUST remain strictly in their standard English spelling. Never translate them or alter them phonetically.
    3. Output Format: Return ONLY the raw translated text. No preamble, no markdown formatting blocks, no conversational intro, and no quotes.
    
    Lesson Title: "${lessonTitle}"
    
    Lesson Content:
    ${plainText}`,
     });
  
  return translateResponse.text.trim(); 
};
