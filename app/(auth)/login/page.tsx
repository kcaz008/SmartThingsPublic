import Link from "next/link";
import { loginAction } from "@/lib/auth-actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error } = await searchParams;
  const demoMode =
    process.env.NODE_ENV !== "production" &&
    (!process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return (
    <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
          LocalSignal
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
          Sign in to your command center
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Your session is stored with secure Supabase Auth cookies.
        </p>
      </div>

      {error ? (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      {demoMode ? (
        <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
          <p className="font-bold">Demo mode is available.</p>
          <p className="mt-1">
            Supabase is not configured in this preview, so real signup/login is
            disabled. You can still open the dashboard with sample data.
          </p>
          <Link
            href="/dashboard"
            className="mt-3 inline-flex rounded-xl bg-signal-blue px-4 py-2 text-xs font-bold text-white"
          >
            Continue with demo data
          </Link>
        </div>
      ) : null}

      <form action={loginAction} className="space-y-4">
        <label className="block">
          <span className="text-sm font-bold text-slate-800">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
          />
        </label>
        <label className="block">
          <span className="text-sm font-bold text-slate-800">Password</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-2xl bg-signal-blue px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700"
        >
          Sign in
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Need an account?{" "}
        <Link href="/signup" className="font-bold text-blue-700">
          Create one
        </Link>
      </p>
      <p className="mt-3 text-center text-sm text-slate-600">
        Want to show someone the workflow?{" "}
        <Link href="/demo/scrubbed-lead" className="font-bold text-blue-700">
          Open public scrubbed-lead demo
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-slate-600">
        Or show sample posts with reply choices:{" "}
        <Link href="/demo/example-posts" className="font-bold text-blue-700">
          Open example posts demo
        </Link>
      </p>
    </section>
  );
}
