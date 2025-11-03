import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { CustomerDetails, StyleSuggestion, StylePreferences } from "../types";

/**
 * Initializes the Gemini client using the correct environment variable.
 */
function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error(
      "Gemini API key not found. Please ensure GEMINI_API_KEY is set in your environment."
    );
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Inspiration pool for Tailora cultural fusion.
 */
const inspirationPool = {
  Nigerian:
    "Ankara prints, Aso-Oke weaving, Adire patterns, Buba/Iro styles, Agbada embroidery.",
  "Middle Eastern": "Abaya silhouettes, Kaftan elegance, intricate embroidery.",
  "East Asian": "Chinese Qipao collars, Japanese Kimono sleeves, Korean Hanbok layering.",
  European: "Victorian-era corsetry/ruffles, sleek English tailoring, French haute couture draping.",
  "South Asian": "Saree draping, Lehenga skirts, intricate Zari work.",
};

/**
 * Generates a new fashion style suggestion with sketch.
 */
export const generateStyle = async (
  fabricImageBase64: string,
  fabricMimeType: string,
  customerImageBase64: string,
  customerMimeType: string,
  customerDetails: CustomerDetails,
  stylePreferences: StylePreferences
): Promise<Omit<StyleSuggestion, "id"> | null> => {
  const client = getAiClient();

  // ✅ Correct models
  const textModel = "gemini-2.5-flash"; // text generation
  const imageModel = "gemini-2.5-flash-image"; // image generation

  try {
    // Step 1: Generate text-based style idea
    const garmentTypeInstruction =
      stylePreferences.garmentType === "Any"
        ? "The output can be a long gown, a short dress, a skirt and top set, or trousers and a blouse."
        : `The output must be a ${stylePreferences.garmentType}.`;

    const selectedInspirations = ["Nigerian", ...stylePreferences.inspirations];
    const inspirationText = selectedInspirations
      .map(
        (key) =>
          `* **${key}:** ${inspirationPool[key as keyof typeof inspirationPool]}`
      )
      .join("\n");

    const textPrompt = `You are 'Tailora', a creative AI fashion design assistant, specializing in **cultural fusion fashion**. 
Invent a novel design fusing Nigerian fashion with ${stylePreferences.inspirations.join(" & ")} fashion.
${garmentTypeInstruction}

**Inspiration Pool:**
${inspirationText}

**Inputs:**
- Fabric: analyze texture, pattern, and color.
- Customer: use complexion for flattering color choices.
- Body Type: ${customerDetails.bodyNature}, Size: ${customerDetails.bodySize}.

**Tailora Branding Mandate:**
- Include elements inspired by the Tailora logo’s serif typography (e.g., embroidery, clasp, or cut lines).
- Include Tailora’s gold color (#D4AF37) subtly in the design.
- Mention how both are incorporated.

Output must be a valid JSON object with:
{
  "styleName": "...",
  "description": "...",
  "occasions": "..."
}`;

    const textResponse = await client.models.generateContent({
      model: textModel,
      contents: {
        role: "user",
        parts: [
          { inlineData: { data: fabricImageBase64, mimeType: fabricMimeType } },
          { inlineData: { data: customerImageBase64, mimeType: customerMimeType } },
          { text: textPrompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            styleName: { type: Type.STRING },
            description: { type: Type.STRING },
            occasions: { type: Type.STRING },
          },
          required: ["styleName", "description", "occasions"],
        },
      },
    });

    let jsonText = textResponse.text?.trim() || "";
    if (jsonText.startsWith("```json")) jsonText = jsonText.slice(7, -3).trim();
    else if (jsonText.startsWith("```")) jsonText = jsonText.slice(3, -3).trim();

    const styleDetails = JSON.parse(jsonText);
    if (!styleDetails?.description) {
      console.error("Invalid style details:", textResponse.text);
      return null;
    }

    // Step 2: Generate sketch
    const imagePrompt = `Generate a professional fashion sketch based on this description:
${styleDetails.description}

Guidelines:
- Use the customer's skin tone from the provided image.
- Fabric must match the provided pattern and color.
- Include a West African-style gele (headwrap) that complements the outfit without hiding neckline/shoulders.
- Visually include Tailora’s gold (#D4AF37) and logo-inspired typography elements.`;

    const imageResponse = await client.models.generateContent({
      model: imageModel,
      contents: {
        role: "user",
        parts: [
          { inlineData: { data: fabricImageBase64, mimeType: fabricMimeType } },
          { inlineData: { data: customerImageBase64, mimeType: customerMimeType } },
          { text: imagePrompt },
        ],
      },
      config: { responseModalities: [Modality.IMAGE] },
    });

    const parts = imageResponse.candidates?.[0]?.content?.parts || [];
    const sketchPart = parts.find((p) => p.inlineData);
    const sketchUrl = sketchPart
      ? `data:${sketchPart.inlineData.mimeType};base64,${sketchPart.inlineData.data}`
      : null;

    if (!sketchUrl) {
      console.error("Failed to generate sketch image.");
      return null;
    }

    return { ...styleDetails, sketchUrl };
  } catch (error: any) {
    console.error("Error in generateStyle:", error);

    if (error.message?.includes("429") || error.message?.includes("capacity"))
      throw new Error("Tailora is taking a short creative break. Please try again soon.");
    if (error.message?.includes("403") || error.message?.includes("API key"))
      throw new Error("Invalid or missing Gemini API key. Please check your configuration.");

    throw new Error("Something went wrong generating your design. Please retry shortly.");
  }
};

/**
 * Refines an existing design based on feedback.
 */
export const refineStyle = async (
  fabricImageBase64: string,
  fabricMimeType: string,
  customerImageBase64: string,
  customerMimeType: string,
  customerDetails: CustomerDetails,
  previousSuggestion: StyleSuggestion,
  refinementPrompt: string
): Promise<Omit<StyleSuggestion, "id"> | null> => {
  const client = getAiClient();
  const textModel = "gemini-2.5-flash";
  const imageModel = "gemini-2.5-flash-image"; // ✅ corrected

  try {
    const textPrompt = `You are 'Tailora', refining a previous fashion design.

**Previous Design:**
Name: ${previousSuggestion.styleName}
Description: ${previousSuggestion.description}

**User Feedback:** "${refinementPrompt}"

Adjust the design accordingly while keeping its original essence.
Ensure Tailora branding (logo-inspired typography + gold color #D4AF37) remains visible.

Output valid JSON with:
{
  "styleName": "...",
  "description": "...",
  "occasions": "..."
}`;

    const textResponse = await client.models.generateContent({
      model: textModel,
      contents: {
        role: "user",
        parts: [
          { inlineData: { data: fabricImageBase64, mimeType: fabricMimeType } },
          { inlineData: { data: customerImageBase64, mimeType: customerMimeType } },
          { text: textPrompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            styleName: { type: Type.STRING },
            description: { type: Type.STRING },
            occasions: { type: Type.STRING },
          },
          required: ["styleName", "description", "occasions"],
        },
      },
    });

    let jsonText = textResponse.text?.trim() || "";
    if (jsonText.startsWith("```json")) jsonText = jsonText.slice(7, -3).trim();
    else if (jsonText.startsWith("```")) jsonText = jsonText.slice(3, -3).trim();

    const styleDetails = JSON.parse(jsonText);
    if (!styleDetails?.description) {
      console.error("Invalid refined style details:", textResponse.text);
      return null;
    }

    const imagePrompt = `Generate a professional sketch for this refined design:
${styleDetails.description}
Follow same image and branding rules as before.`;

    const imageResponse = await client.models.generateContent({
      model: imageModel,
      contents: {
        role: "user",
        parts: [
          { inlineData: { data: fabricImageBase64, mimeType: fabricMimeType } },
          { inlineData: { data: customerImageBase64, mimeType: customerMimeType } },
          { text: imagePrompt },
        ],
      },
      config: { responseModalities: [Modality.IMAGE] },
    });

    const parts = imageResponse.candidates?.[0]?.content?.parts || [];
    const sketchPart = parts.find((p) => p.inlineData);
    const sketchUrl = sketchPart
      ? `data:${sketchPart.inlineData.mimeType};base64,${sketchPart.inlineData.data}`
      : null;

    if (!sketchUrl) {
      console.error("Failed to generate refined sketch image.");
      return null;
    }

    return { ...styleDetails, sketchUrl };
  } catch (error: any) {
    console.error("Error in refineStyle:", error);

    if (error.message?.includes("429") || error.message?.includes("capacity"))
      throw new Error("Tailora is taking a short creative break. Please try again soon.");
    if (error.message?.includes("403") || error.message?.includes("API key"))
      throw new Error("Invalid or missing Gemini API key. Please check your configuration.");

    throw new Error("Something went wrong refining your design. Please retry shortly.");
  }
};
