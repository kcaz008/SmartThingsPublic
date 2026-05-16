type StatCardProps = {
  label: string;
  value: string;
  helper: string;
  tone?: "blue" | "green" | "amber" | "red";
};

const tones = {
  blue: "bg-blue-50 text-blue-700",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
};

export function StatCard({
  label,
  value,
  helper,
  tone = "blue",
}: StatCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
      <div
        className={`mb-5 inline-flex rounded-full px-3 py-1 text-xs font-bold ${tones[tone]}`}
      >
        {label}
      </div>
      <p className="text-3xl font-black tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{helper}</p>
    </div>
  );
}
