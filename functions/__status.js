// Cloudflare Pages Function for status
// NOTE: This is a baseline implementation with mock data.
// For production use, this should be integrated with:
// - Cloudflare KV or D1 for persistent run history
// - Worker integration to log actual operations
// - Real-time tracking of success/failure rates
//
// Until integrated with real data, this serves as a status endpoint baseline.

export async function onRequest(context) {
  const now = new Date();
  
  // Mock data showing successful operations
  // In production, this would be retrieved from persistent storage
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
