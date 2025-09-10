"use strict";

// worker/core.ts
function today() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
function ghHeaders(env) {
  return {
    "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
    "Accept": "application/vnd.github+json",
    "User-Agent": "ai-website-worker"
  };
}
async function getNumericKV(env, key) {
  try {
    return parseInt(await env.STATE_KV.get(key) || "0", 10);
  } catch {
    return 0;
  }
}
async function closeIssue(env, issueNumber, eventName) {
  try {
    const [owner, repo] = env.GITHUB_REPO.split("/");
    const url = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`;
    const r = await fetch(url, { headers: ghHeaders(env) });
    if (!r.ok) return;
    const issue = await r.json();
    if (issue.state !== "open") return;
    await fetch(url, { method: "PATCH", headers: { ...ghHeaders(env), "Content-Type": "application/json" }, body: JSON.stringify({ state: "closed" }) });
    recordEvent(env, eventName, { number: issueNumber });
  } catch {
  }
}
async function closeFailureIssueIfResolved(env) {
  try {
    const streak = await getNumericKV(env, "consecutive_failures");
    const numStr = await env.STATE_KV.get("failure_issue_number");
    if (streak === 0 && numStr) {
      await closeIssue(env, parseInt(numStr, 10), "issue_escalation_closed");
    }
  } catch {
  }
}
async function closeDesignPauseIssueIfResolved(env) {
  try {
    const last = await env.STATE_KV.get("last_design_iteration_date");
    if (!last) return;
    const days = (Date.now() - Date.parse(last)) / 864e5;
    if (days > 14) return;
    const numStr = await env.STATE_KV.get("design_pause_issue_number");
    if (numStr) {
      await closeIssue(env, parseInt(numStr, 10), "design_pause_issue_closed");
    }
  } catch {
  }
}
async function incrementCounter(env, event) {
  if (!env.STATE_KV) return;
  const keyTotal = `metrics:event:${event}:total`;
  const keyDay = `metrics:event:${event}:date:${today()}`;
  for (const key of [keyTotal, keyDay]) {
    try {
      const cur = parseInt(await env.STATE_KV.get(key) || "0", 10) + 1;
      await env.STATE_KV.put(key, String(cur));
    } catch {
    }
  }
}
function recordEvent(env, event, fields = {}) {
  try {
    if (!env.ANALYTICS) return;
    const numeric = {};
    const strings = {};
    for (const [k, v] of Object.entries(fields)) {
      if (typeof v === "number") numeric[k] = v;
      else if (typeof v === "string") strings[k] = v.slice(0, 500);
      else if (typeof v === "boolean") strings[k] = v ? "true" : "false";
    }
    strings.event = event;
    strings.date = today();
    env.ANALYTICS.writeDataPoint({ indexes: [event], blobs: [JSON.stringify(strings)], doubles: Object.values(numeric) });
    incrementCounter(env, event).catch(() => {
    });
  } catch {
  }
}

// debug_test.ts
(async () => {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    console.log("FETCH CALL:", { url, method: init?.method || "GET" });
    calls.push({ url, init });
    if (!init || init.method === void 0 || init.method === "GET") {
      return new Response(JSON.stringify({ number: 123, state: "open" }), { status: 200 });
    }
    return new Response(JSON.stringify({ number: 123, state: "closed" }), { status: 200 });
  };
  const kv = {
    "failure_issue_number": "123",
    "consecutive_failures": "0",
    "design_pause_issue_number": "456",
    "last_design_iteration_date": (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
  };
  const env = {
    GITHUB_REPO: "owner/repo",
    GITHUB_TOKEN: "t",
    STATE_KV: { get: async (k) => kv[k], put: async (k, v) => {
      kv[k] = v;
    }, delete: async (k) => {
      delete kv[k];
    } },
    ANALYTICS: { writeDataPoint: () => {
    } }
  };
  console.log("Calling closeFailureIssueIfResolved...");
  await closeFailureIssueIfResolved(env);
  console.log("Calling closeDesignPauseIssueIfResolved...");
  await closeDesignPauseIssueIfResolved(env);
  console.log("All calls made:", calls.length);
  const patchCalls = calls.filter((c) => c.init && c.init.method === "PATCH");
  console.log("PATCH calls:", patchCalls.length);
  patchCalls.forEach((call, i) => {
    console.log(`PATCH ${i + 1}:`, call.url);
  });
  if (patchCalls.length < 2) {
    console.error("Expected both issues to be patched closed");
    console.log("KV state:");
    for (const [k, v] of Object.entries(kv)) {
      console.log(`  ${k}: ${v}`);
    }
  } else {
    console.log("PASS issueAutoClose test");
  }
})();
