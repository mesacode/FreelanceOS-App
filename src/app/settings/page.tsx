import { useEffect, useMemo, useState } from "react";
import Button from "../../components/ui/button";
import Card from "../../components/ui/card";
import Input from "../../components/ui/input";
import { useConfirm } from "../../components/ui/confirm-provider";
import { useToast } from "../../components/ui/toast-provider";
import type { SettingItem } from "../../../shared/settings";

type NewSettingState = {
  key: string;
  value: string;
};

const defaultKeys = ["currency", "theme", "companyName"];

export default function SettingsPage() {
  const { show } = useToast();
  const { confirm } = useConfirm();

  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [newSetting, setNewSetting] = useState<NewSettingState>({ key: "", value: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadSettings() {
    if (!window.desktopAPI?.settings) {
      setError("Desktop API bulunamadi. Uygulamayi Electron ile acin.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const data = await window.desktopAPI.settings.list();

      const ensured = [...data];
      for (const key of defaultKeys) {
        if (!ensured.some((item) => item.key === key)) {
          const created = await window.desktopAPI.settings.upsert({
            key,
            value: key === "currency" ? "TRY" : key === "theme" ? "dark" : ""
          });
          ensured.push(created);
        }
      }

      ensured.sort((a, b) => a.key.localeCompare(b.key));
      setSettings(ensured);
    } catch (err) {
      console.error(err);
      setError("Ayarlar yuklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSettings();
  }, []);

  const filteredSettings = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) return settings;

    return settings.filter((item) => {
      return (
        item.key.toLowerCase().includes(normalized) ||
        item.value.toLowerCase().includes(normalized)
      );
    });
  }, [searchQuery, settings]);

  async function updateSetting(key: string, value: string) {
    if (!window.desktopAPI?.settings) return;
    try {
      setSavingKey(key);
      setError("");
      const updated = await window.desktopAPI.settings.upsert({ key, value });
      setSettings((prev) => prev.map((item) => (item.key === key ? updated : item)));
      show({ type: "success", title: `${key} guncellendi` });
    } catch (err) {
      console.error(err);
      setError("Ayar guncellenemedi.");
      show({ type: "error", title: "Guncelleme basarisiz" });
    } finally {
      setSavingKey(null);
    }
  }

  async function addSetting() {
    if (!window.desktopAPI?.settings) return;
    if (!newSetting.key.trim()) {
      setError("Yeni ayar icin anahtar zorunludur.");
      return;
    }
    try {
      setSavingKey(newSetting.key.trim());
      setError("");
      const created = await window.desktopAPI.settings.upsert({
        key: newSetting.key.trim(),
        value: newSetting.value
      });
      setSettings((prev) => {
        const exists = prev.some((item) => item.key === created.key);
        if (exists) {
          return prev.map((item) => (item.key === created.key ? created : item));
        }
        return [...prev, created].sort((a, b) => a.key.localeCompare(b.key));
      });
      setNewSetting({ key: "", value: "" });
      show({ type: "success", title: "Ayar kaydedildi" });
    } catch (err) {
      console.error(err);
      setError("Yeni ayar eklenemedi.");
      show({ type: "error", title: "Kayit basarisiz" });
    } finally {
      setSavingKey(null);
    }
  }

  async function deleteSetting(key: string) {
    if (!window.desktopAPI?.settings) return;
    if (defaultKeys.includes(key)) {
      setError("Varsayilan ayarlar silinemez.");
      return;
    }
    const approved = await confirm({
      title: "Ayari sil",
      description: `${key} anahtari kalici olarak silinecek.`,
      confirmLabel: "Sil"
    });
    if (!approved) return;

    try {
      await window.desktopAPI.settings.delete(key);
      setSettings((prev) => prev.filter((item) => item.key !== key));
      show({ type: "success", title: "Ayar silindi" });
    } catch (err) {
      console.error(err);
      setError("Ayar silinemedi.");
      show({ type: "error", title: "Silme basarisiz" });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Ayarlar</h1>
        <p className="mt-1 text-sm text-subtext">Uygulama tercihleri ve genel ayarlar</p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <Card title="Yeni Ayar">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto]">
          <Input
            value={newSetting.key}
            onChange={(e) => setNewSetting((prev) => ({ ...prev, key: e.target.value }))}
            placeholder="Ayar anahtari"
          />
          <Input
            value={newSetting.value}
            onChange={(e) => setNewSetting((prev) => ({ ...prev, value: e.target.value }))}
            placeholder="Deger"
          />
          <Button onClick={() => void addSetting()} disabled={Boolean(savingKey)}>
            Ekle
          </Button>
        </div>
      </Card>

      <Card title="Arama">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Key veya value ara"
        />
      </Card>

      <Card title="Tum Ayarlar" description={`${filteredSettings.length} kayit`}>
        {loading ? (
          <div className="text-sm text-subtext">Yukleniyor...</div>
        ) : filteredSettings.length === 0 ? (
          <div className="text-sm text-subtext">Aramaya uygun ayar yok.</div>
        ) : (
          <div className="space-y-3">
            {filteredSettings.map((item) => (
              <div
                key={item.key}
                className="rounded-2xl border border-border bg-muted/30 px-4 py-3"
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-[220px_1fr_auto] md:items-center">
                  <div className="text-sm font-medium text-text">{item.key}</div>
                  <Input
                    value={item.value}
                    onChange={(e) =>
                      setSettings((prev) =>
                        prev.map((current) =>
                          current.key === item.key
                            ? { ...current, value: e.target.value }
                            : current
                        )
                      )
                    }
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      disabled={savingKey === item.key}
                      onClick={() => void updateSetting(item.key, item.value)}
                    >
                      Kaydet
                    </Button>
                    <Button variant="ghost" onClick={() => void deleteSetting(item.key)}>
                      Sil
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
