import type { ReactNode } from "react";
import Sidebar from "./sidebar";
import Header from "./header";
import BackgroundEffect from "./background-effect";

type ShellProps = {
  children: ReactNode;
};

export default function Shell({ children }: ShellProps) {
  return (
    <div
      className="relative flex h-screen w-full overflow-hidden"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      <BackgroundEffect />
      <Sidebar />
      <div className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto px-3 py-4 md:px-5 lg:px-6 xl:px-8">
          <div className="mx-auto min-w-0 max-w-[1600px] space-y-6 lg:space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
