#!/usr/bin/env node

// Debug script to check daily AI state
const date = new Date().toISOString().slice(0, 10);
console.log(`=== Daily AI Debug for ${date} ===\n`);

console.log("To check the current state of your daily AI system:");
console.log("1. Go to your Cloudflare Worker dashboard");
console.log("2. Navigate to your ai-website-worker");
console.log("3. Go to 'Logs' or 'Analytics' to see execution logs");
console.log("");

console.log("Key things to check:");
console.log(`- Look for errors in the last 7 days`);
console.log(`- Check if workflows are actually executing`);
console.log(`- Look for 'workflow_completed' vs 'workflow_failed' events`);
console.log("");

console.log("To force a manual run:");
console.log("1. Use the GitHub Action 'Worker Daily AI' workflow");
console.log("2. Click 'Run workflow' manually");
console.log("3. Or use the Cloudflare Workers dashboard to trigger manually");
console.log("");

console.log("Common issues to check:");
console.log("- Are there existing daily PRs that prevent new runs?");
console.log("- Is the adaptive skip logic preventing runs due to unchanged content?");
console.log("- Are there too many failed attempts blocking new runs?");
console.log("- Is there a stale daily lock preventing execution?");
