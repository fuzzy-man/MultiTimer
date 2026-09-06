import assert from "node:assert/strict";
import vm from "node:vm";

const appSource = await Deno.readTextFile(new URL("../src/app.js", import.meta.url));
const htmlSource = await Deno.readTextFile(new URL("../index.html", import.meta.url));
const STORAGE_KEY = "multitimer.state.v2";
const NOW = Date.parse("2026-08-31T12:00:00Z");

// Run the real application against isolated DOM/storage doubles, never a browser profile.
class ElementStub {
  constructor() {
    this.listeners = new Map();
    this.elements = new Map();
    this.attributes = new Map();
    this.dataset = {};
    this.children = [];
    this.value = "";
    this.id = "";
    this.name = "";
    this.validationMessage = "";
    const classes = new Set();
    this.classList = {
      add: (name) => classes.add(name),
      remove: (name) => classes.delete(name),
      toggle(name, enabled) {
        if (enabled) classes.add(name);
        else classes.delete(name);
      },
      contains: (name) => classes.has(name),
    };
  }

  querySelector(selector) {
    if (!this.elements.has(selector)) this.elements.set(selector, new ElementStub());
    return this.elements.get(selector);
  }

  querySelectorAll() {
    return [];
  }

  cloneNode() {
    return new ElementStub();
  }

  append(element) {
    element.remove();
    element.parentElement = this;
    this.children.push(element);
  }

  replaceChildren() {
    this.children.forEach((child) => child.parentElement = null);
    this.children = [];
  }

  get firstElementChild() {
    return this.children[0] ?? null;
  }

  get nextElementSibling() {
    const siblings = this.parentElement?.children ?? [];
    return siblings[siblings.indexOf(this) + 1] ?? null;
  }

  remove() {
    if (this.parentElement) {
      const siblings = this.parentElement.children;
      siblings.splice(siblings.indexOf(this), 1);
      this.parentElement = null;
    }
  }

  insertBefore(element, before) {
    element.remove();
    element.parentElement = this;
    const index = before ? this.children.indexOf(before) : this.children.length;
    this.children.splice(index, 0, element);
  }

  setCustomValidity(message) {
    this.validationMessage = message;
  }

  focus() {}
  select() {}
  setSelectionRange() {}

  showModal() {
    this.open = true;
  }

  close() {
    this.open = false;
    this.dispatchEvent({ type: "close" });
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  addEventListener(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(listener);
  }

  dispatchEvent(event) {
    for (const listener of this.listeners.get(event.type) || []) listener(event);
  }
}

function fixtureTimer(id, title, durationMinutes, extra = {}) {
  return {
    id,
    title,
    mode: "duration",
    durationMinutes,
    targetAt: NOW + durationMinutes * 60000,
    pausedRemainingMs: durationMinutes * 60000,
    starred: false,
    deactivated: false,
    alarmed: false,
    createdAt: NOW - 60000,
    ...extra,
  };
}

function fixtureState() {
  return {
    settings: { autoSort: false, muted: true },
    timers: [
      fixtureTimer("tea", "Tea 8", 8, { starred: true }),
      fixtureTimer("other", "Other", 15),
      fixtureTimer("game", "Game", 60, { createdAt: NOW }),
    ],
  };
}

function createApp(savedState = fixtureState(), now = NOW, globals = {}) {
  const document = new ElementStub();
  document.documentElement = new ElementStub();
  document.head = new ElementStub();
  document.createElement = () => new ElementStub();
  document.querySelector("#timerTemplate").content = { firstElementChild: new ElementStub() };
  document.querySelector("#timerForm").elements.timerMode = { value: "duration" };
  const windowEvents = new ElementStub();
  const storage = new Map([[STORAGE_KEY, JSON.stringify(savedState)]]);
  const writes = [];
  const timeouts = new Map();
  let nextTimeoutId = 0;
  class TestDate extends Date {
    constructor(...args) {
      super(...(args.length ? args : [now]));
    }

    static now() {
      return now;
    }
  }
  const context = vm.createContext({
    ...globals,
    document,
    Date: TestDate,
    FormData: class {
      constructor(form) {
        this.form = form;
      }
      get(name) {
        return this.form.elements[name].value;
      }
    },
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem(key, value) {
        storage.set(key, value);
        writes.push(value);
      },
    },
    addEventListener: windowEvents.addEventListener.bind(windowEvents),
    setInterval: () => 1,
    setTimeout(callback, delay) {
      const id = ++nextTimeoutId;
      timeouts.set(id, { callback, delay });
      return id;
    },
    clearTimeout: (id) => timeouts.delete(id),
  });
  vm.runInContext(appSource, context, { filename: "src/app.js" });
  const app = vm.runInContext(`({
    state, rowById, findTimer, renderTimers, saveState, loadState,
    toggleStarred, togglePauseTimer, moveTimerBefore, getRemainingMs,
    refreshTimers, updateTimers, getPageSignalMode, toggleDeactivated,
    resetDurationTimer, deleteTimer, openEditDialog, saveEditFromDialog,
    normalizeDurationFields, validateTargetFields, getTargetTimestamp,
    getDateInputValue, getTimeInputValue, getDefaultTargetTimestamp,
    getNextSameLocalTime, formatDuration, playAlarm, updateSetting,
    handleAlarmSchedulerMessage, I18N
  })`, context);
  return {
    ...app,
    document,
    writes,
    timeouts,
    setNow: (value) => now = value,
    run: (source) => vm.runInContext(source, context),
    stored: () => JSON.parse(storage.get(STORAGE_KEY)),
    titleInput: (id) => app.rowById.get(id).row.querySelector(".timer-title"),
    pageshow: () => windowEvents.dispatchEvent({ type: "pageshow" }),
  };
}

function startGame(app) {
  app.toggleStarred("game");
  app.togglePauseTimer("game");
  app.moveTimerBefore("game", "tea");
  app.saveState();
  app.renderTimers({ sort: false });
}

Deno.test("restart preserves timer identity, favorites, order and running/paused states", () => {
  const app = createApp();
  startGame(app);
  const restored = createApp(app.stored(), NOW + 120000);
  assert.deepEqual(Array.from(restored.state.timers, (timer) => timer.id), ["game", "tea", "other"]);
  assert.equal(restored.findTimer("game").title, "Game");
  assert.equal(restored.findTimer("game").starred, true);
  assert.equal(restored.findTimer("game").pausedRemainingMs, null);
  assert.equal(restored.findTimer("game").targetAt, NOW + 3600000);
  assert.equal(restored.getRemainingMs(restored.findTimer("game")), 3480000);
  assert.equal(restored.findTimer("tea").durationMinutes, 8);
  assert.equal(restored.findTimer("tea").pausedRemainingMs, 480000);
  assert.equal(restored.findTimer("tea").starred, true);
});

Deno.test("old positional form restoration cannot rename or save a different timer", () => {
  const app = createApp();
  startGame(app);
  const restored = createApp(app.stored());
  const snapshot = restored.stored();
  const oldTitles = ["Tea 8", "Other", "Game"];
  for (const [index, timer] of restored.state.timers.entries()) {
    const input = restored.titleInput(timer.id);
    input.value = oldTitles[index];
    // Firefox restores text with a trusted input event whose inputType is empty.
    input.dispatchEvent({ type: "input", inputType: "", isTrusted: true });
  }
  assert.equal(restored.titleInput("game").value, "Game");
  assert.equal(restored.titleInput("tea").value, "Tea 8");
  assert.equal(restored.titleInput("other").value, "Other");
  assert.deepEqual(restored.stored(), snapshot);
  assert.equal(restored.writes.length, 0);
});

Deno.test("form restoration is ignored even when the name field has focus", () => {
  const app = createApp();
  const input = app.titleInput("game");
  app.document.activeElement = input;
  input.value = "Tea 8";
  input.dispatchEvent({ type: "input", inputType: "", isTrusted: true });
  assert.equal(app.findTimer("game").title, "Game");
  assert.equal(input.value, "Game");
  assert.equal(app.writes.length, 0);
});

Deno.test("name input identifiers follow timer IDs through sorting and restart", () => {
  const app = createApp();
  const originalId = app.titleInput("game").id;
  assert.equal(originalId, "timer-title-game");
  assert.equal(app.titleInput("game").name, originalId);
  app.state.settings.autoSort = true;
  app.toggleStarred("game");
  assert.equal(app.titleInput("game").id, originalId);
  const restored = createApp(app.stored());
  assert.equal(restored.titleInput("game").id, originalId);
  assert.notEqual(restored.titleInput("tea").id, originalId);
  assert.match(htmlSource, /<input\b[^>]*class="timer-title"[^>]*autocomplete="off"/);
});

Deno.test("pageshow repairs silently restored names and toolbar without saving stale values", () => {
  const app = createApp();
  const snapshot = app.stored();
  app.titleInput("game").value = "Tea 8";
  app.document.querySelector("#autoSortToggle").checked = true;
  app.pageshow();
  assert.equal(app.titleInput("game").value, "Game");
  assert.equal(app.document.querySelector("#autoSortToggle").checked, false);
  assert.deepEqual(app.stored(), snapshot);
  assert.equal(app.writes.length, 0);
});

for (const inputType of [
  "insertText", "insertFromPaste", "insertCompositionText", "insertReplacementText",
  "deleteContentBackward", "historyUndo", "historyRedo",
]) {
  Deno.test(`real ${inputType} edits still persist to the correct timer`, () => {
    const app = createApp();
    const input = app.titleInput("game");
    input.value = "Game renamed";
    input.dispatchEvent({ type: "input", inputType, isTrusted: true });
    assert.equal(app.findTimer("game").title, "Game renamed");
    assert.equal(app.findTimer("tea").title, "Tea 8");
    assert.equal(app.stored().timers.find((timer) => timer.id === "game").title, "Game renamed");
    assert.equal(app.writes.length, 1);
  });
}

Deno.test("invalid stored timestamps and duplicate IDs cannot break timer rows", () => {
  const app = createApp({
    timers: [
      fixtureTimer("duplicate", "First", 5, { targetAt: 1e100 }),
      fixtureTimer("duplicate", "Second", 10),
      fixtureTimer("", "Third", 15),
    ],
  });
  assert.equal(app.state.timers.length, 3);
  assert.equal(app.rowById.size, 3);
  assert.equal(new Set(app.state.timers.map((timer) => timer.id)).size, 3);
  for (const timer of app.state.timers) {
    assert.ok(timer.id);
    assert.ok(Number.isFinite(new Date(timer.targetAt).getTime()));
  }
});

Deno.test("alarm fields missing from storage are recovered from the saved deadline", () => {
  const targetAt = NOW - 3600000;
  const app = createApp({ timers: [fixtureTimer("alarm", "Alarm", 1, {
    mode: "targetTime", targetAt,
  })] });
  const timer = app.findTimer("alarm");
  assert.equal(timer.targetDate, app.getDateInputValue(targetAt));
  assert.equal(timer.targetTime, app.getTimeInputValue(targetAt));
});

Deno.test("fallback without a worker is scheduled at the deadline without extra delay", () => {
  const app = createApp({ timers: [fixtureTimer("active", "Active", 1, {
    pausedRemainingMs: null,
  })] });
  assert.equal([...app.timeouts.values()][0].delay, 60000);
});

Deno.test("clock jumps are handled on refresh and each expiration is processed once", () => {
  const app = createApp({ timers: [fixtureTimer("active", "Active", 1, {
    pausedRemainingMs: null,
  })] });
  app.setNow(NOW + 120000);
  app.refreshTimers();
  assert.equal(app.findTimer("active").alarmed, true);
  assert.equal(app.writes.length, 1);
  app.refreshTimers();
  assert.equal(app.writes.length, 1);
});

Deno.test("automatic sorting follows frozen remaining time and retains row identity", () => {
  const app = createApp({ timers: [
    fixtureTimer("paused", "Paused", 5),
    fixtureTimer("running", "Running", 6, { pausedRemainingMs: null }),
  ] });
  const input = app.titleInput("running");
  app.setNow(NOW + 120000);
  app.refreshTimers();
  assert.deepEqual(Array.from(app.state.timers, (timer) => timer.id), ["running", "paused"]);
  assert.equal(app.titleInput("running"), input);
  assert.deepEqual(app.document.querySelector("#timerList").children.map((row) => row.dataset.timerId),
    ["running", "paused"]);
  assert.deepEqual(app.stored().timers.map((timer) => timer.id), ["running", "paused"]);
});

Deno.test("paused alarms sort by the displayed remainder, not a projected restart date", () => {
  const reference = createApp();
  const app = createApp({ timers: [
    fixtureTimer("alarm", "Alarm", 5, {
      mode: "targetTime", targetAt: NOW - 60000,
      targetDate: reference.getDateInputValue(NOW - 60000),
      targetTime: reference.getTimeInputValue(NOW - 60000),
    }),
    fixtureTimer("running", "Running", 10, { pausedRemainingMs: null }),
  ] });
  assert.deepEqual(Array.from(app.state.timers, (timer) => timer.id), ["alarm", "running"]);
});

Deno.test("starred and deactivated positions persist after toggling favorites", () => {
  const app = createApp({ settings: { autoSort: false }, timers: [
    fixtureTimer("fixed", "Fixed", 1, { deactivated: true }),
    fixtureTimer("star", "Star", 10),
    fixtureTimer("other", "Other", 2),
  ] });
  app.toggleStarred("star");
  assert.deepEqual(app.stored().timers.map((timer) => timer.id), ["star", "fixed", "other"]);
  app.updateSetting((settings) => settings.autoSort = true);
  assert.deepEqual(Array.from(app.state.timers, (timer) => timer.id), ["star", "fixed", "other"]);
});

Deno.test("renaming in the edit dialog preserves the deadline, pause and deactivation", () => {
  const app = createApp({ timers: [fixtureTimer("timer", "Name", 10, {
    deactivated: true, pausedRemainingMs: -12345,
  })] });
  const before = JSON.stringify(app.findTimer("timer"));
  app.openEditDialog("timer");
  app.document.querySelector("#editTitle").value = "Renamed";
  app.setNow(NOW + 120000);
  app.saveEditFromDialog();
  const expected = JSON.parse(before);
  expected.title = "Renamed";
  assert.deepEqual(JSON.parse(JSON.stringify(app.findTimer("timer"))), expected);
});

Deno.test("duration input normalizes 90 minutes and supports the maximum duration", () => {
  const app = createApp();
  app.openEditDialog();
  const hours = app.document.querySelector("#editDurationHours");
  const minutes = app.document.querySelector("#editDurationMinutes");
  hours.value = "0";
  minutes.value = "90";
  app.normalizeDurationFields();
  assert.equal(hours.value, "1");
  assert.equal(minutes.value, "30");
  minutes.value = "525600";
  hours.value = "0";
  app.normalizeDurationFields();
  assert.equal(hours.value, "8760");
  assert.equal(minutes.value, "00");
  assert.equal(hours.validationMessage, "");
});

Deno.test("all four favicon states honor paused and deactivated timers", () => {
  const app = createApp({ timers: [fixtureTimer("timer", "Timer", 10, {
    pausedRemainingMs: null,
  })] });
  assert.equal(app.getPageSignalMode(), "active");
  app.setNow(NOW + 6 * 60000);
  assert.equal(app.getPageSignalMode(), "warning");
  app.setNow(NOW + 11 * 60000);
  app.refreshTimers();
  assert.equal(app.getPageSignalMode(), "overdue");
  app.toggleDeactivated("timer");
  assert.equal(app.getPageSignalMode(), "neutral");
  app.togglePauseTimer("timer");
  assert.equal(app.findTimer("timer").pausedRemainingMs, -60000);
  app.setNow(NOW + 20 * 60000);
  assert.equal(app.getRemainingMs(app.findTimer("timer")), -60000);
  app.togglePauseTimer("timer");
  assert.equal(app.getRemainingMs(app.findTimer("timer")), -60000);
  assert.equal(app.getPageSignalMode(), "neutral");
});

Deno.test("positive fractions never display zero before expiration", () => {
  const app = createApp();
  assert.equal(app.formatDuration(999), "00:00:01");
  assert.equal(app.formatDuration(0), "00:00:00");
  assert.equal(app.formatDuration(-1999), "+00:00:01");
  assert.equal(app.formatDuration(90061000), "1д 01:01:01");
});

Deno.test("ISO years below 100 round-trip without turning into the twentieth century", () => {
  const app = createApp();
  const timestamp = app.getTargetTimestamp("0099-01-02", "12:00");
  assert.equal(app.getDateInputValue(timestamp), "0099-01-02");
});

Deno.test("24:00 crosses the year boundary and next day keeps the local alarm time", () => {
  const app = createApp();
  const timestamp = app.getTargetTimestamp("2026-12-31", "24:00");
  assert.equal(app.getDateInputValue(timestamp), "2027-01-01");
  assert.equal(app.getTimeInputValue(timestamp), "00:00");
  const now = app.getTargetTimestamp("2027-01-10", "22:00");
  const next = app.getNextSameLocalTime(timestamp, now).getTime();
  assert.equal(app.getDateInputValue(next), "2027-01-11");
  assert.equal(app.getTimeInputValue(next), "00:00");
});

Deno.test("both translations cover every static UI key", () => {
  const app = createApp();
  assert.deepEqual(Object.keys(app.I18N.uk).sort(), Object.keys(app.I18N.en).sort());
  for (const [, key] of htmlSource.matchAll(/data-i18n(?:-aria-label)?="([^"]+)"/g)) {
    assert.ok(app.I18N.uk[key], `Missing UA translation: ${key}`);
    assert.ok(app.I18N.en[key], `Missing EN translation: ${key}`);
  }
});

function createAudioMock() {
  const nodes = [];
  const gains = [];
  const parameter = () => ({
    value: 0,
    setValueAtTime(value) { this.value = value; },
    exponentialRampToValueAtTime(value) { this.value = value; },
  });
  class AudioContext {
    state = "running";
    currentTime = 1;
    destination = {};
    createGain() {
      const gain = { gain: parameter(), connect() {}, disconnect() {} };
      gains.push(gain);
      return gain;
    }
    createOscillator() {
      const oscillator = {
        frequency: parameter(), stops: [], disconnected: false,
        start() {}, connect() {},
        stop(time) { this.stops.push(time); },
        disconnect() { this.disconnected = true; },
      };
      nodes.push(oscillator);
      return oscillator;
    }
  }
  return { AudioContext, nodes, gains };
}

Deno.test("mute immediately cancels already scheduled audio", () => {
  const audio = createAudioMock();
  const app = createApp({ timers: [] }, NOW, audio);
  app.playAlarm();
  assert.ok(audio.nodes.length > 0);
  app.updateSetting((settings) => settings.muted = true, { render: false });
  assert.ok(audio.nodes.every((node) => node.stops.length === 2 && node.disconnected));
});

Deno.test("deactivating an expired timer cancels its audio but not another alarm", () => {
  const audio = createAudioMock();
  const app = createApp({ timers: [
    fixtureTimer("first", "First", 1, { pausedRemainingMs: null, targetAt: NOW - 1 }),
    fixtureTimer("second", "Second", 1, { pausedRemainingMs: null, targetAt: NOW + 1000 }),
  ] }, NOW, audio);
  const firstNodes = [...audio.nodes];
  app.setNow(NOW + 1001);
  app.updateTimers();
  const secondNodes = audio.nodes.slice(firstNodes.length);
  app.toggleDeactivated("first");
  assert.ok(firstNodes.every((node) => node.stops.length === 2));
  assert.ok(secondNodes.length > 0);
  assert.ok(secondNodes.every((node) => node.stops.length === 1));
});

Deno.test("audio construction failure cannot prevent expiration persistence", () => {
  const app = createApp({ timers: [fixtureTimer("timer", "Timer", 1, {
    targetAt: NOW - 1, pausedRemainingMs: null,
  })] }, NOW, { AudioContext: class { constructor() { throw new Error("Audio unavailable"); } } });
  assert.equal(app.findTimer("timer").alarmed, true);
  assert.equal(app.getPageSignalMode(), "overdue");
});

Deno.test("running timers with invalid saved dates recover instead of crashing toISOString", () => {
  const app = createApp({ timers: [fixtureTimer("timer", "Timer", 5, {
    targetAt: 1e100, pausedRemainingMs: null,
  })] });
  assert.equal(app.findTimer("timer").targetAt, NOW + 5 * 60000);
});

Deno.test("inherited object properties are not accepted as ringtones", () => {
  const app = createApp({ settings: { ringtone: "toString" }, timers: [] });
  assert.equal(app.state.settings.ringtone, "classic");
});

Deno.test("volume updates an ongoing signal and natural completion releases audio nodes", () => {
  const audio = createAudioMock();
  const app = createApp({ timers: [] }, NOW, audio);
  app.playAlarm();
  app.updateSetting((settings) => settings.volume = 0.2, { render: false });
  assert.equal(audio.gains[0].gain.value, 0.2);
  for (const node of audio.nodes) node.onended();
  assert.ok(audio.nodes.every((node) => node.disconnected));
  assert.equal(app.run("alarmPlaybacks.size"), 0);
});

Deno.test("repeated Test clicks replace the preview instead of accumulating sound", () => {
  const audio = createAudioMock();
  const app = createApp({ timers: [] }, NOW, audio);
  app.playAlarm();
  const previous = [...audio.nodes];
  app.playAlarm();
  assert.ok(previous.every((node) => node.disconnected));
  assert.equal(app.run("alarmPlaybacks.size"), 1);
});

Deno.test("alarm validation rejects impossible dates and the final-year midnight overflow", () => {
  const app = createApp();
  app.openEditDialog(null, { mode: "targetTime" });
  const date = app.document.querySelector("#editTargetDate");
  const hours = app.document.querySelector("#editTargetHours");
  const minutes = app.document.querySelector("#editTargetMinutes");
  date.value = "2026-02-30";
  app.validateTargetFields();
  assert.ok(date.validationMessage);
  date.value = "9999-12-31";
  hours.value = "24";
  minutes.value = "00";
  app.validateTargetFields();
  assert.ok(date.validationMessage);
  date.value = "2026-12-31";
  app.validateTargetFields();
  assert.equal(date.validationMessage, "");
  assert.equal(hours.validationMessage, "");
});

function createWorkerMock() {
  let source;
  let worker;
  const revokedUrls = [];
  return {
    source: () => source,
    worker: () => worker,
    revokedUrls,
    globals: {
      Blob: class { constructor(parts) { source = parts.join(""); } },
      URL: {
        createObjectURL: () => "blob:test",
        revokeObjectURL: (url) => revokedUrls.push(url),
      },
      Worker: class extends ElementStub {
        constructor() {
          super();
          worker = this;
          this.messages = [];
        }
        postMessage(message) { this.messages.push(message); }
        terminate() { this.terminated = true; }
      },
    },
  };
}

Deno.test("worker notification and main-thread expiration share one notification per deadline", () => {
  const harness = createWorkerMock();
  const notifications = [];
  class Notification {
    static permission = "granted";
    constructor(title, options) { notifications.push({ title, options }); }
  }
  const app = createApp({ settings: { desktopNotificationsEnabled: true }, timers: [
    fixtureTimer("timer", "Timer", 1, { pausedRemainingMs: null }),
  ] }, NOW, { ...harness.globals, Notification });
  const messages = [];
  const timeouts = new Map();
  let nextId = 0;
  const self = { Notification, postMessage: (message) => messages.push(message) };
  vm.runInNewContext(harness.source(), {
    self, Notification, Date: app.run("Date"),
    setTimeout(callback, delay) {
      timeouts.set(++nextId, { callback, delay });
      return nextId;
    },
    clearTimeout: (id) => timeouts.delete(id),
  });
  self.onmessage({ data: harness.worker().messages.at(-1) });
  assert.equal([...timeouts.values()][0].delay, 60000);
  app.setNow(NOW + 60000);
  [...timeouts.values()][0].callback();
  assert.equal(notifications.length, 1);
  app.handleAlarmSchedulerMessage({ data: messages[0] });
  assert.equal(notifications.length, 1);
  assert.equal(app.findTimer("timer").alarmed, true);
  app.resetDurationTimer("timer");
  app.setNow(NOW + 120000);
  app.updateTimers();
  assert.equal(notifications.length, 2);
  assert.notEqual(notifications[0].options.tag, notifications[1].options.tag);
  assert.equal(notifications[1].options.timestamp, NOW + 120000);
  assert.notEqual(notifications[0].options.renotify, true);
  assert.notEqual(notifications[1].options.renotify, true);
});

Deno.test("worker failure releases its resources and installs an exact fallback", () => {
  const harness = createWorkerMock();
  const app = createApp({ timers: [fixtureTimer("timer", "Timer", 1, {
    pausedRemainingMs: null,
  })] }, NOW, harness.globals);
  assert.deepEqual(harness.revokedUrls, ["blob:test"]);
  assert.equal([...app.timeouts.values()][0].delay, 62000);
  harness.worker().dispatchEvent({ type: "error" });
  assert.equal(harness.worker().terminated, true);
  assert.equal([...app.timeouts.values()][0].delay, 60000);
});

Deno.test("long fallback delays are capped and rearmed until the actual deadline", () => {
  const app = createApp({ timers: [fixtureTimer("timer", "Timer", 30 * 24 * 60, {
    pausedRemainingMs: null,
  })] });
  const [id, timeout] = [...app.timeouts.entries()][0];
  assert.equal(timeout.delay, 2147483647);
  app.timeouts.delete(id);
  app.setNow(NOW + timeout.delay);
  timeout.callback();
  assert.equal(app.findTimer("timer").alarmed, false);
  assert.equal([...app.timeouts.values()][0].delay, 30 * 86400000 - 2147483647);
});
