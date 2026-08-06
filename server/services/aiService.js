import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const getAiClient = () => {
  // Strip quotes, \r, \n, and trailing spaces
  const apiKey = process.env.GEMINI_API_KEY
    ?.replace(/['"\r\n]/g, '')
    .trim();

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing from environment variables');
  }
  console.error('[DEBUG] key length:', apiKey.length, 'last4:', apiKey.slice(-4));
  return new GoogleGenAI({ apiKey });
};

const cleanJsonResponse = (text) => {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }
  return cleaned.trim();
};

export const generateCoursePrompt = async (topic) => {
  const prompt = `
    You are an expert curriculum designer. Generate a structured online course on the topic: "${topic}".
    Return raw JSON ONLY. Do NOT include markdown fences (\`\`\`json), explanations, or extra text.

    Expected JSON structure:
    {
      "title": "Course Title String",
      "description": "Short overview of the course",
      "tags": ["tag1", "tag2", "tag3"],
      "modules": [
        {
          "title": "Module Title",
          "lessons": ["Lesson 1 Title", "Lesson 2 Title", "Lesson 3 Title"]
        }
      ]
    }
  `;

  let attempts = 0;
  let currentPrompt = prompt;

  while (attempts < 2) {
    try {
      attempts++;
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: currentPrompt,
      });

      const cleanedText = cleanJsonResponse(response.text);
      const parsed = JSON.parse(cleanedText);

      if (!parsed.title || !parsed.description || !Array.isArray(parsed.modules) || parsed.modules.length === 0) {
        throw new Error('INVALID_SHAPE');
      }

      return { success: true, data: parsed };
    } catch (err) {
      if (attempts === 1) {
        console.warn(`[AI Service] Attempt 1 failed (${err.message}). Retrying...`);
        currentPrompt = `${prompt}\n\nSYSTEM CRITICAL: Return ONLY valid JSON matching the exact schema. No markdown formatting.`;
      } else {
        return { success: false, error: 'AI_PARSE_FAILURE', rawError: err.message };
      }
    }
  }
};

export const generateLessonPrompt = async (courseTitle, moduleTitle, lessonTitle) => {
  const prompt = `
    You are an expert educator. Generate detailed, structured lesson content for:
    Course: "${courseTitle}"
    Module: "${moduleTitle}"
    Lesson: "${lessonTitle}"

    Return raw JSON ONLY. Do NOT include markdown fences (\`\`\`json), explanations, or extra text.

    Expected JSON structure:
    {
      "title": "${lessonTitle}",
      "objectives": ["Objective 1", "Objective 2"],
      "content": [
        { "type": "heading", "text": "Section Heading" },
        { "type": "paragraph", "text": "Detailed lesson explanation." },
        { "type": "code", "language": "javascript", "text": "// Code example if relevant" },
        { "type": "video", "query": "Targeted YouTube search query string" },
        { 
          "type": "mcq", 
          "question": "Question text?", 
          "options": ["Option A", "Option B", "Option C", "Option D"], 
          "answer": 0, 
          "explanation": "Why option 0 is correct" 
        }
      ]
    }
  `;

  let attempts = 0;
  let currentPrompt = prompt;

  while (attempts < 2) {
    try {
      attempts++;
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: currentPrompt,
      });

      const cleanedText = cleanJsonResponse(response.text);
      const parsed = JSON.parse(cleanedText);

      if (!parsed.title || !Array.isArray(parsed.objectives) || !Array.isArray(parsed.content) || parsed.content.length === 0) {
        throw new Error('INVALID_SHAPE');
      }

      return { success: true, data: parsed };
    } catch (err) {
      if (attempts === 1) {
        console.warn(`[AI Service] Attempt 1 failed (${err.message}). Retrying...`);
        currentPrompt = `${prompt}\n\nSYSTEM CRITICAL: Return ONLY valid JSON matching the exact schema. No markdown formatting.`;
      } else {
        return { success: false, error: 'AI_PARSE_FAILURE', rawError: err.message };
      }
    }
  }
};