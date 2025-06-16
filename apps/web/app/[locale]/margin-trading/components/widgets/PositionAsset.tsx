export default function PositionAsset({
  amount,
  symbol,
}: {
  amount: number | string;
  symbol: string;
}) {
  return (
    <div className="flex items-center gap-1 bg-quaternary-bg px-2 py-1 rounded-2">
      <span className="text-secondary-text">{amount}</span>
      <span className="text-tertiary-text">{symbol}</span>
    </div>
  );
}
