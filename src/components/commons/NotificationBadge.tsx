type NotificationBadgeProps = {
  count: number;
	max?: number;
}

export const NotificationBadge = ({count, max = 9}: NotificationBadgeProps) => {
	if (count <= 0) return null;

	const label = count > max ? `${max} +` : count;

	return (
		<span className="bg-red-600 text-white absolute -top-1 -right-1 flex min-h-7 min-w-7 items-center justify-center rounded-full px-1 text-base font-bold leading-none"
		>
			{label}
		</span>
	);
}