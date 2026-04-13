export default function Header() {
  return (
    <header className="border-b border-border bg-bg/80 px-6 py-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-subtext">Hos geldin</p>
          <h2 className="text-lg font-semibold">Kontrol Paneli</h2>
        </div>

        <div className="rounded-2xl border border-border bg-panel px-4 py-2 text-sm text-subtext">
          Surum 0.1.0
        </div>
      </div>
    </header>
  );
}
