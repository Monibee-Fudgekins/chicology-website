// Cloudflare Pages Function for status
export async function onRequest(context) {
  const now = new Date();
  const mockRuns = [
    {
      timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      status: 'success',
      operation: 'Content Generation',
    },
    {
      timestamp: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(),
      status: 'success',
      operation: 'PR Automation',
    },
    {
      timestamp: new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString(),
      status: 'success',
      operation: 'Content Generation',
    },
  ];
  
  const summary = {
    lastRun: {
      timestamp: mockRuns[0].timestamp,
      status: mockRuns[0].status,
      duration: 45.2,
      operation: mockRuns[0].operation,
    },
    recentRuns: mockRuns,
    stats: {
      totalRuns: 100,
      successfulRuns: 100,
      failedRuns: 0,
      successRate: 100,
    },
  };

  return new Response(JSON.stringify(summary), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, must-revalidate',
    },
  });
}
