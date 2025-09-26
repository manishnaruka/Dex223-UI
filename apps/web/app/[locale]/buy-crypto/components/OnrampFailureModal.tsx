"use client";

import { useTranslations } from "next-intl";
import Dialog from "@/components/atoms/Dialog";
import Button, { ButtonColor, ButtonSize, ButtonVariant } from "@/components/buttons/Button";
import DialogHeader from "@/components/atoms/DialogHeader";

interface OnrampFailureModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  transactionData?: {
    transactionHash?: string;
    fiatAmount?: string;
    cryptoAmount?: string;
    coinCode?: string;
    orderId?: string;
    errorMessage?: string;
  };
  onRetry?: () => void;
}

export default function OnrampFailureModal({
  isOpen,
  setIsOpen,
  transactionData,
  onRetry,
}: OnrampFailureModalProps) {
  const t = useTranslations("BuyCrypto");

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleRetry = () => {
    setIsOpen(false);
    if (onRetry) {
      onRetry();
    }
  };

  return (
    <Dialog isOpen={isOpen} setIsOpen={setIsOpen}>
        <DialogHeader onClose={handleClose} title="Buy Crypto" />
      <div className="w-[500px] p-5 flex flex-col items-center text-center">
        {/* Error Icon */}
        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        {/* Title */}
        <h3 className="text-20 font-bold text-primary-text mb-2">
          Transfer failed
        </h3>

        {/* Description */}
        <p className="text-14 text-secondary-text mb-6">
          {transactionData?.fiatAmount
            ? `$${transactionData.fiatAmount} transfer to your bank account has failed`
            : "Your transaction has failed"}
        </p>

        {/* Error Details */}
        <div className="w-full bg-secondary-bg rounded-3 p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-14 text-secondary-text">Transfer failed</span>
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>

          {/* Error Message */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-2 p-3 text-left">
            <p className="text-12 text-red-500">
              {transactionData?.errorMessage ||
                "Transaction failed because the gas limit is too low. Adjust your wallet settings. If you still have issues, click common errors"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-3">
          <Button
            onClick={handleRetry}
            fullWidth
            size={ButtonSize.LARGE}
            colorScheme={ButtonColor.GREEN}
            className="bg-green hover:bg-green-hover"
          >
            Try again
          </Button>
          
          <Button
            onClick={handleClose}
            fullWidth
            size={ButtonSize.LARGE}
            colorScheme={ButtonColor.PURPLE}
            variant={ButtonVariant.OUTLINED}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
