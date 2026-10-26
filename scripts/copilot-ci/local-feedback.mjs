import { execFile } from "node:child_process";
import { promisify, parseArgs } from "node:util";
import { setTimeout as sleep } from "node:timers/promises";
import { pathToFileURL } from "node:url";
import { LABEL, isCopilot } from "./controller.mjs";

const ROOT = "/repos/jackyrwj/scrim-ui";
const STOPPED_PRS = new Set([5, 6, 8]);
const exec = promisify(execFile);

// Read-only snapshots for an already-authorized, active local Kimi task.
// This helper never launches a model, writes to GitHub, or starts a service.
export async function readFeedback(api, pr) {
  if (!Number.isSafeInteger(pr) || pr < 1) throw new Error("A positive PR number is required.");
  if (STOPPED_PRS.has(pr)) return { state: "blocked", reason: "stopped-or-disposable-pr", pr };
  const repository = await api.get(ROOT);
  const pullPath = `${ROOT}/pulls/${pr}`;
  const pull = await api.get(pullPath);
  const eligible = (p) => p.state === "open" && !p.draft &&
    p.base?.ref === repository.default_branch && p.head?.repo?.id === repository.id &&
    p.labels?.some((l) => l.name === LABEL);
  if (!eligible(pull)) return { state: "blocked", reason: "pr-not-opted-in-or-eligible", pr };
  const sha = pull.head.sha;
  const branch = pull.head.ref;
  const runsPath = `${ROOT}/actions/workflows/ci.yml/runs?event=pull_request&branch=${encodeURIComponent(branch)}&head_sha=${sha}&per_page=100`;
  const latest = (runs) => runs.workflow_runs.filter((r) => r.event === "pull_request" &&
    r.head_sha === sha && r.head_branch === branch && r.head_repository?.id === repository.id)
    .sort((a, b) => b.id - a.id)[0];
  const run = latest(await api.get(runsPath));
  let result = { state: "ci-pending", pr, sha, url: pull.html_url };
  if (run) {
    result.ci = { id: run.id, attempt: run.run_attempt, status: run.status,
      conclusion: run.conclusion, url: run.html_url };
    if (run.status === "completed") {
      if (run.conclusion === "failure") result.state = "ci-failed";
      else if (run.conclusion !== "success") result.state = "attention-required";
      else {
        const reviews = (await api.list(`${pullPath}/reviews`))
          .filter((r) => isCopilot(r.user) && r.commit_id === sha &&
            ["COMMENTED", "APPROVED", "CHANGES_REQUESTED"].includes(r.state))
          .sort((a, b) => b.id - a.id);
        result.state = "review-pending";
        if (reviews.length) {
          const review = reviews[0];
          const comments = await api.list(`${pullPath}/comments`);
          result.state = "review-ready";
          result.review = { id: review.id, state: review.state, url: review.html_url,
            body: review.body, comments: comments.filter((c) => c.pull_request_review_id === review.id)
              .map((c) => ({ id: c.id, path: c.path, line: c.line, body: c.body, url: c.html_url })) };
        }
      }
    }
  }
  // Never hand an active local model a stale head or superseded CI failure.
  const [currentPull, currentRuns] = await Promise.all([api.get(pullPath), api.get(runsPath)]);
  const currentRun = latest(currentRuns);
  if (!eligible(currentPull) || currentPull.head.sha !== sha ||
      currentRun?.id !== run?.id || currentRun?.run_attempt !== run?.run_attempt ||
      currentRun?.status !== run?.status || currentRun?.conclusion !== run?.conclusion) {
    return { state: "stale", pr, sha, reason: "head-or-ci-changed-during-read" };
  }
  return result;
}

export function ghReadClient(run = exec) {
  const get = async (path) => {
    try {
      const { stdout } = await run("gh", ["api", "--method", "GET", path], {
        encoding: "utf8", timeout: 30_000, maxBuffer: 8 * 1024 * 1024,
      });
      return JSON.parse(stdout);
    } catch {
      // Do not echo CLI stderr, environment credentials, or private response text.
      throw new Error(`GitHub read failed: ${path.split("?")[0]}. Check the local GitHub App credentials and permissions.`);
    }
  };
  return {
    get,
    list: async (path) => {
      const rows = [];
      for (let page = 1; page <= 20; page++) {
        const batch = await get(`${path}?per_page=100&page=${page}`);
        if (!Array.isArray(batch)) throw new Error("Expected a GitHub array response.");
        rows.push(...batch);
        if (batch.length < 100) return rows;
      }
      throw new Error("GitHub pagination limit reached; inspect manually.");
    },
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const { values } = parseArgs({ options: { pr: { type: "string" }, "wait-seconds": { type: "string", default: "0" } } });
    const pr = Number(values.pr);
    const seconds = Number(values["wait-seconds"]);
    if (!Number.isSafeInteger(seconds) || seconds < 0 || seconds > 1200) {
      throw new Error("--wait-seconds must be an integer from 0 to 1200.");
    }
    const deadline = Date.now() + seconds * 1000;
    const api = ghReadClient();
    while (true) {
      const result = await readFeedback(api, pr);
      const waiting = ["ci-pending", "review-pending", "stale"].includes(result.state);
      if (!waiting || seconds === 0) {
        console.log(JSON.stringify(result));
        break;
      }
      if (Date.now() >= deadline) {
        console.log(JSON.stringify({ ...result, pendingState: result.state, state: "waiting-timeout" }));
        break;
      }
      await sleep(Math.min(30_000, deadline - Date.now()));
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
