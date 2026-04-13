import { ipcMain } from "electron";
import { db } from "../lib/db";
import type { CreateCustomerInput, UpdateCustomerInput } from "../../shared/customer";

function toCustomerDto(customer: Awaited<ReturnType<typeof db.customer.create>>) {
  return {
    ...customer,
    createdAt: customer.createdAt.toISOString(),
    updatedAt: customer.updatedAt.toISOString(),
    lastContactAt: customer.lastContactAt?.toISOString() ?? null
  };
}

async function ensureNoDuplicateCustomer(
  payload: CreateCustomerInput | UpdateCustomerInput,
  excludeId?: string
) {
  const email = payload.email?.trim();
  const phone = payload.phone?.trim();

  const duplicates = await db.customer.findMany({
    where: {
      OR: [
        {
          fullName: payload.fullName.trim(),
          company: payload.company?.trim() || null
        },
        ...(email ? [{ email }] : []),
        ...(phone ? [{ phone }] : [])
      ]
    }
  });

  const conflict = duplicates.find((item) => item.id !== excludeId);
  if (conflict) {
    throw new Error("Ayni musteriye ait benzer bir kayit zaten var.");
  }
}

export function registerCustomerIpc() {
  ipcMain.handle("customers:list", async () => {
    const customers = await db.customer.findMany({
      orderBy: {
        createdAt: "desc"
      }
    });

    return customers.map((customer) => toCustomerDto(customer));
  });

  ipcMain.handle("customers:get", async (_event, id: string) => {
    if (!id) {
      throw new Error("Musteri ID bulunamadi.");
    }

    const customer = await db.customer.findUnique({
      where: { id },
      include: {
        reminders: {
          orderBy: { dueDate: "desc" },
          take: 15
        },
        incomes: {
          orderBy: { date: "desc" },
          take: 25
        },
        expenses: {
          orderBy: { date: "desc" },
          take: 25
        }
      }
    });

    if (!customer) {
      throw new Error("Musteri bulunamadi.");
    }

    const incomes = customer.incomes.map((item) => ({
      id: item.id,
      type: "INCOME" as const,
      title: item.title,
      amount: item.amount,
      date: item.date.toISOString(),
      note: item.note
    }));

    const expenses = customer.expenses.map((item) => ({
      id: item.id,
      type: "EXPENSE" as const,
      title: item.title,
      amount: item.amount,
      date: item.date.toISOString(),
      note: item.note
    }));

    const reminders = customer.reminders.map((item) => ({
      id: item.id,
      title: item.title,
      dueDate: item.dueDate.toISOString(),
      isCompleted: item.isCompleted
    }));

    const totalEarnings = incomes.reduce((sum, item) => sum + item.amount, 0);

    return {
      customer: toCustomerDto(customer),
      incomes,
      expenses,
      reminders,
      totalEarnings,
      lastContactAt: customer.lastContactAt?.toISOString() ?? null
    };
  });

  ipcMain.handle("customers:create", async (_event, payload: CreateCustomerInput) => {
    if (!payload?.fullName?.trim()) {
      throw new Error("Musteri adi zorunludur.");
    }

    await ensureNoDuplicateCustomer(payload);

    const customer = await db.customer.create({
      data: {
        fullName: payload.fullName.trim(),
        email: payload.email?.trim() || null,
        phone: payload.phone?.trim() || null,
        company: payload.company?.trim() || null,
        notes: payload.notes?.trim() || null,
        status: payload.status ?? "LEAD",
        lastContactAt: new Date()
      }
    });

    return toCustomerDto(customer);
  });

  ipcMain.handle("customers:update", async (_event, payload: UpdateCustomerInput) => {
    if (!payload?.id) {
      throw new Error("Musteri ID bulunamadi.");
    }
    if (!payload?.fullName?.trim()) {
      throw new Error("Musteri adi zorunludur.");
    }

    await ensureNoDuplicateCustomer(payload, payload.id);

    const customer = await db.customer.update({
      where: { id: payload.id },
      data: {
        fullName: payload.fullName.trim(),
        email: payload.email?.trim() || null,
        phone: payload.phone?.trim() || null,
        company: payload.company?.trim() || null,
        notes: payload.notes?.trim() || null,
        status: payload.status,
        lastContactAt: payload.lastContactAt ? new Date(payload.lastContactAt) : null
      }
    });

    return toCustomerDto(customer);
  });

  ipcMain.handle("customers:delete", async (_event, id: string) => {
    if (!id) {
      throw new Error("Musteri ID bulunamadi.");
    }

    await db.customer.delete({
      where: { id }
    });

    return { success: true };
  });
}
