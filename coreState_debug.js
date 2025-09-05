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
async function markRunSuccess(env) {
  try {
    await env.STATE_KV.put("consecutive_failures", "0");
    const k = "metrics:run_success_total";
    const cur = parseInt(await env.STATE_KV.get(k) || "0", 10) + 1;
    await env.STATE_KV.put(k, String(cur));
    await closeFailureIssueIfResolved(env);
  } catch {
  }
}
async function markRunFailure(env) {
  try {
    const cur = await getNumericKV(env, "consecutive_failures");
    await env.STATE_KV.put("consecutive_failures", String(cur + 1));
    const k = "metrics:run_failure_total";
    const fcur = parseInt(await env.STATE_KV.get(k) || "0", 10) + 1;
    await env.STATE_KV.put(k, String(fcur));
  } catch {
  }
}
async function setDegradedMode(env, on, reason) {
  try {
    if (on) {
      await env.STATE_KV.put("degraded_mode", "1", { expirationTtl: 6 * 3600 });
      if (reason) await env.STATE_KV.put("degraded_reason", reason.slice(0, 400));
      recordEvent(env, "degraded_mode", { reason: reason?.slice(0, 120) || "unknown" });
    } else {
      await env.STATE_KV.delete("degraded_mode");
      await env.STATE_KV.delete("degraded_reason");
      recordEvent(env, "degraded_cleared");
    }
  } catch {
  }
}
async function recordRunStart(env, id, data) {
  try {
    await env.STATE_KV.put(`run:${id}`, JSON.stringify({ id, startTs: Date.now(), ...data }));
  } catch {
  }
}
async function recordRunEnd(env, id, patch) {
  try {
    const key = `run:${id}`;
    let base = {};
    try {
      base = JSON.parse(await env.STATE_KV.get(key) || "{}");
    } catch {
    }
    base = { ...base, ...patch, endTs: Date.now() };
    await env.STATE_KV.put(key, JSON.stringify(base));
    const idxKey = "run_index";
    let arr = [];
    try {
      arr = JSON.parse(await env.STATE_KV.get(idxKey) || "[]");
    } catch {
    }
    if (!arr.includes(id)) {
      arr.push(id);
    }
    await env.STATE_KV.put(idxKey, JSON.stringify(arr.slice(-20)));
  } catch {
  }
}
async function ghJson(env, path, init) {
  const [owner, repo] = env.GITHUB_REPO.split("/");
  const url = path.startsWith("http") ? path : `https://api.github.com/repos/${owner}/${repo}${path}`;
  const r = await fetch(url, { headers: { "Authorization": `Bearer ${env.GITHUB_TOKEN}`, "Accept": "application/vnd.github+json", "User-Agent": "ai-website-worker" }, ...init });
  return { ok: r.ok, status: r.status, json: r.ok ? await r.json() : null };
}
async function ensureFailureIssue(env, streak, lastError) {
  if (!env.GITHUB_TOKEN || !env.GITHUB_REPO) return;
  try {
    const existingNumStr = await env.STATE_KV.get("failure_issue_number");
    let issueNumber = existingNumStr ? parseInt(existingNumStr, 10) : null;
    if (issueNumber) {
      const existing = await ghJson(env, `/issues/${issueNumber}`);
      if (!existing.ok || existing.json.state !== "open") {
        issueNumber = null;
      }
    }
    if (!issueNumber) {
      const body = `Automated escalation: daily AI run has failed **${streak}** consecutive times.

Last error snippet: 

\`
${(lastError || "n/a").slice(0, 300)}
\`

The self-heal system will continue attempting recovery every few hours. This issue will update automatically.`;
      const created = await ghJson(env, "/issues", { method: "POST", body: JSON.stringify({ title: "AI Daily Run Failing", body, labels: ["ai-ops", "automation"] }) });
      if (created.ok) {
        issueNumber = created.json.number;
        await env.STATE_KV.put("failure_issue_number", String(issueNumber));
        recordEvent(env, "issue_escalated", { streak });
      }
    } else {
      const comment = await ghJson(env, `/issues/${issueNumber}/comments`, { method: "POST", body: JSON.stringify({ body: `Still failing (streak=${streak}) at ${(/* @__PURE__ */ new Date()).toISOString()}

Latest error: 
\`
${(lastError || "n/a").slice(0, 300)}
\`` }) });
      if (comment.ok) recordEvent(env, "issue_escalation_update", { streak });
    }
  } catch {
  }
}
async function escalateIfNeeded(env, errorMessage) {
  try {
    const threshold = parseInt(await env.STATE_KV.get("failure_escalation_threshold") || "3", 10);
    const streak = await getNumericKV(env, "consecutive_failures");
    if (streak >= threshold) {
      await ensureFailureIssue(env, streak, errorMessage);
    }
  } catch {
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

// tests/coreState.test.ts
function makeEnv(extra = {}) {
  const store = {};
  const env = {
    STATE_KV: {
      get: async (k) => store[k] ?? null,
      put: async (k, v) => {
        store[k] = v;
      },
      delete: async (k) => {
        delete store[k];
      }
    },
    GITHUB_TOKEN: "t",
    GITHUB_REPO: "owner/repo",
    GITHUB_DEFAULT_BRANCH: "main",
    ...extra
  };
  return { env, store };
}
var originalFetch = globalThis.fetch;
globalThis.fetch = async (url, init) => {
  if (url.includes("/issues") && init?.method === "POST") {
    return { ok: true, status: 201, json: async () => ({ number: 123, state: "open" }) };
  }
  if (url.includes("/issues/123") && !init?.method) {
    return { ok: true, status: 200, json: async () => ({ number: 123, state: "open" }) };
  }
  return { ok: true, status: 200, json: async () => ({}) };
};
async function testFailureCounterAndReset() {
  const { env, store } = makeEnv();
  await markRunFailure(env);
  await markRunFailure(env);
  let val = await getNumericKV(env, "consecutive_failures");
  if (val !== 2) throw new Error("Expected 2 failures, got " + val);
  await markRunSuccess(env);
  val = await getNumericKV(env, "consecutive_failures");
  if (val !== 0) throw new Error("Reset failed");
}
async function testDegradedModeToggle() {
  const { env, store } = makeEnv();
  await setDegradedMode(env, true, "test");
  if (!store["degraded_mode"]) throw new Error("Degraded flag not set");
  await setDegradedMode(env, false);
  if (store["degraded_mode"]) throw new Error("Degraded flag not cleared");
}
async function testRunRecordLifecycle() {
  const { env, store } = makeEnv();
  await recordRunStart(env, "daily-2025-09-03", { id: "daily-2025-09-03" });
  if (!store["run:daily-2025-09-03"]) throw new Error("Run start not stored");
  await recordRunEnd(env, "daily-2025-09-03", { success: true });
  const final = JSON.parse(store["run:daily-2025-09-03"]);
  if (!final.success || !final.endTs) throw new Error("Run end not recorded properly");
  const idx = JSON.parse(store["run_index"]);
  if (!Array.isArray(idx) || idx.length === 0) throw new Error("Run index missing");
}
async function testEscalation() {
  const { env, store } = makeEnv();
  await markRunFailure(env);
  await markRunFailure(env);
  await markRunFailure(env);
  await escalateIfNeeded(env, "boom");
  if (!store["failure_issue_number"]) throw new Error("Escalation issue not created");
}
(async () => {
  const tests = [
    ["failure counter reset", testFailureCounterAndReset],
    ["degraded mode toggle", testDegradedModeToggle],
    ["run record lifecycle", testRunRecordLifecycle],
    ["escalation issue creation", testEscalation]
  ];
  let pass = 0;
  try {
    for (const [name, fn] of tests) {
      try {
        await fn();
        console.log("PASS", name);
        pass++;
      } catch (e) {
        console.error("FAIL", name, e);
      }
    }
    console.log(`${pass}/${tests.length} core state tests passed`);
  } finally {
    globalThis.fetch = originalFetch;
  }
})();
