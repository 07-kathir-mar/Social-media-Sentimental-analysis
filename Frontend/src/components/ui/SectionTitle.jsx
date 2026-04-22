function SectionTitle({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-xs uppercase tracking-[0.35em] text-orange-200/70">{eyebrow}</p>
        ) : null}
        <h2 className="text-2xl font-semibold text-white md:text-3xl">{title}</h2>
        {description ? <p className="max-w-2xl text-sm text-slate-300">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

export default SectionTitle;