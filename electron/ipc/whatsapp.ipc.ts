import { ipcMain } from "electron";
import { db } from "../lib/db";
import type {
  CreateWhatsappTemplateInput,
  UpdateWhatsappTemplateInput
} from "../../shared/whatsapp";

function toTemplateDto(item: Awaited<ReturnType<typeof db.whatsappTemplate.create>>) {
  return {
    ...item,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString()
  };
}

async function ensureUniqueTemplateName(name: string, excludeId?: string) {
  const existing = await db.whatsappTemplate.findFirst({
    where: {
      name: name.trim()
    }
  });

  if (existing && existing.id !== excludeId) {
    throw new Error("Bu sablon ismi zaten kullaniliyor.");
  }
}

export function registerWhatsappIpc() {
  ipcMain.handle("whatsapp:list", async () => {
    const templates = await db.whatsappTemplate.findMany({
      orderBy: { updatedAt: "desc" }
    });

    return templates.map((item) => toTemplateDto(item));
  });

  ipcMain.handle("whatsapp:create", async (_event, payload: CreateWhatsappTemplateInput) => {
    if (!payload?.name?.trim()) {
      throw new Error("Sablon adi zorunludur.");
    }
    if (!payload?.content?.trim()) {
      throw new Error("Sablon icerigi zorunludur.");
    }

    await ensureUniqueTemplateName(payload.name);

    const template = await db.whatsappTemplate.create({
      data: {
        name: payload.name.trim(),
        content: payload.content.trim()
      }
    });

    return toTemplateDto(template);
  });

  ipcMain.handle("whatsapp:update", async (_event, payload: UpdateWhatsappTemplateInput) => {
    if (!payload?.id) {
      throw new Error("Sablon ID bulunamadi.");
    }
    if (!payload?.name?.trim()) {
      throw new Error("Sablon adi zorunludur.");
    }
    if (!payload?.content?.trim()) {
      throw new Error("Sablon icerigi zorunludur.");
    }

    await ensureUniqueTemplateName(payload.name, payload.id);

    const template = await db.whatsappTemplate.update({
      where: { id: payload.id },
      data: {
        name: payload.name.trim(),
        content: payload.content.trim()
      }
    });

    return toTemplateDto(template);
  });

  ipcMain.handle("whatsapp:delete", async (_event, id: string) => {
    if (!id) {
      throw new Error("Sablon ID bulunamadi.");
    }
    await db.whatsappTemplate.delete({ where: { id } });
    return { success: true };
  });
}
