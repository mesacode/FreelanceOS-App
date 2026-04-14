import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import fs from "node:fs";
import { registerCustomerIpc } from "./ipc/customer.ipc";
import { registerFinanceIpc } from "./ipc/finance.ipc";
import { registerReminderIpc } from "./ipc/reminder.ipc";
import { registerSettingsIpc } from "./ipc/settings.ipc";
import { registerWhatsappIpc } from "./ipc/whatsapp.ipc";
import { registerDashboardIpc } from "./ipc/dashboard.ipc";

const isDev = !app.isPackaged;
const isMac = process.platform === "darwin";

function getActiveWindow() {
  return BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0] ?? null;
}

function registerWindowIpc() {
  ipcMain.handle("window:minimize", () => {
    const win = getActiveWindow();
    if (win && !win.isDestroyed()) win.minimize();
  });

  ipcMain.handle("window:toggle-maximize", () => {
    const win = getActiveWindow();
    if (!win || win.isDestroyed()) return false;
    if (win.isMaximized()) {
      win.unmaximize();
      return false;
    }
    win.maximize();
    return true;
  });

  ipcMain.handle("window:close", () => {
    const win = getActiveWindow();
    if (win && !win.isDestroyed()) win.close();
  });

  ipcMain.handle("window:is-maximized", () => {
    const win = getActiveWindow();
    return Boolean(win && !win.isDestroyed() && win.isMaximized());
  });
}

function resolveRendererHtmlPath() {
  const candidates = [
    path.join(__dirname, "../dist/index.html"),
    path.join(__dirname, "../../dist/index.html")
  ];

  const found = candidates.find((candidate) => fs.existsSync(candidate));
  return found ?? candidates[candidates.length - 1];
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1024,
    minHeight: 680,
    frame: isMac,
    titleBarStyle: isMac ? "hiddenInset" : "hidden",
    titleBarOverlay: isMac
      ? false
      : {
          color: "#131824",
          symbolColor: "#e2e8f0",
          height: 42
        },
    backgroundColor: "#09090b",
    title: "FreelanceOS",
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.on("maximize", () => {
    win.webContents.send("window:maximized-changed", true);
  });

  win.on("unmaximize", () => {
    win.webContents.send("window:maximized-changed", false);
  });

  if (isDev) {
    void win.loadURL("http://localhost:5173");
  } else {
    void win.loadFile(resolveRendererHtmlPath());
  }

  win.once("ready-to-show", () => {
    win.show();
  });
}

app.whenReady().then(() => {
  registerWindowIpc();
  registerCustomerIpc();
  registerFinanceIpc();
  registerReminderIpc();
  registerWhatsappIpc();
  registerSettingsIpc();
  registerDashboardIpc();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
