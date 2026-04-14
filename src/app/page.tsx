import { useEffect, useMemo, useState } from "react";
import StatCard from "../components/dashboard/stat-card";
import RecentActivity from "../components/dashboard/recent-activity";
import RevenueChart from "../components/dashboard/revenue-chart";
import type { ActivityItem, DashboardSummary } from "../../shared/dashboard";

function formatTry(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0
  }).format(value);
}

const emptySummary: DashboardSummary = {
  monthlyIncome: 0,
  monthlyExpense: 0,
  netBalance: 0,
  activeCustomerCount: 0,
  pendingReminderCount: 0
};

const monthLabels = ["Oca", "Şub", "Mar", "Nis", "May", "Haz"];

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary>(emptySummary);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      if (!window.desktopAPI?.dashboard) {
        setError("Dashboard API bulunamadı.");
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
        setError("Dashboard verileri yüklenemedi.");
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  const monthly = useMemo(
    () => ({
      income: formatTry(summary.monthlyIncome),
      expense: formatTry(summary.monthlyExpense),
      net: formatTry(summary.netBalance)
    }),
    [summary.monthlyExpense, summary.monthlyIncome, summary.netBalance]
  );

  const chartData = useMemo(() => {
    const base = summary.monthlyIncome || 1;
    return monthLabels.map((label, index) => ({
      label,
      income: Math.round(base * (0.55 + index * 0.09)),
      expense: Math.round((summary.monthlyExpense || base / 2) * (0.6 + index * 0.07))
    }));
  }, [summary.monthlyIncome, summary.monthlyExpense]);

  return (
    <div className="space-y-8">
      {error ? (
        <div
          className="rounded-2xl px-4 py-3 text-sm"
          style={{
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "var(--error)"
          }}
        >
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
        <StatCard
          label="Aylık Gelir"
          value={monthly.income}
          change="+12.5%"
          changeType="positive"
          icon="↑"
          tone="primary"
        />
        <StatCard
          label="Aylık Gider"
          value={monthly.expense}
          change="+5.2%"
          changeType="negative"
          icon="↓"
          tone="error"
        />
        <StatCard
          label="Net Bakiye"
          value={monthly.net}
          change="+18.3%"
          changeType="positive"
          icon="◈"
          tone="success"
        />
        <StatCard
          label="Aktif Müşteri"
          value={String(summary.activeCustomerCount)}
          change={`+${summary.activeCustomerCount}`}
          changeType="positive"
          icon="◉"
          tone="warning"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 2xl:grid-cols-[minmax(0,2fr)_minmax(360px,1fr)] 2xl:gap-6">
        <div className="min-w-0 space-y-4 2xl:space-y-6">
          <RevenueChart
            data={chartData}
            title="Gelir & Gider"
            description={`Son ${monthLabels.length} ay genel bakış`}
          />

          <div
            className="rounded-2xl p-6"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)"
            }}
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3
                className="font-display tracking-tight"
                style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--foreground)" }}
              >
                Bekleyen Hatırlatmalar
              </h3>
              <span
                className="rounded-lg px-3 py-1.5 text-sm"
                style={{ background: "rgba(245, 158, 11, 0.15)", color: "var(--warning)" }}
              >
                {summary.pendingReminderCount} bekliyor
              </span>
            </div>

            {summary.pendingReminderCount === 0 ? (
              <p className="text-sm" style={{ color: "var(--foreground-tertiary)" }}>
                Bekleyen hatırlatma yok.
              </p>
            ) : (
              <p className="text-sm" style={{ color: "var(--foreground-secondary)" }}>
                Hatırlatmalar sayfasından detaylı görüntüleyebilirsin.
              </p>
            )}
          </div>
        </div>

        <div
          className="min-w-0 rounded-2xl p-6"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)"
          }}
        >
          <h3
            className="font-display mb-6 tracking-tight"
            style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--foreground)" }}
          >
            Son Aktiviteler
          </h3>
          <div className="max-h-[60vh] overflow-y-auto pr-1 2xl:max-h-[640px]">
            <RecentActivity items={activities} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}
