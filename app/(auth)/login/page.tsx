import Link from "next/link";
import { loginAction } from "@/lib/auth-actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error } = await searchParams;

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
    </section>
  );
}
