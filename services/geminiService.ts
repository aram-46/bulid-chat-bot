import { GoogleGenAI } from "@google/genai";
import type { Source } from '../types';
import { SourceType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGroundedResponse = async (question: string, sources: Source[]): Promise<string> => {
  if (sources.length === 0) {
    return "Please select at least one source for me to answer from. (لطفا حداقل یک منبع برای پاسخگویی انتخاب کنید)";
  }

  const fileParts = [];
  let sourceListForPrompt = '';

  for (const source of sources) {
    if (source.type === SourceType.FILE && source.value && source.mimeType) {
      // Extract base64 data from data URL
      const base64Data = source.value.split(',')[1];
      if (base64Data) {
        fileParts.push({
          inlineData: {
            data: base64Data,
            mimeType: source.mimeType,
          },
        });
        sourceListForPrompt += `- FILE: ${source.name} (Content is attached and ready for analysis)\n`;
      }
    } else if (source.type === SourceType.URL) {
      sourceListForPrompt += `- URL: ${source.value}\n`;
    } else {
      sourceListForPrompt += `- ${source.type}: ${source.name}\n`;
    }
  }

  const prompt = `
You are an expert assistant. Your knowledge is strictly limited to the information provided in the "SOURCES" section and any attached files. You MUST NOT use any external knowledge.

Your task is to answer the user's question based *ONLY* on the provided sources.

- If the answer is in the sources, provide a clear and concise answer.
- If the answer cannot be found in the provided sources, you must state: "I could not find an answer in the provided sources."
- Do not make up information.

SOURCES:
${sourceListForPrompt}

USER'S QUESTION:
${question}

ANSWER:
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      // For single-turn, multi-part requests, the `contents` payload should be a single Content object
      // containing all parts, rather than an array of Content objects (which is for chat history).
      // This change aligns with the API documentation for this use case and resolves the XHR error.
      contents: {
          parts: [{ text: prompt }, ...fileParts],
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    const errorMessage = String(error);
    if (errorMessage.includes("401") || errorMessage.includes("UNAUTHENTICATED") || errorMessage.toLowerCase().includes("api key not valid")) {
      return "Authentication Error: Your API key is invalid or missing. Please make sure it is configured correctly as an environment variable.";
    }
    return "I'm sorry, I encountered an error processing your request. The file might be unsupported or too large.";
  }
};