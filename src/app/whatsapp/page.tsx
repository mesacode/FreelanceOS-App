<<<<<<< ours
<<<<<<< ours
import { useEffect, useMemo, useState } from "react";
import Button from "../../components/ui/button";
import Card from "../../components/ui/card";
import Input from "../../components/ui/input";
import Modal from "../../components/ui/modal";
import { useConfirm } from "../../components/ui/confirm-provider";
import { useToast } from "../../components/ui/toast-provider";
import type {
  CreateWhatsappTemplateInput,
  WhatsappTemplateItem
} from "../../../shared/whatsapp";

type TemplateFormState = {
  id: string | null;
  name: string;
  content: string;
};

const emptyTemplateForm: TemplateFormState = {
  id: null,
  name: "",
  content: ""
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

export default function WhatsappPage() {
  const { show } = useToast();
  const { confirm } = useConfirm();

  const [templates, setTemplates] = useState<WhatsappTemplateItem[]>([]);
  const [form, setForm] = useState<TemplateFormState>(emptyTemplateForm);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  async function loadTemplates() {
    if (!window.desktopAPI?.whatsapp) {
      setError("Desktop API bulunamadi. Uygulamayi Electron ile acin.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const data = await window.desktopAPI.whatsapp.list();
      setTemplates(data);
    } catch (err) {
      console.error(err);
      setError("Sablonlar yuklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTemplates();
  }, []);

  const filteredTemplates = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) return templates;
    return templates.filter((item) => {
      return (
        item.name.toLowerCase().includes(normalized) ||
        item.content.toLowerCase().includes(normalized)
      );
    });
  }, [templates, searchQuery]);

  function openModal(item?: WhatsappTemplateItem) {
    if (!item) {
      setForm(emptyTemplateForm);
    } else {
      setForm({
        id: item.id,
        name: item.name,
        content: item.content
      });
    }
    setOpen(true);
  }

  async function saveTemplate() {
    if (!window.desktopAPI?.whatsapp) return;
    if (!form.name.trim() || !form.content.trim()) {
      setError("Sablon adi ve icerigi zorunludur.");
      return;
    }

    const payload: CreateWhatsappTemplateInput = {
      name: form.name.trim(),
      content: form.content.trim()
    };

    try {
      setSaving(true);
      setError("");
      if (form.id) {
        const updated = await window.desktopAPI.whatsapp.update({
          ...payload,
          id: form.id
        });
        setTemplates((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        show({ type: "success", title: "Sablon guncellendi" });
      } else {
        const created = await window.desktopAPI.whatsapp.create(payload);
        setTemplates((prev) => [created, ...prev]);
        show({ type: "success", title: "Sablon eklendi" });
      }
      setOpen(false);
      setForm(emptyTemplateForm);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Sablon kaydedilemedi.";
      setError(message);
      show({ type: "error", title: "Kayit basarisiz", description: message });
    } finally {
      setSaving(false);
    }
  }

  async function deleteTemplate(id: string) {
    if (!window.desktopAPI?.whatsapp) return;
    const approved = await confirm({
      title: "Sablonu sil",
      description: "Bu kayit geri alinamaz.",
      confirmLabel: "Sil"
    });
    if (!approved) return;

    try {
      await window.desktopAPI.whatsapp.delete(id);
      setTemplates((prev) => prev.filter((item) => item.id !== id));
      show({ type: "success", title: "Sablon silindi" });
    } catch (err) {
      console.error(err);
      setError("Sablon silinemedi.");
      show({ type: "error", title: "Silme basarisiz" });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">WhatsApp</h1>
          <p className="mt-1 text-sm text-subtext">Mesaj sablonlari ve hizli kullanim</p>
        </div>
        <Button onClick={() => openModal()}>Yeni Sablon</Button>
      </div>

      <Card title="Arama">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Sablon adinda veya icerikte ara"
        />
      </Card>

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <Card title="Mesaj Sablonlari" description={`${filteredTemplates.length} kayit`}>
        {loading ? (
          <div className="text-sm text-subtext">Yukleniyor...</div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-sm text-subtext">Aramaya uygun sablon yok.</div>
        ) : (
          <div className="space-y-3">
            {filteredTemplates.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-border bg-muted/30 px-4 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="mt-1 text-xs text-subtext">
                      Son guncelleme: {formatDate(item.updatedAt)}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-subtext">{item.content}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => openModal(item)}>
                      Duzenle
                    </Button>
                    <Button variant="ghost" onClick={() => void deleteTemplate(item.id)}>
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
        title={form.id ? "Sablon Duzenle" : "Yeni Sablon"}
        onClose={() => {
          setOpen(false);
          setForm(emptyTemplateForm);
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-subtext">Sablon Adi</label>
            <Input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Orn. Odeme Hatirlatmasi"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-subtext">Mesaj Icerigi</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
              className="min-h-[140px] w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-text outline-none focus:border-accent"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Vazgec
            </Button>
            <Button onClick={() => void saveTemplate()} disabled={saving}>
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
=======
export default function WhatsappPage() {
  return <main>Whatsapp Page</main>;
>>>>>>> theirs
=======
export default function WhatsappPage() {
  return <main>Whatsapp Page</main>;
>>>>>>> theirs
}
