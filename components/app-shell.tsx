import Link from "next/link";
import { currentBusiness } from "@/lib/sample-data";
import { formatAutopilotMode } from "@/lib/format";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: "Command" },
  { href: "/opportunities/new", label: "Add Opportunity", icon: "Plus" },
  { href: "/sources", label: "Sources", icon: "Radar" },
  { href: "/settings", label: "Settings", icon: "Gear" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:flex">
      <aside className="border-b border-slate-200 bg-signal-navy text-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 lg:border-b-0">
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 px-6 py-6">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-2xl bg-white text-lg font-black text-signal-navy">
                LS
              </div>
              <div>
                <p className="text-lg font-bold tracking-tight">LocalSignal</p>
                <p className="text-xs text-slate-300">HVAC lead command</p>
              </div>
            </Link>
          </div>

          <nav className="flex gap-2 overflow-x-auto px-4 py-4 lg:flex-col lg:overflow-visible">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex min-w-max items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
              >
                <span className="grid size-9 place-items-center rounded-xl bg-white/10 text-xs text-slate-200 group-hover:bg-white/15">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto hidden p-4 lg:block">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
                Active business
              </p>
              <p className="mt-2 font-semibold">{currentBusiness.name}</p>
              <p className="mt-1 text-sm text-slate-300">
                {currentBusiness.serviceArea}
              </p>
              <div className="mt-4 rounded-2xl bg-white px-3 py-2 text-sm font-semibold text-signal-navy">
                Autopilot:{" "}
                {formatAutopilotMode(currentBusiness.autopilotMode)}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 px-4 py-6 sm:px-6 lg:ml-72 lg:px-10 lg:py-8">
        {children}
      </main>
    </div>
  );
}
