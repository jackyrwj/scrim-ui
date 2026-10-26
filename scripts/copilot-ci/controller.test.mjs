import test from "node:test";
import assert from "node:assert/strict";
import { MARKER, runController, githubClient } from "./controller.mjs";

const SHA = "a".repeat(40);
const ROOT = "/repos/jackyrwj/scrim-ui";
const user = { login: "jackyrwj", id: 99, type: "User" };

function fixture(conclusion = "success") {
  const repo = { id: 1345173998, full_name: "jackyrwj/scrim-ui", owner: user, default_branch: "main" };
  const run = { id: 100, workflow_id: 10, run_attempt: 1, repository: repo, head_repository: repo,
    head_sha: SHA, head_branch: "test/fixture", event: "pull_request", status: "completed", conclusion };
  const pull = { number: 8, state: "open", draft: false, base: { ref: "main" },
    head: { sha: SHA, repo }, labels: [{ name: "copilot-ci" }], requested_reviewers: [] };
  const f = { event: { repository: repo, workflow_run: { id: 100, run_attempt: 1 } }, run, pull,
    workflow: { name: "CI", path: ".github/workflows/ci.yml" }, comments: [], reviews: [],
    mutations: [], gets: [], runs: [], user, failReview: false, onGetPull: null, onGetRuns: null };
  f.api = {
    get: async (path) => {
      f.gets.push(path);
      if (path === "/user") return f.user;
      if (path === `${ROOT}/actions/runs/${f.run.id}`) return structuredClone(f.run);
      if (path === `${ROOT}/actions/workflows/10`) return f.workflow;
      if (path.startsWith(`${ROOT}/actions/workflows/10/runs?`)) {
        f.onGetRuns?.();
        return { workflow_runs: [f.run, ...f.runs] };
      }
      if (path === `${ROOT}/pulls/8`) {
        f.onGetPull?.();
        return structuredClone(f.pull);
      }
      throw new Error(`Unexpected GET ${path}`);
    },
    list: async (path) => {
      if (path.startsWith(`${ROOT}/pulls?`)) return [structuredClone(f.pull)];
      if (path === `${ROOT}/issues/8/comments`) return structuredClone(f.comments);
      if (path === `${ROOT}/pulls/8/reviews`) return f.reviews;
      throw new Error(`Unexpected list ${path}`);
    },
    post: async (path, body) => {
      f.mutations.push({ method: "POST", path, body });
      assert.doesNotMatch(body.body ?? "", /@copilot\b/i, "review-only mode never invokes the coding agent");
      if (path.endsWith("/requested_reviewers") && f.failReview) throw new Error("Network acknowledgement lost");
      const comment = { id: f.comments.length + 1, user, ...body, html_url: "https://github.com/jackyrwj/scrim-ui/pull/8#test" };
      if (path.endsWith("/comments")) f.comments.push(comment);
      return comment;
    },
    patch: async (path, body) => {
      f.mutations.push({ method: "PATCH", path, body });
      Object.assign(f.comments.find((c) => c.id === Number(path.split("/").at(-1))), body);
    },
  };
  f.execute = () => runController(f.api, f.event, { now: () => "2026-10-26T00:00:00Z" });
  f.reviewRequests = () => f.mutations.filter((m) => m.path.endsWith("/requested_reviewers"));
  f.nextHead = (id, letter) => {
    f.run.id = id;
    f.event.workflow_run.id = id;
    f.run.head_sha = letter.repeat(40);
    f.pull.head.sha = f.run.head_sha;
  };
  return f;
}

test("failed CI never writes a comment, invokes Copilot, or requests a review", async () => {
  const f = fixture("failure");
  for (const [id, letter] of [[100, "a"], [101, "a"], [102, "b"], [103, "c"]]) {
    f.nextHead(id, letter);
    assert.equal((await f.execute()).reason, "ci-failed-local-repair");
  }
  assert.equal(f.mutations.length, 0);
  assert.equal(f.gets.includes("/user"), false);
});

test("failed CI leaves an existing review ledger unchanged", async () => {
  const f = fixture();
  await f.execute();
  const before = structuredClone(f.comments);
  const writes = f.mutations.length;
  f.nextHead(101, "b");
  f.run.conclusion = "failure";
  assert.equal((await f.execute()).reason, "ci-failed-local-repair");
  assert.deepEqual(f.comments, before);
  assert.equal(f.mutations.length, writes);
});

test("green CI requests code review once per head, including a local fix", async () => {
  const f = fixture();
  assert.equal((await f.execute()).result, "review-requested");
  assert.equal((await f.execute()).reason, "review-already-present-or-reserved");
  f.run.run_attempt = 2;
  f.event.workflow_run.run_attempt = 2;
  assert.equal((await f.execute()).reason, "review-already-present-or-reserved");
  assert.deepEqual(f.reviewRequests()[0].body, { reviewers: ["copilot-pull-request-reviewer[bot]"] });
  f.nextHead(101, "b");
  assert.equal((await f.execute()).result, "review-requested");
  assert.equal(f.reviewRequests().length, 2);
  assert.match(f.comments[0].body, /code review only/);
});

test("legacy repair history is preserved without requesting more repairs", async () => {
  const f = fixture();
  const repairs = [{ sha: "b".repeat(40), run: 80, status: "requested" },
    { sha: "c".repeat(40), run: 90, status: "unknown" }];
  f.comments = [{ id: 1, user, body: `${MARKER}${JSON.stringify({ version: 1, repairs, reviews: [] })}\n-->` }];
  assert.equal((await f.execute()).result, "review-requested");
  const state = JSON.parse(f.comments[0].body.split(MARKER)[1].split("\n-->")[0]);
  assert.deepEqual(state.repairs, repairs);
});

test("current-head reviews and pending Copilot requests are not duplicated", async () => {
  for (const pending of [false, true]) {
    const f = fixture();
    if (pending) f.pull.requested_reviewers = [{ id: 175728472, login: "Copilot" }];
    else f.reviews = [{ commit_id: SHA, user: { login: "copilot-pull-request-reviewer[bot]" } }];
    assert.equal((await f.execute()).reason, "review-already-present-or-reserved");
    assert.equal(f.reviewRequests().length, 0);
  }
});

test("an ambiguous review POST remains reserved and is not retried", async () => {
  const f = fixture();
  f.failReview = true;
  await assert.rejects(f.execute(), /acknowledgement lost/);
  assert.equal((await f.execute()).reason, "review-already-present-or-reserved");
  assert.equal(f.reviewRequests().length, 1);
  assert.match(f.comments[0].body, /"status":"unknown"/);
});

test("old-head reviews do not suppress a successful new-head review", async () => {
  const f = fixture();
  f.reviews = [{ commit_id: "b".repeat(40), user: { id: 175728472 } }];
  assert.equal((await f.execute()).result, "review-requested");
});

for (const [name, change] of [
  ["missing opt-in label", (f) => { f.pull.labels = []; }],
  ["draft", (f) => { f.pull.draft = true; }],
  ["closed", (f) => { f.pull.state = "closed"; }],
  ["wrong base", (f) => { f.pull.base.ref = "other"; }],
  ["stale head", (f) => { f.pull.head.sha = "b".repeat(40); }],
  ["external fork", (f) => { f.run.head_repository = { id: 55 }; }],
  ["wrong workflow", (f) => { f.workflow.path = ".github/workflows/untrusted.yml"; }],
  ["canceled CI", (f) => { f.run.conclusion = "cancelled"; }],
  ["approval required", (f) => { f.run.conclusion = "action_required"; }],
  ["old attempt", (f) => { f.run.run_attempt = 2; }],
  ["main push", (f) => { f.run.event = "push"; }],
  ["newer CI exists", (f) => { f.runs = [{ id: 101, head_sha: SHA, head_repository: f.run.head_repository }]; }],
]) {
  test(`${name} causes no mutation or request`, async () => {
    const f = fixture();
    change(f);
    assert.equal((await f.execute()).result, "skipped");
    assert.equal(f.mutations.length, 0);
  });
}

test("a concurrent head update before reservation prevents all writes", async () => {
  const f = fixture();
  let reads = 0;
  f.onGetPull = () => { if (++reads === 3) f.pull.head.sha = "b".repeat(40); };
  assert.equal((await f.execute()).reason, "head-or-run-changed");
  assert.equal(f.mutations.length, 0);
});

test("a newer matching fork run cannot suppress same-repository review", async () => {
  const f = fixture();
  f.runs = [{ id: 101, head_sha: SHA, head_branch: f.run.head_branch, head_repository: { id: 55 } }];
  assert.equal((await f.execute()).result, "review-requested");
});

test("a head update after reservation stops before requesting review", async () => {
  const f = fixture();
  let reads = 0;
  f.onGetPull = () => { if (++reads === 4) f.pull.head.sha = "b".repeat(40); };
  assert.equal((await f.execute()).reason, "changed-after-reservation");
  assert.equal(f.reviewRequests().length, 0);
  assert.match(f.comments[0].body, /"reviews":\[\]/);
});

test("a newer successful run can review after an undispatched reservation", async () => {
  const f = fixture();
  let reads = 0;
  f.onGetRuns = () => {
    if (++reads === 3) f.runs = [{ id: 101, head_sha: SHA, head_repository: f.run.head_repository }];
  };
  assert.equal((await f.execute()).reason, "changed-after-reservation");
  assert.equal(f.reviewRequests().length, 0);
  f.onGetRuns = null;
  f.run.id = 101;
  f.event.workflow_run.id = 101;
  f.runs = [];
  assert.equal((await f.execute()).result, "review-requested");
  assert.equal((await f.execute()).reason, "review-already-present-or-reserved");
  assert.equal(f.reviewRequests().length, 1);
});

test("a pre-dispatch GET failure releases the unused review reservation", async () => {
  const f = fixture();
  let reads = 0;
  f.onGetRuns = () => { if (++reads === 3) throw new Error("GitHub GET unavailable"); };
  await assert.rejects(f.execute(), /GitHub GET unavailable/);
  assert.equal(f.reviewRequests().length, 0);
  assert.match(f.comments[0].body, /"reviews":\[\]/);
  f.onGetRuns = null;
  assert.equal((await f.execute()).result, "review-requested");
});

test("the review limit never writes an unreadable ledger", async () => {
  const f = fixture();
  const reviews = Array.from({ length: 100 }, (_, i) => ({
    sha: i.toString(16).padStart(40, "0"), run: i + 1, status: "requested",
  }));
  f.comments = [{ id: 1, user, body: `${MARKER}${JSON.stringify({ version: 1, repairs: [], reviews })}\n-->` }];
  assert.equal((await f.execute()).reason, "review-limit");
  assert.equal((await f.execute()).reason, "review-limit");
  assert.equal(f.reviewRequests().length, 0);
});

test("non-owner tokens and corrupt owner ledgers fail closed; forged ledgers are ignored", async () => {
  const wrongUser = fixture();
  wrongUser.user = { ...user, login: "github-actions[bot]", type: "Bot" };
  await assert.rejects(wrongUser.execute(), /must belong to the repository owner/);
  assert.equal(wrongUser.mutations.length, 0);
  const forged = fixture();
  forged.comments = [{ id: 11, user: { id: 1000 }, body: `${MARKER}invalid\n-->` }];
  assert.equal((await forged.execute()).result, "review-requested");
  const corrupt = fixture();
  corrupt.comments = [{ id: 1, user, body: `${MARKER}invalid\n-->` }];
  await assert.rejects(corrupt.execute());
  assert.equal(corrupt.mutations.length, 0);
});

test("missing credentials and API errors do not expose token or response text", async () => {
  assert.throws(() => githubClient(""), /Missing COPILOT_AUTOMATION_TOKEN/);
  const client = githubClient("secret-value", async () => ({ ok: false, status: 403 }));
  await assert.rejects(client.get("/user"), (e) => e.message.includes("HTTP 403") && !e.message.includes("secret-value"));
});
