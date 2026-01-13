// Debug version to trace what's happening inside the close functions
import { closeFailureIssueIfResolved, closeDesignPauseIssueIfResolved } from './worker/core';

(async ()=>{
  const calls: any[] = [];
  const originalFetch = (globalThis as any).fetch;
  
  // Mock fetch with detailed logging
  (globalThis as any).fetch = async (url: string, init?: any) => {
    console.log('FETCH CALLED:', { url, method: init?.method || 'GET' });
    calls.push({ url, init });
    
    if (!init || init.method === undefined || init.method === 'GET') {
      const match = url.match(/\/issues\/(\d+)$/);
      const issueNumber = match ? parseInt(match[1], 10) : 123;
      const response = new Response(JSON.stringify({ number: issueNumber, state: 'open' }), { status: 200 });
      console.log('FETCH RESPONSE (GET):', { issueNumber, state: 'open' });
      return response;
    }
    
    const match = url.match(/\/issues\/(\d+)$/);
    const issueNumber = match ? parseInt(match[1], 10) : 123;
    const response = new Response(JSON.stringify({ number: issueNumber, state: 'closed' }), { status: 200 });
    console.log('FETCH RESPONSE (PATCH):', { issueNumber, state: 'closed' });
    return response;
  };

  const kv: Record<string,string> = {
    'failure_issue_number': '123',
    'consecutive_failures': '0',
    'design_pause_issue_number': '456',
    'last_design_iteration_date': '2025-09-05'
  };
  
  const env: any = {
    GITHUB_REPO: 'owner/repo',
    GH_PAT_PUBLISH: 't',
    STATE_KV: { 
      get: async (k:string)=> {
        console.log('KV GET:', k, '->', kv[k]);
        return kv[k];
      }, 
      put: async (k:string,v:string)=>{ 
        console.log('KV PUT:', k, v);
        kv[k]=v; 
      }, 
      delete: async(k:string)=>{ 
        console.log('KV DELETE:', k);
        delete kv[k]; 
      } 
    },
    ANALYTICS: { writeDataPoint: ()=>{} }
  };

  try {
    console.log('=== TESTING closeFailureIssueIfResolved ===');
    await closeFailureIssueIfResolved(env);
    
    console.log('=== TESTING closeDesignPauseIssueIfResolved ===');
    await closeDesignPauseIssueIfResolved(env);
    
    console.log('=== SUMMARY ===');
    console.log('Total calls:', calls.length);
    const patchCalls = calls.filter(c=> c.init && c.init.method === 'PATCH');
    console.log('PATCH calls:', patchCalls.length);
    
    if (patchCalls.length < 2) {
      console.error('Expected both issues to be patched closed');
    } else {
      console.log('PASS issueAutoClose debug test');
    }
  } finally {
    (globalThis as any).fetch = originalFetch;
  }
})();
