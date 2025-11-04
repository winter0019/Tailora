import OpenAI from "openai";

const client = new OpenAI({ apiKey: import.meta.env.VITE_OPENAI_KEY });

export async function generateStyle(...args: any[]) {
  const [fabricImageBase64, fabricMimeType, customerImageBase64, customerMimeType, customerDetails, stylePreferences] = args;
  
  const prompt = `
  Generate a style design based on:
  - Customer body: ${customerDetails.bodyNature}, size ${customerDetails.bodySize}
  - Inspirations: ${stylePreferences.inspirations.join(", ")}
  - Garment Type: ${stylePreferences.garmentType}
  Use the attached fabric and customer image as reference.
  `;

  const response = await client.images.generate({
    model: "gpt-image-1",
    prompt,
    size: "1024x1024",
  });

  return {
    imageUrl: response.data[0].url,
    description: `Generated using OpenAI fallback`,
  };
}

export async function refineStyle(...args: any[]) {
  // You can write a smaller refinement logic here (similar structure)
  return generateStyle(...args);
}
