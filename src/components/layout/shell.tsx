<<<<<<< ours
<<<<<<< ours
import type { ReactNode } from "react";
import Sidebar from "./sidebar";
import Header from "./header";

type ShellProps = {
  children: ReactNode;
};

export default function Shell({ children }: ShellProps) {
  return (
    <div className="flex h-screen bg-bg text-text">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
=======
export function Shell() {
  return <div>Shell</div>;
}
>>>>>>> theirs
=======
export function Shell() {
  return <div>Shell</div>;
}
>>>>>>> theirs
