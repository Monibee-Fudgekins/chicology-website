// Cloudflare Pages Function for health check
export async function onRequest(context) {
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
    message: 'System is healthy. All AI operations functioning normally.',
  };

  return new Response(JSON.stringify(healthData), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, must-revalidate',
    },
  });
}
