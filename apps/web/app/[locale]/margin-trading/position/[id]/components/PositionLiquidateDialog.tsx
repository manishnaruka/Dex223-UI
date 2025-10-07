import React from "react";

import LiquidateForm from "@/app/[locale]/margin-trading/position/[id]/liquidate/components/LiquidateForm";
import { MarginPosition } from "@/app/[locale]/margin-trading/types";
import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";

export default function PositionLiquidateDialog({
  isOpen,
  setIsOpen,
  position,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  position: MarginPosition;
}) {
  return (
    <DrawerDialog isOpen={isOpen} setIsOpen={setIsOpen}>
      <LiquidateForm position={position} />
    </DrawerDialog>
  );
}
