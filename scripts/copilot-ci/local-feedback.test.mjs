import test from "node:test";
import assert from "node:assert/strict";
import { readFeedback, ghReadClient } from "./local-feedback.mjs";

const ROOT = "/repos/jackyrwj/scrim-ui";
const SHA = "a".repeat(40);
function fixture(conclusion = "success") {
  const repo = { id: 1345173998, default_branch: "main" };
  const pull = { state: "open", draft: false, base: { ref: "main" },
    head: { sha: SHA, ref: "task/example", repo }, labels: [{ name: "copilot-ci" }],
    html_url: "https://github.com/jackyrwj/scrim-ui/pull/10" };
  const run = { id: 100, run_attempt: 1, event: "pull_request", head_sha: SHA,
    head_branch: pull.head.ref, head_repository: repo, status: "completed", conclusion,
    html_url: "https://github.com/jackyrwj/scrim-ui/actions/runs/100" };
  const f = { repo, pull, run, runs: [], reviews: [], comments: [], onGetPull: null, onGetRuns: null };
  f.api = {
    get: async (path) => {
      if (path === ROOT) return repo;
      if (path === `${ROOT}/pulls/10`) { f.onGetPull?.(); return structuredClone(pull); }
      if (path.startsWith(`${ROOT}/actions/workflows/ci.yml/runs?`)) {
        f.onGetRuns?.(); return { workflow_runs: structuredClone([run, ...f.runs]) };
      }
      throw new Error(`Unexpected GET ${path}`);
    },
    list: async (path) => {
      if (path === `${ROOT}/pulls/10/reviews`) return f.reviews;
      if (path === `${ROOT}/pulls/10/comments`) return f.comments;
      throw new Error(`Unexpected list ${path}`);
    },
  };
  f.execute = () => readFeedback(f.api, 10);
  return f;
}

test("failed CI is handed to the local model with the exact head and run", async () => {
  const f = fixture("failure");
  const result = await f.execute();
  assert.equal(result.state, "ci-failed");
  assert.equal(result.sha, SHA);
  assert.equal(result.ci.id, 100);
  assert.equal(result.review, undefined);
});

test("in-progress CI waits instead of returning an older failure", async () => {
  const f = fixture("failure");
  f.runs = [{ ...f.run, id: 101, status: "in_progress", conclusion: null }];
  const result = await f.execute();
  assert.equal(result.state, "ci-pending");
  assert.equal(result.ci.id, 101);
});

test("approval, cancellation and timeout need attention rather than a code fix", async () => {
  for (const conclusion of ["action_required", "cancelled", "timed_out"]) {
    const f = fixture(conclusion);
    assert.equal((await f.execute()).state, "attention-required");
  }
});

test("CI success waits for an actual current-head Copilot review", async () => {
  const f = fixture();
  f.reviews = [{ id: 1, user: { login: "Copilot" }, commit_id: "b".repeat(40), state: "COMMENTED" },
    { id: 2, user: { login: "human" }, commit_id: SHA, state: "APPROVED" }];
  assert.equal((await f.execute()).state, "review-pending");
});

test("current-head review returns both summary and only its own inline comments", async () => {
  const f = fixture();
  f.reviews = [{ id: 3, user: { login: "Copilot" }, commit_id: SHA, state: "COMMENTED", body: "Inspect this finding." }];
  f.comments = [{ id: 1, pull_request_review_id: 2, body: "Old issue" },
    { id: 2, pull_request_review_id: 3, body: "Current issue", path: "src/example.ts", line: 4 }];
  const result = await f.execute();
  assert.equal(result.state, "review-ready");
  assert.equal(result.review.body, "Inspect this finding.");
  assert.equal(result.review.comments.length, 1);
  assert.equal(result.review.comments[0].body, "Current issue");
});

test("a matching newer fork run cannot suppress local feedback", async () => {
  const f = fixture("failure");
  f.runs = [{ ...f.run, id: 101, head_repository: { id: 55 }, status: "in_progress" }];
  assert.equal((await f.execute()).state, "ci-failed");
});

test("stopped PRs and unlabelled, closed, draft, fork or wrong-base PRs are blocked", async () => {
  for (const pr of [5, 6, 8]) assert.equal((await readFeedback({}, pr)).state, "blocked");
  for (const change of [
    (f) => { f.pull.labels = []; }, (f) => { f.pull.state = "closed"; },
    (f) => { f.pull.draft = true; }, (f) => { f.pull.head.repo = { id: 55 }; },
    (f) => { f.pull.base.ref = "other"; },
  ]) {
    const f = fixture(); change(f);
    assert.equal((await f.execute()).state, "blocked");
  }
});

test("concurrent head and same-head CI changes invalidate the snapshot", async () => {
  for (const kind of ["head", "run", "attempt"]) {
    const f = fixture("failure");
    let reads = 0;
    if (kind === "head") f.onGetPull = () => { if (++reads === 2) f.pull.head.sha = "b".repeat(40); };
    else f.onGetRuns = () => {
      if (++reads === 2) {
        if (kind === "run") f.runs = [{ ...f.run, id: 101 }];
        else f.run.run_attempt = 2;
      }
    };
    assert.equal((await f.execute()).state, "stale");
  }
});

test("the CLI adapter can issue only GET and does not echo private errors", async () => {
  const calls = [];
  const api = ghReadClient(async (...args) => { calls.push(args); return { stdout: "[]" }; });
  assert.deepEqual(await api.list(`${ROOT}/pulls/10/reviews`), []);
  assert.deepEqual(calls[0][1], ["api", "--method", "GET", `${ROOT}/pulls/10/reviews?per_page=100&page=1`]);
  const failing = ghReadClient(async () => { throw new Error("private token and response"); });
  await assert.rejects(failing.get(ROOT), (e) => e.message.includes("GitHub read failed") && !e.message.includes("private token"));
});
