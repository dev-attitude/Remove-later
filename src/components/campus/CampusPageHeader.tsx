type Props = {
  title: string;
  description: string;
  badge?: string;
};

export function CampusPageHeader({ title, description, badge }: Props) {
  return (
    <div className="mb-6">
      {badge && (
        <span className="mb-2 inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
          {badge}
        </span>
      )}
      <h1 className="text-2xl font-bold text-charcoal">{title}</h1>
      <p className="mt-1 max-w-3xl text-sm text-muted">{description}</p>
    </div>
  );
}
