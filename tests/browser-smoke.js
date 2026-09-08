import assert from "node:assert/strict";
import { chromium } from "npm:playwright@1.58.2";

const basicUi = Deno.args.includes("--basic-ui");
const languageFilter = Deno.args.find((arg) => arg.startsWith("--language="))?.slice(11);
assert.ok(!languageFilter || ["uk", "en"].includes(languageFilter), "Unknown UI language");
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
  await page.evaluate((basic) => {
    const now = Date.now();
    state.settings.muted = true;
    state.settings.autoSort = false;
    state.timers = [
      { id: "star", title: "Обраний таймер / Starred timer", durationMinutes: 25, starred: true },
      { id: "paused", title: "Пауза / Paused", durationMinutes: 8760, pausedRemainingMs: 90061000 },
      { id: "alarm", title: "Будильник / Alarm", mode: "targetTime", targetAt: now + 86400000 },
      { id: "overdue", title: "Оброблений / Deactivated", targetAt: now - 500 * 86400000, deactivated: true },
    ].map((timer) => normalizeTimer({ targetAt: now + 25 * 60000, ...timer }));
    if (basic) {
      for (let i = 0; i < 2; i++) {
        state.timers.push(normalizeTimer({ id: `scroll-${i}`, title: `Timer ${i + 5}`, targetAt: now + 3600000 }));
      }
    }
    saveState();
    renderTimers();
  }, basicUi);

  for (const language of ["uk", "en"].filter((value) => !languageFilter || value === languageFilter)) {
    await page.selectOption("#languageSelect", language);
    const sizes = basicUi
      ? [language === "uk" ? [1280, 800] : [390, 844]]
      : [[1440, 900], [1280, 800], [1024, 768], [720, 900], [390, 844], [320, 720]];
    for (const [width, height] of sizes) {
      await page.setViewportSize({ width, height });
      await page.waitForTimeout(200);
      console.log(`Checking ${language} ${width}`);
      await page.screenshot({ path: `${screenshots}/${language}-${width}.png`, fullPage: !basicUi });
      const overflow = await page.evaluate(() => {
        const issues = [];
        if (document.documentElement.scrollWidth > innerWidth) issues.push("page overflow");
        const header = document.querySelector(".sticky-controls").getBoundingClientRect();
        for (const section of document.querySelectorAll(".app-header, .control-panel")) {
          const box = section.getBoundingClientRect();
          if (box.left - header.left < 12 || header.right - box.right < 12) {
            issues.push(`missing header inset: ${section.className}`);
          }
        }
        const controls = [...document.querySelectorAll(".sticky-controls button, .sticky-controls input, .sticky-controls select")];
        for (const [index, control] of controls.entries()) {
          const box = control.getBoundingClientRect();
          if (box.left < 0 || box.right > innerWidth || control.scrollWidth > control.clientWidth + 1) {
            issues.push(`header overflow: ${control.id}`);
          }
          if (control.matches("select")) {
            const style = getComputedStyle(control);
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
            const textWidth = context.measureText(control.selectedOptions[0].textContent).width;
            const available = control.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
            if (textWidth > available) issues.push(`clipped option: ${control.id}`);
          }
          for (const other of controls.slice(index + 1)) {
            const rect = other.getBoundingClientRect();
            if (Math.min(box.right, rect.right) > Math.max(box.left, rect.left) + 1 &&
                Math.min(box.bottom, rect.bottom) > Math.max(box.top, rect.top) + 1) {
              issues.push(`overlapping controls: ${control.id}, ${other.id}`);
            }
          }
        }
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
      if (basicUi || width === 320) {
        await page.locator(".timer-row").last().scrollIntoViewIfNeeded();
        await page.waitForTimeout(200);
        if (!basicUi) await page.screenshot({ path: `${screenshots}/${language}-${width}-scrolled.png` });
        const headerVisible = await page.locator(".sticky-controls").evaluate((el) => {
          const box = el.getBoundingClientRect();
          return box.top >= -1 && box.bottom <= innerHeight;
        });
        assert.ok(headerVisible, "Sticky controls must remain accessible after scrolling");
        await page.evaluate(() => scrollTo(0, 0));
      }

      if (basicUi) await page.click("#addTimerButton");
      else await page.evaluate(() => openEditDialog("alarm"));
      if (!basicUi) await page.screenshot({ path: `${screenshots}/${language}-${width}-dialog.png` });
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
  if (!basicUi) await checkExtendedInteractions(page);
  await context.close();
  console.log(JSON.stringify({ screenshots, failures }, null, 2));
  assert.equal(failures.length, 0, "Browser checks found layout or runtime errors");
} finally {
  await browser.close();
}

async function checkExtendedInteractions(page) {
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
}
