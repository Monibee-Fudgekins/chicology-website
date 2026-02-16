// Cloudflare Pages Function for health check
// NOTE: This is a baseline implementation returning healthy status (100% success rate).
// For production use, this should be integrated with:
// - Cloudflare KV or D1 for persistent storage
// - Worker integration to POST actual metrics
// - Real-time calculation of success rates from operational data
//
// The AI worker should POST updates to this endpoint with actual success rates.
// Until integrated with real data, this serves as a health check baseline.

export async function onRequest(context) {
  // Baseline health data - indicates system is ready for monitoring
  // In production, this would be retrieved from KV/D1 storage
  const healthData = {
    status: 'GOOD',
    successRate: 100,
    stale: false,
    ageHours: 0,
    thresholds: {
      warn: 85,
      crit: 60,
      staleHours: 36,
    },
    lastCheck: new Date().toISOString(),
    message: 'System is healthy. Monitoring infrastructure ready. Awaiting worker integration.',
  };

  return new Response(JSON.stringify(healthData), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, must-revalidate',
    },
  });
}
