// Simple test to trigger the daily run locally
const { performDailyRun } = require('./worker/lib');

// Mock environment (you'd need to set these properly)
const mockEnv = {
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  GITHUB_REPO: process.env.GITHUB_REPO || 'monibee-fudgekin/chicology-website',
  GITHUB_DEFAULT_BRANCH: 'main',
  AI_GATEWAY_URL: process.env.AI_GATEWAY_URL,
  MODEL_CODE_GENERATION: process.env.MODEL_CODE_GENERATION || '@cf/meta/llama-3.1-8b-instruct',
  SITE_ORIGIN: process.env.SITE_ORIGIN || 'https://chicology.netlify.app',
  STATE_KV: {
    get: async (key) => null,
    put: async (key, value) => console.log(`KV PUT: ${key} = ${value}`),
    delete: async (key) => console.log(`KV DELETE: ${key}`)
  }
};

async function testDailyRun() {
  try {
    console.log('Testing daily run functionality...');
    const today = new Date().toISOString().slice(0, 10);
    const result = await performDailyRun(mockEnv, today);
    console.log('Daily run result:', result);
  } catch (error) {
    console.error('Daily run failed:', error);
  }
}

testDailyRun();
