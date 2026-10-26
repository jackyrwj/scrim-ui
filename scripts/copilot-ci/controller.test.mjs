import test from "node:test";
import assert from "node:assert/strict";
import { MARKER, runController, githubClient } from "./controller.mjs";

const SHA = "a".repeat(40);
const ROOT = "/repos/jackyrwj/scrim-ui";
const user = { login: "jackyrwj", id: 99, type: "User" };

function fixture(conclusion = "failure") {
  const repo = { id: 1345173998, full_name: "jackyrwj/scrim-ui", owner: user, default_branch: "main" };
  const run = { id: 100, workflow_id: 10, run_attempt: 1, repository: repo, head_repository: repo,
    head_sha: SHA, head_branch: "test/fixture", event: "pull_request", status: "completed", conclusion };
  const pull = { number: 8, state: "open", draft: false, base: { ref: "main" },
    head: { sha: SHA, repo }, labels: [{ name: "copilot-ci" }], requested_reviewers: [] };
  const f = { event: { repository: repo, workflow_run: { id: 100, run_attempt: 1 } }, run, pull,
    workflow: { name: "CI", path: ".github/workflows/ci.yml" }, comments: [], reviews: [],
    files: [{ filename: "src/lib/example.ts" }], mutations: [], runs: [], user,
    failRepair: false, onGetPull: null };
  f.api = {
    get: async (path) => {
      if (path === "/user") return f.user;
      if (path === `${ROOT}/actions/runs/${f.run.id}`) return structuredClone(f.run);
      if (path === `${ROOT}/actions/workflows/10`) return f.workflow;
      if (path.startsWith(`${ROOT}/actions/workflows/10/runs?`)) return { workflow_runs: [f.run, ...f.runs] };
      if (path === `${ROOT}/pulls/8`) {
        f.onGetPull?.();
        return structuredClone(f.pull);
      }
      throw new Error(`Unexpected GET ${path}`);
    },
    list: async (path) => {
      if (path.startsWith(`${ROOT}/pulls?`)) return [structuredClone(f.pull)];
      if (path === `${ROOT}/issues/8/comments`) return structuredClone(f.comments);
      if (path === `${ROOT}/pulls/8/files`) return f.files;
      if (path === `${ROOT}/pulls/8/reviews`) return f.reviews;
      throw new Error(`Unexpected list ${path}`);
    },
    post: async (path, body) => {
      f.mutations.push({ method: "POST", path, body });
      if (body.body?.startsWith("@copilot") && f.failRepair) throw new Error("Network acknowledgement lost");
      const comment = { id: f.comments.length + 1, user, ...body, html_url: "https://github.com/jackyrwj/scrim-ui/pull/8#test" };
      if (path.endsWith("/comments")) f.comments.push(comment);
      return comment;
    },
    patch: async (path, body) => {
      f.mutations.push({ method: "PATCH", path, body });
      const id = Number(path.split("/").at(-1));
      Object.assign(f.comments.find((c) => c.id === id), body);
    },
  };
  f.execute = () => runController(f.api, f.event, { now: () => "2026-10-26T00:00:00Z" });
  f.repairs = () => f.mutations.filter((m) => m.body.body?.startsWith("@copilot"));
  f.reviewRequests = () => f.mutations.filter((m) => m.path.endsWith("/requested_reviewers"));
  f.nextFailure = (id, letter) => {
    f.run.id = id;
    f.event.workflow_run.id = id;
    f.run.head_sha = letter.repeat(40);
    f.pull.head.sha = f.run.head_sha;
  };
  return f;
}

test("failed CI requests one exact-run repair, without a new PR or approval", async () => {
  const f = fixture();
  const result = await f.execute();
  assert.equal(result.result, "repair-requested");
  assert.equal(result.round, 1);
  assert.equal(f.repairs().length, 1);
  assert.match(f.repairs()[0].body.body, /actions\/runs\/100/);
  assert.match(f.repairs()[0].body.body, /Do not create another PR/);
  assert.match(f.repairs()[0].body.body, /Do not merge, deploy, approve workflows/);
  assert.equal(f.reviewRequests().length, 0);
});

test("a redelivery or rerun on the same failed head cannot request another fix", async () => {
  const f = fixture();
  await f.execute();
  assert.equal((await f.execute()).reason, "failure-already-reserved");
  f.run.run_attempt = 2;
  f.event.workflow_run.run_attempt = 2;
  assert.equal((await f.execute()).reason, "failure-already-reserved");
  f.run.id = 101;
  f.event.workflow_run.id = 101;
  assert.equal((await f.execute()).reason, "failure-already-reserved");
  assert.equal(f.repairs().length, 1);
});

test("two distinct repair attempts exhaust the lifetime budget", async () => {
  const f = fixture();
  await f.execute();
  f.nextFailure(101, "b");
  assert.equal((await f.execute()).round, 2);
  f.nextFailure(102, "c");
  assert.equal((await f.execute()).reason, "repair-limit");
  assert.equal(f.repairs().length, 2);
  assert.match(f.comments[0].body, /^@jackyrwj/);
});

test("an ambiguous repair POST is reserved and never silently retried", async () => {
  const f = fixture();
  f.failRepair = true;
  await assert.rejects(f.execute(), /acknowledgement lost/);
  assert.equal((await f.execute()).reason, "failure-already-reserved");
  assert.equal(f.repairs().length, 1);
  assert.match(f.comments[0].body, /"status":"unknown"/);
});

test("green CI requests code review once per head, including a fixed new head", async () => {
  const f = fixture("success");
  assert.equal((await f.execute()).result, "review-requested");
  assert.equal((await f.execute()).reason, "review-already-present-or-reserved");
  assert.deepEqual(f.reviewRequests()[0].body, { reviewers: ["copilot-pull-request-reviewer[bot]"] });
  f.nextFailure(101, "b");
  assert.equal((await f.execute()).result, "review-requested");
  assert.equal(f.reviewRequests().length, 2);
  assert.equal(f.repairs().length, 0);
});

test("current-head reviews and pending Copilot requests are not duplicated", async () => {
  for (const pending of [false, true]) {
    const f = fixture("success");
    if (pending) f.pull.requested_reviewers = [{ id: 175728472, login: "Copilot" }];
    else f.reviews = [{ commit_id: SHA, user: { login: "copilot-pull-request-reviewer[bot]" } }];
    assert.equal((await f.execute()).reason, "review-already-present-or-reserved");
    assert.equal(f.reviewRequests().length, 0);
  }
});

test("old-head reviews do not suppress a successful new-head review", async () => {
  const f = fixture("success");
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
  ["newer CI exists", (f) => { f.runs = [{ id: 101, head_sha: SHA }]; }],
]) {
  test(`${name} causes no mutation or agent request`, async () => {
    const f = fixture();
    change(f);
    assert.equal((await f.execute()).result, "skipped");
    assert.equal(f.mutations.length, 0);
  });
}

test("a concurrent head update before reservation prevents all writes", async () => {
  const f = fixture();
  let reads = 0;
  f.onGetPull = () => { if (++reads === 2) f.pull.head.sha = "b".repeat(40); };
  assert.equal((await f.execute()).reason, "head-or-run-changed");
  assert.equal(f.mutations.length, 0);
});

test("a head update after reservation stops before invoking Copilot", async () => {
  const f = fixture();
  let reads = 0;
  f.onGetPull = () => { if (++reads === 3) f.pull.head.sha = "b".repeat(40); };
  assert.equal((await f.execute()).reason, "changed-after-reservation");
  assert.equal(f.repairs().length, 0);
  assert.match(f.comments[0].body, /No repair was dispatched/);
});

test("protected paths and renamed protected paths stop repair", async () => {
  for (const file of [
    { filename: ".github/workflows/ci.yml" },
    { filename: "AGENTS.md" },
    { filename: "package-lock.json" },
    { filename: "scripts/copilot-ci/controller.mjs" },
    { filename: "renamed.md", previous_filename: ".github/copilot-instructions.md" },
  ]) {
    const f = fixture();
    f.files = [file];
    assert.equal((await f.execute()).reason, "protected-files");
    assert.equal(f.repairs().length, 0);
  }
});

test("a non-owner token, forged ledger, and corrupt owner ledger fail closed", async () => {
  const wrongUser = fixture();
  wrongUser.user = { ...user, login: "github-actions[bot]", type: "Bot" };
  await assert.rejects(wrongUser.execute(), /must belong to the repository owner/);
  assert.equal(wrongUser.mutations.length, 0);
  const forged = fixture();
  forged.comments = [{ id: 11, user: { id: 1000 }, body: `${MARKER}invalid\n-->` }];
  assert.equal((await forged.execute()).result, "repair-requested");
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
