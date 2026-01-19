# System Health and Monitoring

## Overview

This document describes the health monitoring system for the autonomous AI website.

> **Note:** The current implementation provides baseline monitoring endpoints that return healthy status (100% success rate). For production use with real metrics, these endpoints should be integrated with:
> - Cloudflare KV or D1 for persistent storage
> - AI worker integration to POST actual operational data
> - Real-time calculation of success rates from worker operations
>
> Until integrated with the AI worker, these endpoints serve as a monitoring infrastructure baseline.

## Health Endpoints

### `/__health`
Primary health check endpoint that reports system SLA status.

**Response Format:**
```json
{
  "status": "GOOD" | "WARNING" | "CRITICAL",
  "successRate": 100,
  "stale": false,
  "ageHours": 0,
  "thresholds": {
    "warn": 85,
    "crit": 60,
    "staleHours": 36
  },
  "lastCheck": "2026-01-19T21:00:00.000Z",
  "message": "System is healthy. All AI operations functioning normally."
}
```

**Status Levels:**
- `GOOD`: Success rate >= 85%
- `WARNING`: Success rate < 85% but >= 60%
- `CRITICAL`: Success rate < 60%

**Stale Detection:**
- Data is considered stale if no updates received for 36 hours
- Stale data indicates the AI worker may not be running

### `/metrics`
Prometheus-compatible metrics endpoint for monitoring.

**Metrics Exposed:**
- `ai_worker_success_rate`: Current success rate percentage
- `ai_worker_operations_total`: Total operations attempted
- `ai_worker_failures_total`: Total failed operations
- `ai_worker_last_run_timestamp_seconds`: Unix timestamp of last run
- `system_health_status`: Current health (0=GOOD, 1=WARNING, 2=CRITICAL)
- `content_generation_success_rate`: Content generation success rate
- `pr_automation_success_rate`: PR automation success rate

### `/__status`
Recent run summary and statistics.

**Response Format:**
```json
{
  "lastRun": {
    "timestamp": "2026-01-19T21:00:00.000Z",
    "status": "success",
    "duration": 45.2,
    "operation": "Content Generation"
  },
  "recentRuns": [...],
  "stats": {
    "totalRuns": 100,
    "successfulRuns": 100,
    "failedRuns": 0,
    "successRate": 100
  }
}
```

### `/__design-status`
Design iteration tracking for UI/UX improvements.

**Response Format:**
```json
{
  "currentIteration": 1,
  "totalIterations": 1,
  "lastUpdate": "2026-01-19T21:00:00.000Z",
  "recentIterations": [...],
  "status": "active" | "idle" | "error"
}
```

## Troubleshooting

### Success Rate Below 60% (CRITICAL)

**Symptoms:**
- Health endpoint returns status "CRITICAL"
- Success rate below 60%
- Multiple failed operations

**Common Causes:**
1. Build failures - Check if `npm run build` succeeds
2. Test failures - Verify `npm test` passes
3. Linting errors - Run `npm run lint` to check
4. Type errors - Run `npm run typecheck`
5. Missing dependencies - Run `npm install`
6. Content validation errors - Check blog posts are valid MDX

**Resolution Steps:**
1. Run full validation suite:
   ```bash
   npm install
   npm run lint
   npm run typecheck
   npm run build
   npm test
   ```
2. Fix any errors reported
3. Ensure content/blog directory has valid MDX files
4. Check that functions directory has all required endpoints
5. Verify git repository is in a clean state

### Data Marked as Stale

**Symptoms:**
- Health endpoint shows `"stale": true`
- Age exceeds 36 hours

**Common Causes:**
1. AI worker not running
2. Worker unable to reach health endpoint
3. Worker encountering repeated failures
4. Cloudflare Worker not deployed
5. Cron triggers not configured

**Resolution Steps:**
1. Verify worker is deployed: `npx wrangler deploy`
2. Check Cloudflare cron triggers are configured
3. Review worker logs for errors
4. Ensure worker has correct endpoint URLs
5. Check worker has necessary secrets/credentials

## Maintaining Good Health

### Daily Operations Checklist

For AI workers and operators to maintain > 85% success rate:

- [ ] Generate daily content update
- [ ] Run full test suite before committing
- [ ] Ensure builds succeed
- [ ] Keep dependencies up to date
- [ ] Monitor health endpoints
- [ ] Address any WARNING states promptly
- [ ] Keep git repository clean

### Best Practices

1. **Minimal Changes**: Make small, focused changes
2. **Test First**: Always test before committing
3. **Clear Commits**: Use descriptive commit messages
4. **Validate Always**: Run lint, typecheck, build, test
5. **Monitor Health**: Check `/__health` regularly
6. **Document Changes**: Update relevant docs

### Helper Scripts

Use the provided scripts in `/scripts` directory:
- `create_daily_update.mjs`: Generate daily blog posts
- `run_tests.mjs`: Validate the build and content
- See `scripts/README.md` for detailed usage

## Alerting

The system automatically creates GitHub issues when:
- Success rate drops below 60% (CRITICAL)
- Success rate drops below 85% (WARNING)
- Data becomes stale (> 36 hours)

Issues auto-close when status returns to GOOD.
