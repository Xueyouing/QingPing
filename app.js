const STORAGE_KEY = "qingping-state-v8";
const LEGACY_KEYS = [
  "qingping-state-v7",
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
  dew: {
    wash: "linear-gradient(145deg, rgba(255,255,255,var(--panel-bg-strong)), rgba(238,248,241,var(--panel-bg-soft)))"
  },
  violet: {
    wash: "radial-gradient(circle at 18% 8%, rgba(185,154,242,var(--panel-wash-alpha)), transparent 34%), linear-gradient(145deg, rgba(255,255,255,var(--panel-bg-strong)), rgba(244,239,252,var(--panel-bg-soft)))"
  },
  mist: {
    wash: "radial-gradient(circle at 80% 10%, rgba(121,199,216,var(--panel-wash-alpha)), transparent 36%), linear-gradient(145deg, rgba(255,255,255,var(--panel-bg-strong)), rgba(237,248,251,var(--panel-bg-soft)))"
  },
  bamboo: {
    wash: "radial-gradient(circle at 12% 85%, rgba(76,175,80,var(--panel-wash-alpha)), transparent 34%), linear-gradient(145deg, rgba(255,255,255,var(--panel-bg-strong)), rgba(235,247,235,var(--panel-bg-soft)))"
  }
};
const MOOD_LABELS = ["低落", "有点累", "平稳", "清亮", "很好"];
const MOOD_MAP = { sad: 1, angry: 2, tired: 2, calm: 3, surprised: 4, happy: 5, done: 5, cheer: 5 };
const REVIEW_CHART_MODES = ["ring", "ripple"];
const REVIEW_COLORS = ["#42a65a", "#8e7ad8", "#3a9ab2", "#ffb74d", "#5ebd88", "#b99af2"];
const DEFAULT_FOCUS_MINUTES = 45;
const DEFAULT_FOCUS_SECONDS = DEFAULT_FOCUS_MINUTES * 60;
const REST_SOUND_PRESETS = ["chime", "dew", "wind", "none"];
const BUBBLE_OPACITY_RANGE = { min: 25, max: 95 };
const PANEL_OPACITY_RANGE = { min: 35, max: 98 };
const BUBBLE_SIZE_RANGE = { min: 68, max: 116 };
const BUBBLE_IMAGE_MODES = ["watercolor", "line", "image"];
const PLAN_STATUS = {
  active: "推进中",
  next: "下一步",
  blocked: "受阻",
  done: "完成"
};

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
  planListScreen: $("#planListScreen"),
  planCreateForm: $("#planCreateForm"),
  newPlanButton: $("#newPlanButton"),
  cancelPlanCreate: $("#cancelPlanCreate"),
  backPlanList: $("#backPlanList"),
  deletePlan: $("#deletePlan"),
  planTitle: $("#planTitle"),
  planDetail: $("#planDetail"),
  planDetailTitle: $("#planDetailTitle"),
  planDetailStatus: $("#planDetailStatus"),
  planProgressText: $("#planProgressText"),
  planCoreMeta: $("#planCoreMeta"),
  planStartDate: $("#planStartDate"),
  planDueDate: $("#planDueDate"),
  planUpdatedAt: $("#planUpdatedAt"),
  planList: $("#planList"),
  milestoneForm: $("#milestoneForm"),
  milestoneInput: $("#milestoneInput"),
  milestoneList: $("#milestoneList"),
  exportHistory: $("#exportHistory"),
  reviewTotal: $("#reviewTotal"),
  reviewChartShell: $("#reviewChartShell"),
  reviewRing: $("#reviewRing"),
  reviewRingTotal: $("#reviewRingTotal"),
  reviewRipple: $("#reviewRipple"),
  reviewTopTask: $("#reviewTopTask"),
  reviewSessionCount: $("#reviewSessionCount"),
  reviewBalance: $("#reviewBalance"),
  reviewLegend: $("#reviewLegend"),
  reviewInsight: $("#reviewInsight"),
  reviewChartButtons: [...document.querySelectorAll("[data-review-chart]")],
  reviewExpand: $("#reviewExpand"),
  reviewOverlay: $("#reviewOverlay"),
  reviewOverlayClose: $("#reviewOverlayClose"),
  reviewExpandedTotal: $("#reviewExpandedTotal"),
  reviewExpandedShell: $("#reviewExpandedShell"),
  reviewExpandedRing: $("#reviewExpandedRing"),
  reviewExpandedRingTotal: $("#reviewExpandedRingTotal"),
  reviewExpandedRipple: $("#reviewExpandedRipple"),
  reviewExpandedTopTask: $("#reviewExpandedTopTask"),
  reviewExpandedSessionCount: $("#reviewExpandedSessionCount"),
  reviewExpandedBalance: $("#reviewExpandedBalance"),
  reviewExpandedLegend: $("#reviewExpandedLegend"),
  reviewExpandedInsight: $("#reviewExpandedInsight"),
  reviewExpandedChartButtons: [...document.querySelectorAll("[data-review-expanded-chart]")],
  reflectionDate: $("#reflectionDate"),
  reflectionTitle: $("#reflectionTitle"),
  reflectionText: $("#reflectionMarkdown"),
  reflectionRating: $("#reflectionRating"),
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
  bubbleSize: $("#bubbleSize"),
  bubbleImageMode: $("#bubbleImageMode"),
  chooseBubbleImage: $("#chooseBubbleImage"),
  restSound: $("#restSound"),
  restTimerEnabled: $("#restTimerEnabled"),
  restMinutes: $("#restMinutes"),
  restToast: $("#restToast"),
  restMessage: $("#restMessage"),
  restCountdown: $("#restCountdown"),
  restContinue: $("#restContinue"),
  restLater: $("#restLater"),
  resizeZones: [...document.querySelectorAll(".resize-zone")]
};

const state = loadState();
let timerId = null;
let currentWindowMode = "panel";
let windowSwitchTimer = 0;
let bubblePointer = null;
let bubbleMoved = false;
let bubbleDragSurface = null;
let lastBubbleClick = 0;
let bubbleClickTimer = 0;
let dragFrame = 0;
let pendingDragPoint = null;
let resizeFrame = 0;
let pendingResizePoint = null;
let planScreen = "list";
let activePlanId = "";
let currentDayKey = todayKey();
let dayRolloverTimer = 0;
let restTimerId = 0;
let restRemainingSeconds = 0;
let restToastPointer = null;
let restToastOffset = { x: 0, y: 0 };
let audioContext = null;
let focusGuardTimer = 0;

init();

function init() {
  normalizeState();
  currentDayKey = todayKey();
  applyLaunchDefaultView();
  bindEvents();
  applySettings();
  applyWindowMode("panel");
  selectFallbackTask();
  render();
  hydrateDesktop();
  scheduleDayRollover();
  openPanelFromHash();
  window.setTimeout(openPanelFromHash, 0);
  window.addEventListener("hashchange", openPanelFromHash);
  window.addEventListener("focus", ensureTodayState);
  window.addEventListener("blur", armFocusGuard);
  window.addEventListener("focus", releaseFocusGuard);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      ensureTodayState();
      releaseFocusGuard();
    }
  });
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
  els.exportHistory.addEventListener("click", exportHistory);
  els.reviewChartButtons.forEach((button) => button.addEventListener("click", () => setReviewChartMode(button.dataset.reviewChart)));
  els.reviewExpandedChartButtons.forEach((button) => button.addEventListener("click", () => setReviewChartMode(button.dataset.reviewExpandedChart)));
  els.reviewExpand.addEventListener("click", openReviewOverlay);
  els.reviewOverlayClose.addEventListener("click", closeReviewOverlay);
  els.reviewOverlay.addEventListener("click", (event) => {
    if (event.target === els.reviewOverlay) closeReviewOverlay();
  });
  els.reflectionTitle.addEventListener("input", saveReflectionFromInputs);
  els.reflectionText.addEventListener("input", saveReflectionFromInputs);
  els.taskSelect.addEventListener("change", () => selectTask(els.taskSelect.value));
  els.newPlanButton.addEventListener("click", showPlanCreate);
  els.cancelPlanCreate.addEventListener("click", showPlanList);
  els.backPlanList.addEventListener("click", showPlanList);
  els.deletePlan.addEventListener("click", deleteActivePlan);
  els.planCreateForm.addEventListener("submit", addStagePlan);
  els.milestoneForm.addEventListener("submit", addMilestone);
  [els.planDetailTitle, els.planDetailStatus, els.planStartDate, els.planDueDate].forEach((input) => {
    input.addEventListener("input", saveActivePlanDetails);
    input.addEventListener("change", saveActivePlanDetails);
  });
  els.planDetailTitle.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      els.planDetailTitle.blur();
    }
  });
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
  els.restToast.addEventListener("pointerdown", onRestToastPointerDown);
  els.restToast.addEventListener("pointermove", onRestToastPointerMove);
  els.restToast.addEventListener("pointerup", onRestToastPointerUp);
  els.restToast.addEventListener("pointercancel", onRestToastPointerCancel);
  [els.themeSelect, els.backgroundPreset, els.showBubbleTimer, els.autoStart, els.systemNotify, els.restSound, els.restTimerEnabled, els.restMinutes].forEach((input) => input.addEventListener("change", updateSettings));
  [els.bubbleOpacity, els.panelOpacity, els.bubbleSize].forEach((input) => input.addEventListener("input", updateSettings));
  els.bubbleImageMode.addEventListener("change", updateSettings);
  els.chooseBackground.addEventListener("click", chooseBackgroundImage);
  els.chooseBubbleImage.addEventListener("click", chooseBubbleImage);
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
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !els.reviewOverlay.hidden) closeReviewOverlay();
  });
  desktopBridge?.onWindowModePrepare?.(prepareWindowMode);
  desktopBridge?.onWindowModeCommit?.(commitWindowMode);
  if (!desktopBridge?.onWindowModeCommit) desktopBridge?.onWindowMode?.(commitWindowMode);
}

function loadState() {
  const blank = {
    tasks: [makeTask("整理今日重点", DEFAULT_FOCUS_MINUTES, "计划"), makeTask("写一段工作记录", DEFAULT_FOCUS_MINUTES, "工作")],
    history: [],
    reflections: {},
    stagePlans: [],
    timer: { taskId: "", mode: "countdown", seconds: DEFAULT_FOCUS_SECONDS, totalSeconds: DEFAULT_FOCUS_SECONDS, running: false, queue: [] },
    settings: {
      activeView: "today",
      theme: "green",
      tags: DEFAULT_TAGS,
      autoStart: false,
      systemNotify: true,
      bubbleOpacity: 70,
      bubbleSize: 84,
      bubbleImageMode: "watercolor",
      bubbleImagePath: "",
      panelOpacity: 92,
      showBubbleTimer: true,
      soundPreset: "chime",
      restTimerEnabled: true,
      restMinutes: 5,
      reviewChartMode: "ring",
      backgroundPreset: "dew",
      backgroundMode: "preset",
      backgroundImagePath: "",
      panelBlur: 18
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
    stagePlans: migrateStagePlans(saved.stagePlans || saved.plans || []),
    timer: migrateTimer({ ...base.timer, ...(saved.timer || {}) }),
    settings: migrateSettings({ ...base.settings, ...(saved.settings || {}) })
  };
}

function normalizeState() {
  state.tasks = (state.tasks || []).filter((task) => !task.done).map(migrateTask);
  state.history = (state.history || []).map(migrateHistoryItem).slice(0, 500);
  state.reflections = migrateReflections(state.reflections || {});
  state.stagePlans = migrateStagePlans(state.stagePlans || []);
  state.settings = migrateSettings(state.settings || {});
  if (state.settings.activeView === "history") state.settings.activeView = "plan";
  if (!["today", "focus", "knowledge", "plan"].includes(state.settings.activeView)) state.settings.activeView = "today";
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
      applyLaunchDefaultView();
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

function applyLaunchDefaultView() {
  const route = location.hash.replace("#", "") || new URLSearchParams(location.search).get("view");
  if (!route) state.settings.activeView = "today";
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  desktopBridge?.saveState?.(clone(state)).catch((error) => console.warn("Failed to save Qingping state:", error));
}

function scheduleDayRollover() {
  window.clearTimeout(dayRolloverTimer);
  const now = new Date();
  const next = new Date(now);
  next.setHours(24, 0, 1, 0);
  const delay = Math.max(1000, Math.min(next.getTime() - now.getTime(), 2147483647));
  dayRolloverTimer = window.setTimeout(() => {
    handleDayRollover();
    scheduleDayRollover();
  }, delay);
}

function ensureTodayState() {
  return todayKey() !== currentDayKey ? handleDayRollover() : false;
}

function handleDayRollover() {
  const nextDay = todayKey();
  if (nextDay === currentDayKey) return false;
  currentDayKey = nextDay;
  if (state.timer.running) {
    stopTimer();
    state.timer.running = false;
  }
  if (!isTodayOpenTask(state.tasks.find((task) => task.id === state.timer.taskId), nextDay)) {
    state.timer.taskId = "";
    state.timer.queue = [];
  }
  selectFallbackTask(nextDay);
  saveState();
  render();
  return true;
}

function render() {
  if (ensureTodayState()) return;
  renderTagSelects();
  renderFocus();
  renderTasks();
  renderReflection();
  renderPlans();
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
  els.focusMeta.textContent = task ? `${task.minutes} 分钟 · ${task.tag || "未分类"} · 今日 ${formatFocus(getTaskDaySeconds(task, todayKey()))}` : "可以休息一下，或写下今日回顾。";
  els.timerText.textContent = formatSeconds(state.timer.seconds);
  els.toggleTimer.textContent = running ? "暂停" : "开始";
  els.toggleTimer.disabled = !task;
  els.completeTask.disabled = !task;
  els.resetTimer.disabled = !task;
  els.timerRing.style.strokeDashoffset = String(TIMER_RING_LENGTH * (1 - clamp(getTimerProgress(), 0, 1)));
  renderSegmentQueue();
}

function renderTasks() {
  const today = todayKey();
  const todayTasks = getTodayOpenTasks(today);
  const completedToday = getTodayCompletedTasks();
  els.summaryOpen.textContent = String(todayTasks.length);
  els.summaryFocus.textContent = formatFocus(getTodayFocusSeconds());
  els.summaryDone.textContent = String(completedToday.length);
  els.taskTotal.textContent = `${todayTasks.reduce((sum, task) => sum + task.minutes, 0)}m`;
  els.completedTodayMeta.textContent = `${completedToday.length}项`;
  els.taskList.innerHTML = "";
  els.completedTodayList.innerHTML = "";
  els.taskSelect.innerHTML = "";

  if (!todayTasks.length) {
    els.taskSelect.innerHTML = `<option value="">暂无今日任务</option>`;
  } else {
    todayTasks.forEach((task) => {
      const option = new Option(task.title, task.id, task.id === state.timer.taskId, task.id === state.timer.taskId);
      els.taskSelect.appendChild(option);
    });
  }

  if (!todayTasks.length) {
    els.taskList.innerHTML = `<li class="empty-state compact"><strong>今天暂时很清爽</strong><span>添加一个小任务，给专注一个落点。</span></li>`;
  } else {
    todayTasks.forEach((task) => {
      const item = document.createElement("li");
      item.className = "task-item";
      item.innerHTML = `<div class="task-main"><span class="task-title"></span><span class="task-meta"></span></div><select class="tag-mini"></select><div class="task-actions"><button class="task-icon timer-action" data-action="timer" type="button" title="开始计时">计时</button><button class="task-icon" data-action="done" type="button" title="完成">✓</button><button class="task-icon" data-action="delete" type="button" title="删除">×</button></div>`;
      item.querySelector(".task-title").textContent = task.title;
      item.querySelector(".task-meta").textContent = `${task.minutes}m · 今日 ${formatFocus(getTaskDaySeconds(task, today))}`;
      fillTagOptions(item.querySelector(".tag-mini"), task.tag);
      item.querySelector(".tag-mini").addEventListener("change", (event) => updateTaskTag(task.id, event.target.value));
      item.querySelector('[data-action="timer"]').addEventListener("click", () => startTaskTimer(task.id));
      item.querySelector('[data-action="done"]').addEventListener("click", () => completeTaskById(task.id));
      item.querySelector('[data-action="delete"]').addEventListener("click", () => deleteTask(task.id));
      els.taskList.appendChild(item);
    });
  }

  if (!completedToday.length) {
    els.completedTodayList.innerHTML = `<li class="empty-state mini"><strong>还没有落款</strong><span>完成的事会在这里安静留下。</span></li>`;
    return;
  }
  completedToday.forEach((task) => {
    const item = document.createElement("li");
    item.className = "completed-item";
    item.innerHTML = `<div class="completed-row"><span class="history-title"></span><small class="history-meta"></small></div>`;
    item.querySelector(".history-title").textContent = task.title;
    item.querySelector(".history-meta").textContent = formatCompletedMeta(task, today);
    els.completedTodayList.appendChild(item);
  });
}

function renderReflection() {
  const reflection = getReflection(todayKey());
  els.reflectionDate.textContent = formatDayTitle(todayKey());
  if (document.activeElement !== els.reflectionTitle) els.reflectionTitle.value = reflection.title;
  if (document.activeElement !== els.reflectionText) els.reflectionText.value = reflection.content;
  els.reflectionSavedAt.textContent = reflection.updatedAt ? `已保存 ${formatDateTime(reflection.updatedAt)}` : "今日还未回顾";
  renderMoodRating(reflection.moodScore);
  renderReviewSummary();
}

function renderReviewSummary() {
  const mode = state.settings.reviewChartMode === "bars" ? "ripple" : (REVIEW_CHART_MODES.includes(state.settings.reviewChartMode) ? state.settings.reviewChartMode : "ring");
  const items = getTodayReviewDistribution();
  const total = items.reduce((sum, item) => sum + item.seconds, 0);
  const top = items[0];
  const sessionCount = items.reduce((sum, item) => sum + item.sessions, 0);
  const topShare = total && top ? top.seconds / total : 0;
  const balance = getReviewBalance(items, topShare);

  els.reviewChartButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.reviewChart === mode));
  els.reviewChartShell.classList.remove("is-ring", "is-ripple");
  els.reviewChartShell.classList.add(`is-${mode}`);
  els.reviewTotal.textContent = formatFocus(total);
  els.reviewRingTotal.textContent = formatFocus(total);
  els.reviewTopTask.textContent = top ? top.title : "暂无";
  els.reviewSessionCount.textContent = String(sessionCount);
  els.reviewBalance.textContent = balance;
  els.reviewInsight.textContent = getReviewInsight(items, total, topShare);

  els.reviewRing.hidden = mode !== "ring";
  els.reviewRipple.hidden = mode !== "ripple";
  renderReviewRing(items, total);
  renderReviewRipple(items, total);
  renderReviewLegend(items, total);
  if (!els.reviewOverlay.hidden) renderReviewOverlay();
}

function renderReviewRing(items, total) {
  if (!items.length || !total) {
    els.reviewRing.style.background = "conic-gradient(rgba(66, 166, 90, 0.18), rgba(142, 122, 216, 0.12), rgba(58, 154, 178, 0.14), rgba(66, 166, 90, 0.18))";
    return;
  }
  let cursor = 0;
  const stops = items.map((item, index) => {
    const start = cursor;
    cursor += (item.seconds / total) * 100;
    const color = REVIEW_COLORS[index % REVIEW_COLORS.length];
    return `${color} ${start.toFixed(2)}% ${cursor.toFixed(2)}%`;
  });
  els.reviewRing.style.background = `conic-gradient(${stops.join(", ")})`;
}

function renderReviewRipple(items, total) {
  els.reviewRipple.innerHTML = "";
  if (!items.length || !total) {
    const empty = document.createElement("span");
    empty.className = "review-empty-line";
    empty.textContent = "暂无时间涟漪";
    els.reviewRipple.appendChild(empty);
    return;
  }
  items.slice(0, 5).forEach((item, index) => {
    const line = document.createElement("div");
    line.className = "ripple-line";
    line.style.setProperty("--share", `${Math.max(1, (item.seconds / total) * 100)}%`);
    line.style.setProperty("--ripple-color", REVIEW_COLORS[index % REVIEW_COLORS.length]);
    const title = document.createElement("strong");
    const time = document.createElement("span");
    title.textContent = item.title;
    time.textContent = formatFocus(item.seconds);
    line.append(title, time);
    els.reviewRipple.appendChild(line);
  });
}

function renderReviewLegend(items, total) {
  els.reviewLegend.innerHTML = "";
  const visible = items.slice(0, 4);
  if (!visible.length || !total) {
    els.reviewLegend.innerHTML = `<li><i></i><span>暂无任务时间</span><b>0%</b></li>`;
    return;
  }
  visible.forEach((item, index) => {
    const row = document.createElement("li");
    row.innerHTML = "<i></i><span></span><b></b>";
    row.querySelector("i").style.background = REVIEW_COLORS[index % REVIEW_COLORS.length];
    row.querySelector("span").textContent = item.title;
    row.querySelector("b").textContent = `${Math.round((item.seconds / total) * 100)}%`;
    els.reviewLegend.appendChild(row);
  });
}

function openReviewOverlay() {
  els.reviewOverlay.hidden = false;
  renderReviewOverlay();
  window.requestAnimationFrame(() => els.reviewOverlayClose.focus());
}

function closeReviewOverlay() {
  els.reviewOverlay.hidden = true;
  els.reviewExpand.focus();
}

function renderReviewOverlay() {
  const mode = state.settings.reviewChartMode === "bars" ? "ripple" : (REVIEW_CHART_MODES.includes(state.settings.reviewChartMode) ? state.settings.reviewChartMode : "ring");
  const items = getTodayReviewDistribution();
  const total = items.reduce((sum, item) => sum + item.seconds, 0);
  const top = items[0];
  const sessionCount = items.reduce((sum, item) => sum + item.sessions, 0);
  const topShare = total && top ? top.seconds / total : 0;
  const balance = getReviewBalance(items, topShare);

  els.reviewExpandedChartButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.reviewExpandedChart === mode));
  els.reviewExpandedShell.classList.remove("is-ring", "is-ripple");
  els.reviewExpandedShell.classList.add(`is-${mode}`);
  els.reviewExpandedTotal.textContent = formatFocus(total);
  els.reviewExpandedRingTotal.textContent = formatFocus(total);
  els.reviewExpandedTopTask.textContent = top ? top.title : "暂无";
  els.reviewExpandedSessionCount.textContent = String(sessionCount);
  els.reviewExpandedBalance.textContent = balance;
  els.reviewExpandedInsight.textContent = getReviewInsight(items, total, topShare);

  els.reviewExpandedRing.hidden = mode !== "ring";
  els.reviewExpandedRipple.hidden = mode !== "ripple";
  renderReviewExpandedRing(items, total);
  renderReviewExpandedRipple(items, total);
  renderReviewExpandedLegend(items, total);
}

function renderReviewExpandedRing(items, total) {
  clearReviewExpandedRingAnnotations();
  const displayItems = getReviewDisplayItems(items, 6);
  if (!displayItems.length || !total) {
    els.reviewExpandedRing.style.background = "conic-gradient(rgba(66, 166, 90, 0.18), rgba(142, 122, 216, 0.12), rgba(58, 154, 178, 0.14), rgba(66, 166, 90, 0.18))";
    return;
  }
  let cursor = 0;
  const stops = displayItems.map((item, index) => {
    const start = cursor;
    cursor += (item.seconds / total) * 100;
    const color = REVIEW_COLORS[index % REVIEW_COLORS.length];
    return `${color} ${start.toFixed(2)}% ${cursor.toFixed(2)}%`;
  });
  els.reviewExpandedRing.style.background = `conic-gradient(${stops.join(", ")})`;
  renderReviewRingCallouts(displayItems, total);
}

function renderReviewExpandedRipple(items, total) {
  els.reviewExpandedRipple.innerHTML = "";
  if (!items.length || !total) {
    const empty = document.createElement("span");
    empty.className = "review-empty-line";
    empty.textContent = "暂无时间涟漪";
    els.reviewExpandedRipple.appendChild(empty);
    return;
  }
  items.slice(0, 8).forEach((item, index) => {
    const line = document.createElement("div");
    line.className = "ripple-line";
    line.style.setProperty("--share", `${Math.max(1, (item.seconds / total) * 100)}%`);
    line.style.setProperty("--ripple-color", REVIEW_COLORS[index % REVIEW_COLORS.length]);
    const title = document.createElement("strong");
    const time = document.createElement("span");
    title.textContent = item.title;
    time.textContent = formatFocus(item.seconds);
    line.append(title, time);
    els.reviewExpandedRipple.appendChild(line);
  });
}

function renderReviewExpandedLegend(items, total) {
  els.reviewExpandedLegend.innerHTML = "";
  const visible = getReviewDisplayItems(items, 6);
  if (!visible.length || !total) {
    els.reviewExpandedLegend.innerHTML = `<li><i></i><span>暂无任务时间</span><b>0%</b></li>`;
    return;
  }
  visible.forEach((item, index) => {
    const row = document.createElement("li");
    row.innerHTML = "<i></i><span></span><b></b>";
    row.querySelector("i").style.background = REVIEW_COLORS[index % REVIEW_COLORS.length];
    row.querySelector("span").textContent = item.title;
    row.querySelector("b").textContent = `${Math.round((item.seconds / total) * 100)}%`;
    els.reviewExpandedLegend.appendChild(row);
  });
}

function clearReviewExpandedRingAnnotations() {
  els.reviewExpandedRing.querySelectorAll(".review-ring-guide, .review-ring-callout").forEach((node) => node.remove());
}

function renderReviewRingCallouts(items, total) {
  let cursor = 0;
  items.forEach((item, index) => {
    const share = item.seconds / total;
    const mid = cursor + share / 2;
    cursor += share;
    const angle = mid * 360 - 90;
    const radians = angle * Math.PI / 180;
    const color = REVIEW_COLORS[index % REVIEW_COLORS.length];

    const guide = document.createElement("i");
    guide.className = "review-ring-guide";
    guide.style.setProperty("--guide-angle", `${angle}deg`);
    guide.style.setProperty("--guide-color", color);

    const callout = document.createElement("span");
    callout.className = "review-ring-callout";
    callout.style.setProperty("--callout-color", color);
    callout.style.left = `${50 + Math.cos(radians) * 43}%`;
    callout.style.top = `${50 + Math.sin(radians) * 43}%`;
    callout.innerHTML = "<b></b><small></small>";
    callout.querySelector("b").textContent = item.title;
    callout.querySelector("small").textContent = `${formatFocus(item.seconds)} · ${Math.round(share * 100)}%`;

    els.reviewExpandedRing.append(guide, callout);
  });
}

function getReviewDisplayItems(items, limit = 6) {
  if (items.length <= limit) return items;
  const head = items.slice(0, Math.max(1, limit - 1));
  const rest = items.slice(head.length).reduce((entry, item) => {
    entry.seconds += item.seconds;
    entry.sessions += item.sessions;
    return entry;
  }, { title: "其他", tag: "汇总", seconds: 0, sessions: 0 });
  return [...head, rest].filter((item) => item.seconds > 0);
}

function renderMoodRating(score) {
  els.reflectionRating.innerHTML = "";
  for (let value = 1; value <= 5; value += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "rating-leaf";
    button.classList.toggle("is-active", value <= score);
    button.title = `${value}分 · ${MOOD_LABELS[value - 1]}`;
    button.setAttribute("aria-pressed", value === score ? "true" : "false");
    button.innerHTML = `<img src="assets/qingping-lily-clock.png" alt="" aria-hidden="true"><span>${value}</span>`;
    button.addEventListener("click", () => setReflectionScore(value));
    els.reflectionRating.appendChild(button);
  }
}

function renderPlans() {
  const activePlan = getActivePlan();
  if (planScreen === "detail" && !activePlan) planScreen = "list";
  els.planListScreen.hidden = planScreen !== "list";
  els.planCreateForm.hidden = planScreen !== "create";
  els.planDetail.hidden = planScreen !== "detail";
  renderPlanList();
  if (planScreen === "detail") renderPlanDetail(activePlan);
}

function renderPlanList() {
  els.planList.innerHTML = "";
  if (!state.stagePlans.length) {
    els.planList.innerHTML = `<li class="empty-state compact"><strong>点开一圈计划涟漪</strong><span>先写主要任务，再把阶段目标一层层放进水纹里。</span></li>`;
    return;
  }
  state.stagePlans.forEach((plan) => {
    const doneCount = plan.milestones.filter((item) => item.done).length;
    const item = document.createElement("li");
    item.className = `plan-item is-${plan.status}`;
    item.innerHTML = `<button class="plan-card-button" type="button"><div class="plan-card-ripple" aria-hidden="true"><i></i><i></i><i></i><b></b></div><div class="plan-item-copy"><div class="plan-item-head"><strong></strong><span></span></div><p class="plan-goal"></p><div class="plan-progress-mini"><i></i></div><small></small></div></button>`;
    item.style.setProperty("--plan-progress", `${clamp(plan.progress, 0, 100)}%`);
    item.querySelector("strong").textContent = plan.title;
    item.querySelector(".plan-item-head span").textContent = PLAN_STATUS[plan.status] || "推进中";
    item.querySelector(".plan-goal").textContent = plan.overallGoal || plan.route || "进入详情设置阶段目标、进度和时间。";
    item.querySelector(".plan-progress-mini i").style.width = `${clamp(plan.progress, 0, 100)}%`;
    item.querySelector("small").textContent = `${plan.progress}% · ${doneCount}/${plan.milestones.length} 阶段 · ${plan.dueDate || "未设截止"}`;
    item.querySelector("button").addEventListener("click", () => showPlanDetail(plan.id));
    els.planList.appendChild(item);
  });
}

function renderPlanDetail(plan) {
  if (!plan) return;
  const doneCount = plan.milestones.filter((item) => item.done).length;
  if (document.activeElement !== els.planDetailTitle) els.planDetailTitle.value = plan.title;
  if (document.activeElement !== els.planDetailStatus) els.planDetailStatus.value = plan.status;
  if (document.activeElement !== els.planStartDate) els.planStartDate.value = plan.startDate;
  if (document.activeElement !== els.planDueDate) els.planDueDate.value = plan.dueDate;
  els.planProgressText.textContent = `${plan.progress}%`;
  els.planProgressText.nextElementSibling.style.width = `${clamp(plan.progress, 0, 100)}%`;
  els.planCoreMeta.textContent = `${plan.progress}% · ${doneCount}/${plan.milestones.length} 阶段`;
  els.planUpdatedAt.textContent = plan.updatedAt ? `更新于 ${formatDateTime(plan.updatedAt)}` : "尚未更新";
  if (!isMilestoneFieldActive()) renderMilestones(plan);
}

function renderMilestones(plan) {
  els.milestoneList.innerHTML = "";
  if (!plan.milestones.length) {
    els.milestoneList.innerHTML = `<li class="milestone-empty"><strong>还没有阶段目标</strong><span>第一滴水落下时，路线才开始有形。</span></li>`;
    return;
  }
  const count = plan.milestones.length;
  const firstPending = plan.milestones.findIndex((item) => !item.done);
  plan.milestones.forEach((milestone, index) => {
    const item = document.createElement("li");
    item.className = "milestone-item";
    item.dataset.milestoneId = milestone.id;
    item.classList.toggle("is-done", milestone.done);
    item.classList.toggle("is-current", index === firstPending);
    item.classList.toggle("is-pending", !milestone.done && index !== firstPending);
    item.style.setProperty("--node-delay", `${index * 120}ms`);
    item.innerHTML = `<button class="milestone-toggle" type="button" title="完成/取消阶段目标"><span></span></button><div class="milestone-node"><input class="milestone-title-input" type="text" autocomplete="off" aria-label="阶段目标名称"><div class="milestone-fields"><label><span>始</span><input class="milestone-date-input" data-field="startDate" type="date" aria-label="阶段开始时间"></label><label><span>止</span><input class="milestone-date-input" data-field="dueDate" type="date" aria-label="阶段结束时间"></label></div><textarea class="milestone-note-input" rows="2" placeholder="阶段笔记：阻力、产出或下一步" aria-label="阶段笔记"></textarea><small></small></div><button class="milestone-delete" type="button" title="删除阶段目标">×</button>`;
    item.querySelector(".milestone-toggle span").textContent = milestone.done ? "✓" : String(index + 1).padStart(2, "0");
    const titleInput = item.querySelector(".milestone-title-input");
    const noteInput = item.querySelector(".milestone-note-input");
    const startInput = item.querySelector('[data-field="startDate"]');
    const dueInput = item.querySelector('[data-field="dueDate"]');
    titleInput.value = milestone.title;
    noteInput.value = milestone.notes || "";
    startInput.value = milestone.startDate || "";
    dueInput.value = milestone.dueDate || "";
    item.querySelector("small").textContent = formatMilestoneMeta(milestone, index, count, index === firstPending);
    item.querySelector(".milestone-toggle").addEventListener("click", () => toggleMilestone(plan.id, milestone.id));
    titleInput.addEventListener("focus", () => titleInput.dataset.original = milestone.title);
    titleInput.addEventListener("input", () => saveMilestoneTitle(plan.id, milestone.id, titleInput.value));
    titleInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") titleInput.blur();
      if (event.key === "Escape") {
        titleInput.value = titleInput.dataset.original || milestone.title;
        saveMilestoneTitle(plan.id, milestone.id, titleInput.value);
        titleInput.blur();
      }
    });
    titleInput.addEventListener("blur", () => commitMilestoneTitle(plan.id, milestone.id, titleInput.value));
    [startInput, dueInput].forEach((input) => {
      input.addEventListener("change", () => saveMilestoneDetails(plan.id, milestone.id, {
        startDate: startInput.value,
        dueDate: dueInput.value
      }));
      input.addEventListener("blur", () => commitMilestoneDetails(plan.id, milestone.id, {
        startDate: startInput.value,
        dueDate: dueInput.value,
        notes: noteInput.value
      }));
    });
    noteInput.addEventListener("input", () => saveMilestoneDetails(plan.id, milestone.id, { notes: noteInput.value }));
    noteInput.addEventListener("blur", () => commitMilestoneDetails(plan.id, milestone.id, {
      startDate: startInput.value,
      dueDate: dueInput.value,
      notes: noteInput.value
    }));
    item.querySelector(".milestone-delete").addEventListener("click", () => deleteMilestone(plan.id, milestone.id));
    els.milestoneList.appendChild(item);
  });
}

function isMilestoneFieldActive() {
  return Boolean(document.activeElement?.closest?.(".milestone-title-input, .milestone-note-input, .milestone-date-input"));
}

function renderView() {
  els.viewTabs.forEach((button) => button.classList.toggle("is-active", button.dataset.view === state.settings.activeView));
  els.views.forEach((view) => view.classList.toggle("is-active", view.id === `${state.settings.activeView}View`));
}

function renderSettings() {
  els.themeSelect.value = state.settings.theme;
  els.backgroundPreset.value = state.settings.backgroundMode === "image" ? "image" : state.settings.backgroundPreset;
  els.panelOpacity.value = opacityToTransparency(state.settings.panelOpacity, PANEL_OPACITY_RANGE);
  els.showBubbleTimer.checked = Boolean(state.settings.showBubbleTimer);
  els.autoStart.checked = Boolean(state.settings.autoStart);
  els.systemNotify.checked = Boolean(state.settings.systemNotify);
  els.bubbleOpacity.value = opacityToTransparency(state.settings.bubbleOpacity, BUBBLE_OPACITY_RANGE);
  els.bubbleSize.value = state.settings.bubbleSize;
  els.bubbleImageMode.value = state.settings.bubbleImageMode;
  els.restSound.value = state.settings.soundPreset;
  els.restTimerEnabled.checked = Boolean(state.settings.restTimerEnabled);
  els.restMinutes.value = state.settings.restMinutes;
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
  if (currentWindowMode === "bubble") {
    els.settingsPanel.hidden = true;
    document.body.classList.remove("is-focus-guard");
  }
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
  if (mode === currentWindowMode && !document.body.classList.contains("is-switching")) {
    applyWindowMode(mode, false);
    return;
  }
  prepareWindowMode(mode);
  await desktopBridge?.setWindowMode?.(mode);
  if (!desktopBridge?.setWindowMode) commitWindowMode(mode);
}

function armFocusGuard() {
  if (currentWindowMode !== "panel") return;
  window.clearTimeout(focusGuardTimer);
  document.body.classList.add("is-focus-guard");
}

function releaseFocusGuard() {
  window.clearTimeout(focusGuardTimer);
  document.body.classList.add("is-focus-guard");
  focusGuardTimer = window.setTimeout(() => {
    document.body.classList.remove("is-focus-guard");
  }, 180);
}

function switchView(view) {
  state.settings.activeView = view;
  saveState();
  renderView();
}

function openPanelFromHash() {
  const raw = location.hash.replace("#", "") || new URLSearchParams(location.search).get("view");
  if (raw?.startsWith("plan:")) {
    const planId = raw.slice(5);
    state.settings.activeView = "plan";
    activePlanId = planId;
    planScreen = state.stagePlans.some((plan) => plan.id === planId) ? "detail" : "list";
    setAppWindowMode("panel");
    renderView();
    renderPlans();
    return;
  }
  const view = normalizeViewName(raw);
  if (["today", "focus", "knowledge", "plan"].includes(view)) {
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
  const minutes = clamp(Number(match?.[2] || DEFAULT_FOCUS_MINUTES), 1, 240);
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

function selectFallbackTask(day = todayKey()) {
  const tasks = getTodayOpenTasks(day);
  if (tasks.some((task) => task.id === state.timer.taskId)) return;
  state.timer.taskId = tasks[0]?.id || "";
  const task = getCurrentTask();
  if (task) {
    state.timer.totalSeconds = Math.max(1, task.minutes * 60);
    state.timer.seconds = state.timer.mode === "countup" ? 0 : state.timer.totalSeconds;
  }
}

function selectTask(taskId) {
  state.timer.taskId = getTodayOpenTasks().some((task) => task.id === taskId) ? taskId : "";
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

async function startTaskTimer(taskId) {
  if (!getTodayOpenTasks().some((task) => task.id === taskId)) {
    showNotice("只能从今天要做中选择任务计时。");
    selectFallbackTask();
    render();
    return;
  }
  if (state.timer.running) pauseTimer(false);
  selectTask(taskId);
  state.settings.activeView = "focus";
  renderView();
  await setAppWindowMode("panel");
  startTimer();
}

function setTimerMode(mode) {
  if (!["countdown", "countup"].includes(mode)) return;
  const task = getCurrentTask();
  stopTimer();
  state.timer.mode = mode;
  state.timer.running = false;
  state.timer.totalSeconds = task ? Math.max(1, task.minutes * 60) : DEFAULT_FOCUS_SECONDS;
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

function pauseTimer(shouldRender = true) {
  stopTimer();
  state.timer.running = false;
  saveState();
  if (shouldRender) render();
}

function stopTimer() {
  if (timerId) window.clearInterval(timerId);
  timerId = null;
}

function tickTimer() {
  if (ensureTodayState()) return;
  const task = getCurrentTask();
  if (!task) {
    pauseTimer();
    return;
  }
  addTaskFocusSecond(task, todayKey(), 1);
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
    showNotice("时间格式可用 45、45:00 或 1:30:00。");
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
  task.actualSeconds = Math.max(task.actualSeconds || 0, totalSessionSeconds(task.sessions), sumDailySeconds(task.dailySeconds));
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
  const endedAt = new Date();
  const duration = Math.round(seconds);
  task.sessions.push({
    seconds: duration,
    mode: state.timer.mode,
    startedAt: new Date(endedAt.getTime() - duration * 1000).toISOString(),
    endedAt: endedAt.toISOString()
  });
}

function addTaskFocusSecond(task, day, seconds) {
  task.dailySeconds = task.dailySeconds && typeof task.dailySeconds === "object" ? task.dailySeconds : {};
  task.dailySeconds[day] = Math.max(0, Number(task.dailySeconds[day] || 0) + seconds);
}

function getReflection(key = todayKey()) {
  state.reflections[key] = migrateReflection(state.reflections[key], key);
  return state.reflections[key];
}

function setReflectionScore(score) {
  const reflection = getReflection(todayKey());
  reflection.moodScore = reflection.moodScore === score ? 0 : score;
  reflection.updatedAt = new Date().toISOString();
  saveState();
  renderReflection();
}

function setReviewChartMode(mode) {
  if (!REVIEW_CHART_MODES.includes(mode)) return;
  state.settings.reviewChartMode = mode;
  saveState();
  renderReviewSummary();
}

function saveReflectionFromInputs() {
  const reflection = getReflection(todayKey());
  reflection.title = els.reflectionTitle.value.trim();
  reflection.content = els.reflectionText.value;
  reflection.updatedAt = new Date().toISOString();
  saveState();
  els.reflectionSavedAt.textContent = `已保存 ${formatDateTime(reflection.updatedAt)}`;
}

function addStagePlan(event) {
  event.preventDefault();
  const title = els.planTitle.value.trim();
  if (!title) {
    showNotice("先写下主要任务名称。");
    return;
  }
  const plan = {
    id: makeId(),
    title,
    overallGoal: "",
    route: "",
    notes: "",
    status: "active",
    progress: 0,
    startDate: todayKey(),
    dueDate: "",
    milestones: [],
    updatedAt: new Date().toISOString()
  };
  state.stagePlans.unshift(plan);
  els.planTitle.value = "";
  activePlanId = plan.id;
  planScreen = "detail";
  saveState();
  renderPlans();
}

function showPlanList() {
  planScreen = "list";
  activePlanId = "";
  renderPlans();
}

function showPlanCreate() {
  planScreen = "create";
  activePlanId = "";
  els.planTitle.value = "";
  renderPlans();
  window.setTimeout(() => els.planTitle.focus(), 0);
}

function showPlanDetail(planId) {
  activePlanId = planId;
  planScreen = "detail";
  renderPlans();
}

function getActivePlan() {
  return state.stagePlans.find((item) => item.id === activePlanId) || null;
}

function saveActivePlanDetails() {
  const plan = getActivePlan();
  if (!plan) return;
  plan.title = els.planDetailTitle.value.trim() || "未命名主要任务";
  plan.status = els.planDetailStatus.value;
  plan.startDate = els.planStartDate.value;
  plan.dueDate = els.planDueDate.value;
  plan.updatedAt = new Date().toISOString();
  saveState();
  renderPlans();
}

function addMilestone(event) {
  event.preventDefault();
  const plan = getActivePlan();
  const title = els.milestoneInput.value.trim();
  if (!plan || !title) return;
  const milestone = { id: makeId(), title, done: false, startDate: "", dueDate: "", notes: "", createdAt: new Date().toISOString() };
  plan.milestones.push(milestone);
  els.milestoneInput.value = "";
  if (plan.status === "done") plan.status = "active";
  syncPlanProgressFromMilestones(plan);
  plan.updatedAt = new Date().toISOString();
  saveState();
  renderPlans();
  window.requestAnimationFrame(() => {
    const node = els.milestoneList.querySelector(`[data-milestone-id="${milestone.id}"]`);
    node?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });
}

function toggleMilestone(planId, milestoneId) {
  const plan = state.stagePlans.find((item) => item.id === planId);
  if (!plan) return;
  const milestone = plan.milestones.find((item) => item.id === milestoneId);
  if (!milestone) return;
  milestone.done = !milestone.done;
  syncPlanProgressFromMilestones(plan);
  plan.updatedAt = new Date().toISOString();
  saveState();
  renderPlans();
}

function deleteMilestone(planId, milestoneId) {
  const plan = state.stagePlans.find((item) => item.id === planId);
  if (!plan) return;
  plan.milestones = plan.milestones.filter((item) => item.id !== milestoneId);
  syncPlanProgressFromMilestones(plan);
  plan.updatedAt = new Date().toISOString();
  saveState();
  renderPlans();
}

function saveMilestoneTitle(planId, milestoneId, title) {
  const milestone = findMilestone(planId, milestoneId);
  if (!milestone) return;
  milestone.title = title;
  const plan = state.stagePlans.find((item) => item.id === planId);
  if (plan) plan.updatedAt = new Date().toISOString();
  saveState();
}

function commitMilestoneTitle(planId, milestoneId, title) {
  const milestone = findMilestone(planId, milestoneId);
  if (!milestone) return;
  milestone.title = title.trim() || "未命名阶段";
  const plan = state.stagePlans.find((item) => item.id === planId);
  if (plan) plan.updatedAt = new Date().toISOString();
  saveState();
  renderPlans();
}

function saveMilestoneDetails(planId, milestoneId, updates = {}) {
  const milestone = findMilestone(planId, milestoneId);
  if (!milestone) return;
  if (Object.prototype.hasOwnProperty.call(updates, "startDate")) milestone.startDate = normalizeDateInput(updates.startDate);
  if (Object.prototype.hasOwnProperty.call(updates, "dueDate")) milestone.dueDate = normalizeDateInput(updates.dueDate);
  if (Object.prototype.hasOwnProperty.call(updates, "notes")) milestone.notes = String(updates.notes || "");
  const plan = state.stagePlans.find((item) => item.id === planId);
  if (plan) plan.updatedAt = new Date().toISOString();
  saveState();
}

function commitMilestoneDetails(planId, milestoneId, updates = {}) {
  saveMilestoneDetails(planId, milestoneId, updates);
  renderPlans();
}

function findMilestone(planId, milestoneId) {
  const plan = state.stagePlans.find((item) => item.id === planId);
  return plan?.milestones.find((item) => item.id === milestoneId) || null;
}

function formatMilestoneMeta(milestone, index, count, current) {
  const status = milestone.done ? "完成" : (current ? "当前推进" : "待推进");
  const dates = formatMilestoneDates(milestone);
  return `${index + 1}/${count} · ${status}${dates ? ` · ${dates}` : ""}`;
}

function formatMilestoneDates(milestone) {
  if (milestone.startDate && milestone.dueDate) return `${milestone.startDate} 至 ${milestone.dueDate}`;
  if (milestone.startDate) return `始 ${milestone.startDate}`;
  if (milestone.dueDate) return `止 ${milestone.dueDate}`;
  return "";
}

function normalizeDateInput(value) {
  const text = String(value || "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : "";
}

function syncPlanProgressFromMilestones(plan) {
  if (!plan.milestones.length) {
    plan.progress = 0;
    if (plan.status === "done") plan.status = "active";
    return;
  }
  const doneCount = plan.milestones.filter((item) => item.done).length;
  plan.progress = Math.round((doneCount / plan.milestones.length) * 100);
  if (doneCount === plan.milestones.length) plan.status = "done";
  else if (plan.status === "done") plan.status = "active";
}

function deleteActivePlan() {
  const plan = getActivePlan();
  if (!plan) return;
  state.stagePlans = state.stagePlans.filter((item) => item.id !== plan.id);
  planScreen = "list";
  activePlanId = "";
  saveState();
  renderPlans();
}

function exportHistory() {
  const used = new Set();
  const rows = [["日期", "任务", "标签", "计划分钟", "实际分钟", "完成时间", "专注段", "今日心情评分", "回顾标题", "回顾内容", "回顾更新时间"]];
  state.history.forEach((item) => {
    const day = getLocalDayKey(item.completedAt);
    const reflection = state.reflections[day] ? migrateReflection(state.reflections[day], day) : null;
    if (reflection?.title || reflection?.content || reflection?.moodScore) used.add(day);
    rows.push([
      day,
      item.title,
      item.tag || "",
      item.minutes,
      Math.round(getTaskDaySeconds(item, day) / 60),
      item.completedAt || "",
      formatSessionsForDay(item.sessions, day),
      reflection?.moodScore || "",
      reflection?.title || "",
      reflection?.content || "",
      reflection?.updatedAt || ""
    ]);
  });
  Object.entries(state.reflections).sort(([a], [b]) => b.localeCompare(a)).forEach(([day, raw]) => {
    const reflection = migrateReflection(raw, day);
    if (!used.has(day) && (reflection.title || reflection.content || reflection.moodScore)) {
      rows.push([day, "仅回顾", "", "", "", reflection.updatedAt || "", "", reflection.moodScore || "", reflection.title, reflection.content, reflection.updatedAt || ""]);
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

async function chooseBubbleImage() {
  if (!desktopBridge?.chooseBubbleImage) {
    showNotice("桌面版支持选择本地气泡图片。");
    return;
  }
  const filePath = await desktopBridge.chooseBubbleImage();
  if (!filePath) return;
  state.settings.bubbleImageMode = "image";
  state.settings.bubbleImagePath = filePath;
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
  state.settings.bubbleOpacity = transparencyToOpacity(els.bubbleOpacity.value, BUBBLE_OPACITY_RANGE);
  state.settings.bubbleSize = clamp(Number(els.bubbleSize.value || 84), BUBBLE_SIZE_RANGE.min, BUBBLE_SIZE_RANGE.max);
  state.settings.bubbleImageMode = BUBBLE_IMAGE_MODES.includes(els.bubbleImageMode.value) ? els.bubbleImageMode.value : "watercolor";
  state.settings.panelOpacity = transparencyToOpacity(els.panelOpacity.value, PANEL_OPACITY_RANGE);
  state.settings.soundPreset = REST_SOUND_PRESETS.includes(els.restSound.value) ? els.restSound.value : "chime";
  state.settings.restTimerEnabled = els.restTimerEnabled.checked;
  state.settings.restMinutes = clamp(Number(els.restMinutes.value || 5), 1, 60);
  applySettings();
  saveState();
  renderBubble();
  desktopBridge?.setBubbleSize?.(state.settings.bubbleSize).catch(() => {});
  desktopBridge?.setAutoStart?.(state.settings.autoStart).catch(() => {});
}

function applySettings() {
  const theme = THEMES[state.settings.theme] || THEMES.green;
  const alpha = clamp(state.settings.bubbleOpacity, BUBBLE_OPACITY_RANGE.min, BUBBLE_OPACITY_RANGE.max) / 100;
  const panelAlpha = clamp(state.settings.panelOpacity, PANEL_OPACITY_RANGE.min, PANEL_OPACITY_RANGE.max) / 100;
  const bubbleSize = clamp(Number(state.settings.bubbleSize || 84), BUBBLE_SIZE_RANGE.min, BUBBLE_SIZE_RANGE.max);
  const bubbleImagePath = state.settings.bubbleImageMode === "image" && state.settings.bubbleImagePath ? cssUrl(state.settings.bubbleImagePath) : "";
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
  document.documentElement.style.setProperty("--bubble-content-alpha", String(clamp(alpha + 0.12, 0.52, 1)));
  document.documentElement.style.setProperty("--bubble-size", `${bubbleSize}px`);
  document.documentElement.style.setProperty("--bubble-icon-size", `${Math.round(bubbleSize * 0.74)}px`);
  document.documentElement.style.setProperty("--bubble-ring-size", `${Math.max(0, bubbleSize - 4)}px`);
  document.documentElement.style.setProperty("--bubble-icon-image", bubbleImagePath ? `url("${bubbleImagePath}")` : "url(\"assets/qingping-bubble-icon.png\")");
  document.documentElement.style.setProperty("--panel-alpha", String(panelAlpha));
  document.documentElement.style.setProperty("--panel-card-alpha", String(clamp(panelAlpha - 0.2, 0.38, 0.9)));
  document.documentElement.style.setProperty("--panel-bg-strong", String(clamp(panelAlpha - 0.1, 0.42, 0.96)));
  document.documentElement.style.setProperty("--panel-bg-soft", String(clamp(panelAlpha - 0.22, 0.3, 0.9)));
  document.documentElement.style.setProperty("--panel-wash-alpha", String(clamp((panelAlpha - 0.54) * 0.72, 0.08, 0.3)));
  document.documentElement.style.setProperty("--panel-border-alpha", String(clamp(panelAlpha - 0.08, 0.42, 0.92)));
  document.documentElement.style.setProperty("--panel-shadow-alpha", String(clamp((1 - panelAlpha) * 0.42, 0.02, 0.14)));
  document.body.dataset.theme = state.settings.theme;
  document.body.dataset.bubbleImage = state.settings.bubbleImageMode || "watercolor";
  const imagePath = state.settings.backgroundMode === "image" && state.settings.backgroundImagePath ? cssUrl(state.settings.backgroundImagePath) : "";
  document.documentElement.style.setProperty("--custom-bg-image", imagePath ? `url("${imagePath}")` : "none");
  const preset = BACKGROUNDS[state.settings.backgroundPreset] || BACKGROUNDS.dew;
  document.documentElement.style.setProperty("--panel-bg", imagePath ? `linear-gradient(rgba(255,255,255,${clamp(panelAlpha - 0.28, 0.32, 0.7)}), rgba(255,255,255,${clamp(panelAlpha - 0.18, 0.42, 0.8)})), url("${imagePath}") center/cover` : preset.wash);
  desktopBridge?.setBubbleSize?.(bubbleSize).catch(() => {});
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
  playRestSound();
  document.body.classList.add("is-resting");
  restToastOffset = { x: 0, y: 0 };
  applyRestToastOffset();
  els.restToast.hidden = false;
  els.restToast.classList.remove("is-leaving");
  window.clearTimeout(showRestToast.timer);
  window.clearTimeout(hideRestToast.timer);
  stopRestTimer();
  restRemainingSeconds = state.settings.restTimerEnabled ? clamp(Number(state.settings.restMinutes || 5), 1, 60) * 60 : 0;
  els.restMessage.textContent = "起身喝口水，看一眼远处，再把心轻轻放回来。";
  renderRestCountdown();
  if (restRemainingSeconds > 0) {
    restTimerId = window.setInterval(() => {
      restRemainingSeconds = Math.max(0, restRemainingSeconds - 1);
      renderRestCountdown();
      if (restRemainingSeconds <= 0) {
        stopRestTimer();
        els.restMessage.textContent = "休息好了，等风停一停，再继续向前。";
        showRestToast.timer = window.setTimeout(hideRestToast, 5200);
      }
    }, 1000);
  } else {
    showRestToast.timer = window.setTimeout(hideRestToast, 6500);
  }
}

function hideRestToast() {
  stopRestTimer();
  document.body.classList.remove("is-resting");
  els.restToast.classList.add("is-leaving");
  window.clearTimeout(showRestToast.timer);
  window.clearTimeout(hideRestToast.timer);
  hideRestToast.timer = window.setTimeout(() => {
    els.restToast.hidden = true;
    els.restToast.classList.remove("is-leaving");
  }, 220);
}

function stopRestTimer() {
  if (restTimerId) window.clearInterval(restTimerId);
  restTimerId = 0;
}

function renderRestCountdown() {
  if (!state.settings.restTimerEnabled || restRemainingSeconds <= 0) {
    els.restCountdown.hidden = true;
    els.restCountdown.textContent = "";
    return;
  }
  els.restCountdown.hidden = false;
  els.restCountdown.textContent = `休息 ${formatSeconds(restRemainingSeconds)}`;
}

function playRestSound() {
  const preset = state.settings.soundPreset;
  if (preset === "none") return;
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextCtor) return;
  try {
    audioContext = audioContext || new AudioContextCtor();
    if (audioContext.state === "suspended") audioContext.resume();
    const now = audioContext.currentTime;
    if (preset === "dew") {
      playTone(740, now, 0.11, "sine", 0.045);
      playTone(980, now + 0.16, 0.12, "triangle", 0.035);
      return;
    }
    if (preset === "wind") {
      playTone(420, now, 0.28, "sine", 0.025);
      playTone(540, now + 0.08, 0.36, "sine", 0.022);
      return;
    }
    playTone(660, now, 0.14, "triangle", 0.04);
    playTone(880, now + 0.13, 0.18, "triangle", 0.036);
    playTone(1320, now + 0.28, 0.2, "sine", 0.025);
  } catch (error) {
    console.warn("Failed to play Qingping rest sound:", error);
  }
}

function playTone(frequency, startAt, duration, type = "sine", volume = 0.035) {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startAt);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.03);
}

function onBubblePointerDown(event) {
  startBubbleDrag(event, els.bubble);
}

function onRestToastPointerDown(event) {
  if (event.target.closest("button")) return;
  event.preventDefault();
  if (currentWindowMode === "bubble") {
    startBubbleDrag(event, els.restToast);
    return;
  }
  startRestToastDrag(event);
}

function startBubbleDrag(event, surface) {
  bubblePointer = { id: event.pointerId, startX: event.clientX, startY: event.clientY };
  bubbleDragSurface = surface;
  bubbleMoved = false;
  surface.setPointerCapture(event.pointerId);
  els.bubble.classList.add("is-dragging");
  if (surface === els.restToast) els.restToast.classList.add("is-dragging");
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

function onRestToastPointerMove(event) {
  if (restToastPointer && event.pointerId === restToastPointer.id) {
    const dx = event.clientX - restToastPointer.startX;
    const dy = event.clientY - restToastPointer.startY;
    if (Math.abs(dx) + Math.abs(dy) > 3) restToastPointer.moved = true;
    const limits = getRestToastDragLimits();
    restToastOffset = {
      x: clamp(restToastPointer.originX + dx, limits.minX, limits.maxX),
      y: clamp(restToastPointer.originY + dy, limits.minY, limits.maxY)
    };
    applyRestToastOffset();
    return;
  }
  onBubblePointerMove(event);
}

function onBubblePointerUp(event) {
  if (!bubblePointer || event.pointerId !== bubblePointer.id) return;
  releaseBubblePointer(event);
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
  bubbleDragSurface = null;
}

function onRestToastPointerUp(event) {
  if (restToastPointer && event.pointerId === restToastPointer.id) {
    releaseRestToastPointer(event);
    finishRestToastDrag();
    restToastPointer = null;
    return;
  }
  if (!bubblePointer || event.pointerId !== bubblePointer.id) return;
  const shouldOpen = !bubbleMoved;
  releaseBubblePointer(event);
  finishBubbleDrag();
  bubblePointer = null;
  bubbleDragSurface = null;
  if (shouldOpen) {
    hideRestToast();
    setAppWindowMode("panel");
  }
}

function onBubblePointerCancel(event) {
  if (bubblePointer) releaseBubblePointer(event);
  finishBubbleDrag();
  bubblePointer = null;
  bubbleDragSurface = null;
}

function onRestToastPointerCancel(event) {
  if (restToastPointer && event.pointerId === restToastPointer.id) {
    releaseRestToastPointer(event);
    finishRestToastDrag();
    restToastPointer = null;
    return;
  }
  if (bubblePointer) releaseBubblePointer(event);
  finishBubbleDrag();
  bubblePointer = null;
  bubbleDragSurface = null;
}

function startRestToastDrag(event) {
  restToastPointer = {
    id: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    originX: restToastOffset.x,
    originY: restToastOffset.y,
    moved: false
  };
  els.restToast.setPointerCapture(event.pointerId);
  els.restToast.classList.add("is-dragging");
}

function releaseRestToastPointer(event) {
  if (els.restToast.hasPointerCapture?.(event.pointerId)) els.restToast.releasePointerCapture(event.pointerId);
}

function finishRestToastDrag() {
  els.restToast.classList.remove("is-dragging");
}

function getRestToastDragLimits() {
  const rect = els.restToast.getBoundingClientRect();
  const margin = 10;
  const baseLeft = (window.innerWidth - rect.width) / 2;
  const baseTop = window.innerHeight - rect.height - 18;
  const minX = margin - baseLeft;
  const maxX = window.innerWidth - margin - rect.width - baseLeft;
  const minY = margin - baseTop;
  const maxY = window.innerHeight - margin - rect.height - baseTop;
  return {
    minX: Math.min(minX, maxX),
    maxX: Math.max(minX, maxX),
    minY: Math.min(minY, maxY),
    maxY: Math.max(minY, maxY)
  };
}

function applyRestToastOffset() {
  els.restToast.style.setProperty("--rest-toast-x", `${restToastOffset.x}px`);
  els.restToast.style.setProperty("--rest-toast-y", `${restToastOffset.y}px`);
}

function releaseBubblePointer(event) {
  const surface = bubbleDragSurface || els.bubble;
  if (surface.hasPointerCapture?.(event.pointerId)) surface.releasePointerCapture(event.pointerId);
}

function finishBubbleDrag() {
  els.bubble.classList.remove("is-dragging");
  els.restToast.classList.remove("is-dragging");
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

function getTodayOpenTasks(day = todayKey()) {
  return state.tasks.filter((task) => isTodayOpenTask(task, day));
}

function isTodayOpenTask(task, day = todayKey()) {
  return Boolean(task) && isSameDay(task.createdAt, day);
}

function getCurrentTask() {
  const task = state.tasks.find((item) => item.id === state.timer.taskId) || null;
  return isTodayOpenTask(task) ? task : null;
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

function getTodayFocusSeconds() {
  const key = todayKey();
  const taskSeconds = state.tasks.reduce((sum, task) => sum + getTaskDaySeconds(task, key), 0);
  const historySeconds = state.history.reduce((sum, task) => sum + getTaskDaySeconds(task, key), 0);
  return taskSeconds + historySeconds;
}

function getTodayReviewDistribution() {
  const day = todayKey();
  const bucket = new Map();
  [...state.tasks, ...state.history].forEach((task) => {
    const seconds = getTaskDaySeconds(task, day);
    if (!seconds) return;
    const key = getReviewTaskKey(task);
    const entry = bucket.get(key) || {
      title: task.title || "未命名任务",
      tag: task.tag || "未分类",
      seconds: 0,
      sessions: 0
    };
    entry.seconds += seconds;
    entry.sessions += countTaskSessionsForDay(task, day);
    bucket.set(key, entry);
  });
  return [...bucket.values()].sort((a, b) => b.seconds - a.seconds);
}

function getReviewTaskKey(task) {
  const title = String(task?.title || "未命名任务").trim().replace(/\s+/g, " ").toLowerCase();
  const tag = String(task?.tag || "未分类").trim().replace(/\s+/g, " ").toLowerCase();
  return `${title}::${tag}`;
}

function countTaskSessionsForDay(task, day) {
  return (task?.sessions || []).filter((session) => isSameDay(session.endedAt, day)).length;
}

function getReviewBalance(items, topShare) {
  if (!items.length) return "未开始";
  if (items.length === 1) return "单线推进";
  if (topShare >= 0.72) return "主线清晰";
  if (topShare <= 0.42) return "分布均衡";
  return "节奏稳定";
}

function getReviewInsight(items, total, topShare) {
  if (!items.length || !total) return "开始一段专注后，这里会记录今天的时间分布。";
  if (items.length === 1) return "今日专注集中在一项任务。";
  if (topShare >= 0.72) return "今日专注明显集中。";
  if (topShare <= 0.42) return "今日专注分布较均衡。";
  return "今日专注节奏较稳定。";
}

function getTaskDaySeconds(task, day) {
  const daily = task?.dailySeconds && typeof task.dailySeconds === "object" ? Number(task.dailySeconds[day] || 0) : 0;
  if (daily > 0) return daily;
  return (task?.sessions || []).reduce((sum, session) => {
    return isSameDay(session.endedAt, day) ? sum + (Number(session.seconds) || 0) : sum;
  }, 0);
}

function makeTask(title, minutes = DEFAULT_FOCUS_MINUTES, tag = "") {
  return { id: makeId(), title, minutes, tag, actualSeconds: 0, dailySeconds: {}, sessions: [], createdAt: new Date().toISOString() };
}

function migrateTask(task = {}) {
  const sessions = Array.isArray(task.sessions) ? task.sessions.map(migrateSession) : [];
  return {
    id: task.id || makeId(),
    title: task.title || "未命名任务",
    minutes: clamp(Number(task.minutes || task.duration || DEFAULT_FOCUS_MINUTES), 1, 240),
    tag: task.tag || "",
    actualSeconds: Number(task.actualSeconds || 0),
    dailySeconds: migrateDailySeconds(task.dailySeconds, sessions),
    sessions,
    createdAt: task.createdAt || new Date().toISOString()
  };
}

function migrateHistoryItem(task = {}) {
  return { ...migrateTask(task), completedAt: task.completedAt || new Date().toISOString() };
}

function migrateSession(session = {}) {
  const endedAt = session.endedAt || new Date().toISOString();
  const seconds = Math.max(0, Number(session.seconds || 0));
  return {
    seconds,
    mode: ["countdown", "countup"].includes(session.mode) ? session.mode : "countdown",
    startedAt: session.startedAt || "",
    endedAt
  };
}

function migrateDailySeconds(dailySeconds, sessions = []) {
  const result = {};
  if (dailySeconds && typeof dailySeconds === "object") {
    Object.entries(dailySeconds).forEach(([day, seconds]) => {
      if (/^\d{4}-\d{2}-\d{2}$/.test(day)) result[day] = Math.max(0, Number(seconds || 0));
    });
  }
  sessions.forEach((session) => {
    const day = getLocalDayKey(session.endedAt);
    if (!result[day]) result[day] = Math.max(0, Number(session.seconds || 0));
  });
  return result;
}

function migrateTimer(timer = {}) {
  const mode = ["countdown", "countup"].includes(timer.mode) ? timer.mode : "countdown";
  const seconds = Number(timer.seconds);
  const totalSeconds = Number(timer.totalSeconds);
  return {
    taskId: timer.taskId || "",
    mode,
    seconds: Math.max(0, Number.isFinite(seconds) ? seconds : (mode === "countup" ? 0 : DEFAULT_FOCUS_SECONDS)),
    totalSeconds: Math.max(1, Number.isFinite(totalSeconds) && totalSeconds > 0 ? totalSeconds : DEFAULT_FOCUS_SECONDS),
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
  if (typeof value === "string") return { title: `${key} 回顾`, content: value, moodScore: 0, updatedAt: "" };
  const content = String(value?.content || value?.markdown || value?.body || "");
  const score = Number(value?.moodScore || 0) || MOOD_MAP[value?.mood] || 0;
  return { title: String(value?.title || ""), content, moodScore: clamp(score, 0, 5), updatedAt: value?.updatedAt || "" };
}

function migrateStagePlans(plans) {
  if (!Array.isArray(plans)) return [];
  return plans.map((plan) => ({
    id: plan.id || makeId(),
    title: String(plan.title || "未命名阶段计划"),
    overallGoal: String(plan.overallGoal || plan.goal || ""),
    route: String(plan.route || ""),
    notes: String(plan.notes || ""),
    status: PLAN_STATUS[plan.status] ? plan.status : "active",
    progress: clamp(Number(plan.progress || 0), 0, 100),
    startDate: /^\d{4}-\d{2}-\d{2}$/.test(plan.startDate || "") ? plan.startDate : "",
    dueDate: /^\d{4}-\d{2}-\d{2}$/.test(plan.dueDate || "") ? plan.dueDate : "",
    milestones: migrateMilestones(plan.milestones, plan.goal),
    updatedAt: plan.updatedAt || new Date().toISOString()
  })).slice(0, 30);
}

function migrateMilestones(milestones, legacyGoal = "") {
  if (Array.isArray(milestones)) {
    return milestones.map((item) => ({
      id: item.id || makeId(),
      title: String(item.title || item.goal || "未命名阶段目标"),
      done: Boolean(item.done),
      startDate: normalizeDateInput(item.startDate),
      dueDate: normalizeDateInput(item.dueDate),
      notes: String(item.notes || item.note || ""),
      createdAt: item.createdAt || new Date().toISOString()
    })).slice(0, 40);
  }
  const goal = String(legacyGoal || "").trim();
  return goal ? [{ id: makeId(), title: goal, done: false, startDate: "", dueDate: "", notes: "", createdAt: new Date().toISOString() }] : [];
}

function migrateSettings(settings = {}) {
  const theme = settings.theme === "lotus" ? "violet" : settings.theme;
  const hasImage = Boolean(settings.backgroundImagePath);
  const wantsImage = settings.backgroundMode === "image" || settings.backgroundPreset === "image";
  const savedPreset = BACKGROUNDS[settings.backgroundPreset] ? settings.backgroundPreset : "dew";
  const activeView = normalizeViewName(settings.activeView || "today");
  const reviewChartMode = settings.reviewChartMode === "bars" ? "ripple" : (REVIEW_CHART_MODES.includes(settings.reviewChartMode) ? settings.reviewChartMode : "ring");
  const bubbleImageMode = BUBBLE_IMAGE_MODES.includes(settings.bubbleImageMode) ? settings.bubbleImageMode : "watercolor";
  const bubbleImagePath = settings.bubbleImagePath || "";
  return {
    ...settings,
    activeView: ["today", "focus", "knowledge", "plan"].includes(activeView) ? activeView : "today",
    theme: THEMES[theme] ? theme : "green",
    tags: Array.from(new Set([...(Array.isArray(settings.tags) ? settings.tags : []), ...DEFAULT_TAGS].filter(Boolean))),
    showBubbleTimer: settings.showBubbleTimer !== false,
    soundPreset: REST_SOUND_PRESETS.includes(settings.soundPreset) ? settings.soundPreset : "chime",
    restTimerEnabled: settings.restTimerEnabled !== false,
    restMinutes: clamp(Number(settings.restMinutes || 5), 1, 60),
    reviewChartMode,
    bubbleOpacity: clamp(Number(settings.bubbleOpacity || 70), BUBBLE_OPACITY_RANGE.min, BUBBLE_OPACITY_RANGE.max),
    bubbleSize: clamp(Number(settings.bubbleSize || 84), BUBBLE_SIZE_RANGE.min, BUBBLE_SIZE_RANGE.max),
    bubbleImageMode: bubbleImageMode === "image" && !bubbleImagePath ? "watercolor" : bubbleImageMode,
    bubbleImagePath,
    panelOpacity: clamp(Number(settings.panelOpacity || 92), PANEL_OPACITY_RANGE.min, PANEL_OPACITY_RANGE.max),
    backgroundMode: wantsImage && hasImage ? "image" : "preset",
    backgroundPreset: wantsImage && hasImage ? "image" : savedPreset,
    backgroundImagePath: settings.backgroundImagePath || "",
    panelBlur: clamp(Number(settings.panelBlur || 18), 8, 30)
  };
}

function opacityToTransparency(value, range) {
  return 100 - clamp(Number(value || range.max), range.min, range.max);
}

function transparencyToOpacity(value, range) {
  return clamp(100 - Number(value || 0), range.min, range.max);
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

function formatCompletedMeta(task, day = todayKey()) {
  return [
    task.tag || "未分类",
    formatSessionPeriodForDay(task.sessions, day, task.completedAt),
    formatFocus(getTaskDaySeconds(task, day))
  ].filter(Boolean).join(" · ");
}

function formatSessionPeriodForDay(sessions = [], day = todayKey(), fallbackTime = "") {
  const daySessions = sessions
    .filter((session) => isSameDay(session.endedAt, day))
    .sort((a, b) => new Date(a.endedAt) - new Date(b.endedAt));
  const firstWithStart = daySessions.find((session) => session.startedAt);
  const last = daySessions[daySessions.length - 1];
  if (firstWithStart && last) return `${formatDateTime(firstWithStart.startedAt)}-${formatDateTime(last.endedAt)}`;
  if (last?.endedAt) return formatDateTime(last.endedAt);
  return formatDateTime(fallbackTime);
}

function formatSessionsForDay(sessions = [], day = todayKey()) {
  const lines = sessions.filter((session) => isSameDay(session.endedAt, day));
  return lines.length ? lines.map((session) => formatFocus(session.seconds)).join(" / ") : "暂无分段记录";
}

function totalSessionSeconds(sessions = []) {
  return sessions.reduce((sum, session) => sum + (session.seconds || 0), 0);
}

function sumDailySeconds(dailySeconds = {}) {
  return Object.values(dailySeconds || {}).reduce((sum, seconds) => sum + (Number(seconds) || 0), 0);
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

function isSameDay(value, day) {
  return getLocalDayKey(value) === day;
}

function normalizeViewName(view) {
  return view === "history" ? "plan" : view;
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
