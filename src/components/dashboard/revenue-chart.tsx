type Point = {
  label: string;
  income: number;
  expense: number;
};

type RevenueChartProps = {
  data: Point[];
  title?: string;
  description?: string;
};

export default function RevenueChart({
  data,
  title = "Gelir & Gider",
  description = "Aylık özet"
}: RevenueChartProps) {
  const maxValue = Math.max(1, ...data.map((d) => Math.max(d.income, d.expense)));

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)"
      }}
    >
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3
            className="font-display mb-1 tracking-tight"
            style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--foreground)" }}
          >
            {title}
          </h3>
          <p className="text-sm" style={{ color: "var(--foreground-tertiary)" }}>
            {description}
          </p>
        </div>

        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{
                background: "linear-gradient(135deg, var(--accent-from) 0%, var(--accent-to) 100%)"
              }}
            />
            <span className="text-sm" style={{ color: "var(--foreground-secondary)" }}>
              Gelir
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ background: "var(--error)" }} />
            <span className="text-sm" style={{ color: "var(--foreground-secondary)" }}>
              Gider
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="flex h-64 min-w-[520px] items-end gap-6">
        {data.map((point, index) => {
          const incomeHeight = (point.income / maxValue) * 100;
          const expenseHeight = (point.expense / maxValue) * 100;

          return (
            <div key={`${point.label}-${index}`} className="flex flex-1 flex-col items-center gap-3">
              <div className="flex h-full w-full items-end gap-2">
                <div className="group relative flex-1 cursor-pointer">
                  <div
                    className="w-full rounded-t-lg transition-all duration-500"
                    style={{
                      height: `${incomeHeight}%`,
                      background:
                        "linear-gradient(180deg, var(--accent-from) 0%, var(--accent-to) 100%)",
                      boxShadow: "0 0 20px var(--primary-glow)"
                    }}
                  />
                  <div
                    className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg px-2 py-1 text-xs opacity-0 transition-opacity group-hover:opacity-100"
                    style={{
                      background: "var(--surface-active)",
                      border: "1px solid var(--border-strong)",
                      color: "var(--foreground)"
                    }}
                  >
                    {point.income.toLocaleString("tr-TR")}
                  </div>
                </div>

                <div className="group relative flex-1 cursor-pointer">
                  <div
                    className="w-full rounded-t-lg transition-all duration-500"
                    style={{
                      height: `${expenseHeight}%`,
                      background: "var(--error)",
                      boxShadow: "0 0 20px var(--error-glow)"
                    }}
                  />
                  <div
                    className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg px-2 py-1 text-xs opacity-0 transition-opacity group-hover:opacity-100"
                    style={{
                      background: "var(--surface-active)",
                      border: "1px solid var(--border-strong)",
                      color: "var(--foreground)"
                    }}
                  >
                    {point.expense.toLocaleString("tr-TR")}
                  </div>
                </div>
              </div>

              <div className="text-xs tracking-wider" style={{ color: "var(--foreground-tertiary)" }}>
                {point.label}
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}
