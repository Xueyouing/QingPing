const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("qingpingDesktop", {
  loadState: () => ipcRenderer.invoke("qingping:state:load"),
  saveState: (state) => ipcRenderer.invoke("qingping:state:save", state),
  notify: (payload) => ipcRenderer.invoke("qingping:notify", payload),
  setAutoStart: (enabled) => ipcRenderer.invoke("qingping:auto-start:set", enabled),
  getAutoStart: () => ipcRenderer.invoke("qingping:auto-start:get"),
  setWindowMode: (mode) => ipcRenderer.invoke("qingping:window:mode:set", mode),
  getWindowMode: () => ipcRenderer.invoke("qingping:window:mode:get"),
  moveWindowBy: (deltaX, deltaY) => ipcRenderer.invoke("qingping:window:move-by", deltaX, deltaY),
  beginWindowDrag: (screenX, screenY) => ipcRenderer.send("qingping:window:drag:start", screenX, screenY),
  dragWindowTo: (screenX, screenY) => ipcRenderer.send("qingping:window:drag:move", screenX, screenY),
  endWindowDrag: () => ipcRenderer.send("qingping:window:drag:end"),
  beginWindowResize: (edge, screenX, screenY) => ipcRenderer.send("qingping:window:resize:start", edge, screenX, screenY),
  resizeWindowTo: (screenX, screenY) => ipcRenderer.send("qingping:window:resize:move", screenX, screenY),
  endWindowResize: () => ipcRenderer.send("qingping:window:resize:end"),
  chooseBackgroundImage: () => ipcRenderer.invoke("qingping:background:choose"),
  onWindowMode: (callback) => {
    ipcRenderer.on("qingping:window:mode", (_event, mode) => callback(mode));
  },
  onWindowModePrepare: (callback) => {
    ipcRenderer.on("qingping:window:mode:prepare", (_event, mode) => callback(mode));
  },
  onWindowModeCommit: (callback) => {
    ipcRenderer.on("qingping:window:mode:commit", (_event, mode) => callback(mode));
  }
});
