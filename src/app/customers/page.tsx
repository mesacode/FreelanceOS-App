import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/ui/button";
import Card from "../../components/ui/card";
import Input from "../../components/ui/input";
import Modal from "../../components/ui/modal";
import Badge from "../../components/ui/badge";
import { useToast } from "../../components/ui/toast-provider";
import { useConfirm } from "../../components/ui/confirm-provider";
import type {
  CreateCustomerInput,
  Customer,
  CustomerStatus,
  UpdateCustomerInput
} from "../../../shared/customer";

type CustomerFormState = CreateCustomerInput & {
  id: string | null;
  lastContactAt: string;
};

const initialForm: CustomerFormState = {
  id: null,
  fullName: "",
  email: "",
  phone: "",
  company: "",
  notes: "",
  status: "LEAD",
  lastContactAt: ""
};

function getStatusBadgeVariant(status: CustomerStatus): "default" | "success" | "warning" {
  if (status === "ACTIVE") return "success";
  if (status === "LEAD") return "warning";
  return "default";
}

function getStatusLabel(status: CustomerStatus) {
  if (status === "ACTIVE") return "Aktif";
  if (status === "INACTIVE") return "Pasif";
  return "Lead";
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("tr-TR");
}

export default function CustomersPage() {
  const { show } = useToast();
  const { confirm } = useConfirm();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CustomerFormState>(initialForm);
  const [saving, setSaving] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | CustomerStatus>("ALL");
  const [sortBy, setSortBy] = useState<"NAME_ASC" | "NAME_DESC" | "NEWEST" | "OLDEST">(
    "NEWEST"
  );

  async function loadCustomers() {
    if (!window.desktopAPI?.customers) {
      setError("Desktop API bulunamadi. Uygulamayi Electron uzerinden acin.");
      setPageLoading(false);
      return;
    }

    try {
      setPageLoading(true);
      setError("");
      const data = await window.desktopAPI.customers.list();
      setCustomers(data);
    } catch (err) {
      console.error(err);
      setError("Musteriler yuklenemedi.");
    } finally {
      setPageLoading(false);
    }
  }

  useEffect(() => {
    void loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    let next = customers.filter((customer) => {
      if (statusFilter !== "ALL" && customer.status !== statusFilter) return false;
      if (!normalized) return true;

      return (
        customer.fullName.toLowerCase().includes(normalized) ||
        (customer.company ?? "").toLowerCase().includes(normalized)
      );
    });

    next = [...next].sort((a, b) => {
      if (sortBy === "NAME_ASC") return a.fullName.localeCompare(b.fullName);
      if (sortBy === "NAME_DESC") return b.fullName.localeCompare(a.fullName);
      if (sortBy === "OLDEST") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return next;
  }, [customers, searchQuery, sortBy, statusFilter]);

  function updateForm<K extends keyof CustomerFormState>(key: K, value: CustomerFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function openCreateModal() {
    setForm(initialForm);
    setError("");
    setOpen(true);
  }

  function openEditModal(customer: Customer) {
    setForm({
      id: customer.id,
      fullName: customer.fullName,
      email: customer.email ?? "",
      phone: customer.phone ?? "",
      company: customer.company ?? "",
      notes: customer.notes ?? "",
      status: customer.status,
      lastContactAt: customer.lastContactAt ? customer.lastContactAt.slice(0, 10) : ""
    });
    setError("");
    setOpen(true);
  }

  function validateForm() {
    if (!form.fullName.trim()) return "Ad soyad zorunludur.";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return "Gecerli bir e-posta girin.";
    }
    return null;
  }

  async function handleSaveCustomer() {
    if (!window.desktopAPI?.customers) return;
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (form.id) {
        const payload: UpdateCustomerInput = {
          id: form.id,
          fullName: form.fullName.trim(),
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
          company: form.company.trim() || undefined,
          notes: form.notes.trim() || undefined,
          status: form.status,
          lastContactAt: form.lastContactAt ? new Date(form.lastContactAt).toISOString() : null
        };
        const updated = await window.desktopAPI.customers.update(payload);
        setCustomers((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        show({ type: "success", title: "Musteri guncellendi" });
      } else {
        const payload: CreateCustomerInput = {
          fullName: form.fullName.trim(),
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
          company: form.company.trim() || undefined,
          notes: form.notes.trim() || undefined,
          status: form.status
        };
        const created = await window.desktopAPI.customers.create(payload);
        setCustomers((prev) => [created, ...prev]);
        show({ type: "success", title: "Musteri olusturuldu" });
      }

      setForm(initialForm);
      setOpen(false);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Musteri kaydedilemedi.");
      show({ type: "error", title: "Kayit basarisiz" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCustomer(id: string) {
    const approved = await confirm({
      title: "Musteriyi sil",
      description: "Bu kayit kalici olarak silinecek. Devam etmek istiyor musun?",
      confirmLabel: "Sil"
    });
    if (!approved) return;

    try {
      if (!window.desktopAPI?.customers) {
        throw new Error("Desktop API bulunamadi.");
      }

      await window.desktopAPI.customers.delete(id);
      setCustomers((prev) => prev.filter((customer) => customer.id !== id));
      show({ type: "success", title: "Musteri silindi" });
    } catch (err) {
      console.error(err);
      setError("Musteri silinemedi.");
      show({ type: "error", title: "Silme islemi basarisiz" });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Musteriler</h1>
          <p className="mt-1 text-sm text-subtext">CRM kayitlari ve iliski yonetimi</p>
        </div>
        <Button onClick={openCreateModal}>Yeni Musteri</Button>
      </div>

      <Card title="Filtreler" description="Arama, durum ve siralama">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Isim veya firma ara"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "ALL" | CustomerStatus)}
            className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-text outline-none focus:border-accent"
          >
            <option value="ALL">Tum durumlar</option>
            <option value="LEAD">Lead</option>
            <option value="ACTIVE">Aktif</option>
            <option value="INACTIVE">Pasif</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "NAME_ASC" | "NAME_DESC" | "NEWEST" | "OLDEST")
            }
            className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-text outline-none focus:border-accent"
          >
            <option value="NEWEST">En yeni</option>
            <option value="OLDEST">En eski</option>
            <option value="NAME_ASC">Isim A-Z</option>
            <option value="NAME_DESC">Isim Z-A</option>
          </select>
          <Button variant="secondary" onClick={() => void loadCustomers()}>
            Yenile
          </Button>
        </div>
      </Card>

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <Card title="Musteri Listesi" description={`${filteredCustomers.length} kayit gosteriliyor`}>
        <div className="overflow-hidden rounded-2xl border border-border">
          <div className="grid grid-cols-12 border-b border-border bg-muted/40 px-4 py-3 text-sm text-subtext">
            <div className="col-span-3">Ad Soyad</div>
            <div className="col-span-2">Firma</div>
            <div className="col-span-2">Durum</div>
            <div className="col-span-3">Iletisim</div>
            <div className="col-span-2 text-right">Islem</div>
          </div>

          {pageLoading ? (
            <div className="px-4 py-8 text-sm text-subtext">Yukleniyor...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="px-4 py-8 text-sm text-subtext">Filtreye uygun musteri yok.</div>
          ) : (
            filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="grid grid-cols-12 items-center border-b border-border/70 px-4 py-4 text-sm last:border-b-0"
              >
                <div className="col-span-3">
                  <Link
                    to={`/customers/${customer.id}`}
                    className="font-medium text-text hover:text-accent"
                  >
                    {customer.fullName}
                  </Link>
                  <div className="mt-1 text-xs text-subtext">
                    Son temas: {formatDate(customer.lastContactAt)}
                  </div>
                </div>

                <div className="col-span-2 text-subtext">{customer.company || "-"}</div>

                <div className="col-span-2">
                  <Badge variant={getStatusBadgeVariant(customer.status)}>
                    {getStatusLabel(customer.status)}
                  </Badge>
                </div>

                <div className="col-span-3 text-subtext">
                  <div>{customer.email || "-"}</div>
                  <div className="mt-1 text-xs">{customer.phone || "-"}</div>
                </div>

                <div className="col-span-2 flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => openEditModal(customer)}>
                    Duzenle
                  </Button>
                  <Button variant="ghost" onClick={() => void handleDeleteCustomer(customer.id)}>
                    Sil
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Modal
        open={open}
        title={form.id ? "Musteri Duzenle" : "Yeni Musteri"}
        onClose={() => {
          setOpen(false);
          setForm(initialForm);
          setError("");
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-subtext">Ad Soyad</label>
            <Input
              value={form.fullName}
              onChange={(e) => updateForm("fullName", e.target.value)}
              placeholder="Orn. Mehmet Kaya"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-subtext">E-posta</label>
              <Input
                value={form.email}
                onChange={(e) => updateForm("email", e.target.value)}
                placeholder="ornek@mail.com"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-subtext">Telefon</label>
              <Input
                value={form.phone}
                onChange={(e) => updateForm("phone", e.target.value)}
                placeholder="05xx xxx xx xx"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-subtext">Firma</label>
            <Input
              value={form.company}
              onChange={(e) => updateForm("company", e.target.value)}
              placeholder="Firma adi"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-subtext">Durum</label>
              <select
                value={form.status}
                onChange={(e) => updateForm("status", e.target.value as CustomerStatus)}
                className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-text outline-none focus:border-accent"
              >
                <option value="LEAD">Lead</option>
                <option value="ACTIVE">Aktif</option>
                <option value="INACTIVE">Pasif</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-subtext">Son iletisim tarihi</label>
              <Input
                type="date"
                value={form.lastContactAt}
                onChange={(e) => updateForm("lastContactAt", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-subtext">Not</label>
            <textarea
              value={form.notes}
              onChange={(e) => updateForm("notes", e.target.value)}
              placeholder="Kisa not ekle..."
              className="min-h-[100px] w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-text outline-none placeholder:text-subtext focus:border-accent"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setOpen(false);
                setForm(initialForm);
              }}
            >
              Vazgec
            </Button>
            <Button onClick={() => void handleSaveCustomer()} disabled={saving}>
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
