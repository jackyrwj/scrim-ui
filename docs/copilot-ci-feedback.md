# Copilot after CI

Kimi opens the pull request. GitHub Actions runs CI. Copilot cloud agent handles
up to two CI repair requests on that PR; successful CI requests Copilot Code
Review. A human decides whether to merge. There is no callback to a local machine.

## Activation

1. Merge the implementation PR into `main`. `workflow_run` only starts a workflow
   that already exists on the default branch.
2. Create a fine-grained personal access token belonging to `jackyrwj`, restricted
   to `jackyrwj/scrim-ui`, with Actions read and Pull requests write permissions.
   The account must have access to both Copilot cloud agent and code review, with
   available usage allowance. Store the value as repository Actions secret
   `COPILOT_AUTOMATION_TOKEN`. Never put it in a file, commit, PR, or comment.
   The default `GITHUB_TOKEN` is not a substitute for this user's identity.
3. Create the `copilot-ci` label and add it to new PRs that should use this flow.
   Kimi should create new authorized task PRs with this label. Existing PRs #5
   and #6 are not opted in and must not be resumed by this setup.
4. After verifying the after-CI workflow, disable the earlier `Copilot automatic
   code review` ruleset if reviews must happen strictly after CI. That ruleset
   requests reviews when PRs open, independently of this workflow.

Only open, non-draft PRs from this same repository targeting its default branch
are eligible. A label alone cannot make an external fork eligible. CI must be
the project's `.github/workflows/ci.yml`; only its latest completed attempt for
the current PR head can act. Canceled, timed-out, approval-blocked, and other
non-success/non-failure outcomes require human attention.

## Repair and review

The controller stores a durable ledger in one owner-authored PR comment. Each
distinct failed head may reserve one repair, up to two across the PR's lifetime.
A rerun on the same failed commit does not request another repair. Reservations
are made before requesting Copilot. An ambiguous delivery consumes its reserved
attempt and requires inspection, rather than silently duplicating a coding task.
If the PR or CI run changes before any external request is attempted, the unused
reservation is released so the latest CI can act normally.
The same release applies when the pre-dispatch GitHub query fails; the invocation
fails visibly and can be retried without consuming a repair attempt.
Do not delete or edit the ledger while automation is active.

The visible `@copilot` request links the exact failed CI run and requires a
minimal fix on the existing branch. Changes to workflows, automation scripts,
all CI scripts, nested agent instructions, build/lint/typecheck/PostCSS configuration,
or dependency manifests require human investigation. The
controller refuses automatic repair on PRs containing those changes. It never
checks out or executes the PR branch in its privileged workflow, reads artifacts,
approves workflows, changes protections, merges, or deploys.

Copilot fixes may still require **Approve and run workflows** under the existing
repository settings. This configuration intentionally preserves that approval.
Approve the specific run after inspecting the changes; do not interpret a blocked
run as a test failure or as a passing result. Fully unattended reruns would
require a separate explicit decision about this repository policy.

Successful CI requests one Copilot Code Review per head, skipping existing or
pending reviews. A request is asynchronous: inspect the timeline for actual
acceptance and the review result. Review feedback is left for the human to assess;
it does not autonomously launch an additional repair loop.
After 100 reserved or requested reviewed heads, further review requests stop for
manual handling; the ledger remains readable and CI repair handling still works.

## Verification and rollback

Run `node --test scripts/copilot-ci/controller.test.mjs` for duplicate delivery,
repair-budget, stale-head, workflow/branch/fork/label filtering, protected-file,
and review-request scenarios. This tests orchestration decisions, not product
behavior or a real Copilot session. CI also runs these tests.

For a live test, use a disposable opt-in PR with a small failing product-code
fixture. Confirm actual cloud-agent acceptance, a fix on the same branch, CI on
the new SHA, and the final review. Never merge the deliberately failing fixture.
Existing Vercel integration may automatically build a Preview for new PRs.

To stop one PR, remove `copilot-ci`; to stop all, disable the `Copilot after CI`
workflow and remove its secret. Stop any already running Copilot session in its
GitHub session UI. Removing the label does not cancel a request already accepted
by Copilot. The CI workflow and manual merge decisions remain available.

References:
- https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/use-cloud-agent-on-github
- https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-code-review
- https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#workflow_run
