<<<<<<< ours
<<<<<<< ours
import { useEffect, useMemo, useState } from "react";
import StatCard from "../components/dashboard/stat-card";
import Card from "../components/ui/card";
import RecentActivity from "../components/dashboard/recent-activity";
import type { ActivityItem, DashboardSummary } from "../../shared/dashboard";

function formatTry(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2
  }).format(value);
}

const emptySummary: DashboardSummary = {
  monthlyIncome: 0,
  monthlyExpense: 0,
  netBalance: 0,
  activeCustomerCount: 0,
  pendingReminderCount: 0
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary>(emptySummary);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      if (!window.desktopAPI?.dashboard) {
        setError("Dashboard API bulunamadi.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const [summaryData, activityData] = await Promise.all([
          window.desktopAPI.dashboard.summary(),
          window.desktopAPI.dashboard.activities()
        ]);
        setSummary(summaryData);
        setActivities(activityData);
      } catch (err) {
        console.error(err);
        setError("Dashboard verileri yuklenemedi.");
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  const monthlySummary = useMemo(() => {
    return {
      income: formatTry(summary.monthlyIncome),
      expense: formatTry(summary.monthlyExpense),
      net: formatTry(summary.netBalance)
    };
  }, [summary.monthlyExpense, summary.monthlyIncome, summary.netBalance]);

  return (
    <div className="space-y-6 p-2">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-subtext">Gercek zamanli is ozeti</p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Bu Ay Gelir" value={monthlySummary.income} hint="Guncel ay toplam gelir" />
        <StatCard label="Bu Ay Gider" value={monthlySummary.expense} hint="Guncel ay toplam gider" />
        <StatCard label="Net Bakiye" value={monthlySummary.net} hint="Gelir - gider" />
        <StatCard
          label="Aktif Musteri"
          value={String(summary.activeCustomerCount)}
          hint="Status ACTIVE olanlar"
        />
        <StatCard
          label="Bekleyen Hatirlatma"
          value={String(summary.pendingReminderCount)}
          hint="Tamamlanmamis gorevler"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Card title="Aylik Durum" description="Gelir ve gider ozeti">
            {loading ? (
              <div className="text-sm text-subtext">Yukleniyor...</div>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-border bg-muted/30 p-4">
                  <p className="text-xs text-subtext">Toplam Gelir</p>
                  <p className="mt-2 text-xl font-semibold text-emerald-400">
                    {monthlySummary.income}
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-muted/30 p-4">
                  <p className="text-xs text-subtext">Toplam Gider</p>
                  <p className="mt-2 text-xl font-semibold text-rose-400">
                    {monthlySummary.expense}
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-muted/30 p-4">
                  <p className="text-xs text-subtext">Net</p>
                  <p className="mt-2 text-xl font-semibold">{monthlySummary.net}</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        <Card title="Son Aktiviteler" description="Yeni ve guncellenen kayitlar">
          <RecentActivity items={activities} loading={loading} />
        </Card>
      </div>
    </div>
  );
=======
export default function HomePage() {
  return <main>FreelanceOS Dashboard</main>;
>>>>>>> theirs
=======
export default function HomePage() {
  return <main>FreelanceOS Dashboard</main>;
>>>>>>> theirs
}
