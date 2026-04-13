import { ipcMain } from "electron";
import { db } from "../lib/db";
import type { CreateReminderInput, UpdateReminderInput } from "../../shared/reminder";

function parseDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Gecersiz tarih.");
  }
  return parsed;
}

function toReminderDto(item: Awaited<ReturnType<typeof db.reminder.create>>) {
  return {
    ...item,
    dueDate: item.dueDate.toISOString(),
    createdAt: item.createdAt.toISOString()
  };
}

async function ensureNoDuplicateReminder(
  payload: CreateReminderInput | UpdateReminderInput,
  excludeId?: string
) {
  const atTime = new Date(payload.dueDate);
  const existing = await db.reminder.findMany({
    where: {
      title: payload.title.trim(),
      dueDate: atTime,
      customerId: payload.customerId?.trim() || null
    }
  });

  if (existing.some((item) => item.id !== excludeId)) {
    throw new Error("Ayni hatirlatma zaten mevcut.");
  }
}

export function registerReminderIpc() {
  ipcMain.handle("reminders:list", async () => {
    const reminders = await db.reminder.findMany({
      orderBy: [{ isCompleted: "asc" }, { dueDate: "asc" }]
    });

    return reminders.map((item) => toReminderDto(item));
  });

  ipcMain.handle("reminders:create", async (_event, payload: CreateReminderInput) => {
    if (!payload?.title?.trim()) {
      throw new Error("Hatirlatma basligi zorunludur.");
    }

    await ensureNoDuplicateReminder(payload);

    const reminder = await db.reminder.create({
      data: {
        title: payload.title.trim(),
        description: payload.description?.trim() || null,
        dueDate: parseDate(payload.dueDate),
        customerId: payload.customerId?.trim() || null
      }
    });

    if (reminder.customerId) {
      await db.customer.update({
        where: { id: reminder.customerId },
        data: { lastContactAt: new Date() }
      });
    }

    return toReminderDto(reminder);
  });

  ipcMain.handle("reminders:update", async (_event, payload: UpdateReminderInput) => {
    if (!payload?.id) {
      throw new Error("Hatirlatma ID bulunamadi.");
    }
    if (!payload.title?.trim()) {
      throw new Error("Hatirlatma basligi zorunludur.");
    }

    await ensureNoDuplicateReminder(payload, payload.id);

    const reminder = await db.reminder.update({
      where: { id: payload.id },
      data: {
        title: payload.title.trim(),
        description: payload.description?.trim() || null,
        dueDate: parseDate(payload.dueDate),
        customerId: payload.customerId?.trim() || null,
        isCompleted: Boolean(payload.isCompleted)
      }
    });

    if (reminder.customerId) {
      await db.customer.update({
        where: { id: reminder.customerId },
        data: { lastContactAt: new Date() }
      });
    }

    return toReminderDto(reminder);
  });

  ipcMain.handle("reminders:toggle", async (_event, id: string) => {
    if (!id) {
      throw new Error("Hatirlatma ID bulunamadi.");
    }

    const current = await db.reminder.findUnique({ where: { id } });
    if (!current) {
      throw new Error("Hatirlatma bulunamadi.");
    }

    const reminder = await db.reminder.update({
      where: { id },
      data: { isCompleted: !current.isCompleted }
    });

    return toReminderDto(reminder);
  });

  ipcMain.handle("reminders:delete", async (_event, id: string) => {
    if (!id) {
      throw new Error("Hatirlatma ID bulunamadi.");
    }

    await db.reminder.delete({ where: { id } });
    return { success: true };
  });
}
