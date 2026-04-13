<<<<<<< ours
<<<<<<< ours
import { app, BrowserWindow } from "electron";
import path from "node:path";
import { registerCustomerIpc } from "./ipc/customer.ipc";
import { registerFinanceIpc } from "./ipc/finance.ipc";
import { registerReminderIpc } from "./ipc/reminder.ipc";
import { registerSettingsIpc } from "./ipc/settings.ipc";
import { registerWhatsappIpc } from "./ipc/whatsapp.ipc";
import { registerDashboardIpc } from "./ipc/dashboard.ipc";

const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1200,
    minHeight: 760,
    backgroundColor: "#09090b",
    title: "FreelanceOS",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (isDev) {
    void win.loadURL("http://localhost:5173");
  } else {
    void win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(() => {
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
=======
export {};
>>>>>>> theirs
=======
export {};
>>>>>>> theirs
