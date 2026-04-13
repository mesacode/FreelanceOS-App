<<<<<<< ours
<<<<<<< ours
type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
};

export default function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="rounded-3xl border border-border bg-panel p-5 shadow-soft">
      <p className="text-sm text-subtext">{label}</p>
      <h3 className="mt-3 text-3xl font-semibold tracking-tight">{value}</h3>
      {hint && <p className="mt-2 text-xs text-subtext">{hint}</p>}
    </div>
  );
}
=======
export function StatCard() {
  return <div>Stat Card</div>;
}
>>>>>>> theirs
=======
export function StatCard() {
  return <div>Stat Card</div>;
}
>>>>>>> theirs
