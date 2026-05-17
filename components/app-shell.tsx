import Link from "next/link";
import { formatAutopilotMode } from "@/lib/format";
import { logoutAction } from "@/lib/auth-actions";
import { switchActiveBusinessAction } from "@/lib/client-actions";
import { getBusiness, listBusinesses } from "@/lib/data";
import { requireAuthContext } from "@/lib/auth";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: "★", featured: true },
  { href: "/opportunities/new", label: "Add Opportunity", icon: "+" },
  { href: "/browser-assist", label: "Browser Assist", icon: "⇄" },
  { href: "/sources", label: "Sources", icon: "◎" },
  { href: "/settings", label: "Settings", icon: "⚙" },
  { href: "/settings/clients", label: "Clients", icon: "◆" },
  { href: "/settings/reputation-memory", label: "Memory", icon: "◉" },
  { href: "/settings/connected-accounts", label: "Connections", icon: "↗" },
];

export async function AppShell({ children }: { children: React.ReactNode }) {
  const authContext = await requireAuthContext();
  const [currentBusiness, businesses] = await Promise.all([
    getBusiness(authContext.businessId),
    listBusinesses(),
  ]);

  return (
    <div className="min-h-screen lg:flex">
      <aside className="border-b border-slate-200 bg-signal-navy text-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 lg:border-b-0">
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 px-6 py-6">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div
                className="grid size-11 place-items-center rounded-2xl text-lg font-black text-white"
                style={{ backgroundColor: currentBusiness.brandColor }}
              >
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
                className={`group flex min-w-max items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  item.featured
                    ? "border border-white/30 bg-white text-signal-navy shadow-lg"
                    : "text-slate-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span
                  className={`grid size-9 place-items-center rounded-xl text-sm font-black ${
                    item.featured
                      ? "bg-signal-blue text-white"
                      : "bg-white/10 text-slate-200 group-hover:bg-white/15"
                  }`}
                >
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
              <form action={switchActiveBusinessAction} className="mt-4">
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-300">
                  Active client
                </label>
                <select
                  name="businessId"
                  defaultValue={currentBusiness.id}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white px-3 py-2 text-sm font-bold text-signal-navy"
                >
                  {businesses.map((business) => (
                    <option key={business.id} value={business.id}>
                      {business.name}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="mt-2 w-full rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/20"
                >
                  Switch client
                </button>
              </form>
              <div className="mt-4 border-t border-white/10 pt-4">
                <p className="text-sm font-semibold text-white">
                  {authContext.fullName}
                </p>
                <p className="text-xs capitalize text-slate-300">
                  {authContext.role}
                </p>
                <form action={logoutAction} className="mt-3">
                  <button
                    type="submit"
                    className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/20"
                  >
                    Log out
                  </button>
                </form>
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
