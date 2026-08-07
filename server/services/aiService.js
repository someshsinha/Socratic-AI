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
        model: 'gemini-3.5-flash-lite',
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

    Rules for code blocks:
    - Only include content blocks of type "code" if the lesson topic or course is explicitly related to computer science, programming, software engineering, databases, algorithms, or coding.
    - For non-programming topics (such as theoretical physics, chemistry, mathematics, history, literature, philosophy, exam syllabi like JEE/NEET, etc.), omit code blocks entirely. Focus instead on detailed paragraphs, textual formulas, and conceptual MCQs.

    Rules for formatting inside "paragraph" block text (applies to ALL topics, not just technical ones):
    - Write paragraph text as Markdown, not plain prose. Use these conventions deliberately, not sparingly:
    - Bold key terms and definitions on first use: **quantum entanglement**, **Treaty of Westphalia**, **derivative**.
    - For italic emphasis (such as foreign or technical terms like *samskaras*), always use a single asterisk directly touching the word with no spaces: *samskaras*, never * samskaras * (with spaces). If unsure, prefer using bolding (**samskaras**) for terms, as bolding is cleaner and consistently supported.
    - Use bullet lists ("- item") or numbered lists ("1. item") whenever the content is naturally a sequence of steps, causes, properties, or exam topics — do not describe a list in a single run-on sentence.
    - Use Markdown blockquotes ("> ...") for direct quotations (historical figures, primary sources) and for standalone definitions worth setting apart from the surrounding explanation.
    - For inline math, wrap it in single dollar signs, e.g. "the relation $E = h\\nu$ describes...". For standalone display equations, use double dollar signs on their own line, e.g. "$$ \\alpha^2 + \\beta^2 = 1 $$".
    - Use inline code formatting (single backticks) only for actual code identifiers, commands, or variable names referenced in prose — never for emphasis in non-technical topics.
    - For a "Pro Tip", "Note", or "Warning" aside, use a blockquote whose first line is a bolded label, e.g. "> **Note:** ..." or "> **Pro Tip:** ...".

    Rules for the "objectives" array specifically:
    - Write each objective as plain text only, with no Markdown syntax (no asterisks, backticks, or bold) — this list renders as-is, without any formatting parser. Reserve Markdown formatting for the "paragraph" block text in "content" only.

    Expected JSON structure:
    {
      "title": "${lessonTitle}",
      "objectives": ["Objective 1", "Objective 2"],
      "content": [
        { "type": "heading", "text": "Section Heading" } ,
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
        model: 'gemini-3.5-flash-lite',
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