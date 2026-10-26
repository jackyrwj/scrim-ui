import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { once } from "node:events";
import { setTimeout as delay } from "node:timers/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
await verifyStopProcess();
const url = `http://127.0.0.1:${await availablePort()}`;
const nextBin = resolve(root, "node_modules/next/dist/bin/next");
const serverMode = process.env.RESPONSE_DIFF_SERVER_MODE === "dev" ? "dev" : "start";
const app = spawn(
  process.execPath,
  [nextBin, serverMode, "--hostname", "127.0.0.1", "--port", String(new URL(url).port)],
  { cwd: root, stdio: "inherit", env: process.env },
);
let processError;
app.on("error", (error) => {
  processError = error;
});
let browser;

try {
  await waitForServer(app, url, serverMode, () => processError);
  browser = await chromium.launch();
  const page = await browser.newPage();
  const response = await page.goto(`${url}/tools/response-diff`);
  assert.equal(response?.status(), 200, "Response Diff page should load");

  const inputA = page.getByPlaceholder("Paste response A here...");
  const inputB = page.getByPlaceholder("Paste response B here...");
  const analysis = page.getByRole("heading", { name: "Analysis", exact: true }).locator("..");
  const analysisSnapshots = [];

  async function analysisText() {
    assert.equal(await analysis.isVisible(), true, "Analysis should be visible");
    const text = await analysis.innerText();
    analysisSnapshots.push(text);
    return text;
  }

  async function assertStats(label, expected) {
    const stats = page
      .getByText(`Response ${label}`, { exact: true })
      .last()
      .locator("../..");
    assert.equal(await stats.isVisible(), true, `Response ${label} statistics should be visible`);
    const text = await stats.innerText();
    assert.match(text, expected);
  }

  assert.match(await inputA.inputValue(), /concise debounce implementation/);
  assert.match(await inputB.inputValue(), /implement a debounce function/);
  await assertStats("A", /[1-9][\d,]*\s+Characters[\s\S]*[1-9][\d,]*\s+Words[\s\S]*~[1-9][\d,]*\s+Est\. Tokens/);
  await assertStats("B", /[1-9][\d,]*\s+Characters[\s\S]*[1-9][\d,]*\s+Words[\s\S]*~[1-9][\d,]*\s+Est\. Tokens/);
  assert.match(await analysisText(), /Response A/);
  console.log("Passed: default samples and visible statistics");

  await inputA.fill("hello");
  await inputB.fill("plain text");
  assert.equal(await inputA.inputValue(), "hello");
  assert.equal(await inputB.inputValue(), "plain text");
  await assertStats("A", /5\s+Characters[\s\S]*1\s+Words[\s\S]*~2\s+Est\. Tokens/);
  await assertStats("B", /10\s+Characters[\s\S]*2\s+Words[\s\S]*~3\s+Est\. Tokens/);
  assert.match(await analysisText(), /Response A is 50% shorter than Response B/);
  console.log("Passed: plain-text length comparison");

  await inputA.fill("cats");
  await inputB.fill("dogs");
  const equalAnalysis = await analysisText();
  assert.match(equalAnalysis, /Both responses are the same length/);
  assert.doesNotMatch(equalAnalysis, /%/);
  await assertStats("A", /4\s+Characters[\s\S]*1\s+Words[\s\S]*~1\s+Est\. Tokens/);
  await assertStats("B", /4\s+Characters[\s\S]*1\s+Words[\s\S]*~1\s+Est\. Tokens/);
  console.log("Passed: distinct equal-length inputs");

  await inputA.fill("");
  await inputB.fill("response B");
  assert.match(
    await analysisText(),
    /Response B has 10 characters; the other response is empty/,
  );
  assert.doesNotMatch(analysisSnapshots.at(-1), /%/);
  await assertStats("A", /0\s+Characters[\s\S]*0\s+Words[\s\S]*~0\s+Est\. Tokens/);
  await assertStats("B", /10\s+Characters[\s\S]*2\s+Words[\s\S]*~3\s+Est\. Tokens/);
  console.log("Passed: Response A empty");

  await inputA.fill("response A");
  await inputB.fill("");
  assert.match(
    await analysisText(),
    /Response A has 10 characters; the other response is empty/,
  );
  assert.doesNotMatch(analysisSnapshots.at(-1), /%/);
  await assertStats("A", /10\s+Characters[\s\S]*2\s+Words[\s\S]*~3\s+Est\. Tokens/);
  await assertStats("B", /0\s+Characters[\s\S]*0\s+Words[\s\S]*~0\s+Est\. Tokens/);
  console.log("Passed: Response B empty");

  await inputA.fill("short");
  await inputB.fill("a much longer answer");
  assert.match(await analysisText(), /Response A is 75% shorter than Response B/);
  await assertStats("A", /5\s+Characters[\s\S]*1\s+Words[\s\S]*~2\s+Est\. Tokens/);
  await assertStats("B", /20\s+Characters[\s\S]*4\s+Words[\s\S]*~5\s+Est\. Tokens/);
  console.log("Passed: ordinary unequal lengths");

  await page.getByRole("button", { name: "Clear" }).click();
  assert.equal(await inputA.inputValue(), "");
  assert.equal(await inputB.inputValue(), "");
  await assertStats("A", /0\s+Characters[\s\S]*0\s+Words[\s\S]*~0\s+Est\. Tokens/);
  await assertStats("B", /0\s+Characters[\s\S]*0\s+Words[\s\S]*~0\s+Est\. Tokens/);
  const emptyAnalysis = await analysisText();
  assert.match(emptyAnalysis, /Paste two responses to compare their lengths/);
  assert.doesNotMatch(emptyAnalysis, /%/);
  console.log("Passed: Clear resets both inputs and statistics");

  for (const text of analysisSnapshots) {
    assert.doesNotMatch(text, /\bcode examples?\b|\barrow function\b|\bnamed function\b/i);
  }
  console.log("Passed: analysis contains no fixed code or function claims");
} finally {
  try {
    await browser?.close();
  } finally {
    await stopProcess(app);
  }
}

async function availablePort() {
  const server = createServer();
  await new Promise((resolveListen, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolveListen);
  });
  const { port } = server.address();
  await new Promise((resolveClose, reject) => {
    server.close((error) => (error ? reject(error) : resolveClose()));
  });
  return port;
}

async function waitForServer(child, serverUrl, mode, getProcessError) {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (getProcessError()) {
      throw new Error(`Could not start the Next.js ${mode} server`, {
        cause: getProcessError(),
      });
    }
    if (child.exitCode !== null) {
      throw new Error(`Next.js ${mode} server exited with code ${child.exitCode}`);
    }
    try {
      const response = await fetch(`${serverUrl}/tools/response-diff`, {
        signal: AbortSignal.timeout(Math.max(1, Math.min(1_000, deadline - Date.now()))),
      });
      if (response.status === 200) return;
    } catch {
      // The server is not listening yet.
    }
    await delay(250);
  }
  throw new Error(`Timed out waiting for the Next.js ${mode} server`);
}

async function stopProcess(child, gracePeriod = 5_000) {
  if (child.pid === undefined || isTerminated(child)) return;
  const exited = once(child, "exit");
  if (isTerminated(child)) return;

  child.kill("SIGTERM");
  let timeout;
  await Promise.race([
    exited,
    new Promise((resolveTimeout) => {
      timeout = setTimeout(resolveTimeout, gracePeriod);
    }),
  ]);
  clearTimeout(timeout);

  if (!isTerminated(child)) {
    child.kill("SIGKILL");
    await exited;
  }
}

function isTerminated(child) {
  return child.exitCode !== null || child.signalCode !== null;
}

async function verifyStopProcess() {
  const graceful = spawn(
    process.execPath,
    [
      "-e",
      "process.on('SIGTERM', () => process.exit(0)); process.stdout.write('ready'); setInterval(() => {}, 1000)",
    ],
    { stdio: ["ignore", "pipe", "ignore"] },
  );
  try {
    await once(graceful.stdout, "data");
    await stopProcess(graceful, 1_000);
    assert.equal(graceful.exitCode, 0, "SIGTERM should allow normal child termination");
    assert.equal(graceful.signalCode, null);
  } finally {
    await stopProcess(graceful, 1_000);
  }

  const stopped = spawn(process.execPath, ["-e", "process.exit(0)"], { stdio: "ignore" });
  await once(stopped, "exit");
  let killCalls = 0;
  const kill = stopped.kill.bind(stopped);
  stopped.kill = (...args) => {
    killCalls += 1;
    return kill(...args);
  };
  await stopProcess(stopped);
  assert.equal(killCalls, 0, "an already-stopped child should not be signalled");

  const stubborn = spawn(
    process.execPath,
    [
      "-e",
      "process.on('SIGTERM', () => {}); process.stdout.write('ready'); setInterval(() => {}, 1000)",
    ],
    { stdio: ["ignore", "pipe", "ignore"] },
  );
  try {
    await once(stubborn.stdout, "data");
    await stopProcess(stubborn, 25);
    assert.equal(stubborn.signalCode, "SIGKILL", "unresponsive child should be forcefully stopped");
  } finally {
    await stopProcess(stubborn, 25);
  }

  console.log("Passed: child process cleanup (graceful, already stopped, SIGKILL fallback)");
}
