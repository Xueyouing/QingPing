const STORAGE_KEY = "qingping-state-v7";
const LEGACY_KEYS = [
  "qingping-state-v6",
  "qingping-state-v5",
  "qingping-state-v4",
  "qingping-state-v3",
  "qingping-state-v2",
  "qingping-state-v1"
];
const TIMER_RING_LENGTH = 464.96;
const BUBBLE_RING_LENGTH = 182.21;
const DEFAULT_TAGS = ["计划", "工作", "学习", "阅读", "生活"];
const THEMES = {
  green: { green: "#42a65a", greenDark: "#286b3a", greenSoft: "#edf8f0", panel: "rgba(255,255,255,.94)", wash: "#d8eedf", accent: "#ffb74d" },
  blue: { green: "#3a9ab2", greenDark: "#1f6070", greenSoft: "#edf8fb", panel: "rgba(252,254,255,.94)", wash: "#d7eef4", accent: "#79c7d8" },
  violet: { green: "#8e7ad8", greenDark: "#5d4ca0", greenSoft: "#f2effb", panel: "rgba(254,252,255,.94)", wash: "#e7ddfb", accent: "#b99af2" }
};
const BACKGROUNDS = {
  dew: "linear-gradient(145deg, rgba(255,255,255,.96), rgba(238,248,241,.92))",
  violet: "radial-gradient(circle at 18% 8%, rgba(185,154,242,.3), transparent 34%), linear-gradient(145deg, rgba(255,255,255,.95), rgba(244,239,252,.92))",
  mist: "radial-gradient(circle at 80% 10%, rgba(121,199,216,.28), transparent 36%), linear-gradient(145deg, rgba(255,255,255,.95), rgba(237,248,251,.92))",
  bamboo: "radial-gradient(circle at 12% 85%, rgba(76,175,80,.2), transparent 34%), linear-gradient(145deg, rgba(255,255,255,.95), rgba(235,247,235,.92))"
};
const MOODS = [
  { value: "happy", label: "开心", mark: "晴" },
  { value: "calm", label: "平静", mark: "静" },
  { value: "tired", label: "疲惫", mark: "倦" },
  { value: "sad", label: "难过", mark: "雨" },
  { value: "angry", label: "生气", mark: "火" },
  { value: "surprised", label: "惊喜", mark: "光" },
  { value: "done", label: "完成", mark: "成" },
  { value: "cheer", label: "加油", mark: "风" }
];

const desktopBridge = globalThis.qingpingDesktop;
const $ = (selector) => document.querySelector(selector);
const els = {
  panel: $("#panel"),
  settingsPanel: $("#settingsPanel"),
  notice: $("#notice"),
  viewTabs: [...document.querySelectorAll(".view-tab")],
  views: [...document.querySelectorAll(".view")],
  modeButtons: [...document.querySelectorAll(".mode-switch .mode-button")],
  focusLabel: $("#focusLabel"),
  focusTitle: $("#focusTitle"),
  focusMeta: $("#focusMeta"),
  timerText: $("#timerText"),
  timerEdit: $("#timerEdit"),
  timerRing: $("#timerRing"),
  bubble: $("#bubble"),
  bubbleText: $("#bubbleText"),
  bubbleRing: $("#bubbleRing"),
  toggleTimer: $("#toggleTimer"),
  completeTask: $("#completeTask"),
  resetTimer: $("#resetTimer"),
  taskSelect: $("#taskSelect"),
  countdownBuilder: $("#countdownBuilder"),
  countdownMinutes: $("#countdownMinutes"),
  addCountdown: $("#addCountdown"),
  segmentQueue: $("#segmentQueue"),
  taskForm: $("#taskForm"),
  taskInput: $("#taskInput"),
  tagSelect: $("#tagSelect"),
  customTagInput: $("#customTagInput"),
  taskList: $("#taskList"),
  completedTodayList: $("#completedTodayList"),
  completedTodayMeta: $("#completedTodayMeta"),
  summaryOpen: $("#summaryOpen"),
  summaryFocus: $("#summaryFocus"),
  summaryDone: $("#summaryDone"),
  taskTotal: $("#taskTotal"),
  historyHeading: $("#historyHeading"),
  historyBack: $("#historyBack"),
  historyList: $("#historyList"),
  exportHistory: $("#exportHistory"),
  reflectionDate: $("#reflectionDate"),
  reflectionTitle: $("#reflectionTitle"),
  reflectionText: $("#reflectionMarkdown"),
  reflectionMoods: $("#reflectionMoods"),
  reflectionSavedAt: $("#reflectionSavedAt"),
  collapseButton: $("#collapseButton"),
  settingsButton: $("#settingsButton"),
  closeSettings: $("#closeSettings"),
  themeSelect: $("#themeSelect"),
  backgroundPreset: $("#backgroundPreset"),
  chooseBackground: $("#chooseBackground"),
  panelOpacity: $("#panelOpacity"),
  showBubbleTimer: $("#showBubbleTimer"),
  autoStart: $("#autoStart"),
  systemNotify: $("#systemNotify"),
  bubbleOpacity: $("#bubbleOpacity"),
  restToast: $("#restToast"),
  restContinue: $("#restContinue"),
  restLater: $("#restLater"),
  resizeZones: [...document.querySelectorAll(".resize-zone")]
};

const state = loadState();
let selectedHistoryDay = "";
let timerId = null;
let currentWindowMode = "bubble";
let windowSwitchTimer = 0;
let bubblePointer = null;
let bubbleMoved = false;
let lastBubbleClick = 0;
let bubbleClickTimer = 0;
let dragFrame = 0;
let pendingDragPoint = null;
let resizeFrame = 0;
let pendingResizePoint = null;

init();

function init() {
  normalizeState();
  bindEvents();
  applySettings();
  applyWindowMode("bubble");
  selectFallbackTask();
  render();
  hydrateDesktop();
  openPanelFromHash();
  window.setTimeout(openPanelFromHash, 0);
  window.addEventListener("hashchange", openPanelFromHash);
}

function bindEvents() {
  els.taskForm.addEventListener("submit", addTask);
  els.tagSelect.addEventListener("change", () => els.customTagInput.classList.toggle("is-hidden", els.tagSelect.value !== "__custom"));
  els.viewTabs.forEach((button) => button.addEventListener("click", () => switchView(button.dataset.view)));
  els.modeButtons.forEach((button) => button.addEventListener("click", () => setTimerMode(button.dataset.mode)));
  els.timerText.addEventListener("click", startTimerEdit);
  els.timerEdit.addEventListener("keydown", onTimerEditKeydown);
  els.timerEdit.addEventListener("blur", commitTimerEdit);
  els.toggleTimer.addEventListener("click", toggleTimer);
  els.completeTask.addEventListener("click", () => {
    const task = getCurrentTask();
    if (task) completeTaskById(task.id);
  });
  els.resetTimer.addEventListener("click", resetTimer);
  els.addCountdown.addEventListener("click", addCountdownSegment);
  els.historyBack.addEventListener("click", () => {
    selectedHistoryDay = "";
    renderHistory();
  });
  els.exportHistory.addEventListener("click", exportHistory);
  els.reflectionTitle.addEventListener("input", saveReflectionFromInputs);
  els.reflectionText.addEventListener("input", saveReflectionFromInputs);
  els.taskSelect.addEventListener("change", () => selectTask(els.taskSelect.value));
  els.collapseButton.addEventListener("click", () => setAppWindowMode("bubble"));
  els.settingsButton.addEventListener("click", () => {
    els.settingsPanel.hidden = false;
  });
  els.closeSettings.addEventListener("click", () => {
    els.settingsPanel.hidden = true;
  });
  els.restContinue.addEventListener("click", () => {
    hideRestToast();
    setAppWindowMode("panel");
  });
  els.restLater.addEventListener("click", hideRestToast);
  [els.themeSelect, els.backgroundPreset, els.showBubbleTimer, els.autoStart, els.systemNotify].forEach((input) => input.addEventListener("change", updateSettings));
  [els.bubbleOpacity, els.panelOpacity].forEach((input) => input.addEventListener("input", updateSettings));
  els.chooseBackground.addEventListener("click", chooseBackgroundImage);
  els.bubble.addEventListener("pointerdown", onBubblePointerDown);
  els.bubble.addEventListener("pointermove", onBubblePointerMove);
  els.bubble.addEventListener("pointerup", onBubblePointerUp);
  els.bubble.addEventListener("pointercancel", onBubblePointerCancel);
  els.resizeZones.forEach((zone) => {
    zone.addEventListener("pointerdown", onResizePointerDown);
    zone.addEventListener("pointermove", onResizePointerMove);
    zone.addEventListener("pointerup", onResizePointerUp);
    zone.addEventListener("pointercancel", onResizePointerUp);
  });
  desktopBridge?.onWindowModePrepare?.(prepareWindowMode);
  desktopBridge?.onWindowModeCommit?.(commitWindowMode);
  if (!desktopBridge?.onWindowModeCommit) desktopBridge?.onWindowMode?.(commitWindowMode);
}

function loadState() {
  const blank = {
    tasks: [makeTask("整理今日重点", 25, "计划"), makeTask("写一段工作记录", 20, "工作")],
    history: [],
    reflections: {},
    timer: { taskId: "", mode: "countdown", seconds: 1500, totalSeconds: 1500, running: false, queue: [] },
    settings: {
      activeView: "today",
      theme: "green",
      tags: DEFAULT_TAGS,
      autoStart: false,
      systemNotify: true,
      bubbleOpacity: 70,
      panelOpacity: 92,
      showBubbleTimer: true,
      backgroundPreset: "dew",
      backgroundMode: "preset",
      backgroundImagePath: "",
      panelBlur: 18,
      bubbleX: null,
      bubbleY: null
    }
  };
  const saved = localStorage.getItem(STORAGE_KEY) || LEGACY_KEYS.map((key) => localStorage.getItem(key)).find(Boolean);
  if (!saved) return clone(blank);
  try {
    return mergeState(blank, JSON.parse(saved));
  } catch {
    return clone(blank);
  }
}

function mergeState(base, saved) {
  const history = Array.isArray(saved.history) ? saved.history.map(migrateHistoryItem) : [];
  const completed = Array.isArray(saved.tasks) ? saved.tasks.filter((task) => task.done).map(migrateHistoryItem) : [];
  return {
    ...clone(base),
    tasks: Array.isArray(saved.tasks) ? saved.tasks.filter((task) => !task.done).map(migrateTask) : base.tasks,
    history: [...history, ...completed].slice(0, 500),
    reflections: migrateReflections(saved.reflections || saved.diary || {}),
    timer: migrateTimer({ ...base.timer, ...(saved.timer || {}) }),
    settings: migrateSettings({ ...base.settings, ...(saved.settings || {}) })
  };
}

function normalizeState() {
  state.tasks = (state.tasks || []).filter((task) => !task.done).map(migrateTask);
  state.history = (state.history || []).map(migrateHistoryItem).slice(0, 500);
  state.reflections = migrateReflections(state.reflections || {});
  state.settings = migrateSettings(state.settings || {});
  if (!["today", "focus", "knowledge", "history"].includes(state.settings.activeView)) state.settings.activeView = "today";
  state.timer = migrateTimer(state.timer || {});
}

async function hydrateDesktop() {
  try {
    const mode = await desktopBridge?.getWindowMode?.();
    if (mode) commitWindowMode(mode);
    const desktopState = await desktopBridge?.loadState?.();
    if (desktopState) {
      Object.assign(state, mergeState(state, desktopState));
      normalizeState();
      selectFallbackTask();
      render();
      openPanelFromHash();
    }
    if (desktopBridge?.getAutoStart) {
      state.settings.autoStart = Boolean(await desktopBridge.getAutoStart());
      renderSettings();
    }
  } catch (error) {
    console.warn("Failed to hydrate desktop state:", error);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  desktopBridge?.saveState?.(clone(state)).catch((error) => console.warn("Failed to save Qingping state:", error));
}

function render() {
  renderTagSelects();
  renderFocus();
  renderTasks();
  renderHistory();
  renderReflection();
  renderView();
  renderSettings();
  renderBubble();
}

function renderFocus() {
  const task = getCurrentTask();
  const running = state.timer.running;
  const modeLabel = state.timer.mode === "countup" ? "正计时" : "倒计时";
  els.modeButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.mode === state.timer.mode));
  els.countdownBuilder.hidden = state.timer.mode !== "countdown";
  els.segmentQueue.hidden = state.timer.mode !== "countdown";
  els.timerText.disabled = running || state.timer.mode !== "countdown";
  els.focusLabel.textContent = task ? (running ? `${modeLabel}中` : modeLabel) : "今日清空";
  els.focusTitle.textContent = task ? task.title : "没有待办";
  els.focusMeta.textContent = task ? `${task.minutes} 分钟 · ${task.tag || "未分类"} · 已投 ${formatFocus(task.actualSeconds)}` : "可以休息一下，或写下今日感想。";
  els.timerText.textContent = formatSeconds(state.timer.seconds);
  els.toggleTimer.textContent = running ? "暂停" : "开始";
  els.toggleTimer.disabled = !task;
  els.completeTask.disabled = !task;
  els.resetTimer.disabled = !task;
  els.timerRing.style.strokeDashoffset = String(TIMER_RING_LENGTH * (1 - clamp(getTimerProgress(), 0, 1)));
  renderSegmentQueue();
}

function renderTasks() {
  const completedToday = getTodayCompletedTasks();
  els.summaryOpen.textContent = String(state.tasks.length);
  els.summaryFocus.textContent = formatFocus([...state.tasks, ...state.history].reduce((sum, task) => sum + (task.actualSeconds || 0), 0));
  els.summaryDone.textContent = String(completedToday.length);
  els.taskTotal.textContent = `${state.tasks.reduce((sum, task) => sum + task.minutes, 0)}m`;
  els.completedTodayMeta.textContent = `${completedToday.length}项`;
  els.taskList.innerHTML = "";
  els.completedTodayList.innerHTML = "";
  els.taskSelect.innerHTML = "";

  if (!state.tasks.length) {
    els.taskList.innerHTML = `<li class="empty-state compact"><strong>今天暂时很清爽</strong><span>添加一个小任务，给专注一个落点。</span></li>`;
    els.taskSelect.innerHTML = `<option value="">暂无任务</option>`;
  } else {
    state.tasks.slice(0, 12).forEach((task) => {
      const option = new Option(task.title, task.id, task.id === state.timer.taskId, task.id === state.timer.taskId);
      els.taskSelect.appendChild(option);
      const item = document.createElement("li");
      item.className = "task-item";
      item.innerHTML = `<div class="task-main"><span class="task-title"></span><span class="task-meta"></span></div><select class="tag-mini"></select><div class="task-actions"><button class="task-icon" data-action="select" type="button" title="设为当前">设</button><button class="task-icon" data-action="done" type="button" title="完成">✓</button><button class="task-icon" data-action="delete" type="button" title="删除">×</button></div>`;
      item.querySelector(".task-title").textContent = task.title;
      item.querySelector(".task-meta").textContent = `${task.minutes}m · 已投 ${formatFocus(task.actualSeconds)}`;
      fillTagOptions(item.querySelector(".tag-mini"), task.tag);
      item.querySelector(".tag-mini").addEventListener("change", (event) => updateTaskTag(task.id, event.target.value));
      item.querySelector('[data-action="select"]').addEventListener("click", () => selectTask(task.id));
      item.querySelector('[data-action="done"]').addEventListener("click", () => completeTaskById(task.id));
      item.querySelector('[data-action="delete"]').addEventListener("click", () => deleteTask(task.id));
      els.taskList.appendChild(item);
    });
  }

  if (!completedToday.length) {
    els.completedTodayList.innerHTML = `<li class="empty-state mini"><strong>还没有落款</strong><span>完成的事会在这里安静留下。</span></li>`;
    return;
  }
  completedToday.slice(0, 8).forEach((task) => {
    const item = document.createElement("li");
    item.className = "history-item completed-item";
    item.innerHTML = `<div class="history-main"><span class="history-title"></span><span class="history-meta"></span><span class="session-line"></span></div>`;
    item.querySelector(".history-title").textContent = task.title;
    item.querySelector(".history-meta").textContent = `${task.tag || "未分类"} · ${formatDateTime(task.completedAt)} · ${formatFocus(task.actualSeconds)}`;
    item.querySelector(".session-line").textContent = formatSessions(task.sessions);
    els.completedTodayList.appendChild(item);
  });
}

function renderHistory() {
  els.historyList.innerHTML = "";
  els.historyBack.hidden = !selectedHistoryDay;
  els.historyHeading.textContent = selectedHistoryDay ? formatDayTitle(selectedHistoryDay) : "按天回顾";
  const hasReflections = Object.values(state.reflections).some((item) => item.title || item.content || item.mood);
  if (!state.history.length && !hasReflections) {
    els.historyList.innerHTML = `<li class="empty-state"><strong>还没有完成记录</strong><span>完成任务后，青萍会按日期保存投入时长、完成时间与当天感想。</span></li>`;
    return;
  }

  if (selectedHistoryDay) {
    const reflection = state.reflections[selectedHistoryDay] ? migrateReflection(state.reflections[selectedHistoryDay], selectedHistoryDay) : null;
    if (reflection?.title || reflection?.content || reflection?.mood) {
      const diary = document.createElement("li");
      diary.className = "history-item detail reflection-history";
      diary.innerHTML = `<div class="history-main"><span class="history-title"></span><span class="history-meta"></span><span class="session-line"></span></div>`;
      diary.querySelector(".history-title").textContent = reflection.title || "未命名感想";
      diary.querySelector(".history-meta").textContent = `今日感想 · ${getMoodLabel(reflection.mood)} · ${reflection.updatedAt ? formatDateTime(reflection.updatedAt) : "未记录时间"}`;
      diary.querySelector(".session-line").textContent = reflection.content.replace(/\s+/g, " ").slice(0, 88) || "只留下一阵安静的风。";
      els.historyList.appendChild(diary);
    }
    state.history.filter((item) => getLocalDayKey(item.completedAt) === selectedHistoryDay).forEach((task) => {
      const item = document.createElement("li");
      item.className = "history-item detail";
      item.innerHTML = `<div class="history-main"><span class="history-title"></span><span class="history-meta"></span><span class="session-line"></span></div>`;
      item.querySelector(".history-title").textContent = task.title;
      item.querySelector(".history-meta").textContent = `${task.tag || "未分类"} · ${formatFocus(task.actualSeconds)} · ${formatDateTime(task.completedAt)}`;
      item.querySelector(".session-line").textContent = formatSessions(task.sessions);
      els.historyList.appendChild(item);
    });
    return;
  }

  groupHistoryByDay().forEach((day) => {
    const item = document.createElement("li");
    item.className = "history-day";
    item.innerHTML = `<button type="button"><span><strong>${formatDayTitle(day.key)}</strong><small>${day.count} 项完成 · ${formatFocus(day.seconds)}${day.hasReflection ? " · 有感想" : ""}</small></span><b>进入</b></button>`;
    item.querySelector("button").addEventListener("click", () => {
      selectedHistoryDay = day.key;
      renderHistory();
    });
    els.historyList.appendChild(item);
  });
}

function renderReflection() {
  const reflection = getReflection(todayKey());
  els.reflectionDate.textContent = formatDayTitle(todayKey());
  if (document.activeElement !== els.reflectionTitle) els.reflectionTitle.value = reflection.title;
  if (document.activeElement !== els.reflectionText) els.reflectionText.value = reflection.content;
  els.reflectionSavedAt.textContent = reflection.updatedAt ? `已保存 ${formatDateTime(reflection.updatedAt)}` : "今日还未记录";
  renderMoodButtons(reflection.mood);
}

function renderMoodButtons(activeMood) {
  els.reflectionMoods.innerHTML = "";
  MOODS.forEach((mood) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "mood-button";
    button.classList.toggle("is-active", mood.value === activeMood);
    button.title = mood.label;
    button.setAttribute("aria-pressed", mood.value === activeMood ? "true" : "false");
    button.innerHTML = `<span class="mood-mark">${mood.mark}</span><b>${mood.label}</b>`;
    button.addEventListener("click", () => setReflectionMood(mood.value));
    els.reflectionMoods.appendChild(button);
  });
}

function renderView() {
  els.viewTabs.forEach((button) => button.classList.toggle("is-active", button.dataset.view === state.settings.activeView));
  els.views.forEach((view) => view.classList.toggle("is-active", view.id === `${state.settings.activeView}View`));
}

function renderSettings() {
  els.themeSelect.value = state.settings.theme;
  els.backgroundPreset.value = state.settings.backgroundMode === "image" ? "image" : state.settings.backgroundPreset;
  els.panelOpacity.value = state.settings.panelOpacity;
  els.showBubbleTimer.checked = Boolean(state.settings.showBubbleTimer);
  els.autoStart.checked = Boolean(state.settings.autoStart);
  els.systemNotify.checked = Boolean(state.settings.systemNotify);
  els.bubbleOpacity.value = state.settings.bubbleOpacity;
}

function renderBubble() {
  const task = getCurrentTask();
  const showTime = state.timer.running && state.settings.showBubbleTimer;
  els.bubble.classList.toggle("is-open", currentWindowMode === "panel");
  els.bubble.classList.toggle("is-alert", state.timer.running && state.timer.mode === "countdown" && state.timer.seconds <= 60);
  els.bubble.classList.toggle("is-timing", showTime);
  els.bubbleText.textContent = showTime ? formatBubbleTime(state.timer.seconds) : "";
  els.bubbleRing.style.strokeDashoffset = String(BUBBLE_RING_LENGTH * (1 - clamp(getTimerProgress(), 0, 1)));
  els.bubble.setAttribute("aria-label", task ? `${task.title} ${formatSeconds(state.timer.seconds)}` : "展开青萍");
}

function renderTagSelects() {
  fillTagOptions(els.tagSelect, els.tagSelect.value || state.settings.tags[0] || "计划", true);
  els.customTagInput.classList.toggle("is-hidden", els.tagSelect.value !== "__custom");
}

function renderSegmentQueue() {
  els.segmentQueue.innerHTML = "";
  if (state.timer.mode !== "countdown" || !state.timer.queue.length) {
    els.segmentQueue.hidden = true;
    return;
  }
  els.segmentQueue.hidden = false;
  state.timer.queue.forEach((seconds, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "segment-chip";
    button.textContent = `后续 ${formatFocus(seconds)}`;
    button.addEventListener("click", () => {
      state.timer.queue.splice(index, 1);
      saveState();
      renderSegmentQueue();
    });
    els.segmentQueue.appendChild(button);
  });
}

function applyWindowMode(mode, switching = false) {
  currentWindowMode = mode === "panel" ? "panel" : "bubble";
  document.body.classList.toggle("is-switching", switching);
  document.body.classList.toggle("is-panel", currentWindowMode === "panel");
  document.body.classList.toggle("is-bubble", currentWindowMode === "bubble");
  els.panel.classList.toggle("is-open", currentWindowMode === "panel");
  els.bubble.classList.toggle("is-open", currentWindowMode === "panel");
  if (currentWindowMode === "bubble") els.settingsPanel.hidden = true;
  renderBubble();
}

function prepareWindowMode(mode) {
  window.clearTimeout(windowSwitchTimer);
  applyWindowMode(mode, true);
  windowSwitchTimer = window.setTimeout(() => commitWindowMode(mode), 260);
}

function commitWindowMode(mode) {
  applyWindowMode(mode, true);
  window.clearTimeout(windowSwitchTimer);
  window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
    document.body.classList.remove("is-switching");
    renderBubble();
  }));
}

async function setAppWindowMode(mode) {
  prepareWindowMode(mode);
  await desktopBridge?.setWindowMode?.(mode);
  if (!desktopBridge?.setWindowMode) commitWindowMode(mode);
}

function switchView(view) {
  state.settings.activeView = view;
  saveState();
  renderView();
}

function openPanelFromHash() {
  const view = location.hash.replace("#", "") || new URLSearchParams(location.search).get("view");
  if (["today", "focus", "knowledge", "history"].includes(view)) {
    state.settings.activeView = view;
    setAppWindowMode("panel");
    renderView();
  }
}

function addTask(event) {
  event.preventDefault();
  const raw = els.taskInput.value.trim();
  if (!raw) return;
  const match = raw.match(/^(.*?)(?:\s+(\d{1,3})m)?$/i);
  const title = (match?.[1] || raw).trim();
  const minutes = clamp(Number(match?.[2] || 25), 1, 240);
  const task = makeTask(title || "未命名任务", minutes, getSelectedTag());
  state.tasks.push(task);
  if (!state.timer.taskId) selectTask(task.id);
  els.taskInput.value = "";
  els.customTagInput.value = "";
  selectFallbackTask();
  saveState();
  render();
}

function getSelectedTag() {
  if (els.tagSelect.value !== "__custom") return els.tagSelect.value || "计划";
  const tag = els.customTagInput.value.trim() || "自定义";
  addKnownTag(tag);
  return tag;
}

function selectFallbackTask() {
  if (state.tasks.some((task) => task.id === state.timer.taskId)) return;
  state.timer.taskId = state.tasks[0]?.id || "";
  const task = getCurrentTask();
  if (task) {
    state.timer.totalSeconds = Math.max(1, task.minutes * 60);
    state.timer.seconds = state.timer.mode === "countup" ? 0 : state.timer.totalSeconds;
  }
}

function selectTask(taskId) {
  state.timer.taskId = taskId;
  const task = getCurrentTask();
  stopTimer();
  state.timer.running = false;
  if (task) {
    state.timer.totalSeconds = Math.max(1, task.minutes * 60);
    state.timer.seconds = state.timer.mode === "countup" ? 0 : state.timer.totalSeconds;
  }
  saveState();
  render();
}

function setTimerMode(mode) {
  if (!["countdown", "countup"].includes(mode)) return;
  const task = getCurrentTask();
  stopTimer();
  state.timer.mode = mode;
  state.timer.running = false;
  state.timer.totalSeconds = task ? Math.max(1, task.minutes * 60) : 1500;
  state.timer.seconds = mode === "countup" ? 0 : state.timer.totalSeconds;
  saveState();
  render();
}

function toggleTimer() {
  selectFallbackTask();
  if (!getCurrentTask()) {
    showNotice("先添加或选择一个任务，再开始计时。");
    return;
  }
  state.timer.running ? pauseTimer() : startTimer();
}

function startTimer() {
  const task = getCurrentTask();
  if (!task || state.timer.running) return;
  if (timerId) window.clearInterval(timerId);
  if (state.timer.mode === "countdown" && state.timer.seconds <= 0) {
    state.timer.seconds = state.timer.totalSeconds || task.minutes * 60;
  }
  state.timer.running = true;
  timerId = window.setInterval(tickTimer, 1000);
  saveState();
  render();
}

function pauseTimer() {
  stopTimer();
  state.timer.running = false;
  saveState();
  render();
}

function stopTimer() {
  if (timerId) window.clearInterval(timerId);
  timerId = null;
}

function tickTimer() {
  const task = getCurrentTask();
  if (!task) {
    pauseTimer();
    return;
  }
  task.actualSeconds = (task.actualSeconds || 0) + 1;
  if (state.timer.mode === "countup") {
    state.timer.seconds += 1;
  } else {
    state.timer.seconds -= 1;
    if (state.timer.seconds <= 0) {
      recordTaskSession(task, state.timer.totalSeconds);
      const next = state.timer.queue.shift();
      if (next) {
        state.timer.totalSeconds = next;
        state.timer.seconds = next;
      } else {
        state.timer.seconds = 0;
        state.timer.running = false;
        stopTimer();
        showRestToast();
        maybeNotify(`${task.title} 的一段倒计时已完成`);
      }
    }
  }
  saveState();
  render();
}

function resetTimer() {
  const task = getCurrentTask();
  if (!task) return;
  stopTimer();
  state.timer.running = false;
  state.timer.totalSeconds = Math.max(1, task.minutes * 60);
  state.timer.seconds = state.timer.mode === "countup" ? 0 : state.timer.totalSeconds;
  state.timer.queue = [];
  saveState();
  render();
}

function startTimerEdit() {
  if (state.timer.running || state.timer.mode !== "countdown") return;
  els.timerEdit.hidden = false;
  els.timerText.hidden = true;
  els.timerEdit.value = formatSeconds(state.timer.seconds);
  els.timerEdit.focus();
  els.timerEdit.select();
}

function onTimerEditKeydown(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    commitTimerEdit();
  }
  if (event.key === "Escape") {
    event.preventDefault();
    cancelTimerEdit();
  }
}

function commitTimerEdit() {
  if (els.timerEdit.hidden) return;
  const seconds = parseTimeInput(els.timerEdit.value);
  if (seconds > 0) {
    state.timer.mode = "countdown";
    state.timer.seconds = seconds;
    state.timer.totalSeconds = seconds;
    els.countdownMinutes.value = String(Math.max(1, Math.round(seconds / 60)));
    saveState();
  } else {
    showNotice("时间格式可用 25、25:00 或 1:30:00。");
  }
  cancelTimerEdit();
  render();
}

function cancelTimerEdit() {
  els.timerEdit.hidden = true;
  els.timerText.hidden = false;
}

function addCountdownSegment() {
  const task = getCurrentTask();
  if (!task) {
    showNotice("先选择一个任务，再添加倒计时。");
    return;
  }
  state.timer.mode = "countdown";
  state.timer.queue.push(clamp(Number(els.countdownMinutes.value || task.minutes), 1, 240) * 60);
  saveState();
  render();
}

function completeTaskById(taskId, message = "任务已完成，已记录在今日完成与历史中。") {
  const index = state.tasks.findIndex((task) => task.id === taskId);
  if (index < 0) return;
  const [task] = state.tasks.splice(index, 1);
  if (task.id === state.timer.taskId && state.timer.running && state.timer.mode === "countup" && state.timer.seconds > 0) {
    recordTaskSession(task, state.timer.seconds);
  }
  stopTimer();
  state.timer.running = false;
  task.actualSeconds = Math.max(task.actualSeconds || 0, totalSessionSeconds(task.sessions));
  state.history.unshift({ ...task, completedAt: new Date().toISOString() });
  state.history = state.history.slice(0, 500);
  selectFallbackTask();
  saveState();
  showNotice(message);
  render();
}

function deleteTask(taskId) {
  state.tasks = state.tasks.filter((task) => task.id !== taskId);
  if (state.timer.taskId === taskId) {
    stopTimer();
    state.timer.running = false;
    selectFallbackTask();
  }
  saveState();
  render();
}

function updateTaskTag(taskId, value) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;
  if (value === "__custom") {
    const tag = window.prompt("输入新的标签", task.tag || "");
    if (!tag) {
      renderTasks();
      return;
    }
    task.tag = tag.trim();
    addKnownTag(task.tag);
  } else {
    task.tag = value;
  }
  saveState();
  render();
}

function recordTaskSession(task, seconds) {
  if (!seconds || seconds <= 0) return;
  task.sessions = Array.isArray(task.sessions) ? task.sessions : [];
  task.sessions.push({ seconds: Math.round(seconds), mode: state.timer.mode, endedAt: new Date().toISOString() });
}

function getReflection(key = todayKey()) {
  state.reflections[key] = migrateReflection(state.reflections[key], key);
  return state.reflections[key];
}

function setReflectionMood(mood) {
  const reflection = getReflection(todayKey());
  reflection.mood = reflection.mood === mood ? "" : mood;
  reflection.updatedAt = new Date().toISOString();
  saveState();
  renderReflection();
  renderHistory();
}

function saveReflectionFromInputs() {
  const reflection = getReflection(todayKey());
  reflection.title = els.reflectionTitle.value.trim();
  reflection.content = els.reflectionText.value;
  reflection.updatedAt = new Date().toISOString();
  saveState();
  els.reflectionSavedAt.textContent = `已保存 ${formatDateTime(reflection.updatedAt)}`;
}

function exportHistory() {
  const used = new Set();
  const rows = [["日期", "任务", "标签", "计划分钟", "实际分钟", "完成时间", "专注段", "今日心情", "感想标题", "感想内容", "感想更新时间"]];
  state.history.forEach((item) => {
    const day = getLocalDayKey(item.completedAt);
    const reflection = state.reflections[day] ? migrateReflection(state.reflections[day], day) : null;
    if (reflection?.title || reflection?.content || reflection?.mood) used.add(day);
    rows.push([
      day,
      item.title,
      item.tag || "",
      item.minutes,
      Math.round((item.actualSeconds || 0) / 60),
      item.completedAt || "",
      formatSessions(item.sessions),
      getMoodLabel(reflection?.mood),
      reflection?.title || "",
      reflection?.content || "",
      reflection?.updatedAt || ""
    ]);
  });
  Object.entries(state.reflections).sort(([a], [b]) => b.localeCompare(a)).forEach(([day, raw]) => {
    const reflection = migrateReflection(raw, day);
    if (!used.has(day) && (reflection.title || reflection.content || reflection.mood)) {
      rows.push([day, "仅感想", "", "", "", reflection.updatedAt || "", "", getMoodLabel(reflection.mood), reflection.title, reflection.content, reflection.updatedAt || ""]);
    }
  });
  const blob = new Blob([`\ufeff${rows.map((row) => row.map(csvCell).join(",")).join("\n")}`], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `青萍历史任务-${todayKey()}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

async function chooseBackgroundImage() {
  if (!desktopBridge?.chooseBackgroundImage) {
    showNotice("桌面版支持选择本地背景图片。");
    return;
  }
  const filePath = await desktopBridge.chooseBackgroundImage();
  if (!filePath) return;
  state.settings.backgroundMode = "image";
  state.settings.backgroundPreset = "image";
  state.settings.backgroundImagePath = filePath;
  applySettings();
  renderSettings();
  saveState();
}

function updateSettings() {
  state.settings.theme = els.themeSelect.value;
  state.settings.backgroundPreset = els.backgroundPreset.value === "image" ? state.settings.backgroundPreset : els.backgroundPreset.value;
  state.settings.backgroundMode = els.backgroundPreset.value === "image" ? (state.settings.backgroundImagePath ? "image" : "preset") : "preset";
  state.settings.showBubbleTimer = els.showBubbleTimer.checked;
  state.settings.autoStart = els.autoStart.checked;
  state.settings.systemNotify = els.systemNotify.checked;
  state.settings.bubbleOpacity = Number(els.bubbleOpacity.value);
  state.settings.panelOpacity = Number(els.panelOpacity.value);
  applySettings();
  saveState();
  renderBubble();
  desktopBridge?.setAutoStart?.(state.settings.autoStart).catch(() => {});
}

function applySettings() {
  const theme = THEMES[state.settings.theme] || THEMES.green;
  const alpha = clamp(state.settings.bubbleOpacity, 45, 95) / 100;
  const panelAlpha = clamp(state.settings.panelOpacity, 68, 98) / 100;
  document.documentElement.style.setProperty("--green", theme.green);
  document.documentElement.style.setProperty("--green-dark", theme.greenDark);
  document.documentElement.style.setProperty("--green-soft", theme.greenSoft);
  document.documentElement.style.setProperty("--panel", theme.panel);
  document.documentElement.style.setProperty("--theme-wash", theme.wash);
  document.documentElement.style.setProperty("--accent", theme.accent);
  document.documentElement.style.setProperty("--bubble-alpha", String(alpha));
  document.documentElement.style.setProperty("--bubble-hover-alpha", String(clamp(alpha + 0.08, 0.45, 0.98)));
  document.documentElement.style.setProperty("--bubble-border-alpha", String(clamp(alpha * 0.9, 0.32, 0.86)));
  document.documentElement.style.setProperty("--bubble-shadow-alpha", String(clamp(alpha * 0.24, 0.08, 0.24)));
  document.documentElement.style.setProperty("--panel-alpha", String(panelAlpha));
  document.documentElement.style.setProperty("--panel-card-alpha", String(clamp(panelAlpha - 0.12, 0.5, 0.92)));
  document.documentElement.style.setProperty("--panel-border-alpha", String(clamp(panelAlpha, 0.55, 0.95)));
  document.documentElement.style.setProperty("--panel-shadow-alpha", String(clamp((1 - panelAlpha) * 0.42, 0.02, 0.14)));
  document.body.dataset.theme = state.settings.theme;
  const imagePath = state.settings.backgroundMode === "image" && state.settings.backgroundImagePath ? cssUrl(state.settings.backgroundImagePath) : "";
  document.documentElement.style.setProperty("--custom-bg-image", imagePath ? `url("${imagePath}")` : "none");
  document.documentElement.style.setProperty("--panel-bg", imagePath ? `linear-gradient(rgba(255,255,255,${panelAlpha * 0.78}), rgba(255,255,255,${panelAlpha * 0.84})), url("${imagePath}") center/cover` : BACKGROUNDS[state.settings.backgroundPreset] || BACKGROUNDS.dew);
}

function maybeNotify(body) {
  if (!state.settings.systemNotify) return;
  if (desktopBridge?.notify) desktopBridge.notify({ title: "青萍", body });
  else if ("Notification" in window && Notification.permission === "granted") new Notification("青萍", { body });
}

function showNotice(message) {
  els.notice.textContent = message;
  els.notice.hidden = false;
  window.clearTimeout(showNotice.timer);
  showNotice.timer = window.setTimeout(() => {
    els.notice.hidden = true;
  }, 3200);
}

function showRestToast() {
  els.restToast.hidden = false;
  els.restToast.classList.remove("is-leaving");
  window.clearTimeout(showRestToast.timer);
  showRestToast.timer = window.setTimeout(hideRestToast, 6500);
}

function hideRestToast() {
  els.restToast.classList.add("is-leaving");
  window.clearTimeout(showRestToast.timer);
  window.setTimeout(() => {
    els.restToast.hidden = true;
    els.restToast.classList.remove("is-leaving");
  }, 220);
}

function onBubblePointerDown(event) {
  bubblePointer = { id: event.pointerId, startX: event.clientX, startY: event.clientY };
  bubbleMoved = false;
  els.bubble.setPointerCapture(event.pointerId);
  els.bubble.classList.add("is-dragging");
  desktopBridge?.beginWindowDrag?.(event.screenX, event.screenY);
}

function onBubblePointerMove(event) {
  if (!bubblePointer || event.pointerId !== bubblePointer.id) return;
  const dx = event.clientX - bubblePointer.startX;
  const dy = event.clientY - bubblePointer.startY;
  if (Math.abs(dx) + Math.abs(dy) > 4) bubbleMoved = true;
  if (!desktopBridge?.dragWindowTo) return;
  pendingDragPoint = { x: event.screenX, y: event.screenY };
  if (!dragFrame) {
    dragFrame = window.requestAnimationFrame(() => {
      dragFrame = 0;
      if (pendingDragPoint) desktopBridge.dragWindowTo(pendingDragPoint.x, pendingDragPoint.y);
    });
  }
}

function onBubblePointerUp(event) {
  if (!bubblePointer || event.pointerId !== bubblePointer.id) return;
  if (els.bubble.hasPointerCapture(event.pointerId)) els.bubble.releasePointerCapture(event.pointerId);
  finishBubbleDrag();
  if (!bubbleMoved) {
    const now = Date.now();
    if (now - lastBubbleClick < 320) {
      window.clearTimeout(bubbleClickTimer);
      toggleTimer();
    } else {
      bubbleClickTimer = window.setTimeout(togglePanel, 320);
    }
    lastBubbleClick = now;
  }
  bubblePointer = null;
}

function onBubblePointerCancel(event) {
  if (bubblePointer && els.bubble.hasPointerCapture(event.pointerId)) els.bubble.releasePointerCapture(event.pointerId);
  finishBubbleDrag();
  bubblePointer = null;
}

function finishBubbleDrag() {
  els.bubble.classList.remove("is-dragging");
  if (dragFrame) window.cancelAnimationFrame(dragFrame);
  dragFrame = 0;
  if (pendingDragPoint && desktopBridge?.dragWindowTo) desktopBridge.dragWindowTo(pendingDragPoint.x, pendingDragPoint.y);
  pendingDragPoint = null;
  desktopBridge?.endWindowDrag?.();
}

function onResizePointerDown(event) {
  event.currentTarget.setPointerCapture(event.pointerId);
  desktopBridge?.beginWindowResize?.(event.currentTarget.dataset.edge, event.screenX, event.screenY);
}

function onResizePointerMove(event) {
  if (!event.currentTarget.hasPointerCapture(event.pointerId) || !desktopBridge?.resizeWindowTo) return;
  pendingResizePoint = { x: event.screenX, y: event.screenY };
  if (!resizeFrame) {
    resizeFrame = window.requestAnimationFrame(() => {
      resizeFrame = 0;
      if (pendingResizePoint) desktopBridge.resizeWindowTo(pendingResizePoint.x, pendingResizePoint.y);
    });
  }
}

function onResizePointerUp(event) {
  if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
  resizeFrame = 0;
  if (pendingResizePoint && desktopBridge?.resizeWindowTo) desktopBridge.resizeWindowTo(pendingResizePoint.x, pendingResizePoint.y);
  pendingResizePoint = null;
  desktopBridge?.endWindowResize?.();
}

function togglePanel() {
  setAppWindowMode(currentWindowMode === "panel" ? "bubble" : "panel");
}

function getCurrentTask() {
  return state.tasks.find((task) => task.id === state.timer.taskId) || null;
}

function getTimerProgress() {
  if (state.timer.mode === "countup") {
    return state.timer.totalSeconds > 0 ? state.timer.seconds / state.timer.totalSeconds : 0;
  }
  return state.timer.totalSeconds > 0 ? 1 - state.timer.seconds / state.timer.totalSeconds : 0;
}

function getTodayCompletedTasks() {
  const key = todayKey();
  return state.history.filter((task) => getLocalDayKey(task.completedAt) === key);
}

function getMoodLabel(value) {
  if (!value) return "";
  return MOODS.find((mood) => mood.value === value)?.label || "";
}

function makeTask(title, minutes = 25, tag = "") {
  return { id: makeId(), title, minutes, tag, actualSeconds: 0, sessions: [], createdAt: new Date().toISOString() };
}

function migrateTask(task = {}) {
  return {
    id: task.id || makeId(),
    title: task.title || "未命名任务",
    minutes: clamp(Number(task.minutes || task.duration || 25), 1, 240),
    tag: task.tag || "",
    actualSeconds: Number(task.actualSeconds || 0),
    sessions: Array.isArray(task.sessions) ? task.sessions.map(migrateSession) : [],
    createdAt: task.createdAt || new Date().toISOString()
  };
}

function migrateHistoryItem(task = {}) {
  return { ...migrateTask(task), completedAt: task.completedAt || new Date().toISOString() };
}

function migrateSession(session = {}) {
  return {
    seconds: Math.max(0, Number(session.seconds || 0)),
    mode: ["countdown", "countup"].includes(session.mode) ? session.mode : "countdown",
    endedAt: session.endedAt || new Date().toISOString()
  };
}

function migrateTimer(timer = {}) {
  const mode = ["countdown", "countup"].includes(timer.mode) ? timer.mode : "countdown";
  return {
    taskId: timer.taskId || "",
    mode,
    seconds: Math.max(0, Number(timer.seconds || (mode === "countup" ? 0 : 1500))),
    totalSeconds: Math.max(1, Number(timer.totalSeconds || 1500)),
    running: false,
    queue: Array.isArray(timer.queue) ? timer.queue.map((value) => Math.max(60, Number(value || 0))).filter(Boolean) : []
  };
}

function migrateReflections(reflections) {
  return Object.entries(reflections || {}).reduce((result, [key, value]) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(key)) result[key] = migrateReflection(value, key);
    return result;
  }, {});
}

function migrateReflection(value, key = todayKey()) {
  if (typeof value === "string") return { title: `${key} 感想`, content: value, mood: "", updatedAt: "" };
  const content = String(value?.content || value?.markdown || value?.body || "");
  const mood = MOODS.some((item) => item.value === value?.mood) ? value.mood : "";
  return { title: String(value?.title || ""), content, mood, updatedAt: value?.updatedAt || "" };
}

function migrateSettings(settings = {}) {
  const theme = settings.theme === "lotus" ? "violet" : settings.theme;
  const hasImage = Boolean(settings.backgroundImagePath);
  const wantsImage = settings.backgroundMode === "image" || settings.backgroundPreset === "image";
  const savedPreset = BACKGROUNDS[settings.backgroundPreset] ? settings.backgroundPreset : "dew";
  return {
    ...settings,
    theme: THEMES[theme] ? theme : "green",
    tags: Array.from(new Set([...(Array.isArray(settings.tags) ? settings.tags : []), ...DEFAULT_TAGS].filter(Boolean))),
    showBubbleTimer: settings.showBubbleTimer !== false,
    bubbleOpacity: clamp(Number(settings.bubbleOpacity || 70), 45, 95),
    panelOpacity: clamp(Number(settings.panelOpacity || 92), 68, 98),
    backgroundMode: wantsImage && hasImage ? "image" : "preset",
    backgroundPreset: wantsImage && hasImage ? "image" : savedPreset,
    backgroundImagePath: settings.backgroundImagePath || "",
    panelBlur: clamp(Number(settings.panelBlur || 18), 8, 30)
  };
}

function groupHistoryByDay() {
  const map = new Map();
  state.history.forEach((item) => {
    const key = getLocalDayKey(item.completedAt);
    const current = map.get(key) || { key, count: 0, seconds: 0 };
    current.count += 1;
    current.seconds += item.actualSeconds || 0;
    map.set(key, current);
  });
  Object.entries(state.reflections || {}).forEach(([key, raw]) => {
    const reflection = migrateReflection(raw, key);
    if (!reflection.title && !reflection.content && !reflection.mood) return;
    const current = map.get(key) || { key, count: 0, seconds: 0 };
    current.hasReflection = true;
    map.set(key, current);
  });
  return Array.from(map.values()).sort((a, b) => b.key.localeCompare(a.key));
}

function addKnownTag(tag) {
  const clean = String(tag || "").trim();
  if (!clean || state.settings.tags.includes(clean)) return;
  state.settings.tags.unshift(clean);
  state.settings.tags = state.settings.tags.slice(0, 12);
}

function fillTagOptions(select, selected = "", includeCustom = false) {
  select.innerHTML = "";
  state.settings.tags.forEach((tag) => select.appendChild(new Option(tag, tag, tag === selected, tag === selected)));
  if (includeCustom || selected === "__custom") select.appendChild(new Option("自定义", "__custom", selected === "__custom", selected === "__custom"));
}

function parseTimeInput(value) {
  const text = String(value || "").trim();
  if (!text) return 0;
  if (/^\d+$/.test(text)) return clamp(Number(text), 1, 240) * 60;
  const parts = text.split(":").map(Number);
  if (parts.some((part) => !Number.isFinite(part) || part < 0)) return 0;
  if (parts.length === 2) return clamp(parts[0] * 60 + parts[1], 1, 86400);
  if (parts.length === 3) return clamp(parts[0] * 3600 + parts[1] * 60 + parts[2], 1, 86400);
  return 0;
}

function formatSeconds(total) {
  const seconds = Math.max(0, Math.floor(total));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function formatBubbleTime(total) {
  const seconds = Math.max(0, Math.floor(total));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, "0")}` : `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function formatFocus(seconds) {
  const minutes = Math.round((seconds || 0) / 60);
  return minutes >= 60 ? `${Math.floor(minutes / 60)}h${minutes % 60 ? `${minutes % 60}m` : ""}` : `${minutes}m`;
}

function formatSessions(sessions = []) {
  return sessions.length ? sessions.map((session) => `${session.mode === "countup" ? "正" : "倒"} ${formatFocus(session.seconds)}`).join(" / ") : "暂无分段记录";
}

function totalSessionSeconds(sessions = []) {
  return sessions.reduce((sum, session) => sum + (session.seconds || 0), 0);
}

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function formatDayTitle(key) {
  const [year, month, day] = key.split("-");
  return key === todayKey() ? "今天" : `${year}.${month}.${day}`;
}

function getLocalDayKey(value) {
  const date = value ? new Date(value) : new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function todayKey() {
  return getLocalDayKey(new Date().toISOString());
}

function csvCell(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function cssUrl(value) {
  return String(value).replace(/\\/g, "/").replace(/"/g, '\\"');
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function makeId() {
  return globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `qp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function clone(value) {
  return typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}
