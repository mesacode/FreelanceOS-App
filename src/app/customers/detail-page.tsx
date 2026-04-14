import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Card from "../../components/ui/card";
import Button from "../../components/ui/button";
import EmptyState from "../../components/ui/empty-state";
import type { CustomerDetail } from "../../../shared/customer";

function formatTry(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2
  }).format(value);
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("tr-TR");
}

export default function CustomerDetailPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDetail() {
      if (!customerId || !window.desktopAPI?.customers) {
        setError("Müşteri bilgisi yüklenemedi.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError("");
        const data = await window.desktopAPI.customers.get(customerId);
        setDetail(data);
      } catch (err) {
        console.error(err);
        setError("Müşteri detayı yüklenemedi.");
      } finally {
        setLoading(false);
      }
    }

    void loadDetail();
  }, [customerId]);

  const movementCount = useMemo(() => {
    if (!detail) return 0;
    return detail.incomes.length + detail.expenses.length;
  }, [detail]);

  if (loading) {
    return <div className="text-sm text-subtext">Yükleniyor...</div>;
  }

  if (!detail) {
    return (
      <div className="space-y-4">
        {error ? (
          <div className="app-error-box">
            {error}
          </div>
        ) : null}
        <Link to="/customers" className="text-sm text-accent hover:opacity-80">
          Müşteri listesine dön
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">{detail.customer.fullName}</h1>
          <p className="page-subtitle">
            Son iletişim: {formatDate(detail.lastContactAt)}
          </p>
        </div>
        <Link to="/customers">
          <Button variant="secondary">Listeye Don</Button>
        </Link>
      </div>

      {error ? (
        <div className="app-error-box">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card title="Toplam Kazanc">
          <p className="text-2xl font-semibold text-emerald-400">{formatTry(detail.totalEarnings)}</p>
        </Card>
        <Card title="Bağlı Finans Hareketi">
          <p className="text-2xl font-semibold">{movementCount}</p>
        </Card>
        <Card title="Bağlı Hatırlatma">
          <p className="text-2xl font-semibold">{detail.reminders.length}</p>
        </Card>
      </div>

      <Card title="Temel Bilgiler">
        <div className="grid grid-cols-1 gap-2 text-sm text-subtext md:grid-cols-2">
          <div>E-posta: {detail.customer.email || "-"}</div>
          <div>Telefon: {detail.customer.phone || "-"}</div>
          <div>Firma: {detail.customer.company || "-"}</div>
          <div>Durum: {detail.customer.status}</div>
        </div>
      </Card>

      <Card title="Notlar">
        <p className="text-sm text-subtext">{detail.customer.notes || "Not bulunmuyor."}</p>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card title="Bağlı Gelir Hareketleri">
          {detail.incomes.length === 0 ? (
            <EmptyState title="Gelir kaydı bulunmuyor" />
          ) : (
            <div className="space-y-2">
              {detail.incomes.map((item) => (
                <div
                  key={item.id}
                  className="app-row"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span>{item.title}</span>
                    <span className="font-medium text-emerald-400">{formatTry(item.amount)}</span>
                  </div>
                  <p className="mt-1 text-xs text-subtext">{formatDate(item.date)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Bağlı Gider Hareketleri">
          {detail.expenses.length === 0 ? (
            <EmptyState title="Gider kaydı bulunmuyor" />
          ) : (
            <div className="space-y-2">
              {detail.expenses.map((item) => (
                <div
                  key={item.id}
                  className="app-row"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span>{item.title}</span>
                    <span className="font-medium text-rose-400">{formatTry(item.amount)}</span>
                  </div>
                  <p className="mt-1 text-xs text-subtext">{formatDate(item.date)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card title="Bağlı Hatırlatmalar">
        {detail.reminders.length === 0 ? (
          <EmptyState title="Hatırlatma bulunmuyor" />
        ) : (
          <div className="space-y-2">
            {detail.reminders.map((item) => (
              <div
                key={item.id}
                className="app-row"
              >
                <div className="flex items-center justify-between text-sm">
                  <span>{item.title}</span>
                  <span className={item.isCompleted ? "text-emerald-400" : "text-amber-400"}>
                    {item.isCompleted ? "Tamamlandi" : "Bekliyor"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-subtext">{formatDate(item.dueDate)}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

