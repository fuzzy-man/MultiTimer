# MultiTimer

Noncritical offline HTML/CSS/JS app, opened as index.html in Firefox (file://). No build/server. Reply in Ukrainian.

## Verification contract

- For reviews/testing and behavior changes, read TEST_PLAN.md. Use its fixed BASIC scope; do not invent a new plan. A review alone does not authorize fixes.
- Read relevant diffs/source ranges once, not entire history/CONTEXT/CHANGELOG by default. Limit output to summaries and failing details.
- One agent, one pass per case. Passing automated coverage replaces duplicate manual checks. No speculative cases, browser matrix, long tests, web research, dependency installation or new test framework unless explicitly requested.
- After code edits: existing fast suite plus affected catalogue rows, once after all edits. Documentation-only: links/diff only.
- At most one retry round, only failed or subsequently changed checks. Report remaining failures or unavailable infrastructure; no automatic audit/repair loop.
- Every behavior change must update the affected TEST_PLAN row and relevant test in the same change. Add cases only for new behavior or reproduced bugs; keep test counts current.
- Record compact results in TEST_PLAN. Reuse only matching source/test fingerprints, environment and scope; label reused results. Honor explicit fresh-run requests. Source review is not a browser test.
- Finish at the selected scope or budget boundary. Briefly report findings, counts and skipped items; no second review of unchanged code.

## Soft usage budget

- Keep the user's model/effort, including GPT-6 Ultra. This contract limits work, not internal reasoning or billing.
- If available, read usage at start, after automated checks and before optional UI (at most three reads).
- Per verification request: aim for at most 10 percentage points of the 300-minute allowance; reserve 20% in both five-hour and weekly windows. At a checkpoint, stop further verification if either reserve is reached or five-hour usage rose by 10 points; report partial results.
- Usage is account-wide, may lag and is not an exact per-task cost. If the window resets during the task, stop instead of restarting this budget. If telemetry is unavailable, disclose that and use BASIC without optional expansion.
- These are best-effort guardrails, not a guaranteed hard cap. Never buy credits, redeem resets or change account/model settings without explicit authorization.
