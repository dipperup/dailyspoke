import type { DeepSeekConfig } from '../types';

const MYMEMORY = 'https://api.mymemory.translated.net/get';

export async function translateText(text: string, config?: DeepSeekConfig): Promise<string> {
  if (config?.key) {
    return translateDeepSeek(text, config);
  }
  return translateMyMemory(text);
}

async function translateMyMemory(text: string): Promise<string> {
  const params = new URLSearchParams({ q: text, langpair: 'en|zh' });
  const res = await fetch(`${MYMEMORY}?${params}`);
  if (!res.ok) throw new Error(`MyMemory failed: ${res.status}`);
  const data = await res.json();
  return data.responseData?.translatedText ?? text;
}

async function translateDeepSeek(text: string, config: DeepSeekConfig): Promise<string> {
  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.key}`,
    },
    body: JSON.stringify({
      model: config.model || 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'Translate the following English to Chinese. Return only the translation, no extra text.',
        },
        { role: 'user', content: text },
      ],
      max_tokens: 1024,
      temperature: 0.3,
    }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`DeepSeek failed: ${res.status} ${err}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? text;
}
