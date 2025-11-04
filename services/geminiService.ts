import OpenAI from "openai";
import { GoogleGenAI, Modality } from "@google/genai";
import type { CustomerDetails, StylePreferences, StyleSuggestion } from "../types";

// ------------------ IMAGE PROVIDER HELPERS ------------------

// 1️⃣ OpenAI (DALL·E)
async function generateWithOpenAI(prompt: string): Promise<string | null> {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const result = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      size: "1024x1024",
    });
    return result.data[0].url ?? null;
  } catch (err: any) {
    console.warn("⚠️ OpenAI failed:", err.message);
    return null;
  }
}

// 2️⃣ Gemini
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
          ...(fabricImageBase64
            ? [{ inlineData: { data: fabricImageBase64, mimeType: fabricMimeType! } }]
            : []),
          ...(customerImageBase64
            ? [{ inlineData: { data: customerImageBase64, mimeType: customerMimeType! } }]
            : []),
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

// 3️⃣ Stability AI
async function generateWithStabilityAI(prompt: string): Promise<string | null> {
  try {
    const response = await fetch(
      "https://api.stability.ai/v2beta/stable-image/generate/sd3",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          output_format: "png",
        }),
      }
    );
    const data = await response.json();
    if (data?.image) return `data:image/png;base64,${data.image}`;
    return null;
  } catch (err: any) {
    console.warn("⚠️ StabilityAI failed:", err.message);
    return null;
  }
}

// 4️⃣ DeepAI
async function generateWithDeepAI(prompt: string): Promise<string | null> {
  try {
    const response = await fetch("https://api.deepai.org/api/text2img", {
      method: "POST",
      headers: {
        "Api-Key": process.env.DEEP_AI_KEY!,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ text: prompt }),
    });
    const data = await response.json();
    return data.output_url || null;
  } catch (err: any) {
    console.warn("⚠️ DeepAI failed:", err.message);
    return null;
  }
}

// ------------------ SMART FALLBACK ------------------

export const safeGenerateImage = async (
  client: GoogleGenAI,
  fabricImageBase64: string,
  fabricMimeType: string,
  customerImageBase64: string,
  customerMimeType: string,
  prompt: string
): Promise<string | null> => {
  console.log("🎨 Attempting image generation with fallback chain...");

  // 1️⃣ OpenAI
  const openaiResult = await generateWithOpenAI(prompt);
  if (openaiResult) return openaiResult;

  // 2️⃣ Gemini
  const geminiResult = await generateWithGemini(
    client,
    prompt,
    fabricImageBase64,
    fabricMimeType,
    customerImageBase64,
    customerMimeType
  );
  if (geminiResult) return geminiResult;

  // 3️⃣ Stability AI
  const stabilityResult = await generateWithStabilityAI(prompt);
  if (stabilityResult) return stabilityResult;

  // 4️⃣ DeepAI
  const deepaiResult = await generateWithDeepAI(prompt);
  if (deepaiResult) return deepaiResult;

  console.warn("🚫 All image APIs failed. No image generated.");
  return null;
};

// ------------------ STYLE GENERATION LOGIC ------------------

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

  const textPrompt = `
You are Tailora, a creative fashion design assistant.
Using Nigerian cultural inspirations: ${preferences.inspirations.join(", ")},
and fabric and customer details:
- Body Size: ${customerDetails.bodySize}
- Body Nature: ${customerDetails.bodyNature}
- Garment Type: ${preferences.garmentType}

Suggest a creative fashion style with colors, patterns, and cuts that would look elegant and modern.
Summarize briefly and attractively.`;

  const response = await client.models.generateContent({
    model: textModel,
    contents: [{ role: "user", parts: [{ text: textPrompt }] }],
  });

  const suggestionText =
    response.candidates?.[0]?.content?.parts?.[0]?.text || "Elegant modern style inspired by Nigerian motifs.";

  // Try generating the image using multi-provider fallback
  const imageBase64 = await safeGenerateImage(
    client,
    fabricImageBase64,
    fabricMimeType,
    customerImageBase64,
    customerMimeType,
    suggestionText
  );

  if (!imageBase64) throw new Error("Tailora is taking a short creative break... please try again soon.");

  return {
    text: suggestionText,
    image: imageBase64,
  };
};

// ------------------ REFINEMENT LOGIC ------------------

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

  const refineTextPrompt = `
You are refining a fashion design based on feedback.
Previous design: ${previousSuggestion.text}
Refinement notes: ${refinementPrompt}
Customer: ${customerDetails.bodySize}, ${customerDetails.bodyNature}

Generate an improved version that integrates the feedback while maintaining elegance and brand consistency.`;

  const response = await client.models.generateContent({
    model: textModel,
    contents: [{ role: "user", parts: [{ text: refineTextPrompt }] }],
  });

  const refinedText =
    response.candidates?.[0]?.content?.parts?.[0]?.text || "Updated elegant version of the design.";

  const imageBase64 = await safeGenerateImage(
    client,
    fabricImageBase64,
    fabricMimeType,
    customerImageBase64,
    customerMimeType,
    refinedText
  );

  if (!imageBase64) throw new Error("Tailora is taking a short creative break... please try again soon.");

  return {
    text: refinedText,
    image: imageBase64,
  };
};
