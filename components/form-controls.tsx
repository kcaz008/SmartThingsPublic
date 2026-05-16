type FieldProps = {
  label: string;
  hint?: string;
  children: React.ReactNode;
};

export function Field({ label, hint, children }: FieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-800">{label}</span>
      {hint ? <span className="ml-2 text-xs text-slate-500">{hint}</span> : null}
      <div className="mt-2">{children}</div>
    </label>
  );
}

export const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100";
