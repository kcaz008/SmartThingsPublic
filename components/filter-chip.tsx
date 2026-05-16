type FilterChipProps = {
  children: React.ReactNode;
  active?: boolean;
};

export function FilterChip({ children, active = false }: FilterChipProps) {
  return (
    <button
      type="button"
      className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-inset transition ${
        active
          ? "bg-signal-navy text-white ring-signal-navy"
          : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}
