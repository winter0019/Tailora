import OpenAI from "openai";
import { GoogleGenAI, Modality } from "@google/genai";
import type { CustomerDetails, StylePreferences, StyleSuggestion } from "../types";
import dotenv from "dotenv";
dotenv.config();

// ---------- API KEY VALIDATION ----------
const checkKeys = () => {
  if (!process.env.OPENAI_API_KEY) console.warn("⚠️ OpenAI API key missing!");
  if (!process.env.API_KEY) console.warn("⚠️ Google GenAI API key missing!");
  if (!process.env.STABILITY_API_KEY) console.warn("⚠️ StabilityAI API key missing!");
  if (!process.env.DEEP_AI_KEY) console.warn("⚠️ DeepAI API key missing!");
};
checkKeys();

// ---------- IMAGE PROVIDER HELPERS ----------

async function generateWithOpenAI(prompt: string): Promise<string | null> {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const result = await openai.images.generate({ model: "dall-e-3", prompt, size: "1024x1024" });
    return result.data[0].url ?? null;
  } catch (err: any) {
    console.warn("⚠️ OpenAI failed:", err.message);
    return null;
  }
}

async function generateWithGemini(
  client: GoogleGenAI,
  prompt: string,
  fabricImageBase64?: string,
  fabricMimeType?: string,
  customerImageBase64?: string,
  customerMimeType?: string
): Promise<string | null> {
  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          ...(fabricImageBase64 ? [{ inlineData: { data: fabricImageBase64, mimeType: fabricMimeType! } }] : []),
          ...(customerImageBase64 ? [{ inlineData: { data: customerImageBase64, mimeType: customerMimeType! } }] : []),
          { text: prompt },
        ],
      },
      config: { responseModalities: [Modality.IMAGE] },
    });
    const part = response.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
    return part ? `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` : null;
  } catch (err: any) {
    console.warn("⚠️ Gemini failed:", err.message);
    return null;
  }
}

async function generateWithStabilityAI(prompt: string): Promise<string | null> {
  try {
    const res = await fetch("https://api.stability.ai/v2beta/stable-image/generate/sd3", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, output_format: "png" }),
    });
    const data = await res.json();
    return data?.image ? `data:image/png;base64,${data.image}` : null;
  } catch (err: any) {
    console.warn("⚠️ StabilityAI failed:", err.message);
    return null;
  }
}

async function generateWithDeepAI(prompt: string): Promise<string | null> {
  try {
    const res = await fetch("https://api.deepai.org/api/text2img", {
      method: "POST",
      headers: {
        "Api-Key": process.env.DEEP_AI_KEY!,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ text: prompt }),
    });
    const data = await res.json();
    return data.output_url || null;
  } catch (err: any) {
    console.warn("⚠️ DeepAI failed:", err.message);
    return null;
  }
}

// ---------- SAFE FALLBACK ----------

export const safeGenerateImage = async (
  client: GoogleGenAI,
  fabricImageBase64: string,
  fabricMimeType: string,
  customerImageBase64: string,
  customerMimeType: string,
  prompt: string
): Promise<string | null> => {
  console.log("🎨 Generating image with fallback chain...");

  const openaiResult = await generateWithOpenAI(prompt);
  if (openaiResult) return openaiResult;

  const geminiResult = await generateWithGemini(
    client, prompt, fabricImageBase64, fabricMimeType, customerImageBase64, customerMimeType
  );
  if (geminiResult) return geminiResult;

  const stabilityResult = await generateWithStabilityAI(prompt);
  if (stabilityResult) return stabilityResult;

  const deepaiResult = await generateWithDeepAI(prompt);
  if (deepaiResult) return deepaiResult;

  console.warn("🚫 All providers failed.");
  return null;
};

// ---------- STYLE GENERATION ----------

export const generateStyle = async (
  fabricImageBase64: string,
  fabricMimeType: string,
  customerImageBase64: string,
  customerMimeType: string,
  customerDetails: CustomerDetails,
  preferences: StylePreferences
): Promise<Partial<StyleSuggestion> | null> => {
  const client = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const textModel = "gemini-2.5-flash";

  const prompt = `
You are Tailora, a creative fashion design assistant.
Using Nigerian cultural inspirations: ${preferences.inspirations.join(", ")},
Customer Body: ${customerDetails.bodySize}, ${customerDetails.bodyNature}.
Garment Type: ${preferences.garmentType}.
Suggest an elegant, modern fashion style with colors, patterns, and cuts.`;

  const response = await client.models.generateContent({
    model: textModel,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const suggestionText = response.candidates?.[0]?.content?.parts?.[0]?.text
    ?? "Elegant modern style inspired by Nigerian motifs.";

  const imageBase64 = await safeGenerateImage(
    client, fabricImageBase64, fabricMimeType, customerImageBase64, customerMimeType, suggestionText
  );

  if (!imageBase64) throw new Error("Tailora is taking a short creative break... please try again soon.");

  return { text: suggestionText, image: imageBase64 };
};

// ---------- REFINEMENT ----------

export const refineStyle = async (
  fabricImageBase64: string,
  fabricMimeType: string,
  customerImageBase64: string,
  customerMimeType: string,
  customerDetails: CustomerDetails,
  previousSuggestion: StyleSuggestion,
  refinementPrompt: string
): Promise<Partial<StyleSuggestion> | null> => {
  const client = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const textModel = "gemini-2.5-flash";

  const prompt = `
Refine design: ${previousSuggestion.text}.
Customer: ${customerDetails.bodySize}, ${customerDetails.bodyNature}.
Feedback: ${refinementPrompt}.
Generate improved, elegant, and consistent style.`;

  const response = await client.models.generateContent({
    model: textModel,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const refinedText = response.candidates?.[0]?.content?.parts?.[0]?.text
    ?? "Updated elegant version of the design.";

  const imageBase64 = await safeGenerateImage(
    client, fabricImageBase64, fabricMimeType, customerImageBase64, customerMimeType, refinedText
  );

  if (!imageBase64) throw new Error("Tailora is taking a short creative break... please try again soon.");

  return { text: refinedText, image: imageBase64 };
};
