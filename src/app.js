const STORAGE_KEY = "multitimer.state.v2";
const DEFAULT_TITLE = "Новий таймер";
const DEFAULT_DURATION_MINUTES = 25;
const DEFAULT_ALARM_SECONDS = 6;
const MAX_DURATION_MINUTES = 525600;
const DEFAULT_WARNING_MINUTES = 5;
const TICK_MS = 1000;
const MAX_TIMEOUT_MS = 2147483647;
const ALARM_FALLBACK_GRACE_MS = 2000;
const ALARM_WORKER_RESPONSE_GRACE_MS = 500;
const PAUSED_TARGET_LABEL = "—";

const RINGTONES = {
  classic: {
    type: "square",
    frequencies: [720, 560, 720, 560, 760, 540, 760, 540],
    step: 0.23,
    note: 0.16,
    gain: 0.26,
  },
  digital: {
    type: "sawtooth",
    frequencies: [880, 880, 1180, 880, 1180, 1320],
    step: 0.18,
    note: 0.11,
    gain: 0.18,
  },
  soft: {
    type: "sine",
    frequencies: [440, 554, 659, 554],
    step: 0.42,
    note: 0.32,
    gain: 0.22,
  },
};

const I18N = {
  uk: {
    "app.title": "Мульти таймери",
    "controls.language": "Мова",
    "controls.volume": "Гучність",
    "controls.test": "Тест",
    "controls.addTimer": "Додати таймер",
    "controls.autoSort": "Автосортування",
    "controls.sortNow": "Сортувати",
    "controls.direction": "Напрям",
    "controls.ringtone": "Рингтон",
    "controls.alarmSeconds": "Сигнал, с",
    "controls.warningMinutes": "Попередження, хв",
    "controls.notificationsEnable": "Увімкнути сповіщення",
    "controls.notificationsOn": "Сповіщення увімкнені",
    "controls.notificationsBlocked": "Сповіщення заблоковані",
    "controls.notificationsUnavailable": "Сповіщення недоступні",
    "controls.clearAll": "Очистити всі таймери",
    "controls.mute": "Вимкнути",
    "controls.unmute": "Увімкнути",
    "sort.asc": "Менші зверху",
    "sort.desc": "Більші зверху",
    "ringtone.classic": "Старий будильник",
    "ringtone.digital": "Цифровий",
    "ringtone.soft": "М'який",
    "sections.timerSettings": "Налаштування таймерів",
    "sections.timerList": "Список таймерів",
    "sections.starred": "Обрані",
    "sections.otherTimers": "Інші таймери",
    "empty.title": "Таймерів ще немає",
    "timer.defaultTitle": "Новий таймер",
    "timer.move": "Перемістити таймер",
    "timer.delete": "Видалити таймер",
    "timer.titleInput": "Назва таймера",
    "timer.data": "Дані таймера",
    "timer.target": "Ціль",
    "timer.modeAria": "Режим",
    "timer.setTo": "Задано",
    "timer.pause": "Зупинити",
    "timer.resume": "Продовжити",
    "timer.reset": "Скинути",
    "timer.nextDay": "Наступний день",
    "timer.deactivate": "Деактивувати",
    "timer.activate": "Активувати",
    "timer.edit": "Редагувати",
    "timer.addStar": "Додати в обране",
    "timer.removeStar": "Прибрати з обраного",
    "timer.paused": "Пауза",
    "dialog.close": "Закрити",
    "dialog.editTitle": "Редагувати",
    "dialog.newTitle": "Новий таймер",
    "dialog.name": "Назва",
    "dialog.timeFormat": "Формат часу",
    "dialog.duration": "Тривалість",
    "dialog.durationTime": "Тривалість",
    "dialog.targetTime": "Цільовий час",
    "dialog.date": "Дата",
    "dialog.finishTime": "Час завершення",
    "dialog.hours": "Години",
    "dialog.minutesField": "Хвилини",
    "dialog.openCalendar": "Відкрити календар",
    "dialog.delete": "Видалити",
    "dialog.cancel": "Скасувати",
    "dialog.save": "Зберегти",
    "validation.time": "Вкажіть час у форматі 00:00-23:59 або 24:00.",
    "validation.date": "Введіть дату у форматі yyyy-mm-dd.",
    "validation.duration": "Вкажіть тривалість від 0:01 до 8760:00.",
    "notification.expiredTitle": "MultiTimer",
    "notification.expiredBody": "Час вийшов: {title}",
    "confirm.clearAll": "Видалити всі таймери?",
    "unit.day": "д",
  },
  en: {
    "app.title": "Multi timers",
    "controls.language": "Language",
    "controls.volume": "Volume",
    "controls.test": "Test",
    "controls.addTimer": "Add timer",
    "controls.autoSort": "Auto sort",
    "controls.sortNow": "Sort",
    "controls.direction": "Direction",
    "controls.ringtone": "Ringtone",
    "controls.alarmSeconds": "Alarm, s",
    "controls.warningMinutes": "Warning, min",
    "controls.notificationsEnable": "Enable notifications",
    "controls.notificationsOn": "Notifications on",
    "controls.notificationsBlocked": "Notifications blocked",
    "controls.notificationsUnavailable": "Notifications unavailable",
    "controls.clearAll": "Clear all timers",
    "controls.mute": "Mute",
    "controls.unmute": "Unmute",
    "sort.asc": "Smallest first",
    "sort.desc": "Largest first",
    "ringtone.classic": "Classic alarm",
    "ringtone.digital": "Digital",
    "ringtone.soft": "Soft",
    "sections.timerSettings": "Timer settings",
    "sections.timerList": "Timer list",
    "sections.starred": "Starred",
    "sections.otherTimers": "Other timers",
    "empty.title": "No timers yet",
    "timer.defaultTitle": "New timer",
    "timer.move": "Move timer",
    "timer.delete": "Delete timer",
    "timer.titleInput": "Timer name",
    "timer.data": "Timer data",
    "timer.target": "Target",
    "timer.modeAria": "Mode",
    "timer.setTo": "Set",
    "timer.pause": "Pause",
    "timer.resume": "Resume",
    "timer.reset": "Reset",
    "timer.nextDay": "Next day",
    "timer.deactivate": "Deactivate",
    "timer.activate": "Activate",
    "timer.edit": "Edit",
    "timer.addStar": "Add to starred",
    "timer.removeStar": "Remove from starred",
    "timer.paused": "Paused",
    "dialog.close": "Close",
    "dialog.editTitle": "Edit",
    "dialog.newTitle": "New timer",
    "dialog.name": "Name",
    "dialog.timeFormat": "Time format",
    "dialog.duration": "Duration",
    "dialog.durationTime": "Duration",
    "dialog.targetTime": "Target time",
    "dialog.date": "Date",
    "dialog.finishTime": "Finish time",
    "dialog.hours": "Hours",
    "dialog.minutesField": "Minutes",
    "dialog.openCalendar": "Open calendar",
    "dialog.delete": "Delete",
    "dialog.cancel": "Cancel",
    "dialog.save": "Save",
    "validation.time": "Enter time as 00:00-23:59 or 24:00.",
    "validation.date": "Enter date as yyyy-mm-dd.",
    "validation.duration": "Enter a duration from 0:01 to 8760:00.",
    "notification.expiredTitle": "MultiTimer",
    "notification.expiredBody": "Time is up: {title}",
    "confirm.clearAll": "Delete all timers?",
    "unit.day": "d",
  },
};

const timerList = document.querySelector("#timerList");
const emptyState = document.querySelector("#emptyState");
const addTimerButton = document.querySelector("#addTimerButton");
const clearAllButton = document.querySelector("#clearAllButton");
const timerTemplate = document.querySelector("#timerTemplate");
const volumeRange = document.querySelector("#volumeRange");
const volumeValue = document.querySelector("#volumeValue");
const muteButton = document.querySelector("#muteButton");
const notificationsButton = document.querySelector("#notificationsButton");
const testAlarmButton = document.querySelector("#testAlarmButton");
const languageSelect = document.querySelector("#languageSelect");
const autoSortToggle = document.querySelector("#autoSortToggle");
const sortNowButton = document.querySelector("#sortNowButton");
const sortDirectionSelect = document.querySelector("#sortDirectionSelect");
const ringtoneSelect = document.querySelector("#ringtoneSelect");
const alarmDurationSeconds = document.querySelector("#alarmDurationSeconds");
const warningMinutesInput = document.querySelector("#warningMinutes");

const timerDialog = document.querySelector("#timerDialog");
const timerForm = document.querySelector("#timerForm");
const dialogTitle = document.querySelector("#dialogTitle");
const dialogCloseButton = document.querySelector("#dialogCloseButton");
const cancelEditButton = document.querySelector("#cancelEditButton");
const deleteEditButton = document.querySelector("#deleteEditButton");
const editTitle = document.querySelector("#editTitle");
const editDurationHours = document.querySelector("#editDurationHours");
const editDurationMinutes = document.querySelector("#editDurationMinutes");
const editTargetDate = document.querySelector("#editTargetDate");
const editTargetDatePicker = document.querySelector("#editTargetDatePicker");
const targetDatePickerButton = document.querySelector("#targetDatePickerButton");
const editTargetHours = document.querySelector("#editTargetHours");
const editTargetMinutes = document.querySelector("#editTargetMinutes");
const durationField = document.querySelector("#durationField");
const targetTimeField = document.querySelector("#targetTimeField");

const state = loadState();
let editingTimerId = null;
let audioContext = null;
let lastPageSignalMode = null;
let neutralFaviconHref = null;
let activeFaviconHref = null;
let warningFaviconHref = null;
let overdueFaviconHref = null;
let alarmSchedulerWorker = null;
let alarmFallbackTimeoutId = null;
let resumeAlarmCheckTimeoutId = null;
let alarmScheduleSignature = null;

const rowById = new Map();
const dropMarker = document.createElement("div");
let draggedTimerId = null;

dropMarker.className = "drop-marker";

function createDefaultState() {
  return {
    settings: {
      volume: 0.55,
      muted: false,
      language: "uk",
      autoSort: true,
      sortDirection: "asc",
      ringtone: "classic",
      alarmDurationSeconds: DEFAULT_ALARM_SECONDS,
      warningMinutes: DEFAULT_WARNING_MINUTES,
      desktopNotificationsEnabled: false,
    },
    timers: [],
  };
}

function loadState() {
  try {
    const rawState = localStorage.getItem(STORAGE_KEY);
    const fallbackState = createDefaultState();

    if (!rawState) {
      return fallbackState;
    }

    const parsedState = JSON.parse(rawState);

    if (!parsedState || typeof parsedState !== "object") {
      return fallbackState;
    }

    const settings = {
      ...fallbackState.settings,
      ...(parsedState.settings || {}),
    };
    const normalizedSettings = normalizeSettings(settings);
    const defaultTitle = getDefaultTitle(normalizedSettings.language);
    const timers = Array.isArray(parsedState.timers)
      ? parsedState.timers.map((timer) => normalizeTimer(timer, defaultTitle)).filter(Boolean)
      : [];

    return {
      settings: normalizedSettings,
      timers,
    };
  } catch {
    return createDefaultState();
  }
}

function normalizeSettings(settings) {
  const ringtone = RINGTONES[settings.ringtone] ? settings.ringtone : "classic";
  const sortDirection = settings.sortDirection === "desc" ? "desc" : "asc";
  const language = settings.language === "en" ? "en" : "uk";

  return {
    volume: clampVolume(settings.volume),
    muted: Boolean(settings.muted),
    language,
    autoSort: settings.autoSort !== false,
    sortDirection,
    ringtone,
    alarmDurationSeconds: clampInteger(
      settings.alarmDurationSeconds,
      1,
      60,
      DEFAULT_ALARM_SECONDS,
    ),
    warningMinutes: clampInteger(
      settings.warningMinutes,
      1,
      1440,
      DEFAULT_WARNING_MINUTES,
    ),
    desktopNotificationsEnabled: Boolean(settings.desktopNotificationsEnabled),
  };
}

function getLanguage() {
  return state.settings.language === "en" ? "en" : "uk";
}

function t(key) {
  const language = getLanguage();

  return I18N[language][key] || I18N.uk[key] || key;
}

function getDefaultTitle(language) {
  return I18N[language]?.["timer.defaultTitle"] || DEFAULT_TITLE;
}

function applyLocalization() {
  document.documentElement.lang = getLanguage();
  localizeElementTree(document);
}

function localizeElementTree(root) {
  getElementsForLocalization(root, "[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });

  getElementsForLocalization(root, "[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
  });
}

function getElementsForLocalization(root, selector) {
  const elements = [];

  if (root.matches?.(selector)) {
    elements.push(root);
  }

  root.querySelectorAll?.(selector).forEach((element) => {
    elements.push(element);
  });

  return elements;
}

function normalizeTimer(timer, defaultTitle = DEFAULT_TITLE) {
  if (!timer || typeof timer !== "object") {
    return null;
  }

  const mode = timer.mode === "targetTime" ? "targetTime" : "duration";
  const durationMinutes = clampInteger(
    timer.durationMinutes,
    1,
    MAX_DURATION_MINUTES,
    DEFAULT_DURATION_MINUTES,
  );
  const defaultTargetAt = getDefaultTargetTimestamp();
  const fallbackTargetAt = mode === "duration"
    ? Date.now() + durationMinutes * 60 * 1000
    : defaultTargetAt;
  const targetTime = isValidTime(timer.targetTime)
    ? timer.targetTime
    : getTimeInputValue(fallbackTargetAt);
  const fallbackTargetDate = Number.isFinite(timer.targetAt)
    ? getDateInputValue(timer.targetAt)
    : getDateInputValue(defaultTargetAt);
  const targetDate = isValidDate(timer.targetDate) ? timer.targetDate : fallbackTargetDate;
  const targetAt =
    Number.isFinite(timer.targetAt) && timer.targetAt > 0
      ? timer.targetAt
      : calculateTargetAt({ mode, durationMinutes, targetDate, targetTime });
  const pausedRemainingMs = Number.isFinite(timer.pausedRemainingMs)
    ? timer.pausedRemainingMs
    : null;

  return {
    id: typeof timer.id === "string" ? timer.id : createId(),
    title: typeof timer.title === "string" && timer.title.trim() ? timer.title : defaultTitle,
    mode,
    durationMinutes,
    targetDate,
    targetTime,
    targetAt,
    pausedRemainingMs,
    deactivated: Boolean(timer.deactivated),
    starred: Boolean(timer.starred),
    alarmed: Boolean(timer.deactivated) || Boolean(timer.alarmed),
    createdAt: Number.isFinite(timer.createdAt) ? timer.createdAt : Date.now(),
  };
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage can be unavailable in strict privacy modes.
  }
}

function createTimerFromForm() {
  const formData = new FormData(timerForm);
  const mode = formData.get("timerMode") === "targetTime" ? "targetTime" : "duration";
  const durationMinutes = getDurationMinutesFromForm();
  const defaultTargetAt = getDefaultTargetTimestamp();
  const targetDate = isValidDate(editTargetDate.value)
    ? editTargetDate.value
    : getDateInputValue(defaultTargetAt);
  const targetTime = isValidTime(getEditTargetTime())
    ? getEditTargetTime()
    : getTimeInputValue(defaultTargetAt);

  return {
    id: createId(),
    title: editTitle.value.trim() || t("timer.defaultTitle"),
    mode,
    durationMinutes,
    targetDate,
    targetTime,
    targetAt: calculateTargetAt({ mode, durationMinutes, targetDate, targetTime }),
    pausedRemainingMs: null,
    deactivated: false,
    starred: false,
    alarmed: false,
    createdAt: Date.now(),
  };
}

function createId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `timer-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function clampInteger(value, min, max, fallback) {
  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isFinite(parsedValue)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, parsedValue));
}

function clampVolume(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0.55;
  }

  return Math.min(1, Math.max(0, number));
}

function getDurationMinutesFromForm() {
  const totalMinutes = getDurationTotalMinutes();

  if (!Number.isFinite(totalMinutes)) {
    return DEFAULT_DURATION_MINUTES;
  }

  return Math.min(MAX_DURATION_MINUTES, Math.max(1, totalMinutes));
}

function getDurationTotalMinutes() {
  const { hours, minutes } = getDurationParts();

  if (!isValidDurationParts(hours, minutes)) {
    return Number.NaN;
  }

  return hours * 60 + minutes;
}

function getDurationParts() {
  return {
    hours: readDurationPart(editDurationHours),
    minutes: readDurationPart(editDurationMinutes),
  };
}

function isValidDurationParts(hours, minutes) {
  const totalMinutes = hours * 60 + minutes;

  return (
    Number.isFinite(hours) &&
    Number.isFinite(minutes) &&
    hours >= 0 &&
    minutes >= 0 &&
    totalMinutes >= 1 &&
    totalMinutes <= MAX_DURATION_MINUTES
  );
}

function readDurationPart(input) {
  if (input.value.trim() === "") {
    return 0;
  }

  const value = Number(input.value);

  return Number.isInteger(value) ? value : Number.NaN;
}

function isValidTime(value) {
  return /^(24:00|([01]\d|2[0-3]):[0-5]\d)$/.test(value);
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function calculateTargetAt({ mode, durationMinutes, targetDate, targetTime }) {
  if (mode === "targetTime") {
    return getTargetTimestamp(targetDate, targetTime);
  }

  return Date.now() + durationMinutes * 60 * 1000;
}

function getTargetTimestamp(dateValue, timeValue) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const [hours, minutes] = timeValue.split(":").map(Number);
  const target = new Date(year, month - 1, day, 0, 0, 0, 0);

  if (hours === 24) {
    target.setDate(target.getDate() + 1);
    target.setHours(0, 0, 0, 0);
  } else {
    target.setHours(hours, minutes, 0, 0);
  }

  return target.getTime();
}

function renderTimers({ sort = state.settings.autoSort } = {}) {
  arrangeTimers({ sort });

  rowById.clear();
  timerList.replaceChildren();
  emptyState.hidden = state.timers.length > 0;
  clearAllButton.disabled = state.timers.length === 0;

  const hasStarredTimers = state.timers.some((timer) => timer.starred);
  let showedStarredGroup = false;
  let showedRegularGroup = false;

  state.timers.forEach((timer) => {
    if (timer.starred && !showedStarredGroup) {
      timerList.append(createTimerGroupHeader("sections.starred"));
      showedStarredGroup = true;
    }

    if (!timer.starred && hasStarredTimers && !showedRegularGroup) {
      timerList.append(createTimerGroupHeader("sections.otherTimers"));
      showedRegularGroup = true;
    }

    const row = timerTemplate.content.firstElementChild.cloneNode(true);
    localizeElementTree(row);

    const titleInput = row.querySelector(".timer-title");
    const pauseButton = row.querySelector(".pause-button");
    const resetButton = row.querySelector(".reset-button");
    const nextDayButton = row.querySelector(".next-day-button");
    const deactivateButton = row.querySelector(".deactivate-button");
    const editButton = row.querySelector(".edit-button");
    const deleteButton = row.querySelector(".delete-button");
    const starButton = row.querySelector(".star-button");
    const dragHandle = row.querySelector(".drag-handle");
    const refs = {
      row,
      titleInput,
      timeOutput: row.querySelector(".timer-time"),
      targetOutput: row.querySelector(".target-time"),
      modeOutput: row.querySelector(".mode-value"),
      setValueOutput: row.querySelector(".set-value"),
      pauseButton,
      resetButton,
      nextDayButton,
      deactivateButton,
      editButton,
      starButton,
      dragHandle,
    };

    row.dataset.timerId = timer.id;
    titleInput.id = `timer-title-${timer.id}`;
    titleInput.name = titleInput.id;
    titleInput.value = timer.title;

    titleInput.addEventListener("input", (event) => {
      // Firefox session restore emits input without an inputType, not a user edit.
      if (!event.inputType) {
        titleInput.value = timer.title;
        return;
      }

      timer.title = titleInput.value.trim() || t("timer.defaultTitle");
      saveState();
      syncAlarmScheduler();
    });

    pauseButton.addEventListener("click", () => {
      togglePauseTimer(timer.id);
    });

    resetButton.addEventListener("click", () => {
      resetDurationTimer(timer.id);
    });

    nextDayButton.addEventListener("click", () => {
      rescheduleTargetTimerNextDay(timer.id);
    });

    deactivateButton.addEventListener("click", () => {
      toggleDeactivated(timer.id);
    });

    editButton.addEventListener("click", () => {
      openTimerEditDialog(timer.id);
    });

    deleteButton.addEventListener("click", () => {
      deleteTimer(timer.id);
    });

    starButton.addEventListener("click", () => {
      toggleStarred(timer.id);
    });

    dragHandle.draggable = !state.settings.autoSort;
    dragHandle.addEventListener("dragstart", (event) => {
      startDraggingTimer(event, timer.id, row);
    });
    dragHandle.addEventListener("dragend", finishDraggingTimer);

    rowById.set(timer.id, refs);
    renderStaticTimerData(timer, refs);
    timerList.append(row);
  });

  updateToolbarUi();
  updateTimers();
}

function createTimerGroupHeader(labelKey) {
  const header = document.createElement("div");

  header.className = "timer-group-header";
  header.textContent = t(labelKey);
  header.dataset.i18n = labelKey;

  return header;
}

function sortTimersPreservingDeactivated() {
  arrangeTimers({ sort: true });
}

function arrangeTimers({ sort }) {
  const starredTimers = arrangeTimerGroup(
    state.timers.filter((timer) => timer.starred),
    sort,
  );
  const regularTimers = arrangeTimerGroup(
    state.timers.filter((timer) => !timer.starred),
    sort,
  );

  state.timers.splice(0, state.timers.length, ...starredTimers, ...regularTimers);
}

function arrangeTimerGroup(timers, sort) {
  const sortableTimers = timers.filter((timer) => !timer.deactivated);

  if (sort) {
    sortableTimers.sort(compareTimerTime);
  }

  let nextSortableIndex = 0;
  return timers.map((timer) => {
    if (timer.deactivated) {
      return timer;
    }

    const nextTimer = sortableTimers[nextSortableIndex];
    nextSortableIndex += 1;
    return nextTimer;
  });
}

function compareTimerTime(first, second) {
  const direction = state.settings.sortDirection === "desc" ? -1 : 1;
  const firstSortAt = getSortAt(first);
  const secondSortAt = getSortAt(second);

  if (firstSortAt !== secondSortAt) {
    return (firstSortAt - secondSortAt) * direction;
  }

  return first.createdAt - second.createdAt;
}

function getSortAt(timer) {
  if (isPaused(timer)) {
    if (timer.mode === "targetTime") {
      return getTargetTimerResumeAt(timer);
    }

    return Date.now() + timer.pausedRemainingMs;
  }

  return timer.targetAt;
}

function startDraggingTimer(event, timerId, row) {
  if (state.settings.autoSort) {
    event.preventDefault();
    return;
  }

  draggedTimerId = timerId;
  row.classList.add("is-dragging");
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", timerId);
}

function finishDraggingTimer() {
  const draggedRow = timerList.querySelector(".timer-row.is-dragging");

  draggedRow?.classList.remove("is-dragging");
  dropMarker.remove();
  draggedTimerId = null;
}

function handleTimerListDragOver(event) {
  if (state.settings.autoSort || !draggedTimerId) {
    return;
  }

  event.preventDefault();
  const afterElement = getDragAfterElement(event.clientY);

  if (afterElement) {
    timerList.insertBefore(dropMarker, afterElement);
  } else {
    timerList.append(dropMarker);
  }
}

function handleTimerListDrop(event) {
  if (state.settings.autoSort || !draggedTimerId) {
    return;
  }

  event.preventDefault();
  const beforeId = dropMarker.nextElementSibling?.dataset.timerId || null;

  moveTimerBefore(draggedTimerId, beforeId);
  finishDraggingTimer();
  saveState();
  renderTimers({ sort: false });
}

function getDragAfterElement(clientY) {
  const rows = [...timerList.querySelectorAll(".timer-row:not(.is-dragging)")];

  return rows.reduce(
    (closest, row) => {
      const box = row.getBoundingClientRect();
      const offset = clientY - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset, row };
      }

      return closest;
    },
    { offset: Number.NEGATIVE_INFINITY, row: null },
  ).row;
}

function moveTimerBefore(timerId, beforeId) {
  if (timerId === beforeId) {
    return;
  }

  const fromIndex = state.timers.findIndex((timer) => timer.id === timerId);

  if (fromIndex === -1) {
    return;
  }

  const [timer] = state.timers.splice(fromIndex, 1);
  const toIndex = beforeId
    ? state.timers.findIndex((item) => item.id === beforeId)
    : state.timers.length;

  state.timers.splice(toIndex === -1 ? state.timers.length : toIndex, 0, timer);
}

function updateTimers({
  notifiedTimerIds = new Set(),
  timerIdsToProcess = null,
} = {}) {
  const now = Date.now();
  let shouldSave = false;
  let shouldPlayAlarm = false;
  const expiredTimers = [];

  state.timers.forEach((timer) => {
    const remainingMs = getRemainingMs(timer, now);

    if (
      (!timerIdsToProcess || timerIdsToProcess.has(timer.id)) &&
      !isPaused(timer) &&
      !timer.deactivated &&
      remainingMs <= 0 &&
      !timer.alarmed
    ) {
      timer.alarmed = true;
      shouldSave = true;
      shouldPlayAlarm = true;
      expiredTimers.push(timer);
    }

    updateTimerRow(timer, remainingMs);
  });

  updatePageSignal();

  if (shouldSave) {
    saveState();
  }

  if (shouldPlayAlarm) {
    playAlarm();
  }

  expiredTimers
    .filter((timer) => !notifiedTimerIds.has(timer.id))
    .forEach(notifyTimerExpired);

  syncAlarmScheduler();
}

function refreshTimers() {
  const now = Date.now();

  state.timers.forEach((timer) => {
    updateTimerRow(timer, getRemainingMs(timer, now));
  });

  updatePageSignal();
}

function updateTimerRow(timer, remainingMs) {
  const refs = rowById.get(timer.id);

  if (!refs) {
    return;
  }

  const paused = isPaused(timer);
  const isOverdue = !paused && remainingMs <= 0;
  const isWarning = isTimerWarning(timer, remainingMs);

  refs.row.classList.toggle("is-overdue", isOverdue);
  refs.row.classList.toggle("is-warning", isWarning);
  refs.row.classList.toggle("is-paused", paused);
  refs.row.classList.toggle("is-deactivated", timer.deactivated);
  refs.row.classList.toggle("is-starred", timer.starred);
  refs.timeOutput.textContent = formatDuration(remainingMs);
  refs.targetOutput.classList.toggle("is-warning", isWarning);
  refs.pauseButton.textContent = paused ? t("timer.resume") : t("timer.pause");
  refs.pauseButton.setAttribute("aria-pressed", String(paused));
  refs.pauseButton.disabled = false;
  refs.resetButton.hidden = timer.mode !== "duration";
  refs.nextDayButton.hidden = !(timer.mode === "targetTime" && isOverdue);
  refs.nextDayButton.disabled = timer.mode !== "targetTime" || !isOverdue;
  refs.deactivateButton.textContent = timer.deactivated ? t("timer.activate") : t("timer.deactivate");
  refs.deactivateButton.setAttribute("aria-pressed", String(timer.deactivated));
  refs.starButton.textContent = timer.starred ? "★" : "☆";
  refs.starButton.setAttribute("aria-pressed", String(timer.starred));
  refs.starButton.setAttribute(
    "aria-label",
    timer.starred ? t("timer.removeStar") : t("timer.addStar"),
  );
}

function renderStaticTimerData(timer, refs) {
  refs.pauseButton.hidden = false;
  refs.resetButton.textContent = t("timer.reset");
  refs.nextDayButton.textContent = t("timer.nextDay");
  refs.editButton.textContent = t("timer.edit");

  if (isPaused(timer)) {
    refs.targetOutput.textContent = PAUSED_TARGET_LABEL;
    refs.targetOutput.removeAttribute("datetime");
  } else {
    const targetDate = new Date(timer.targetAt);

    refs.targetOutput.textContent = formatDateTimeLocal(timer.targetAt);
    refs.targetOutput.dateTime = targetDate.toISOString();
  }

  refs.modeOutput.textContent = formatModeValue(timer);
  refs.setValueOutput.textContent = formatSpecifiedValue(timer);
}

function formatModeValue(timer) {
  return timer.mode === "targetTime" ? "⏰" : "⏱";
}

function getRemainingMs(timer, now = Date.now()) {
  if (isPaused(timer)) {
    return timer.pausedRemainingMs;
  }

  return timer.targetAt - now;
}

function isTimerWarning(timer, remainingMs) {
  return (
    !isPaused(timer) &&
    !timer.deactivated &&
    remainingMs > 0 &&
    remainingMs <= getWarningMs()
  );
}

function getWarningMs() {
  return state.settings.warningMinutes * 60 * 1000;
}

function isPaused(timer) {
  return Number.isFinite(timer.pausedRemainingMs);
}

function formatDuration(ms) {
  const totalSeconds = Math.floor(Math.abs(ms) / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const sign = ms < 0 ? "+" : "";
  const time = [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");

  return days > 0 ? `${sign}${days}${t("unit.day")} ${time}` : `${sign}${time}`;
}

function formatSpecifiedValue(timer) {
  if (timer.mode === "targetTime") {
    return `${formatDateShort(timer.targetDate)} ${timer.targetTime}`;
  }

  return formatDurationSetting(timer.durationMinutes);
}

function formatDurationSetting(totalMinutes) {
  const durationMinutes = clampInteger(
    totalMinutes,
    1,
    MAX_DURATION_MINUTES,
    DEFAULT_DURATION_MINUTES,
  );
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  return `${hours}:${String(minutes).padStart(2, "0")}`;
}

function formatDateShort(value) {
  if (!isValidDate(value)) {
    return "";
  }

  return value;
}

function formatDateTimeLocal(timestamp) {
  return `${getDateInputValue(timestamp)} ${getTimeInputValue(timestamp)}`;
}

function togglePauseTimer(timerId) {
  const timer = findTimer(timerId);

  if (!timer) {
    return;
  }

  if (isPaused(timer)) {
    resumeTimer(timer);
  } else {
    pauseTimer(timer);
  }

  saveState();
  renderTimers();
}

function pauseTimer(timer) {
  timer.pausedRemainingMs = getRemainingMs(timer);

  if (timer.pausedRemainingMs <= 0) {
    timer.alarmed = true;
  }
}

function resumeTimer(timer) {
  const pausedRemainingMs = timer.pausedRemainingMs;

  timer.pausedRemainingMs = null;

  if (timer.mode === "targetTime") {
    resumeTargetTimer(timer);
    return;
  }

  timer.targetAt = Date.now() + pausedRemainingMs;

  if (pausedRemainingMs > 0) {
    timer.alarmed = false;
  }
}

function resumeTargetTimer(timer) {
  const now = Date.now();
  const targetAt = getTargetTimestamp(timer.targetDate, timer.targetTime);

  if (targetAt > now) {
    timer.targetAt = targetAt;
  } else {
    setTargetTimerAt(timer, getNextSameLocalTime(targetAt, now).getTime());
  }

  timer.alarmed = false;
}

function resetDurationTimer(timerId) {
  const timer = findTimer(timerId);

  if (!timer || timer.mode !== "duration") {
    return;
  }

  timer.targetAt = calculateTargetAt(timer);
  timer.pausedRemainingMs = null;
  timer.deactivated = false;
  timer.alarmed = false;
  saveState();
  renderTimers();
}

function openTimerEditDialog(timerId) {
  const timer = findTimer(timerId);

  if (!timer) {
    return;
  }

  if (timer.mode !== "targetTime" || getRemainingMs(timer) > 0) {
    openEditDialog(timerId);
    return;
  }

  const now = getDefaultTargetTimestamp();
  openEditDialog(timerId, {
    mode: "targetTime",
    targetDate: getDateInputValue(now),
    targetTime: getTimeInputValue(now),
  });
}

function rescheduleTargetTimerNextDay(timerId) {
  const timer = findTimer(timerId);

  if (!timer || timer.mode !== "targetTime") {
    return;
  }

  const nextTarget = getNextSameLocalTime(timer.targetAt);

  setTargetTimerAt(timer, nextTarget.getTime());
  timer.deactivated = false;
  timer.alarmed = false;
  saveState();
  renderTimers();
}

function getTargetTimerResumeAt(timer, now = Date.now()) {
  const targetAt = getTargetTimestamp(timer.targetDate, timer.targetTime);

  if (targetAt > now) {
    return targetAt;
  }

  return getNextSameLocalTime(targetAt, now).getTime();
}

function setTargetTimerAt(timer, timestamp) {
  timer.targetAt = timestamp;
  timer.targetDate = getDateInputValue(timestamp);
  timer.targetTime = getTimeInputValue(timestamp);
}

function getNextSameLocalTime(timestamp, now = Date.now()) {
  const nextTarget = new Date(timestamp);

  do {
    nextTarget.setDate(nextTarget.getDate() + 1);
  } while (nextTarget.getTime() <= now);

  return nextTarget;
}

function toggleDeactivated(timerId) {
  const timer = findTimer(timerId);

  if (!timer) {
    return;
  }

  timer.deactivated = !timer.deactivated;

  if (timer.deactivated) {
    timer.alarmed = true;
  } else if (getRemainingMs(timer) > 0) {
    timer.alarmed = false;
  }

  saveState();
  renderTimers();
}

function toggleStarred(timerId) {
  const timer = findTimer(timerId);

  if (!timer) {
    return;
  }

  timer.starred = !timer.starred;
  saveState();
  renderTimers();
}

function deleteTimer(timerId) {
  const timerIndex = state.timers.findIndex((timer) => timer.id === timerId);

  if (timerIndex === -1) {
    return;
  }

  state.timers.splice(timerIndex, 1);
  saveState();
  renderTimers();
}

function findTimer(timerId) {
  return state.timers.find((timer) => timer.id === timerId);
}

function openEditDialog(timerId = null, initialValues = {}) {
  const timer = timerId ? findTimer(timerId) : null;
  const defaultTargetAt = getDefaultTargetTimestamp();

  if (timerId && !timer) {
    return;
  }

  const shouldShowDialog = !timerDialog.open;
  editingTimerId = timer?.id || null;
  dialogTitle.textContent = timer ? t("dialog.editTitle") : t("dialog.newTitle");
  deleteEditButton.hidden = !timer;
  editTitle.value = timer?.title || t("timer.defaultTitle");
  setEditDurationValue(
    initialValues.durationMinutes ?? timer?.durationMinutes ?? DEFAULT_DURATION_MINUTES,
  );
  setEditTargetDate(initialValues.targetDate ?? (timer
    ? timer.mode === "targetTime"
      ? timer.targetDate
      : getDateInputValue(timer.targetAt)
    : getDateInputValue(defaultTargetAt)));
  setEditTargetTime(
    initialValues.targetTime ?? (timer
      ? timer.mode === "targetTime"
        ? timer.targetTime
        : getTimeInputValue(timer.targetAt)
      : getTimeInputValue(defaultTargetAt)),
  );

  const mode = initialValues.mode || timer?.mode || "duration";
  timerForm.elements.timerMode.value = mode;
  updateModeFields();

  if (shouldShowDialog) {
    timerDialog.showModal();
  }

  editTitle.focus();
  editTitle.select();
}

function getDefaultTargetTimestamp(now = Date.now()) {
  const target = new Date(now);

  target.setSeconds(0, 0);

  if (target.getTime() <= now) {
    target.setMinutes(target.getMinutes() + 1);
  }

  return target.getTime();
}

function closeEditDialog() {
  if (timerDialog.open) {
    timerDialog.close();
  }

  editingTimerId = null;
  deleteEditButton.hidden = true;
}

function saveEditFromDialog() {
  const formTimer = createTimerFromForm();
  const timer = editingTimerId ? findTimer(editingTimerId) : null;

  if (!timer) {
    state.timers.push(formTimer);
  } else {
    const timeChanged = hasTimerTimeChanged(timer, formTimer);

    timer.title = formTimer.title;

    if (timeChanged) {
      Object.assign(timer, {
        mode: formTimer.mode,
        durationMinutes: formTimer.durationMinutes,
        targetDate: formTimer.targetDate,
        targetTime: formTimer.targetTime,
        targetAt: formTimer.targetAt,
        pausedRemainingMs: null,
        deactivated: false,
        alarmed: false,
      });
    }
  }

  saveState();
  closeEditDialog();
  renderTimers();
}

function hasTimerTimeChanged(timer, formTimer) {
  if (timer.mode !== formTimer.mode) {
    return true;
  }

  if (timer.mode === "duration") {
    return timer.durationMinutes !== formTimer.durationMinutes;
  }

  return timer.targetDate !== formTimer.targetDate || timer.targetTime !== formTimer.targetTime;
}

function updateModeFields() {
  const mode = timerForm.elements.timerMode.value;
  const isDurationMode = mode === "duration";
  const isTargetMode = mode === "targetTime";

  durationField.hidden = !isDurationMode;
  targetTimeField.hidden = !isTargetMode;
  editDurationHours.disabled = !isDurationMode;
  editDurationMinutes.disabled = !isDurationMode;
  editTargetDate.disabled = !isTargetMode;
  editTargetDatePicker.disabled = !isTargetMode;
  targetDatePickerButton.disabled = !isTargetMode;
  editTargetHours.disabled = !isTargetMode;
  editTargetMinutes.disabled = !isTargetMode;
  editTargetDate.required = isTargetMode;
  editTargetHours.required = isTargetMode;
  editTargetMinutes.required = isTargetMode;
  validateDurationFields();
  validateTargetFields();
}

function setEditDurationValue(totalMinutes) {
  const durationMinutes = clampInteger(
    totalMinutes,
    1,
    MAX_DURATION_MINUTES,
    DEFAULT_DURATION_MINUTES,
  );
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  editDurationHours.value = String(hours);
  editDurationMinutes.value = String(minutes).padStart(2, "0");
  validateDurationFields();
}

function normalizeDurationFields() {
  const { hours, minutes } = getDurationParts();

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    editDurationHours.value = normalizeDurationPart(editDurationHours.value);
    editDurationMinutes.value = normalizeDurationPart(editDurationMinutes.value).padStart(2, "0");
    validateDurationFields();
    return;
  }

  const totalMinutes =
    Math.max(0, Math.trunc(hours)) * 60 + Math.max(0, Math.trunc(minutes));
  const normalizedHours = Math.floor(totalMinutes / 60);
  const normalizedMinutes = totalMinutes % 60;

  editDurationHours.value = String(normalizedHours);
  editDurationMinutes.value = String(normalizedMinutes).padStart(2, "0");
  validateDurationFields();
}

function normalizeDurationPart(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return String(Math.max(0, Math.trunc(number)));
}

function validateDurationFields() {
  const isDurationMode = timerForm.elements.timerMode.value === "duration";
  const { hours, minutes } = getDurationParts();
  const durationMessage =
    isDurationMode && !isValidDurationParts(hours, minutes)
      ? t("validation.duration")
      : "";

  editDurationHours.setCustomValidity(durationMessage);
  editDurationMinutes.setCustomValidity(durationMessage);
}

function getEditTargetTime() {
  const hours = toPaddedTimePart(editTargetHours.value);
  const minutes = toPaddedTimePart(editTargetMinutes.value);

  return `${hours}:${minutes}`;
}

function setEditTargetTime(value) {
  const time = isValidTime(value)
    ? value
    : getTimeInputValue(getDefaultTargetTimestamp());
  const [hours, minutes] = time.split(":");

  editTargetHours.value = hours;
  editTargetMinutes.value = minutes;
  validateTargetFields();
}

function toPaddedTimePart(value) {
  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isFinite(parsedValue)) {
    return "00";
  }

  return String(parsedValue).padStart(2, "0");
}

function normalizeTargetFields() {
  if (!isValidDate(editTargetDate.value)) {
    setEditTargetDate("");
  } else {
    setEditTargetDate(editTargetDate.value);
  }

  editTargetHours.value = toPaddedTimePart(editTargetHours.value);
  editTargetMinutes.value = toPaddedTimePart(editTargetMinutes.value);
  validateTargetFields();
}

function validateTargetFields() {
  const isTargetMode = timerForm.elements.timerMode.value === "targetTime";
  const targetTime = getEditTargetTime();
  const [hours, minutes] = targetTime.split(":").map(Number);
  let timeMessage = "";
  let dateMessage = "";

  if (isTargetMode && (!isValidTime(targetTime) || (hours === 24 && minutes !== 0))) {
    timeMessage = t("validation.time");
  }

  if (isTargetMode && !isValidDate(editTargetDate.value)) {
    dateMessage = t("validation.date");
  }

  editTargetHours.setCustomValidity(timeMessage);
  editTargetMinutes.setCustomValidity(timeMessage);
  editTargetDate.setCustomValidity(dateMessage);
}

function setEditTargetDate(value) {
  const dateValue = isValidDate(value)
    ? value
    : getDateInputValue(getDefaultTargetTimestamp());

  editTargetDate.value = dateValue;
  editTargetDatePicker.value = dateValue;
}

function formatDateInputDraft(value) {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 4) {
    return digits;
  }

  if (digits.length <= 6) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }

  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

function openTargetDatePicker() {
  if (isValidDate(editTargetDate.value)) {
    editTargetDatePicker.value = editTargetDate.value;
  }

  if (typeof editTargetDatePicker.showPicker === "function") {
    try {
      editTargetDatePicker.showPicker();
      return;
    } catch {
      // Fall back to focusing the native picker input.
    }
  }

  editTargetDatePicker.focus();
  editTargetDatePicker.click();
}

function getTimeInputValue(timestamp) {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

function getDateInputValue(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function updateToolbarUi() {
  const volumePercent = Math.round(clampVolume(state.settings.volume) * 100);

  applyLocalization();
  if (timerDialog.open) {
    dialogTitle.textContent = editingTimerId ? t("dialog.editTitle") : t("dialog.newTitle");
  }
  languageSelect.value = getLanguage();
  volumeRange.value = String(volumePercent);
  volumeValue.textContent = `${volumePercent}%`;
  muteButton.classList.toggle("is-active", state.settings.muted);
  muteButton.setAttribute("aria-pressed", String(state.settings.muted));
  muteButton.textContent = state.settings.muted ? t("controls.unmute") : t("controls.mute");
  updateNotificationsUi();
  autoSortToggle.checked = state.settings.autoSort;
  sortNowButton.disabled = state.settings.autoSort;
  sortDirectionSelect.value = state.settings.sortDirection;
  ringtoneSelect.value = state.settings.ringtone;
  alarmDurationSeconds.value = String(state.settings.alarmDurationSeconds);
  warningMinutesInput.value = String(state.settings.warningMinutes);
  timerList.classList.toggle("can-drag", !state.settings.autoSort);
}

function updateNotificationsUi() {
  const permission = getDesktopNotificationPermission();
  const enabled =
    state.settings.desktopNotificationsEnabled && permission === "granted";
  let labelKey = "controls.notificationsEnable";

  notificationsButton.disabled = permission === "unsupported" || permission === "denied";
  notificationsButton.classList.toggle("is-active", enabled);
  notificationsButton.setAttribute("aria-pressed", String(enabled));

  if (permission === "unsupported") {
    labelKey = "controls.notificationsUnavailable";
  } else if (permission === "denied") {
    labelKey = "controls.notificationsBlocked";
  } else if (enabled) {
    labelKey = "controls.notificationsOn";
  }

  notificationsButton.textContent = t(labelKey);
}

function ensureAudioContext() {
  const AudioContextConstructor = globalThis.AudioContext || globalThis.webkitAudioContext;

  if (!AudioContextConstructor) {
    return null;
  }

  if (!audioContext) {
    audioContext = new AudioContextConstructor();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume().catch(() => {});
  }

  return audioContext;
}

function playAlarm() {
  const volume = clampVolume(state.settings.volume);
  const context = ensureAudioContext();

  if (!context || volume === 0 || state.settings.muted) {
    return;
  }

  const ringtone = RINGTONES[state.settings.ringtone] || RINGTONES.classic;
  const duration = clampInteger(
    state.settings.alarmDurationSeconds,
    1,
    60,
    DEFAULT_ALARM_SECONDS,
  );
  const startAt = context.currentTime + 0.03;
  const endAt = startAt + duration;
  let time = startAt;

  while (time < endAt) {
    for (const frequency of ringtone.frequencies) {
      if (time >= endAt) {
        break;
      }

      scheduleBeep(context, {
        frequency,
        gainValue: volume * ringtone.gain,
        noteLength: Math.min(ringtone.note, endAt - time),
        startAt: time,
        type: ringtone.type,
      });
      time += ringtone.step;
    }
  }
}

function createAlarmSchedulerWorker() {
  if (!("Worker" in globalThis) || !("Blob" in globalThis) || !("URL" in globalThis)) {
    return null;
  }

  const workerSource = `
    let timers = [];
    let timeoutId = null;
    let notificationsEnabled = false;
    const MAX_TIMEOUT_MS = ${MAX_TIMEOUT_MS};

    self.onmessage = (event) => {
      const data = event.data || {};

      if (data.type === "check") {
        if (timers.length > 0 && timers[0].targetAt <= Date.now()) {
          handleDeadline();
        } else {
          scheduleNextDeadline();
        }
        return;
      }

      if (data.type !== "schedule") {
        return;
      }

      timers = Array.isArray(data.timers)
        ? data.timers
          .filter((timer) => Number.isFinite(timer.targetAt))
          .sort((first, second) => first.targetAt - second.targetAt)
        : [];
      notificationsEnabled = data.notificationsEnabled === true;
      scheduleNextDeadline();
    };

    function scheduleNextDeadline() {
      clearTimeout(timeoutId);
      timeoutId = null;

      if (timers.length === 0) {
        return;
      }

      const remainingMs = timers[0].targetAt - Date.now();
      const delay = Math.min(MAX_TIMEOUT_MS, Math.max(0, remainingMs));

      timeoutId = setTimeout(handleDeadline, delay);
    }

    function handleDeadline() {
      timeoutId = null;
      const now = Date.now();

      if (timers.length > 0 && timers[0].targetAt > now) {
        scheduleNextDeadline();
        return;
      }

      const dueTimers = timers.filter((timer) => timer.targetAt <= now);
      const dueTimerIds = dueTimers.map((timer) => timer.id);
      const notifiedTimerIds = dueTimers
        .filter(showNotification)
        .map((timer) => timer.id);

      timers = timers.filter((timer) => timer.targetAt > now);
      self.postMessage({
        type: "deadline",
        timerIds: dueTimerIds,
        notifiedTimerIds,
      });
      scheduleNextDeadline();
    }

    function showNotification(timer) {
      if (
        !notificationsEnabled ||
        !("Notification" in self) ||
        Notification.permission !== "granted"
      ) {
        return false;
      }

      try {
        const notification = new Notification(timer.notificationTitle, {
          body: timer.notificationBody,
          icon: timer.icon,
          renotify: true,
          tag: "multitimer-" + timer.id,
          timestamp: timer.targetAt,
        });

        notification.onclick = () => {
          self.postMessage({ type: "notification-click" });
          notification.close();
        };
        return true;
      } catch {
        return false;
      }
    }
  `;

  try {
    const workerUrl = URL.createObjectURL(new Blob([workerSource], {
      type: "text/javascript",
    }));
    const worker = new Worker(workerUrl, { name: "multitimer-alarm-scheduler" });

    URL.revokeObjectURL(workerUrl);
    worker.addEventListener("message", handleAlarmSchedulerMessage);
    worker.addEventListener("error", () => {
      if (alarmSchedulerWorker !== worker) {
        return;
      }

      worker.terminate();
      alarmSchedulerWorker = null;
      alarmScheduleSignature = null;
      syncAlarmScheduler();
    }, { once: true });
    return worker;
  } catch {
    return null;
  }
}

function handleAlarmSchedulerMessage(event) {
  const data = event.data || {};

  if (data.type === "notification-click") {
    globalThis.focus();
    return;
  }

  if (data.type !== "deadline") {
    return;
  }

  clearTimeout(resumeAlarmCheckTimeoutId);
  resumeAlarmCheckTimeoutId = null;
  updateTimers({
    notifiedTimerIds: new Set(
      Array.isArray(data.notifiedTimerIds) ? data.notifiedTimerIds : [],
    ),
    timerIdsToProcess: new Set(
      Array.isArray(data.timerIds) ? data.timerIds : [],
    ),
  });
}

function checkTimersAfterPageResume() {
  if (!alarmSchedulerWorker) {
    updateTimers();
    return;
  }

  if (resumeAlarmCheckTimeoutId !== null) {
    return;
  }

  resumeAlarmCheckTimeoutId = setTimeout(() => {
    resumeAlarmCheckTimeoutId = null;
    updateTimers();
  }, ALARM_WORKER_RESPONSE_GRACE_MS);
  alarmSchedulerWorker.postMessage({ type: "check" });
}

function syncAlarmScheduler() {
  const notificationsEnabled =
    state.settings.desktopNotificationsEnabled &&
    getDesktopNotificationPermission() === "granted";
  const icon = notificationsEnabled
    ? (overdueFaviconHref ||= createFavicon("#ff6b5f", true))
    : "";
  const timers = state.timers
    .filter((timer) => (
      !timer.deactivated &&
      !timer.alarmed &&
      !isPaused(timer) &&
      Number.isFinite(timer.targetAt)
    ))
    .map((timer) => ({
      id: timer.id,
      targetAt: timer.targetAt,
      notificationTitle: t("notification.expiredTitle"),
      notificationBody: t("notification.expiredBody").replace("{title}", timer.title),
      icon,
    }))
    .sort((first, second) => first.targetAt - second.targetAt);
  const signature = JSON.stringify({ notificationsEnabled, timers });

  if (signature === alarmScheduleSignature) {
    return;
  }

  alarmScheduleSignature = signature;
  alarmSchedulerWorker?.postMessage({
    type: "schedule",
    notificationsEnabled,
    timers,
  });
  scheduleFallbackAlarm(timers[0]?.targetAt ?? null);
}

function scheduleFallbackAlarm(targetAt) {
  clearTimeout(alarmFallbackTimeoutId);
  alarmFallbackTimeoutId = null;

  if (!Number.isFinite(targetAt)) {
    return;
  }

  const remainingMs = Math.max(0, targetAt - Date.now());
  const delay = Math.min(
    MAX_TIMEOUT_MS,
    remainingMs + ALARM_FALLBACK_GRACE_MS,
  );

  alarmFallbackTimeoutId = setTimeout(() => {
    alarmFallbackTimeoutId = null;

    if (targetAt > Date.now()) {
      alarmScheduleSignature = null;
      syncAlarmScheduler();
      return;
    }

    updateTimers();
  }, delay);
}

function getDesktopNotificationPermission() {
  if (!("Notification" in globalThis)) {
    return "unsupported";
  }

  return Notification.permission;
}

async function toggleDesktopNotifications() {
  const permission = getDesktopNotificationPermission();

  if (permission === "unsupported" || permission === "denied") {
    updateSetting((settings) => {
      settings.desktopNotificationsEnabled = false;
    }, { render: false });
    return;
  }

  if (permission === "granted") {
    updateSetting((settings) => {
      settings.desktopNotificationsEnabled = !settings.desktopNotificationsEnabled;
    }, { render: false });
    return;
  }

  try {
    const nextPermission = await Notification.requestPermission();

    updateSetting((settings) => {
      settings.desktopNotificationsEnabled = nextPermission === "granted";
    }, { render: false });
  } catch {
    updateSetting((settings) => {
      settings.desktopNotificationsEnabled = false;
    }, { render: false });
  }
}

function notifyTimerExpired(timer) {
  if (
    !state.settings.desktopNotificationsEnabled ||
    getDesktopNotificationPermission() !== "granted"
  ) {
    return;
  }

  try {
    overdueFaviconHref ||= createFavicon("#ff6b5f", true);
    const notification = new Notification(t("notification.expiredTitle"), {
      body: t("notification.expiredBody").replace("{title}", timer.title),
      icon: overdueFaviconHref,
      renotify: true,
      tag: `multitimer-${timer.id}`,
      timestamp: Date.now(),
    });

    notification.onclick = () => {
      globalThis.focus();
      notification.close();
    };
  } catch {
    // Browser notification permissions and platform support can change at runtime.
  }
}

function scheduleBeep(context, { frequency, gainValue, noteLength, startAt, type }) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const stopAt = startAt + noteLength;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startAt);
  oscillator.connect(gain);
  gain.connect(context.destination);

  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, gainValue), startAt + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.0001, stopAt);

  oscillator.start(startAt);
  oscillator.stop(stopAt + 0.04);
}

function updatePageSignal() {
  const signalMode = getPageSignalMode();

  if (signalMode === lastPageSignalMode) {
    return;
  }

  lastPageSignalMode = signalMode;
  document.title = signalMode === "overdue" ? "● MultiTimer" : "MultiTimer";
  setFavicon(signalMode);
}

function getPageSignalMode() {
  const now = Date.now();
  let hasActiveTimer = false;
  let hasWarningTimer = false;

  for (const timer of state.timers) {
    if (timer.deactivated || isPaused(timer)) {
      continue;
    }

    hasActiveTimer = true;
    const remainingMs = getRemainingMs(timer, now);

    if (remainingMs <= 0) {
      return "overdue";
    }

    if (isTimerWarning(timer, remainingMs)) {
      hasWarningTimer = true;
    }
  }

  if (hasWarningTimer) {
    return "warning";
  }

  return hasActiveTimer ? "active" : "neutral";
}

function setFavicon(signalMode) {
  let link = document.querySelector("link[rel='icon']");

  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.append(link);
  }

  neutralFaviconHref ||= createFavicon("#8a8580", false);
  activeFaviconHref ||= createFavicon("#57d6c1", false);
  warningFaviconHref ||= createFavicon("#f2c14e", false);
  overdueFaviconHref ||= createFavicon("#ff6b5f", true);

  const faviconByMode = {
    neutral: neutralFaviconHref,
    active: activeFaviconHref,
    warning: warningFaviconHref,
    overdue: overdueFaviconHref,
  };

  link.href = faviconByMode[signalMode] || neutralFaviconHref;
}

function createFavicon(color, hasDot) {
  const dot = hasDot
    ? `<circle cx="22" cy="10" r="6" fill="#ff6b5f" stroke="#11100f" stroke-width="2"/>`
    : "";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <rect width="32" height="32" rx="7" fill="#151311"/>
      <circle cx="16" cy="17" r="10" fill="#24211f" stroke="${color}" stroke-width="3"/>
      <path d="M16 10v7l5 3" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      ${dot}
    </svg>
  `;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function updateSetting(updater, { render = true } = {}) {
  updater(state.settings);
  state.settings = normalizeSettings(state.settings);
  saveState();

  if (render) {
    renderTimers();
  } else {
    updateToolbarUi();
    syncAlarmScheduler();
  }
}

addTimerButton.addEventListener("click", () => {
  openEditDialog();
});

clearAllButton.addEventListener("click", () => {
  if (state.timers.length === 0) {
    return;
  }

  if (globalThis.confirm(t("confirm.clearAll"))) {
    state.timers.splice(0, state.timers.length);
    saveState();
    renderTimers({ sort: false });
  }
});

timerList.addEventListener("dragover", handleTimerListDragOver);
timerList.addEventListener("drop", handleTimerListDrop);
timerList.addEventListener("dragleave", (event) => {
  if (!timerList.contains(event.relatedTarget)) {
    dropMarker.remove();
  }
});

volumeRange.addEventListener("input", () => {
  updateSetting((settings) => {
    settings.volume = clampVolume(Number(volumeRange.value) / 100);
  }, { render: false });
});

muteButton.addEventListener("click", () => {
  updateSetting((settings) => {
    settings.muted = !settings.muted;
  }, { render: false });
});

notificationsButton.addEventListener("click", () => {
  toggleDesktopNotifications();
});

languageSelect.addEventListener("change", () => {
  updateSetting((settings) => {
    settings.language = languageSelect.value === "en" ? "en" : "uk";
  });
});

autoSortToggle.addEventListener("change", () => {
  updateSetting((settings) => {
    settings.autoSort = autoSortToggle.checked;
  });
});

sortDirectionSelect.addEventListener("change", () => {
  updateSetting((settings) => {
    settings.sortDirection = sortDirectionSelect.value === "desc" ? "desc" : "asc";
  });
});

sortNowButton.addEventListener("click", () => {
  if (state.settings.autoSort) {
    return;
  }

  sortTimersPreservingDeactivated();
  saveState();
  renderTimers({ sort: false });
});

ringtoneSelect.addEventListener("change", () => {
  updateSetting((settings) => {
    settings.ringtone = RINGTONES[ringtoneSelect.value] ? ringtoneSelect.value : "classic";
  }, { render: false });
});

alarmDurationSeconds.addEventListener("change", () => {
  updateSetting((settings) => {
    settings.alarmDurationSeconds = clampInteger(
      alarmDurationSeconds.value,
      1,
      60,
      DEFAULT_ALARM_SECONDS,
    );
  }, { render: false });
});

warningMinutesInput.addEventListener("change", () => {
  updateSetting((settings) => {
    settings.warningMinutes = clampInteger(
      warningMinutesInput.value,
      1,
      1440,
      DEFAULT_WARNING_MINUTES,
    );
  });
});

testAlarmButton.addEventListener("click", () => {
  playAlarm();
});

timerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  normalizeDurationFields();
  normalizeTargetFields();

  if (!timerForm.checkValidity()) {
    timerForm.reportValidity();
    return;
  }

  saveEditFromDialog();
});

document.querySelectorAll("input[name='timerMode']").forEach((input) => {
  input.addEventListener("change", updateModeFields);
});

[editDurationHours, editDurationMinutes].forEach((input) => {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "").slice(0, input.maxLength);
    validateDurationFields();
  });

  input.addEventListener("blur", normalizeDurationFields);
});

editTargetDate.addEventListener("input", () => {
  const isCursorAtEnd = editTargetDate.selectionStart === editTargetDate.value.length;

  editTargetDate.value = formatDateInputDraft(editTargetDate.value);

  if (isCursorAtEnd) {
    editTargetDate.setSelectionRange(editTargetDate.value.length, editTargetDate.value.length);
  }

  if (isValidDate(editTargetDate.value)) {
    editTargetDatePicker.value = editTargetDate.value;
  }

  validateTargetFields();
});

editTargetDate.addEventListener("change", validateTargetFields);

editTargetDatePicker.addEventListener("change", () => {
  if (isValidDate(editTargetDatePicker.value)) {
    setEditTargetDate(editTargetDatePicker.value);
  }

  validateTargetFields();
});

targetDatePickerButton.addEventListener("click", openTargetDatePicker);

[editTargetHours, editTargetMinutes].forEach((input) => {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "").slice(0, 2);
    validateTargetFields();
  });

  input.addEventListener("blur", () => {
    input.value = toPaddedTimePart(input.value);
    validateTargetFields();
  });

  input.addEventListener("dblclick", () => {
    input.select();
  });
});

dialogCloseButton.addEventListener("click", closeEditDialog);
cancelEditButton.addEventListener("click", closeEditDialog);

deleteEditButton.addEventListener("click", () => {
  if (!editingTimerId) {
    return;
  }

  const timerId = editingTimerId;

  closeEditDialog();
  deleteTimer(timerId);
});

timerDialog.addEventListener("close", () => {
  editingTimerId = null;
  deleteEditButton.hidden = true;
});

document.addEventListener("pointerdown", ensureAudioContext, { once: true });
document.addEventListener("keydown", ensureAudioContext, { once: true });
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    checkTimersAfterPageResume();
  }
});
globalThis.addEventListener("focus", checkTimersAfterPageResume);
globalThis.addEventListener("pageshow", () => {
  // The saved application state takes precedence over browser-restored form values.
  state.timers.forEach((timer) => {
    const refs = rowById.get(timer.id);

    if (refs) {
      refs.titleInput.value = timer.title;
    }
  });
  updateToolbarUi();
  checkTimersAfterPageResume();
});

alarmSchedulerWorker = createAlarmSchedulerWorker();
updateToolbarUi();
renderTimers();
setInterval(refreshTimers, TICK_MS);
