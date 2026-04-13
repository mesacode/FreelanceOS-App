<<<<<<< ours
<<<<<<< ours
import { ipcMain } from "electron";
import { db } from "../lib/db";
import type { UpsertSettingInput } from "../../shared/settings";

function toSettingDto(item: Awaited<ReturnType<typeof db.setting.create>>) {
  return {
    ...item,
    updatedAt: item.updatedAt.toISOString()
  };
}

export function registerSettingsIpc() {
  ipcMain.handle("settings:list", async () => {
    const settings = await db.setting.findMany({
      orderBy: { key: "asc" }
    });

    return settings.map((item) => toSettingDto(item));
  });

  ipcMain.handle("settings:upsert", async (_event, payload: UpsertSettingInput) => {
    if (!payload?.key?.trim()) {
      throw new Error("Ayar anahtari zorunludur.");
    }

    const setting = await db.setting.upsert({
      where: { key: payload.key.trim() },
      update: { value: payload.value ?? "" },
      create: {
        key: payload.key.trim(),
        value: payload.value ?? ""
      }
    });

    return toSettingDto(setting);
  });

  ipcMain.handle("settings:delete", async (_event, key: string) => {
    if (!key?.trim()) {
      throw new Error("Ayar anahtari bulunamadi.");
    }
    await db.setting.delete({ where: { key: key.trim() } });
    return { success: true };
  });
}
=======
export {};
>>>>>>> theirs
=======
export {};
>>>>>>> theirs
