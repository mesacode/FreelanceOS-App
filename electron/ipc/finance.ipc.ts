<<<<<<< ours
<<<<<<< ours
import { ipcMain } from "electron";
import { db } from "../lib/db";
import type {
  CreateExpenseInput,
  CreateIncomeInput,
  UpdateExpenseInput,
  UpdateIncomeInput
} from "../../shared/finance";

function parseDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Gecersiz tarih.");
  }
  return parsed;
}

function assertAmount(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("Tutar sifirdan buyuk olmali.");
  }
}

function toIncomeDto(item: Awaited<ReturnType<typeof db.income.create>>) {
  return {
    ...item,
    date: item.date.toISOString(),
    createdAt: item.createdAt.toISOString()
  };
}

function toExpenseDto(item: Awaited<ReturnType<typeof db.expense.create>>) {
  return {
    ...item,
    date: item.date.toISOString(),
    createdAt: item.createdAt.toISOString()
  };
}

async function ensureNoDuplicateIncome(
  payload: CreateIncomeInput | UpdateIncomeInput,
  excludeId?: string
) {
  const sameDayStart = new Date(payload.date);
  sameDayStart.setHours(0, 0, 0, 0);
  const sameDayEnd = new Date(payload.date);
  sameDayEnd.setHours(23, 59, 59, 999);

  const existing = await db.income.findMany({
    where: {
      title: payload.title.trim(),
      amount: payload.amount,
      date: {
        gte: sameDayStart,
        lte: sameDayEnd
      },
      customerId: payload.customerId?.trim() || null
    }
  });

  if (existing.some((item) => item.id !== excludeId)) {
    throw new Error("Ayni gelir kaydi zaten mevcut.");
  }
}

async function ensureNoDuplicateExpense(
  payload: CreateExpenseInput | UpdateExpenseInput,
  excludeId?: string
) {
  const sameDayStart = new Date(payload.date);
  sameDayStart.setHours(0, 0, 0, 0);
  const sameDayEnd = new Date(payload.date);
  sameDayEnd.setHours(23, 59, 59, 999);

  const existing = await db.expense.findMany({
    where: {
      title: payload.title.trim(),
      amount: payload.amount,
      date: {
        gte: sameDayStart,
        lte: sameDayEnd
      },
      customerId: payload.customerId?.trim() || null
    }
  });

  if (existing.some((item) => item.id !== excludeId)) {
    throw new Error("Ayni gider kaydi zaten mevcut.");
  }
}

export function registerFinanceIpc() {
  ipcMain.handle("finances:incomes:list", async () => {
    const incomes = await db.income.findMany({
      orderBy: { date: "desc" }
    });

    return incomes.map((item) => toIncomeDto(item));
  });

  ipcMain.handle("finances:incomes:create", async (_event, payload: CreateIncomeInput) => {
    if (!payload?.title?.trim()) {
      throw new Error("Gelir basligi zorunludur.");
    }
    assertAmount(payload.amount);

    await ensureNoDuplicateIncome(payload);

    const income = await db.income.create({
      data: {
        title: payload.title.trim(),
        amount: payload.amount,
        date: parseDate(payload.date),
        note: payload.note?.trim() || null,
        customerId: payload.customerId?.trim() || null
      }
    });

    if (income.customerId) {
      await db.customer.update({
        where: { id: income.customerId },
        data: { lastContactAt: new Date() }
      });
    }

    return toIncomeDto(income);
  });

  ipcMain.handle("finances:incomes:update", async (_event, payload: UpdateIncomeInput) => {
    if (!payload?.id) {
      throw new Error("Gelir ID bulunamadi.");
    }
    if (!payload.title?.trim()) {
      throw new Error("Gelir basligi zorunludur.");
    }
    assertAmount(payload.amount);

    await ensureNoDuplicateIncome(payload, payload.id);

    const income = await db.income.update({
      where: { id: payload.id },
      data: {
        title: payload.title.trim(),
        amount: payload.amount,
        date: parseDate(payload.date),
        note: payload.note?.trim() || null,
        customerId: payload.customerId?.trim() || null
      }
    });

    if (income.customerId) {
      await db.customer.update({
        where: { id: income.customerId },
        data: { lastContactAt: new Date() }
      });
    }

    return toIncomeDto(income);
  });

  ipcMain.handle("finances:incomes:delete", async (_event, id: string) => {
    if (!id) {
      throw new Error("Gelir ID bulunamadi.");
    }
    await db.income.delete({ where: { id } });
    return { success: true };
  });

  ipcMain.handle("finances:expenses:list", async () => {
    const expenses = await db.expense.findMany({
      orderBy: { date: "desc" }
    });

    return expenses.map((item) => toExpenseDto(item));
  });

  ipcMain.handle("finances:expenses:create", async (_event, payload: CreateExpenseInput) => {
    if (!payload?.title?.trim()) {
      throw new Error("Gider basligi zorunludur.");
    }
    assertAmount(payload.amount);

    await ensureNoDuplicateExpense(payload);

    const expense = await db.expense.create({
      data: {
        title: payload.title.trim(),
        amount: payload.amount,
        category: payload.category?.trim() || null,
        date: parseDate(payload.date),
        note: payload.note?.trim() || null,
        customerId: payload.customerId?.trim() || null
      }
    });

    if (expense.customerId) {
      await db.customer.update({
        where: { id: expense.customerId },
        data: { lastContactAt: new Date() }
      });
    }

    return toExpenseDto(expense);
  });

  ipcMain.handle("finances:expenses:update", async (_event, payload: UpdateExpenseInput) => {
    if (!payload?.id) {
      throw new Error("Gider ID bulunamadi.");
    }
    if (!payload.title?.trim()) {
      throw new Error("Gider basligi zorunludur.");
    }
    assertAmount(payload.amount);

    await ensureNoDuplicateExpense(payload, payload.id);

    const expense = await db.expense.update({
      where: { id: payload.id },
      data: {
        title: payload.title.trim(),
        amount: payload.amount,
        category: payload.category?.trim() || null,
        date: parseDate(payload.date),
        note: payload.note?.trim() || null,
        customerId: payload.customerId?.trim() || null
      }
    });

    if (expense.customerId) {
      await db.customer.update({
        where: { id: expense.customerId },
        data: { lastContactAt: new Date() }
      });
    }

    return toExpenseDto(expense);
  });

  ipcMain.handle("finances:expenses:delete", async (_event, id: string) => {
    if (!id) {
      throw new Error("Gider ID bulunamadi.");
    }
    await db.expense.delete({ where: { id } });
    return { success: true };
  });
}
=======
export {};
>>>>>>> theirs
=======
export {};
>>>>>>> theirs
