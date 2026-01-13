// Debug version of the test to see what's happening
import { closeFailureIssueIfResolved, closeDesignPauseIssueIfResolved } from './worker/core';

(async ()=>{
  const calls: any[] = [];
  // Mock fetch: first GET returns open issue, subsequent PATCH closes
  (globalThis as any).fetch = async (url: string, init?: any) => {
    console.log('FETCH CALL:', { url, method: init?.method || 'GET' });
    calls.push({ url, init });
    if (!init || init.method === undefined || init.method === 'GET') {
      return new Response(JSON.stringify({ number: 123, state: 'open' }), { status: 200 });
    }
    return new Response(JSON.stringify({ number: 123, state: 'closed' }), { status: 200 });
  };
  const kv: Record<string,string> = {
    'failure_issue_number': '123',
    'consecutive_failures': '0',
    'design_pause_issue_number': '456',
    'last_design_iteration_date': new Date().toISOString().slice(0,10)
  };
  const env: any = {
    GITHUB_REPO: 'owner/repo',
    GH_PAT_PUBLISH: 't',
    STATE_KV: { get: async (k:string)=> kv[k], put: async (k:string,v:string)=>{ kv[k]=v; }, delete: async(k:string)=>{ delete kv[k]; } },
    ANALYTICS: { writeDataPoint: ()=>{} }
  };
  
  console.log('Calling closeFailureIssueIfResolved...');
  await closeFailureIssueIfResolved(env);
  console.log('Calling closeDesignPauseIssueIfResolved...');
  await closeDesignPauseIssueIfResolved(env);
  
  console.log('All calls made:', calls.length);
  const patchCalls = calls.filter(c=> c.init && c.init.method === 'PATCH');
  console.log('PATCH calls:', patchCalls.length);
  patchCalls.forEach((call, i) => {
    console.log(`PATCH ${i+1}:`, call.url);
  });
  
  if (patchCalls.length < 2) {
    console.error('Expected both issues to be patched closed');
    console.log('KV state:');
    for (const [k, v] of Object.entries(kv)) {
      console.log(`  ${k}: ${v}`);
    }
  } else {
    console.log('PASS issueAutoClose test');
  }
})();
