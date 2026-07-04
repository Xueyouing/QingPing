const { app, BrowserWindow, Menu, Tray, nativeImage, shell, ipcMain, Notification, screen, dialog } = require("electron");
const fs = require("node:fs");
const path = require("node:path");

let mainWindow;
let tray;
let windowMode = "bubble";
let panelBounds = null;
let dragOffset = null;
let resizeState = null;
let modeSwitchToken = 0;

const BUBBLE_SIZE = 84;
const PANEL_SIZE = { width: 520, height: 720 };
const PANEL_MIN_SIZE = { width: 500, height: 660 };
const VISIBLE_MARGIN = 28;

function getStatePath() {
  return path.join(app.getPath("userData"), "qingping-state.json");
}

function getHistoryPath() {
  return path.join(app.getPath("userData"), "qingping-history.json");
}

function readStateFile() {
  try {
    const file = getStatePath();
    if (!fs.existsSync(file)) return null;
    const state = JSON.parse(fs.readFileSync(file, "utf8"));
    const historyFile = getHistoryPath();
    if ((!state.history || !state.history.length) && fs.existsSync(historyFile)) {
      state.history = JSON.parse(fs.readFileSync(historyFile, "utf8"));
    }
    return state;
  } catch (error) {
    console.error("Failed to read Qingping state:", error);
    return null;
  }
}

function writeStateFile(state) {
  const file = getStatePath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tempFile = `${file}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(state, null, 2), "utf8");
  fs.renameSync(tempFile, file);
  fs.writeFileSync(getHistoryPath(), JSON.stringify(state?.history || [], null, 2), "utf8");
  return true;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function keepBoundsVisible(bounds) {
  const display = screen.getDisplayMatching(bounds).workArea;
  return {
    ...bounds,
    x: clamp(bounds.x, display.x - bounds.width + VISIBLE_MARGIN, display.x + display.width - VISIBLE_MARGIN),
    y: clamp(bounds.y, display.y - bounds.height + VISIBLE_MARGIN, display.y + display.height - VISIBLE_MARGIN)
  };
}

function fitBoundsToDisplay(bounds) {
  const display = screen.getDisplayMatching(bounds).workArea;
  return {
    ...bounds,
    x: clamp(bounds.x, display.x, display.x + display.width - bounds.width),
    y: clamp(bounds.y, display.y, display.y + display.height - bounds.height)
  };
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function setWindowMode(mode) {
  if (!mainWindow || !["bubble", "panel"].includes(mode)) return windowMode;
  if (mode === windowMode && mainWindow.isVisible()) {
    if (mode === "bubble") {
      const current = mainWindow.getBounds();
      if (current.width !== BUBBLE_SIZE || current.height !== BUBBLE_SIZE) {
        mainWindow.setBounds(keepBoundsVisible({
          x: current.x + current.width - BUBBLE_SIZE,
          y: current.y,
          width: BUBBLE_SIZE,
          height: BUBBLE_SIZE
        }), false);
      }
    }
    applyWindowShape(mode);
    return windowMode;
  }

  const current = mainWindow.getBounds();
  const token = ++modeSwitchToken;
  windowMode = mode;
  mainWindow.webContents.send("qingping:window:mode:prepare", mode);
  await delay(16);
  if (!mainWindow || token !== modeSwitchToken) return windowMode;

  if (mode === "panel") {
    const next = fitBoundsToDisplay(panelBounds || {
      x: current.x + current.width - PANEL_SIZE.width,
      y: current.y,
      width: PANEL_SIZE.width,
      height: PANEL_SIZE.height
    });
    mainWindow.setResizable(false);
    mainWindow.setMinimumSize(PANEL_MIN_SIZE.width, PANEL_MIN_SIZE.height);
    mainWindow.setBounds(next, false);
    applyWindowShape("panel");
    await delay(16);
    if (!mainWindow || token !== modeSwitchToken) return windowMode;
    mainWindow.webContents.send("qingping:window:mode:commit", "panel");
    await delay(32);
    if (mainWindow && token === modeSwitchToken) mainWindow.setResizable(true);
    return windowMode;
  }

  if (current.width > BUBBLE_SIZE || current.height > BUBBLE_SIZE) panelBounds = current;
  const next = keepBoundsVisible({
    x: current.x + current.width - BUBBLE_SIZE,
    y: current.y,
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE
  });
  mainWindow.setMinimumSize(BUBBLE_SIZE, BUBBLE_SIZE);
  mainWindow.setResizable(false);
  mainWindow.setBounds(next, false);
  applyWindowShape("bubble");
  await delay(16);
  if (mainWindow && token === modeSwitchToken) mainWindow.webContents.send("qingping:window:mode:commit", "bubble");
  return windowMode;
}

function applyWindowShape(mode) {
  if (!mainWindow || typeof mainWindow.setShape !== "function") return;
  try {
    if (mode === "panel") {
      mainWindow.setShape([]);
      return;
    }
    const size = BUBBLE_SIZE;
    const radius = size / 2;
    const step = 3;
    const bands = [];
    for (let y = 0; y < size; y += step) {
      const height = Math.min(step, size - y);
      const yMid = y + height / 2;
      const halfWidth = Math.sqrt(Math.max(0, radius * radius - (yMid - radius) ** 2));
      const x = Math.floor(radius - halfWidth);
      bands.push({ x, y, width: Math.ceil(halfWidth * 2), height });
    }
    mainWindow.setShape(bands);
  } catch (error) {
    console.warn("Failed to update Qingping window shape:", error);
  }
}

function beginWindowDrag(screenX, screenY) {
  if (!mainWindow) return;
  const bounds = mainWindow.getBounds();
  dragOffset = {
    x: Number(screenX || 0) - bounds.x,
    y: Number(screenY || 0) - bounds.y
  };
}

function dragWindowTo(screenX, screenY) {
  if (!mainWindow || !dragOffset) return;
  mainWindow.setPosition(
    Math.round(Number(screenX || 0) - dragOffset.x),
    Math.round(Number(screenY || 0) - dragOffset.y),
    false
  );
}

function endWindowDrag() {
  if (!mainWindow) {
    dragOffset = null;
    return;
  }
  mainWindow.setBounds(keepBoundsVisible(mainWindow.getBounds()), false);
  if (windowMode === "panel") panelBounds = mainWindow.getBounds();
  dragOffset = null;
}

function moveWindowBy(deltaX, deltaY) {
  if (!mainWindow) return null;
  const bounds = mainWindow.getBounds();
  const next = keepBoundsVisible({
    ...bounds,
    x: bounds.x + Math.round(Number(deltaX || 0)),
    y: bounds.y + Math.round(Number(deltaY || 0))
  });
  mainWindow.setBounds(next, false);
  if (windowMode === "panel") panelBounds = mainWindow.getBounds();
  return mainWindow.getBounds();
}

function beginWindowResize(edge, screenX, screenY) {
  if (!mainWindow || windowMode !== "panel") return;
  resizeState = {
    edge,
    startX: Number(screenX || 0),
    startY: Number(screenY || 0),
    bounds: mainWindow.getBounds()
  };
}

function resizeWindowTo(screenX, screenY) {
  if (!mainWindow || !resizeState) return;
  const dx = Number(screenX || 0) - resizeState.startX;
  const dy = Number(screenY || 0) - resizeState.startY;
  const next = { ...resizeState.bounds };
  const edge = resizeState.edge || "";

  if (edge.includes("e")) next.width = Math.max(PANEL_MIN_SIZE.width, resizeState.bounds.width + dx);
  if (edge.includes("s")) next.height = Math.max(PANEL_MIN_SIZE.height, resizeState.bounds.height + dy);
  if (edge.includes("w")) {
    const width = Math.max(PANEL_MIN_SIZE.width, resizeState.bounds.width - dx);
    next.x = resizeState.bounds.x + resizeState.bounds.width - width;
    next.width = width;
  }
  if (edge.includes("n")) {
    const height = Math.max(PANEL_MIN_SIZE.height, resizeState.bounds.height - dy);
    next.y = resizeState.bounds.y + resizeState.bounds.height - height;
    next.height = height;
  }

  mainWindow.setBounds(keepBoundsVisible(next), false);
}

function endWindowResize() {
  if (!mainWindow) {
    resizeState = null;
    return;
  }
  panelBounds = mainWindow.getBounds();
  resizeState = null;
}

async function chooseBackgroundImage() {
  if (!mainWindow) return "";
  const result = await dialog.showOpenDialog(mainWindow, {
    title: "选择青萍背景图片",
    properties: ["openFile"],
    filters: [{ name: "图片", extensions: ["png", "jpg", "jpeg", "webp"] }]
  });
  return result.canceled ? "" : result.filePaths[0] || "";
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: PANEL_SIZE.width,
    height: PANEL_SIZE.height,
    minWidth: PANEL_MIN_SIZE.width,
    minHeight: PANEL_MIN_SIZE.height,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: true,
    show: false,
    backgroundColor: "#00000000",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js")
    }
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));
  mainWindow.once("ready-to-show", async () => {
    await setWindowMode("panel");
    mainWindow.show();
  });
  mainWindow.on("resize", () => {
    if (windowMode === "panel" && !resizeState) panelBounds = mainWindow.getBounds();
  });
  mainWindow.on("move", () => {
    if (windowMode === "panel" && !dragOffset && !resizeState) panelBounds = mainWindow.getBounds();
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function createTrayIcon() {
  const candidates = ["qingping-tray.ico", "qingping-tray.png", "qingping-lily-clock.png", "qingping-tray.svg"];
  for (const fileName of candidates) {
    const icon = nativeImage.createFromPath(path.join(__dirname, "assets", fileName));
    if (!icon.isEmpty()) return icon;
  }
  return nativeImage.createFromDataURL([
    "data:image/svg+xml;utf8,",
    encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'><rect width='32' height='32' rx='8' fill='#4caf50'/><path d='M8 17c8-11 16-7 13 5-7 1-12 0-13-5Z' fill='#fff'/></svg>")
  ].join(""));
}

function createTray() {
  tray = new Tray(createTrayIcon());
  tray.setToolTip("青萍桌面助手");
  tray.setContextMenu(Menu.buildFromTemplate([
    {
      label: "展开 / 收起青萍",
      click: () => {
        if (!mainWindow) {
          createWindow();
          return;
        }
        if (!mainWindow.isVisible()) mainWindow.show();
        setWindowMode(windowMode === "panel" ? "bubble" : "panel");
      }
    },
    {
      label: "打开数据目录",
      click: () => shell.openPath(app.getPath("userData"))
    },
    { type: "separator" },
    {
      label: "退出",
      click: () => app.quit()
    }
  ]));
}

ipcMain.handle("qingping:state:load", () => readStateFile());
ipcMain.handle("qingping:state:save", (_event, state) => writeStateFile(state));
ipcMain.handle("qingping:notify", (_event, payload) => {
  if (!Notification.isSupported()) return false;
  new Notification({
    title: payload?.title || "青萍提醒",
    body: payload?.body || ""
  }).show();
  return true;
});
ipcMain.handle("qingping:auto-start:set", (_event, enabled) => {
  app.setLoginItemSettings({ openAtLogin: Boolean(enabled) });
  return app.getLoginItemSettings().openAtLogin;
});
ipcMain.handle("qingping:auto-start:get", () => app.getLoginItemSettings().openAtLogin);
ipcMain.handle("qingping:window:mode:set", (_event, mode) => setWindowMode(mode));
ipcMain.handle("qingping:window:mode:get", () => windowMode);
ipcMain.handle("qingping:window:move-by", (_event, deltaX, deltaY) => moveWindowBy(deltaX, deltaY));
ipcMain.handle("qingping:background:choose", () => chooseBackgroundImage());

ipcMain.on("qingping:window:drag:start", (_event, screenX, screenY) => beginWindowDrag(screenX, screenY));
ipcMain.on("qingping:window:drag:move", (_event, screenX, screenY) => dragWindowTo(screenX, screenY));
ipcMain.on("qingping:window:drag:end", () => endWindowDrag());
ipcMain.on("qingping:window:resize:start", (_event, edge, screenX, screenY) => beginWindowResize(edge, screenX, screenY));
ipcMain.on("qingping:window:resize:move", (_event, screenX, screenY) => resizeWindowTo(screenX, screenY));
ipcMain.on("qingping:window:resize:end", () => endWindowResize());

app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on("window-all-closed", (event) => {
  event.preventDefault();
});

app.on("activate", () => {
  if (!mainWindow) createWindow();
});
