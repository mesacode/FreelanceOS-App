<<<<<<< ours
<<<<<<< ours
import { contextBridge, ipcRenderer } from "electron";
import type {
  CreateCustomerInput,
  UpdateCustomerInput
} from "../shared/customer";
import type {
  CreateExpenseInput,
  CreateIncomeInput,
  UpdateExpenseInput,
  UpdateIncomeInput
} from "../shared/finance";
import type { CreateReminderInput, UpdateReminderInput } from "../shared/reminder";
import type {
  CreateWhatsappTemplateInput,
  UpdateWhatsappTemplateInput
} from "../shared/whatsapp";
import type { UpsertSettingInput } from "../shared/settings";

contextBridge.exposeInMainWorld("desktopAPI", {
  appName: "FreelanceOS",
  version: "0.1.0",

  customers: {
    list: () => ipcRenderer.invoke("customers:list"),
    get: (id: string) => ipcRenderer.invoke("customers:get", id),
    create: (payload: CreateCustomerInput) =>
      ipcRenderer.invoke("customers:create", payload),
    update: (payload: UpdateCustomerInput) =>
      ipcRenderer.invoke("customers:update", payload),
    delete: (id: string) => ipcRenderer.invoke("customers:delete", id)
  },

  finances: {
    incomes: {
      list: () => ipcRenderer.invoke("finances:incomes:list"),
      create: (payload: CreateIncomeInput) =>
        ipcRenderer.invoke("finances:incomes:create", payload),
      update: (payload: UpdateIncomeInput) =>
        ipcRenderer.invoke("finances:incomes:update", payload),
      delete: (id: string) => ipcRenderer.invoke("finances:incomes:delete", id)
    },
    expenses: {
      list: () => ipcRenderer.invoke("finances:expenses:list"),
      create: (payload: CreateExpenseInput) =>
        ipcRenderer.invoke("finances:expenses:create", payload),
      update: (payload: UpdateExpenseInput) =>
        ipcRenderer.invoke("finances:expenses:update", payload),
      delete: (id: string) => ipcRenderer.invoke("finances:expenses:delete", id)
    }
  },

  reminders: {
    list: () => ipcRenderer.invoke("reminders:list"),
    create: (payload: CreateReminderInput) => ipcRenderer.invoke("reminders:create", payload),
    update: (payload: UpdateReminderInput) => ipcRenderer.invoke("reminders:update", payload),
    toggle: (id: string) => ipcRenderer.invoke("reminders:toggle", id),
    delete: (id: string) => ipcRenderer.invoke("reminders:delete", id)
  },

  whatsapp: {
    list: () => ipcRenderer.invoke("whatsapp:list"),
    create: (payload: CreateWhatsappTemplateInput) =>
      ipcRenderer.invoke("whatsapp:create", payload),
    update: (payload: UpdateWhatsappTemplateInput) =>
      ipcRenderer.invoke("whatsapp:update", payload),
    delete: (id: string) => ipcRenderer.invoke("whatsapp:delete", id)
  },

  settings: {
    list: () => ipcRenderer.invoke("settings:list"),
    upsert: (payload: UpsertSettingInput) => ipcRenderer.invoke("settings:upsert", payload),
    delete: (key: string) => ipcRenderer.invoke("settings:delete", key)
  },

  dashboard: {
    summary: () => ipcRenderer.invoke("dashboard:summary"),
    activities: () => ipcRenderer.invoke("dashboard:activities")
  }
});
=======
export {};
>>>>>>> theirs
=======
export {};
>>>>>>> theirs
