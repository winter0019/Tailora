import axios from "axios";
import "dotenv/config"; // Load .env file if used locally
import type { CustomerDetails, StyleSuggestion, StylePreferences } from "../types";

const STABILITY_API_KEY = process.env.STABILITY_API_KEY;

// --- Stability AI Style Generator ---
export async function generateStyle(
  fabricImageBase64: string,
  fabricMimeType: string,
  customerImageBase64: string,
  customerMimeType: string,
  customerDetails: CustomerDetails,
  stylePreferences: StylePreferences
): Promise<Omit<StyleSuggestion, "id"> | null> {
  try {
    // Build a detailed text prompt for the AI model
    const textDescription = `
      Design a fashion outfit that fuses ${stylePreferences.inspirations.join(", ")} with Nigerian cultural aesthetics.
      Body type: ${customerDetails.bodyNature}. Size: ${customerDetails.bodySize}.
      Incorporate ${stylePreferences.colorTone || "warm, elegant"} color tones,
      with refined gold accents and smooth logo-inspired typography lines.
    `.trim();

    // Make the request to Stability AI
    const response = await axios.post(
      "https://api.stability.ai/v2beta/stable-image/generate/sd3",
      {
        prompt: textDescription,
        output_format: "base64",
      },
      {
        headers: {
          Authorization: `Bearer ${STABILITY_API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    // Handle possible response formats
    const imageBase64 =
      response.data.image ||
      response.data.artifacts?.[0]?.base64 ||
      null;

    if (!imageBase64) {
      console.error("No image returned from Stability API:", response.data);
      return null;
    }

    // Return final styled output
    return {
      styleName: "Fusion Design",
      description: textDescription,
      occasions: "Cultural, formal, casual",
      sketchUrl: `data:image/png;base64,${imageBase64}`,
    };
  } catch (error: any) {
    console.error("❌ Stability AI API Error:", error.response?.data || error.message);
    return null;
  }
}

export const refineStyle = generateStyle;
