interface Props {
  current: number | null;
  total: number;
}

export default function ProgressBar({ current, total }: Props) {
  if (current === null || total === 0) return null;
  const pct = Math.min((current / total) * 100, 100);

  return (
    <div className="w-full h-1 bg-[#38383C] rounded-full mt-3 overflow-hidden">
      <div
        className="h-full bg-[#0A84FF] rounded-full transition-all duration-200 ease-in-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
