"use client";

import React from "react";

import OrderConfigurationPage from "@/app/[locale]/margin-trading/lending-order/[id]/components/OrderConfigurationPage";
import ReviewLendingOrderDialog from "@/app/[locale]/margin-trading/lending-order/create/components/ReviewCreateOrderDialog";
import { useCreateOrderConfigStore } from "@/app/[locale]/margin-trading/lending-order/create/stores/useCreateOrderConfigStore";
import { useCreateOrderStepStore } from "@/app/[locale]/margin-trading/lending-order/create/stores/useCreateOrderStepStore";
import { useConfirmCreateOrderDialogStore } from "@/app/[locale]/margin-trading/stores/dialogStates";
import { OrderActionMode } from "@/app/[locale]/margin-trading/types";
import { useRecentTransactionTracking } from "@/hooks/useRecentTransactionTracking";

export default function CreateLendingOrderPage() {
  useRecentTransactionTracking();

  const { step, setStep } = useCreateOrderStepStore();

  const config = useCreateOrderConfigStore();

  const { isOpen, setIsOpen } = useConfirmCreateOrderDialogStore();

  return (
    <>
      <OrderConfigurationPage
        {...config}
        openPreviewDialog={() => setIsOpen(true)}
        setStep={setStep}
        mode={OrderActionMode.CREATE}
        step={step}
      />

      <ReviewLendingOrderDialog isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
}
