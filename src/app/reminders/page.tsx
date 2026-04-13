import { useEffect, useMemo, useState } from "react";
import Button from "../../components/ui/button";
import Card from "../../components/ui/card";
import Input from "../../components/ui/input";
import Modal from "../../components/ui/modal";
import Badge from "../../components/ui/badge";
import { useConfirm } from "../../components/ui/confirm-provider";
import { useToast } from "../../components/ui/toast-provider";
import type { Customer } from "../../../shared/customer";
import type {
  CreateReminderInput,
  ReminderItem,
  UpdateReminderInput
} from "../../../shared/reminder";

type ReminderFormState = {
  id: string | null;
  title: string;
  description: string;
  dueDate: string;
  customerId: string;
  isCompleted: boolean;
};

const emptyReminderForm: ReminderFormState = {
  id: null,
  title: "",
  description: "",
  dueDate: new Date().toISOString().slice(0, 16),
  customerId: "",
  isCompleted: false
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

export default function RemindersPage() {
  const { show } = useToast();
  const { confirm } = useConfirm();

  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState<ReminderFormState>(emptyReminderForm);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState<"ALL" | "COMPLETED" | "PENDING">("ALL");
  const [customerFilter, setCustomerFilter] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState("");

  const customerMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const customer of customers) map.set(customer.id, customer.fullName);
    return map;
  }, [customers]);

  async function loadData() {
    if (!window.desktopAPI?.reminders) {
      setError("Desktop API bulunamadi. Uygulamayi Electron ile acin.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const [reminderData, customerData] = await Promise.all([
        window.desktopAPI.reminders.list(),
        window.desktopAPI.customers.list()
      ]);
      setReminders(reminderData);
      setCustomers(customerData);
    } catch (err) {
      console.error(err);
      setError("Hatirlatmalar yuklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const filteredReminders = useMemo(() => {
    return reminders.filter((item) => {
      if (statusFilter === "COMPLETED" && !item.isCompleted) return false;
      if (statusFilter === "PENDING" && item.isCompleted) return false;
      if (customerFilter !== "ALL" && item.customerId !== customerFilter) return false;
      if (dateFilter) {
        const target = new Date(dateFilter).toDateString();
        if (new Date(item.dueDate).toDateString() !== target) return false;
      }
      return true;
    });
  }, [reminders, statusFilter, customerFilter, dateFilter]);

  function openModal(item?: ReminderItem) {
    if (!item) {
      setForm(emptyReminderForm);
    } else {
      setForm({
        id: item.id,
        title: item.title,
        description: item.description ?? "",
        dueDate: item.dueDate.slice(0, 16),
        customerId: item.customerId ?? "",
        isCompleted: item.isCompleted
      });
    }
    setOpen(true);
  }

  async function saveReminder() {
    if (!window.desktopAPI?.reminders) return;
    if (!form.title.trim() || !form.dueDate) {
      setError("Baslik ve tarih zorunludur.");
      return;
    }

    const basePayload: CreateReminderInput = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      dueDate: form.dueDate,
      customerId: form.customerId || undefined
    };

    try {
      setSaving(true);
      setError("");
      if (form.id) {
        const updatePayload: UpdateReminderInput = {
          ...basePayload,
          id: form.id,
          isCompleted: form.isCompleted
        };
        const updated = await window.desktopAPI.reminders.update(updatePayload);
        setReminders((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        show({ type: "success", title: "Hatirlatma guncellendi" });
      } else {
        const created = await window.desktopAPI.reminders.create(basePayload);
        setReminders((prev) => [created, ...prev]);
        show({ type: "success", title: "Hatirlatma olusturuldu" });
      }
      setOpen(false);
      setForm(emptyReminderForm);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Hatirlatma kaydedilemedi.";
      setError(message);
      show({ type: "error", title: "Kayit basarisiz", description: message });
    } finally {
      setSaving(false);
    }
  }

  async function toggleReminder(id: string) {
    if (!window.desktopAPI?.reminders) return;
    try {
      const updated = await window.desktopAPI.reminders.toggle(id);
      setReminders((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      show({
        type: "success",
        title: updated.isCompleted ? "Hatirlatma tamamlandi" : "Hatirlatma tekrar acildi"
      });
    } catch (err) {
      console.error(err);
      setError("Hatirlatma guncellenemedi.");
      show({ type: "error", title: "Guncelleme basarisiz" });
    }
  }

  async function deleteReminder(id: string) {
    if (!window.desktopAPI?.reminders) return;
    const approved = await confirm({
      title: "Hatirlatmayi sil",
      description: "Bu kayit kalici olarak silinecek.",
      confirmLabel: "Sil"
    });
    if (!approved) return;

    try {
      await window.desktopAPI.reminders.delete(id);
      setReminders((prev) => prev.filter((item) => item.id !== id));
      show({ type: "success", title: "Hatirlatma silindi" });
    } catch (err) {
      console.error(err);
      setError("Hatirlatma silinemedi.");
      show({ type: "error", title: "Silme basarisiz" });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Hatirlaticilar</h1>
          <p className="mt-1 text-sm text-subtext">Gorev ve takip yonetimi</p>
        </div>
        <Button onClick={() => openModal()}>Hatirlatma Ekle</Button>
      </div>

      <Card title="Filtreler" description="Durum, tarih ve musteriye gore filtrele">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "ALL" | "COMPLETED" | "PENDING")}
            className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-text outline-none focus:border-accent"
          >
            <option value="ALL">Tum durumlar</option>
            <option value="PENDING">Bekleyen</option>
            <option value="COMPLETED">Tamamlanan</option>
          </select>
          <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
          <select
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-text outline-none focus:border-accent"
          >
            <option value="ALL">Tum musteriler</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.fullName}
              </option>
            ))}
          </select>
          <Button variant="secondary" onClick={() => void loadData()}>
            Yenile
          </Button>
        </div>
      </Card>

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <Card title="Gorev Listesi" description={`${filteredReminders.length} kayit`}>
        {loading ? (
          <div className="text-sm text-subtext">Yukleniyor...</div>
        ) : filteredReminders.length === 0 ? (
          <div className="text-sm text-subtext">Filtreye uygun hatirlatma yok.</div>
        ) : (
          <div className="space-y-3">
            {filteredReminders.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-border bg-muted/30 px-4 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{item.title}</p>
                      <Badge variant={item.isCompleted ? "success" : "warning"}>
                        {item.isCompleted ? "Tamamlandi" : "Bekliyor"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-subtext">{formatDate(item.dueDate)}</p>
                    {item.customerId ? (
                      <p className="mt-1 text-xs text-subtext">
                        Musteri: {customerMap.get(item.customerId) ?? item.customerId}
                      </p>
                    ) : null}
                    {item.description ? (
                      <p className="mt-2 text-sm text-subtext">{item.description}</p>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => void toggleReminder(item.id)}>
                      {item.isCompleted ? "Geri Al" : "Tamamla"}
                    </Button>
                    <Button variant="ghost" onClick={() => openModal(item)}>
                      Duzenle
                    </Button>
                    <Button variant="ghost" onClick={() => void deleteReminder(item.id)}>
                      Sil
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={open}
        title={form.id ? "Hatirlatma Duzenle" : "Hatirlatma Ekle"}
        onClose={() => {
          setOpen(false);
          setForm(emptyReminderForm);
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-subtext">Baslik</label>
            <Input
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Orn. Fatura takibi"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-subtext">Tarih ve Saat</label>
            <Input
              type="datetime-local"
              value={form.dueDate}
              onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-subtext">Musteri</label>
            <select
              value={form.customerId}
              onChange={(e) => setForm((prev) => ({ ...prev, customerId: e.target.value }))}
              className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-text outline-none focus:border-accent"
            >
              <option value="">Secilmedi</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.fullName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm text-subtext">Aciklama</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              className="min-h-[90px] w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-text outline-none focus:border-accent"
            />
          </div>
          {form.id ? (
            <label className="flex items-center gap-2 text-sm text-subtext">
              <input
                type="checkbox"
                checked={form.isCompleted}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, isCompleted: e.target.checked }))
                }
              />
              Tamamlandi
            </label>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Vazgec
            </Button>
            <Button onClick={() => void saveReminder()} disabled={saving}>
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
