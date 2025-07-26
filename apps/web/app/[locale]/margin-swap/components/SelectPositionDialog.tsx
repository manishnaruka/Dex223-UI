import Tooltip from "@repo/ui/tooltip";
import React, { ReactNode, useState } from "react";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import { date } from "yup";

import { useMarginSwapPositionStore } from "@/app/[locale]/margin-swap/stores/useMarginSwapPositionStore";
import PositionAsset from "@/app/[locale]/margin-trading/components/widgets/PositionAsset";
import PositionDetailCard from "@/app/[locale]/margin-trading/components/widgets/PositionDetailCard";
import { usePositionsByOwner } from "@/app/[locale]/margin-trading/hooks/useMarginPosition";
import { MarginPosition } from "@/app/[locale]/margin-trading/types";
import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import { SearchInput } from "@/components/atoms/Input";
import Svg from "@/components/atoms/Svg";
import Button, { ButtonColor, ButtonSize } from "@/components/buttons/Button";
import { ThemeColors } from "@/config/theme/colors";
import { Link } from "@/i18n/routing";

enum DangerStatus {
  STABLE,
  RISKY,
  DANGEROUS,
}

const dangerIconsMap: Record<Exclude<DangerStatus, DangerStatus.STABLE>, ReactNode> = {
  [DangerStatus.RISKY]: (
    <div className="w-10 h-10 flex justify-center items-center text-yellow-light rounded-2.5 border-yellow-light border relative before:absolute before:w-4 before:h-4 before:rounded-full before:blur-[9px] before:bg-yellow-light">
      <Svg iconName="warning" />
    </div>
  ),
  [DangerStatus.DANGEROUS]: (
    <div className="w-10 h-10 flex justify-center items-center text-red-light rounded-2.5 border-red-light border relative before:absolute before:w-4 before:h-4 before:rounded-full before:blur-[9px] before:bg-red-light">
      <Svg iconName="warning" />
    </div>
  ),
};

function PositionSelectItem({
  position,
  handleSelectedPosition,
}: {
  handleSelectedPosition: (position: MarginPosition) => void;
  position: MarginPosition;
}) {
  return (
    <div className="p-5 rounded-3 bg-tertiary-bg">
      <div className="flex items-center mb-3 gap-3">
        <Link className="flex items-center gap-2 text-secondary-text" href="#">
          View position details
          <Svg iconName="next" />
        </Link>
        <div className="w-[178px]">
          <PositionDetailCard title="ID" value={position.id} tooltipText="Tooltip text" />
        </div>
        <PositionDetailCard
          title="Deadline"
          value={new Date(position.deadline * 1000).toLocaleString("en-GB").split("/").join(".")}
          tooltipText="Tooltip text"
        />
        <span className="text-green flex items-center gap-3 min-w-[92px]">
          {dangerIconsMap[DangerStatus.RISKY]}
          {dangerIconsMap[DangerStatus.DANGEROUS]}
        </span>
        <div className="w-[210px]">
          <Button
            fullWidth
            size={ButtonSize.MEDIUM}
            colorScheme={ButtonColor.PURPLE}
            className="flex-grow"
            onClick={() => handleSelectedPosition(position)}
          >
            Select position
          </Button>
        </div>
      </div>

      <div className="bg-primary-bg rounded-3 p-5 flex flex-wrap gap-2">
        <div className="flex items-center gap-1">
          <Tooltip text="Tooltip text" /> Assets {position.assets.length}/
          {position.order.currencyLimit}
        </div>
        {position.assets?.map((asset) => (
          <PositionAsset
            key={asset.wrapped.address0}
            amount={12.22}
            symbol={asset.symbol || "Unknown"}
          />
        ))}
      </div>
    </div>
  );
}

export function SelectedPositionInfo() {
  const { marginSwapPosition } = useMarginSwapPositionStore();

  if (!marginSwapPosition) {
    return null;
  }

  return (
    <div className="bg-primary-bg p-5 rounded-3">
      <div className="flex justify-between mb-3">
        <Link className="flex items-center gap-2 text-secondary-text" href="#">
          View position details
          <Svg iconName="next" />
        </Link>
      </div>
      <div className="grid gap-2.5">
        <PositionDetailCard title="ID" value={marginSwapPosition.id} tooltipText="Tooltip text" />
        <PositionDetailCard
          title="Deadline"
          value={new Date(marginSwapPosition.deadline * 1000)
            .toLocaleString("en-GB")
            .split("/")
            .join(".")}
          tooltipText="Tooltip text"
        />
        <div className="bg-tertiary-bg rounded-3 p-5">
          <div className="flex items-center gap-1 w-full text-tertiary-text mb-2">
            <Tooltip text="Tooltip text" /> <span>Assets:</span>
            <span className="text-secondary-text">
              {marginSwapPosition.assets.length || 0} / {marginSwapPosition.order.currencyLimit}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {marginSwapPosition.assetsWithBalances?.map(({ asset, balance }) => (
              <PositionAsset
                key={asset.wrapped.address0}
                amount={formatUnits(balance || BigInt(0), asset.decimals)}
                symbol={asset.symbol || "Unknown"}
              />
            ))}
          </div>
        </div>{" "}
      </div>
    </div>
  );
}

export default function SelectPositionDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const { setMarginSwapPosition } = useMarginSwapPositionStore();

  const { address } = useAccount();
  const { loading, positions } = usePositionsByOwner({ owner: address });

  if (loading || !positions) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <DrawerDialog isOpen={isOpen} setIsOpen={setIsOpen}>
        <DialogHeader onClose={() => setIsOpen(false)} title="Select position" />
        <div className="w-[1200px] card-spacing-x card-spacing-b">
          <SearchInput
            placeholder="Search position ID"
            colorScheme={ThemeColors.PURPLE}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <div className="grid gap-5 mt-5">
            {positions.map((position) => (
              <PositionSelectItem
                key={position.id}
                handleSelectedPosition={(position) => {
                  setMarginSwapPosition(position);
                  setIsOpen(false);
                }}
                position={position}
              />
            ))}
          </div>
        </div>
      </DrawerDialog>
      <Button
        size={ButtonSize.MEDIUM}
        onClick={() => setIsOpen(true)}
        colorScheme={ButtonColor.PURPLE}
      >
        Select position
      </Button>
    </>
  );
}
