import { callClaude } from './claude.js';
import { callOpenAI } from './openai.js';
import { callGemini } from './gemini.js';

const PROVIDERS = {
  claude: callClaude,
  openai: callOpenAI,
  gemini: callGemini,
};

export async function callAI(provider, apiKey, messages) {
  const fn = PROVIDERS[provider];
  if (!fn) throw new Error(`Unknown provider: ${provider}`);
  return fn(apiKey, messages);
}
