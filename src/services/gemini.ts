import { GoogleGenAI, Type } from "@google/genai";
import { GeminiResponse } from "../types";

const apiKey = process.env.GEMINI_API_KEY!;
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION = `You are a very intelligent assistant of Smile Crafters, a premier dental practice.
Your goal is to talk to leads, warm them up, provide information about dental services, and book them for a 15-minute consultation (online or in-person).

Smile Crafters services include:
- Porcelain veneers
- Laser dentistry
- AI clear aligners
- Dental implants
- Sleep apnea treatment
- General dental services like crowns, fillings, and cleanings.

Your response MUST be a JSON object with the following fields:
- text: (string) Your message to the user. Use Markdown for formatting.
- imageUrl: (string, optional) A URL to an image from the public folder if relevant to the topic.
  Available images:
  - /images/veneers.jpg
  - /images/aligners.jpg
  - /images/implants.jpg
  - /images/clinic.jpg
  - /images/doctor.jpg
- showBooking: (boolean, optional) Set to true if the user is ready to book a consultation.

Guidelines:
- Be professional, empathetic, and informative.
- If the user asks about a specific service, provide a brief explanation and offer to show an image if appropriate.
- When the user seems interested or ready, suggest booking a 15-minute consultation.
- Keep responses concise but helpful.
- ALWAYS return valid JSON.`;

export async function getChatResponse(history: { role: "user" | "model"; parts: { text: string }[] }[]) {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: history,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          imageUrl: { type: Type.STRING },
          showBooking: { type: Type.BOOLEAN },
        },
        required: ["text"],
      },
    },
  });

  const response = await model;
  try {
    return JSON.parse(response.text) as GeminiResponse;
  } catch (e) {
    console.error("Failed to parse Gemini response:", response.text);
    return { text: response.text } as GeminiResponse;
  }
}
