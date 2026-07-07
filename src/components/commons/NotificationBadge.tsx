type NotificationBadgeProps = {
  count: number;
  max?: number;
};

export const NotificationBadge = ({ count, max = 9 }: NotificationBadgeProps) => {
  if (count <= 0) return null;

  const label = count > max ? `${max} +` : count;

  return (
    <span className="border-border/60 bg-danger text-primary absolute -top-1 -right-1 flex min-h-7 min-w-7 items-center justify-center rounded-none border-2 px-1 text-base leading-none font-bold">
      {label}
    </span>
  );
};
