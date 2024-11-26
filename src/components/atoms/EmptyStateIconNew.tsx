import Image from "next/image";

const emptyStateIconUrlMap = {
  assets: "/empty/empty-assets.svg",
  edit: "/empty/empty-edit.svg",
  history: "/empty/empty-history.svg",
  imported: "/empty/empty-imported.svg",
  list: "/empty/empty-list.svg",
  pair: "/empty/empty-pair.svg",
  poolList: "/empty/empty-pool-list.svg",
  pool: "/empty/empty-pool-new.svg",
  search: "/empty/empty-search.svg",
  "search-list": "/empty/empty-search-list.svg",
  wallet: "/empty/empty-wallet-new.svg",
  custom: "/empty/empty-custom-tokens.svg",
  tokens: "/empty/empty-tokens.svg",
  warning: "/empty/empty-warning.svg",
  autolisting: "/empty/empty-autolisting.svg",
  "deposited-tokens": "/empty/empty-deposited-tokens.svg",
  "margin-positions": "/empty/empty-margin-positions.svg",
  "lending-orders": "/empty/empty-lending-orders.svg",
  "search-autolisting": "/empty/empty-autolisting-search.svg",
};

type EmptyIconName = keyof typeof emptyStateIconUrlMap;

export default function EmptyStateIcon({
  iconName,
  size = 340,
  className,
}: {
  iconName: EmptyIconName;
  size?: number;
  className?: string;
}) {
  return (
    <Image
      width={size}
      height={size}
      src={emptyStateIconUrlMap[iconName]}
      alt=""
      className={className}
    />
  );
}
