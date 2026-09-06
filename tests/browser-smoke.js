import assert from "node:assert/strict";
import { chromium } from "npm:playwright@1.58.2";

const browser = await chromium.launch({
  executablePath: Deno.args[0],
  headless: true,
  args: ["--mute-audio", "--disable-gpu"],
});
const screenshots = await Deno.makeTempDir({ prefix: "multitimer-review-" });
const failures = [];
console.log(`Screenshots: ${screenshots}`);

try {
  const context = await browser.newContext({ locale: "uk-UA", timezoneId: "Europe/Kyiv" });
  const page = await context.newPage();
  page.on("pageerror", (error) => failures.push(error.message));
  await page.goto(new URL("../index.html", import.meta.url).href);
  await page.evaluate(() => {
    const now = Date.now();
    state.settings.muted = true;
    state.settings.autoSort = false;
    state.timers = [
      { id: "star", title: "Обраний таймер / Starred timer", durationMinutes: 25, starred: true },
      { id: "paused", title: "Пауза / Paused", durationMinutes: 8760, pausedRemainingMs: 90061000 },
      { id: "alarm", title: "Будильник / Alarm", mode: "targetTime", targetAt: now + 86400000 },
      { id: "overdue", title: "Оброблений / Deactivated", targetAt: now - 500 * 86400000, deactivated: true },
    ].map((timer) => normalizeTimer({ targetAt: now + 25 * 60000, ...timer }));
    saveState();
    renderTimers();
  });

  for (const language of ["uk", "en"]) {
    await page.selectOption("#languageSelect", language);
    for (const [width, height] of [[1440, 900], [1280, 800], [1024, 768], [720, 900], [390, 844], [320, 720]]) {
      await page.setViewportSize({ width, height });
      await page.waitForTimeout(200);
      console.log(`Checking ${language} ${width}`);
      await page.screenshot({ path: `${screenshots}/${language}-${width}.png`, fullPage: true });
      const overflow = await page.evaluate(() => {
        const issues = [];
        if (document.documentElement.scrollWidth > innerWidth) issues.push("page overflow");
        for (const el of document.querySelectorAll(".timer-title, .timer-time, .meta-row, .timer-actions button")) {
          const box = el.getBoundingClientRect();
          if (box.width === 0) continue;
          const row = el.closest(".timer-row").getBoundingClientRect();
          const clippedText = !el.matches("input") && el.scrollWidth > el.clientWidth + 1;
          if (box.left < row.left - 1 || box.right > row.right + 1 || clippedText) {
            issues.push(`clipped ${el.className}: ${el.textContent}`);
          }
        }
        return issues;
      });
      failures.push(...overflow.map((issue) => `${language} ${width}: ${issue}`));
      if (width === 320) {
        await page.locator('[data-timer-id="overdue"]').scrollIntoViewIfNeeded();
        await page.waitForTimeout(200);
        await page.screenshot({ path: `${screenshots}/${language}-${width}-scrolled.png` });
        await page.evaluate(() => scrollTo(0, 0));
      }

      await page.evaluate(() => openEditDialog("alarm"));
      await page.screenshot({ path: `${screenshots}/${language}-${width}-dialog.png` });
      const dialogOverflow = await page.evaluate(() => {
        const dialog = document.querySelector("#timerDialog");
        const box = dialog.getBoundingClientRect();
        return [...dialog.querySelectorAll("input, button")].filter((el) => {
          const rect = el.getBoundingClientRect();
          return rect.width && (rect.left < box.left || rect.right > box.right || el.scrollWidth > el.clientWidth + 1);
        }).map((el) => el.id || el.textContent);
      });
      failures.push(...dialogOverflow.map((field) => `${language} ${width}: dialog overflow: ${field}`));
      await page.evaluate(() => closeEditDialog());
    }
  }

  console.log(JSON.stringify({ layoutFailures: failures }, null, 2));
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.clock.install();
  await page.reload();
  await page.evaluate(() => {
    const now = Date.now();
    state.settings.autoSort = true;
    state.timers = [
      normalizeTimer({ id: "paused", title: "Paused", targetAt: now + 300000, pausedRemainingMs: 300000 }),
      normalizeTimer({ id: "running", title: "Editable name", targetAt: now + 360000 }),
    ];
    renderTimers();
  });
  await page.locator("#timer-title-running").focus();
  await page.locator("#timer-title-running").evaluate((input) => input.setSelectionRange(2, 7));
  await page.clock.fastForward(61000);
  assert.deepEqual(await page.locator(".timer-row").evaluateAll((rows) => rows.map((row) => row.dataset.timerId)),
    ["running", "paused"]);
  assert.deepEqual(await page.evaluate(() => [document.activeElement.id,
    document.activeElement.selectionStart, document.activeElement.selectionEnd]), ["timer-title-running", 2, 7]);

  await page.evaluate(() => {
    state.settings.muted = false;
    playAlarm();
  });
  assert.equal(await page.evaluate(() => alarmPlaybacks.size), 1);
  await page.click("#muteButton");
  assert.equal(await page.evaluate(() => alarmPlaybacks.size), 0);

  const clockCases = await page.evaluate(() => {
    const fallBack = Date.parse("2026-10-25T01:30:30Z");
    const oldAlarm = getTargetTimestamp("2026-03-28", "03:30");
    const afterTransition = getTargetTimestamp("2026-03-30", "00:00");
    return {
      nextMinute: getDefaultTargetTimestamp(fallBack) - fallBack,
      nextAlarm: formatDateTimeLocal(getNextSameLocalTime(oldAlarm, afterTransition).getTime()),
    };
  });
  assert.equal(clockCases.nextMinute, 30000);
  assert.equal(clockCases.nextAlarm, "2026-03-30 03:30");

  await page.evaluate(() => openEditDialog(null, {
    mode: "targetTime", targetDate: "2026-03-29", targetTime: "03:30",
  }));
  assert.match(await page.locator("#editTargetHours").evaluate((el) => el.validationMessage),
    /does not exist/);
  await page.fill("#editTargetDate", "2026-03-30");
  await page.locator("#editTargetDate").evaluate((el) => el.setSelectionRange(5, 7));
  await page.keyboard.type("12");
  assert.equal(await page.inputValue("#editTargetDate"), "2026-12-30");
  await page.evaluate(() => closeEditDialog());

  await page.evaluate(() => {
    const now = Date.now();
    state.settings.autoSort = false;
    state.timers = [
      normalizeTimer({ id: "star", title: "Star", starred: true, targetAt: now + 600000 }),
      normalizeTimer({ id: "first", title: "First", targetAt: now + 600000 }),
      normalizeTimer({ id: "second", title: "Second", targetAt: now + 600000 }),
    ];
    renderTimers();
  });
  await page.locator('[data-timer-id="second"] .drag-handle')
    .dragTo(page.locator('[data-timer-id="star"]'), { targetPosition: { x: 100, y: 5 } });
  assert.deepEqual(await page.locator(".timer-row").evaluateAll((rows) => rows.map((row) => row.dataset.timerId)),
    ["star", "second", "first"]);
  const snapshot = await page.evaluate(() => localStorage.getItem("multitimer.state.v2"));
  await page.reload();
  assert.equal(await page.evaluate(() => localStorage.getItem("multitimer.state.v2")), snapshot);
  await context.close();
  console.log(JSON.stringify({ screenshots, failures }, null, 2));
  assert.equal(failures.length, 0, "Browser checks found layout or runtime errors");
} finally {
  await browser.close();
}
