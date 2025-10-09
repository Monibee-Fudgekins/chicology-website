// Simple test for closeIssue function
import { closeFailureIssueIfResolved } from '../worker/core';

(async ()=>{
  console.log('=== MINIMAL CLOSE ISSUE TEST ===');
  
  const calls = [];
  const originalFetch = globalThis.fetch;
  
  globalThis.fetch = async (url, init) => {
    console.log(`FETCH: ${init?.method || 'GET'} ${url}`);
    calls.push({ url, method: init?.method || 'GET' });
    
    if (url.includes('/issues/123') && (!init || init.method === 'GET')) {
      return new Response(JSON.stringify({ number: 123, state: 'open' }), { status: 200 });
    } else if (url.includes('/issues/123') && init?.method === 'PATCH') {
      return new Response(JSON.stringify({ number: 123, state: 'closed' }), { status: 200 });
    }
    return new Response('Not found', { status: 404 });
  };

  const env = {
    GITHUB_REPO: 'owner/repo',
    GITHUB_TOKEN: 'test',
    STATE_KV: {
  get: async (key) => {
        console.log(`KV.get(${key})`);
        if (key === 'consecutive_failures') return '0';
        if (key === 'failure_issue_number') return '123';
        return null;
      },
      put: async () => {},
      delete: async () => {}
    },
    ANALYTICS: { writeDataPoint: () => {} }
  };

  try {
    await closeFailureIssueIfResolved(env);
    console.log('Function completed. Calls made:', calls.length);
    console.log('Calls:', calls);
    
    if (calls.length >= 2) {
      console.log('PASS: Expected calls made');
    } else {
      console.log('FAIL: Not enough calls made');
    }
  } finally {
    if (originalFetch) {
      globalThis.fetch = originalFetch;
    } else {
      delete globalThis.fetch;
    }
  }
})();
