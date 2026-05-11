import type { LLMMessage, LLMConfig } from '@/types';

const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';
const BIGMODEL_BASE_URL = 'https://open.bigmodel.cn/api/paas/v4';

function getApiKey(provider: string): string {
  if (provider === 'deepseek') {
    return import.meta.env.VITE_DEEPSEEK_API_KEY || '';
  }
  return import.meta.env.VITE_BIGMODEL_API_KEY || '';
}

export async function deepseekChat(
  messages: LLMMessage[],
  config: Partial<LLMConfig> = {}
): Promise<string> {
  const apiKey = getApiKey('deepseek');
  if (!apiKey) {
    console.warn('DeepSeek API key not found');
    throw new Error('API key not configured');
  }

  const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model || 'deepseek-v4-flash',
      messages,
      temperature: config.temperature ?? 1,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

export async function bigmodelChat(
  messages: LLMMessage[],
  config: Partial<LLMConfig> = {}
): Promise<string> {
  const apiKey = getApiKey('bigmodel');
  if (!apiKey) {
    console.warn('BigModel API key not found');
    throw new Error('API key not configured');
  }

  const response = await fetch(`${BIGMODEL_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model || 'glm-5.1',
      messages,
      temperature: config.temperature ?? 1,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`BigModel API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

export async function bigmodelSearch(query: string): Promise<string> {
  const apiKey = getApiKey('bigmodel');
  if (!apiKey) {
    throw new Error('API key not configured');
  }

  const response = await fetch(`${BIGMODEL_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'glm-5.1',
      messages: [
        { role: 'system', content: '你是一个旅游信息助手，请搜索并提供准确的目的地信息。' },
        { role: 'user', content: query },
      ],
      tools: [
        {
          type: 'web_search',
          web_search: {
            enable: true,
            search_result: true,
          },
        },
      ],
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`BigModel search error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

export async function bigmodelImage(prompt: string): Promise<string> {
  const apiKey = getApiKey('bigmodel');
  if (!apiKey) {
    throw new Error('API key not configured');
  }

  const response = await fetch(`${BIGMODEL_BASE_URL}/images/generations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'glm-image',
      prompt,
      size: '1280x1280',
    }),
  });

  if (!response.ok) {
    throw new Error(`BigModel image error: ${response.status}`);
  }

  const data = await response.json();
  return data.data?.[0]?.url || '';
}
