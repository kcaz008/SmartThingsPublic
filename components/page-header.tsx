type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-signal-blue">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
          {description}
        </p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
