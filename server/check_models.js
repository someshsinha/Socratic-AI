import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function getValidModels() {
    console.log("Fetching available models...");
    try {
        const response = await ai.models.list();
        console.log("✅ Valid Models for your API Key:");

        // The new SDK returns a paginated Page object, not a simple array.
        // You iterate over it using an async for...await loop:
        for await (const m of response) {
            console.log(`- ${m.name} (${m.displayName || 'No display name'})`);
        }
    } catch (err) {
        console.error("Failed to fetch models:", err.message);
    }
}

getValidModels();