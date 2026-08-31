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
    const classes = new Set();
    this.classList = {
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
    this.children.push(element);
  }

  replaceChildren() {
    this.children = [];
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

function createApp(savedState = fixtureState(), now = NOW) {
  const document = new ElementStub();
  document.documentElement = new ElementStub();
  document.head = new ElementStub();
  document.createElement = () => new ElementStub();
  document.querySelector("#timerTemplate").content = { firstElementChild: new ElementStub() };
  const windowEvents = new ElementStub();
  const storage = new Map([[STORAGE_KEY, JSON.stringify(savedState)]]);
  const writes = [];
  class TestDate extends Date {
    constructor(...args) {
      super(...(args.length ? args : [now]));
    }

    static now() {
      return now;
    }
  }
  const context = vm.createContext({
    document,
    Date: TestDate,
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem(key, value) {
        storage.set(key, value);
        writes.push(value);
      },
    },
    addEventListener: windowEvents.addEventListener.bind(windowEvents),
    setInterval: () => 1,
    setTimeout: () => 1,
    clearTimeout: () => {},
  });
  vm.runInContext(appSource, context, { filename: "src/app.js" });
  const app = vm.runInContext(`({
    state, rowById, findTimer, renderTimers, saveState, loadState,
    toggleStarred, togglePauseTimer, moveTimerBefore, getRemainingMs
  })`, context);
  return {
    ...app,
    document,
    writes,
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
