# MultiTimer context cache

Updated: 2026-11-02. Base: main, da78486 (v1.2.2), with Undo additions documented in Unreleased. Read before longer CONTEXT.md. Verify git status/log for freshness and publication state.

- Offline index.html + styles.css + src/app.js, file:// in Firefox/Windows. No build/server/runtime dependencies.
- src/app.js: state, DOM, uk/en translations, audio, inline Worker/fallback. Storage key multitimer.state.v2; keep backward compatibility.
- Stable timer IDs: preserve titles, starred groups, order, deactivation, targetAt, pausedRemainingMs. Firefox form restoration must not overwrite saved names.
- Duration resume: now + frozen remainder. Alarm resume: original local target or next future day. Pause: Target dash, Set unchanged. Deactivation suppresses alerts/favicon, not countdown.
- Sorting preserves deactivated positions in each group and title editing focus. Drag only with auto sort off.
- Undo: state.deletionHistory, last 20 operations for 30 days. Single delete/Clear all each one operation. Snapshots include timers and positions/neighbors, not settings. Undo restores latest; Deleted timers dialog restores selected. Persist across reload. Preserve absolute deadlines/frozen paused time; elapsed running timers become alarmed to avoid replay. Resolve ID collisions with fresh IDs.
- Reuse sticky header, buttons/dialogs, I18N. Offline assets only.
- tests/app-state.test.js: real JS, isolated DOM/storage/clock doubles, 42 tests. tests/browser-smoke.js --basic-ui: UA 1280x800, EN 390x844, cached Playwright/Chrome, temporary profile. Extended matrix opt-in. TEST_PLAN.md holds actual results/fingerprints; follow AGENTS budget.
- Known: saveState silently catches localStorage write failure; power-loss persistence not guaranteed. Unloaded Firefox tabs/OS sleep may delay alerts. Physical sound/notifications need separate checks.
- README: launch/behavior; CHANGELOG: releases/Unreleased; CONTEXT: long history. Replace stale facts here, do not append logs.
