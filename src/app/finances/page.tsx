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
  CreateExpenseInput,
  CreateIncomeInput,
  ExpenseItem,
  IncomeItem
} from "../../../shared/finance";

type IncomeFormState = {
  id: string | null;
  title: string;
  amount: string;
  date: string;
  note: string;
  customerId: string;
};

type ExpenseFormState = {
  id: string | null;
  title: string;
  amount: string;
  category: string;
  date: string;
  note: string;
  customerId: string;
};

type FinanceViewItem = {
  id: string;
  itemType: "INCOME" | "EXPENSE";
  title: string;
  amount: number;
  date: string;
  note?: string | null;
  category?: string | null;
  customerId?: string | null;
};

const today = new Date().toISOString().slice(0, 10);

const emptyIncomeForm: IncomeFormState = {
  id: null,
  title: "",
  amount: "",
  date: today,
  note: "",
  customerId: ""
};

const emptyExpenseForm: ExpenseFormState = {
  id: null,
  title: "",
  amount: "",
  category: "",
  date: today,
  note: "",
  customerId: ""
};

function formatTry(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2
  }).format(value);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("tr-TR");
}

export default function FinancesPage() {
  const { show } = useToast();
  const { confirm } = useConfirm();

  const [incomes, setIncomes] = useState<IncomeItem[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [incomeForm, setIncomeForm] = useState<IncomeFormState>(emptyIncomeForm);
  const [expenseForm, setExpenseForm] = useState<ExpenseFormState>(emptyExpenseForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [typeFilter, setTypeFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortByAmount, setSortByAmount] = useState<"DATE_DESC" | "AMOUNT_ASC" | "AMOUNT_DESC">(
    "DATE_DESC"
  );

  const customerMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const customer of customers) map.set(customer.id, customer.fullName);
    return map;
  }, [customers]);

  const totalIncome = useMemo(
    () => incomes.reduce((sum, income) => sum + income.amount, 0),
    [incomes]
  );
  const totalExpense = useMemo(
    () => expenses.reduce((sum, expense) => sum + expense.amount, 0),
    [expenses]
  );

  async function loadData() {
    if (!window.desktopAPI?.finances) {
      setError("Desktop API bulunamadi. Uygulamayi Electron ile acin.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const [incomeData, expenseData, customerData] = await Promise.all([
        window.desktopAPI.finances.incomes.list(),
        window.desktopAPI.finances.expenses.list(),
        window.desktopAPI.customers.list()
      ]);
      setIncomes(incomeData);
      setExpenses(expenseData);
      setCustomers(customerData);
    } catch (err) {
      console.error(err);
      setError("Finans kayitlari yuklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const filteredRows = useMemo(() => {
    const rows: FinanceViewItem[] = [
      ...incomes.map((item) => ({
        id: item.id,
        itemType: "INCOME" as const,
        title: item.title,
        amount: item.amount,
        date: item.date,
        note: item.note,
        customerId: item.customerId
      })),
      ...expenses.map((item) => ({
        id: item.id,
        itemType: "EXPENSE" as const,
        title: item.title,
        amount: item.amount,
        date: item.date,
        note: item.note,
        category: item.category,
        customerId: item.customerId
      }))
    ];

    let next = rows.filter((row) => {
      if (typeFilter !== "ALL" && row.itemType !== typeFilter) return false;
      if (startDate && new Date(row.date) < new Date(`${startDate}T00:00:00`)) return false;
      if (endDate && new Date(row.date) > new Date(`${endDate}T23:59:59`)) return false;
      return true;
    });

    next = [...next].sort((a, b) => {
      if (sortByAmount === "AMOUNT_ASC") return a.amount - b.amount;
      if (sortByAmount === "AMOUNT_DESC") return b.amount - a.amount;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return next;
  }, [incomes, expenses, typeFilter, startDate, endDate, sortByAmount]);

  function openIncomeModal(item?: IncomeItem) {
    if (!item) {
      setIncomeForm(emptyIncomeForm);
    } else {
      setIncomeForm({
        id: item.id,
        title: item.title,
        amount: item.amount.toString(),
        date: item.date.slice(0, 10),
        note: item.note ?? "",
        customerId: item.customerId ?? ""
      });
    }
    setIncomeModalOpen(true);
  }

  function openExpenseModal(item?: ExpenseItem) {
    if (!item) {
      setExpenseForm(emptyExpenseForm);
    } else {
      setExpenseForm({
        id: item.id,
        title: item.title,
        amount: item.amount.toString(),
        category: item.category ?? "",
        date: item.date.slice(0, 10),
        note: item.note ?? "",
        customerId: item.customerId ?? ""
      });
    }
    setExpenseModalOpen(true);
  }

  async function saveIncome() {
    if (!window.desktopAPI?.finances) return;
    if (!incomeForm.title.trim() || !incomeForm.amount || !incomeForm.date) {
      setError("Gelir icin baslik, tutar ve tarih zorunludur.");
      return;
    }

    const amount = Number(incomeForm.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Gelir tutari sifirdan buyuk olmali.");
      return;
    }

    const payload: CreateIncomeInput = {
      title: incomeForm.title.trim(),
      amount,
      date: incomeForm.date,
      note: incomeForm.note.trim() || undefined,
      customerId: incomeForm.customerId || undefined
    };

    try {
      setSaving(true);
      setError("");
      if (incomeForm.id) {
        const updated = await window.desktopAPI.finances.incomes.update({
          ...payload,
          id: incomeForm.id
        });
        setIncomes((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        show({ type: "success", title: "Gelir guncellendi" });
      } else {
        const created = await window.desktopAPI.finances.incomes.create(payload);
        setIncomes((prev) => [created, ...prev]);
        show({ type: "success", title: "Gelir kaydi eklendi" });
      }
      setIncomeModalOpen(false);
      setIncomeForm(emptyIncomeForm);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Gelir kaydi kaydedilemedi.";
      setError(message);
      show({ type: "error", title: "Kayit basarisiz", description: message });
    } finally {
      setSaving(false);
    }
  }

  async function saveExpense() {
    if (!window.desktopAPI?.finances) return;
    if (!expenseForm.title.trim() || !expenseForm.amount || !expenseForm.date) {
      setError("Gider icin baslik, tutar ve tarih zorunludur.");
      return;
    }

    const amount = Number(expenseForm.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Gider tutari sifirdan buyuk olmali.");
      return;
    }

    const payload: CreateExpenseInput = {
      title: expenseForm.title.trim(),
      amount,
      category: expenseForm.category.trim() || undefined,
      date: expenseForm.date,
      note: expenseForm.note.trim() || undefined,
      customerId: expenseForm.customerId || undefined
    };

    try {
      setSaving(true);
      setError("");
      if (expenseForm.id) {
        const updated = await window.desktopAPI.finances.expenses.update({
          ...payload,
          id: expenseForm.id
        });
        setExpenses((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        show({ type: "success", title: "Gider guncellendi" });
      } else {
        const created = await window.desktopAPI.finances.expenses.create(payload);
        setExpenses((prev) => [created, ...prev]);
        show({ type: "success", title: "Gider kaydi eklendi" });
      }
      setExpenseModalOpen(false);
      setExpenseForm(emptyExpenseForm);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Gider kaydi kaydedilemedi.";
      setError(message);
      show({ type: "error", title: "Kayit basarisiz", description: message });
    } finally {
      setSaving(false);
    }
  }

  async function deleteIncome(id: string) {
    if (!window.desktopAPI?.finances) return;
    const approved = await confirm({
      title: "Gelir kaydini sil",
      description: "Bu islem geri alinamaz.",
      confirmLabel: "Sil"
    });
    if (!approved) return;

    try {
      await window.desktopAPI.finances.incomes.delete(id);
      setIncomes((prev) => prev.filter((item) => item.id !== id));
      show({ type: "success", title: "Gelir silindi" });
    } catch (err) {
      console.error(err);
      setError("Gelir kaydi silinemedi.");
      show({ type: "error", title: "Silme basarisiz" });
    }
  }

  async function deleteExpense(id: string) {
    if (!window.desktopAPI?.finances) return;
    const approved = await confirm({
      title: "Gider kaydini sil",
      description: "Bu islem geri alinamaz.",
      confirmLabel: "Sil"
    });
    if (!approved) return;

    try {
      await window.desktopAPI.finances.expenses.delete(id);
      setExpenses((prev) => prev.filter((item) => item.id !== id));
      show({ type: "success", title: "Gider silindi" });
    } catch (err) {
      console.error(err);
      setError("Gider kaydi silinemedi.");
      show({ type: "error", title: "Silme basarisiz" });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Finans</h1>
          <p className="mt-1 text-sm text-subtext">Gelir ve gider yonetimi</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => openExpenseModal()}>
            Gider Ekle
          </Button>
          <Button onClick={() => openIncomeModal()}>Gelir Ekle</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card title="Toplam Gelir">
          <div className="text-2xl font-semibold">{formatTry(totalIncome)}</div>
        </Card>
        <Card title="Toplam Gider">
          <div className="text-2xl font-semibold">{formatTry(totalExpense)}</div>
        </Card>
        <Card title="Net Durum">
          <div className="text-2xl font-semibold">{formatTry(totalIncome - totalExpense)}</div>
        </Card>
      </div>

      <Card title="Filtreler" description="Tip, tarih araligi ve tutar siralama">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as "ALL" | "INCOME" | "EXPENSE")}
            className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-text outline-none focus:border-accent"
          >
            <option value="ALL">Tum tipler</option>
            <option value="INCOME">Sadece gelir</option>
            <option value="EXPENSE">Sadece gider</option>
          </select>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <select
            value={sortByAmount}
            onChange={(e) =>
              setSortByAmount(e.target.value as "DATE_DESC" | "AMOUNT_ASC" | "AMOUNT_DESC")
            }
            className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-text outline-none focus:border-accent"
          >
            <option value="DATE_DESC">Tarih (yeni-eski)</option>
            <option value="AMOUNT_DESC">Tutar (buyuk-kucuk)</option>
            <option value="AMOUNT_ASC">Tutar (kucuk-buyuk)</option>
          </select>
        </div>
      </Card>

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <Card title="Finans Hareketleri" description={`${filteredRows.length} kayit`}>
        {loading ? (
          <div className="text-sm text-subtext">Yukleniyor...</div>
        ) : filteredRows.length === 0 ? (
          <div className="text-sm text-subtext">Filtreye uygun hareket yok.</div>
        ) : (
          <div className="space-y-3">
            {filteredRows.map((row) => (
              <div key={`${row.itemType}-${row.id}`} className="rounded-2xl border border-border bg-muted/30 px-4 py-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{row.title}</p>
                      <Badge variant={row.itemType === "INCOME" ? "success" : "default"}>
                        {row.itemType === "INCOME" ? "Gelir" : "Gider"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-subtext">{formatDate(row.date)}</p>
                    {row.customerId ? (
                      <p className="mt-1 text-xs text-subtext">
                        Musteri: {customerMap.get(row.customerId) ?? row.customerId}
                      </p>
                    ) : null}
                    {row.note ? <p className="mt-2 text-sm text-subtext">{row.note}</p> : null}
                    {row.category ? (
                      <p className="mt-1 text-xs text-subtext">Kategori: {row.category}</p>
                    ) : null}
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        row.itemType === "INCOME" ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {formatTry(row.amount)}
                    </p>
                    <div className="mt-2 flex justify-end gap-2">
                      {row.itemType === "INCOME" ? (
                        <>
                          <Button
                            variant="ghost"
                            onClick={() =>
                              openIncomeModal(incomes.find((item) => item.id === row.id))
                            }
                          >
                            Duzenle
                          </Button>
                          <Button variant="ghost" onClick={() => void deleteIncome(row.id)}>
                            Sil
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            onClick={() =>
                              openExpenseModal(expenses.find((item) => item.id === row.id))
                            }
                          >
                            Duzenle
                          </Button>
                          <Button variant="ghost" onClick={() => void deleteExpense(row.id)}>
                            Sil
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={incomeModalOpen}
        title={incomeForm.id ? "Gelir Duzenle" : "Gelir Ekle"}
        onClose={() => {
          setIncomeModalOpen(false);
          setIncomeForm(emptyIncomeForm);
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-subtext">Baslik</label>
            <Input
              value={incomeForm.title}
              onChange={(e) => setIncomeForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Orn. Web sitesi odemesi"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-subtext">Tutar</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={incomeForm.amount}
                onChange={(e) => setIncomeForm((prev) => ({ ...prev, amount: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-subtext">Tarih</label>
              <Input
                type="date"
                value={incomeForm.date}
                onChange={(e) => setIncomeForm((prev) => ({ ...prev, date: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm text-subtext">Bagli musteri</label>
            <select
              value={incomeForm.customerId}
              onChange={(e) =>
                setIncomeForm((prev) => ({ ...prev, customerId: e.target.value }))
              }
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
            <label className="mb-2 block text-sm text-subtext">Not</label>
            <textarea
              value={incomeForm.note}
              onChange={(e) => setIncomeForm((prev) => ({ ...prev, note: e.target.value }))}
              className="min-h-[90px] w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-text outline-none focus:border-accent"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIncomeModalOpen(false)}>
              Vazgec
            </Button>
            <Button onClick={() => void saveIncome()} disabled={saving}>
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={expenseModalOpen}
        title={expenseForm.id ? "Gider Duzenle" : "Gider Ekle"}
        onClose={() => {
          setExpenseModalOpen(false);
          setExpenseForm(emptyExpenseForm);
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-subtext">Baslik</label>
            <Input
              value={expenseForm.title}
              onChange={(e) => setExpenseForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Orn. Lisans odemesi"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-subtext">Tutar</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm((prev) => ({ ...prev, amount: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-subtext">Kategori</label>
              <Input
                value={expenseForm.category}
                onChange={(e) =>
                  setExpenseForm((prev) => ({ ...prev, category: e.target.value }))
                }
                placeholder="Orn. Yazilim"
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm text-subtext">Tarih</label>
            <Input
              type="date"
              value={expenseForm.date}
              onChange={(e) => setExpenseForm((prev) => ({ ...prev, date: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-subtext">Bagli musteri</label>
            <select
              value={expenseForm.customerId}
              onChange={(e) =>
                setExpenseForm((prev) => ({ ...prev, customerId: e.target.value }))
              }
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
            <label className="mb-2 block text-sm text-subtext">Not</label>
            <textarea
              value={expenseForm.note}
              onChange={(e) => setExpenseForm((prev) => ({ ...prev, note: e.target.value }))}
              className="min-h-[90px] w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-text outline-none focus:border-accent"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setExpenseModalOpen(false)}>
              Vazgec
            </Button>
            <Button onClick={() => void saveExpense()} disabled={saving}>
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
