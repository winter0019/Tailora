// src/services/aiRouterService.ts
import { generateStyle as generateGemini, refineStyle as refineGemini } from './geminiService';
import { generateStyle as generateOpenAI, refineStyle as refineOpenAI } from './openaiService';
import { generateStyle as generateDeepAI, refineStyle as refineDeepAI } from './deepaiService';

export async function generateStyleWithFallback(...args: Parameters<typeof generateGemini>) {
  const providers = [
    { name: 'Gemini', fn: generateGemini },
    { name: 'OpenAI', fn: generateOpenAI },
    { name: 'DeepAI', fn: generateDeepAI },
  ];

  for (const { name, fn } of providers) {
    try {
      console.log(`🔹 Trying ${name}...`);
      const result = await fn(...args);
      if (result) return result;
    } catch (err) {
      console.warn(`⚠️ ${name} failed:`, (err as Error).message);
    }
  }

  throw new Error("All AI services failed. Please try again later.");
}

export async function refineStyleWithFallback(...args: Parameters<typeof refineGemini>) {
  const providers = [
    { name: 'Gemini', fn: refineGemini },
    { name: 'OpenAI', fn: refineOpenAI },
    { name: 'DeepAI', fn: refineDeepAI },
  ];

  for (const { name, fn } of providers) {
    try {
      console.log(`🔹 Refining with ${name}...`);
      const result = await fn(...args);
      if (result) return result;
    } catch (err) {
      console.warn(`⚠️ ${name} failed:`, (err as Error).message);
    }
  }

  throw new Error("All AI refinement services failed.");
}
