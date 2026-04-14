import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/ui/button";
import Card from "../../components/ui/card";
import Input from "../../components/ui/input";
import Modal from "../../components/ui/modal";
import Badge from "../../components/ui/badge";
import Select from "../../components/ui/select";
import EmptyState from "../../components/ui/empty-state";
import { Table, TableHeadRow, TableRow } from "../../components/ui/table";
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
      setError("Desktop API bulunamadı. Uygulamayı Electron üzerinden açın.");
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
      setError("Müşteriler yüklenemedi.");
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
          email: form.email?.trim() || undefined,
          phone: form.phone?.trim() || undefined,
          company: form.company?.trim() || undefined,
          notes: form.notes?.trim() || undefined,
          status: form.status,
          lastContactAt: form.lastContactAt ? new Date(form.lastContactAt).toISOString() : null
        };
        const updated = await window.desktopAPI.customers.update(payload);
        setCustomers((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        show({ type: "success", title: "Müşteri güncellendi" });
      } else {
        const payload: CreateCustomerInput = {
          fullName: form.fullName.trim(),
          email: form.email?.trim() || undefined,
          phone: form.phone?.trim() || undefined,
          company: form.company?.trim() || undefined,
          notes: form.notes?.trim() || undefined,
          status: form.status
        };
        const created = await window.desktopAPI.customers.create(payload);
        setCustomers((prev) => [created, ...prev]);
        show({ type: "success", title: "Müşteri oluşturuldu" });
      }

      setForm(initialForm);
      setOpen(false);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Müşteri kaydedilemedi.");
      show({ type: "error", title: "Kayit başarısız" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCustomer(id: string) {
    const approved = await confirm({
      title: "Müşteriyi sil",
      description: "Bu kayıt kalıcı olarak silinecek. Devam etmek istiyor musun?",
      confirmLabel: "Sil"
    });
    if (!approved) return;

    try {
      if (!window.desktopAPI?.customers) {
        throw new Error("Desktop API bulunamadı.");
      }

      await window.desktopAPI.customers.delete(id);
      setCustomers((prev) => prev.filter((customer) => customer.id !== id));
      show({ type: "success", title: "Müşteri silindi" });
    } catch (err) {
      console.error(err);
      setError("Müşteri silinemedi.");
      show({ type: "error", title: "Silme islemi başarısız" });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="page-title">Müşteriler</h1>
          <p className="page-subtitle">CRM kayıtları ve ilişki yönetimi</p>
        </div>
        <Button onClick={openCreateModal}>Yeni Müşteri</Button>
      </div>

      <Card title="Filtreler" description="Arama, durum ve sıralama">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="İsim veya firma ara"
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "ALL" | CustomerStatus)}
          >
            <option value="ALL">Tüm durumlar</option>
            <option value="LEAD">Lead</option>
            <option value="ACTIVE">Aktif</option>
            <option value="INACTIVE">Pasif</option>
          </Select>
          <Select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "NAME_ASC" | "NAME_DESC" | "NEWEST" | "OLDEST")
            }
          >
            <option value="NEWEST">En yeni</option>
            <option value="OLDEST">En eski</option>
            <option value="NAME_ASC">İsim A-Z</option>
            <option value="NAME_DESC">İsim Z-A</option>
          </Select>
          <Button variant="secondary" onClick={() => void loadCustomers()}>
            Yenile
          </Button>
        </div>
      </Card>

      {error ? (
        <div className="app-error-box">
          {error}
        </div>
      ) : null}

      <Card title="Müşteri Listesi" description={`${filteredCustomers.length} kayıt gösteriliyor`}>
        <Table
          head={
            <TableHeadRow className="grid-cols-12">
            <div className="col-span-3">Ad Soyad</div>
            <div className="col-span-2">Firma</div>
            <div className="col-span-2">Durum</div>
            <div className="col-span-3">İletişim</div>
            <div className="col-span-2 text-right">İşlem</div>
            </TableHeadRow>
          }
        >

          {pageLoading ? (
            <div className="px-4 py-8 text-sm text-subtext">Yükleniyor...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="px-4 py-5">
              <EmptyState
                title="Filtreye uygun müşteri yok"
                description="Arama kriterlerini değiştir veya yeni müşteri ekle."
              />
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <TableRow
                key={customer.id}
                className="group grid-cols-12"
              >
                <div className="col-span-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-xs font-semibold text-white"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--accent-from) 0%, var(--accent-to) 100%)"
                      }}
                    >
                      {customer.fullName
                        .split(" ")
                        .slice(0, 2)
                        .map((part) => part[0]?.toUpperCase() ?? "")
                        .join("")}
                    </div>
                    <div>
                      <Link
                        to={`/customers/${customer.id}`}
                        className="font-semibold text-text hover:text-accent"
                      >
                        {customer.fullName}
                      </Link>
                      <div className="mt-1 text-xs text-subtext">
                        Son temas: {formatDate(customer.lastContactAt)}
                      </div>
                    </div>
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

                <div className="col-span-2 flex justify-end gap-2 opacity-80 transition group-hover:opacity-100">
                  <Button variant="ghost" onClick={() => openEditModal(customer)}>
                    Düzenle
                  </Button>
                  <Button variant="ghost" onClick={() => void handleDeleteCustomer(customer.id)}>
                    Sil
                  </Button>
                </div>
              </TableRow>
            ))
          )}
        </Table>
      </Card>

      <Modal
        open={open}
        title={form.id ? "Müşteri Düzenle" : "Yeni Müşteri"}
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
              placeholder="Firma adı"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-subtext">Durum</label>
              <Select
                value={form.status}
                onChange={(e) => updateForm("status", e.target.value as CustomerStatus)}
              >
                <option value="LEAD">Lead</option>
                <option value="ACTIVE">Aktif</option>
                <option value="INACTIVE">Pasif</option>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-subtext">Son iletişim tarihi</label>
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
              placeholder="Kısa not ekle..."
              className="app-textarea min-h-[100px] text-sm placeholder:text-subtext/80"
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
              Vazgeç
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

