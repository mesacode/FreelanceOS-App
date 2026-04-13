import { ipcMain } from "electron";
import { db } from "../lib/db";

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function toActivityTime(value: Date) {
  return value.toISOString();
}

export function registerDashboardIpc() {
  ipcMain.handle("dashboard:summary", async () => {
    const now = new Date();
    const monthStart = startOfMonth(now);

    const [incomes, expenses, activeCustomerCount, pendingReminderCount] = await Promise.all([
      db.income.findMany({
        where: { date: { gte: monthStart, lte: now } },
        select: { amount: true }
      }),
      db.expense.findMany({
        where: { date: { gte: monthStart, lte: now } },
        select: { amount: true }
      }),
      db.customer.count({
        where: { status: "ACTIVE" }
      }),
      db.reminder.count({
        where: { isCompleted: false }
      })
    ]);

    const monthlyIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
    const monthlyExpense = expenses.reduce((sum, item) => sum + item.amount, 0);

    return {
      monthlyIncome,
      monthlyExpense,
      netBalance: monthlyIncome - monthlyExpense,
      activeCustomerCount,
      pendingReminderCount
    };
  });

  ipcMain.handle("dashboard:activities", async () => {
    const [customers, incomes, expenses, reminders, templates, settings] = await Promise.all([
      db.customer.findMany({
        orderBy: { updatedAt: "desc" },
        take: 5
      }),
      db.income.findMany({
        orderBy: { createdAt: "desc" },
        take: 5
      }),
      db.expense.findMany({
        orderBy: { createdAt: "desc" },
        take: 5
      }),
      db.reminder.findMany({
        orderBy: { createdAt: "desc" },
        take: 5
      }),
      db.whatsappTemplate.findMany({
        orderBy: { updatedAt: "desc" },
        take: 5
      }),
      db.setting.findMany({
        orderBy: { updatedAt: "desc" },
        take: 5
      })
    ]);

    const activities = [
      ...customers.map((item) => ({
        id: `customer-${item.id}`,
        title: "Musteri guncellendi",
        description: item.fullName,
        createdAt: toActivityTime(item.updatedAt),
        entityType: "CUSTOMER" as const
      })),
      ...incomes.map((item) => ({
        id: `income-${item.id}`,
        title: "Gelir kaydi",
        description: item.title,
        createdAt: toActivityTime(item.createdAt),
        entityType: "INCOME" as const
      })),
      ...expenses.map((item) => ({
        id: `expense-${item.id}`,
        title: "Gider kaydi",
        description: item.title,
        createdAt: toActivityTime(item.createdAt),
        entityType: "EXPENSE" as const
      })),
      ...reminders.map((item) => ({
        id: `reminder-${item.id}`,
        title: "Hatirlatma",
        description: item.title,
        createdAt: toActivityTime(item.createdAt),
        entityType: "REMINDER" as const
      })),
      ...templates.map((item) => ({
        id: `template-${item.id}`,
        title: "WhatsApp sablonu",
        description: item.name,
        createdAt: toActivityTime(item.updatedAt),
        entityType: "WHATSAPP_TEMPLATE" as const
      })),
      ...settings.map((item) => ({
        id: `setting-${item.id}`,
        title: "Ayar guncellendi",
        description: item.key,
        createdAt: toActivityTime(item.updatedAt),
        entityType: "SETTING" as const
      }))
    ];

    activities.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return activities.slice(0, 12);
  });
}
