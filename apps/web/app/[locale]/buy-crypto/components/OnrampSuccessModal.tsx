"use client";

import { useTranslations } from "next-intl";

import Dialog from "@/components/atoms/Dialog";
import DialogHeader from "@/components/atoms/DialogHeader";
import Button, { ButtonColor, ButtonSize } from "@/components/buttons/Button";

interface OnrampSuccessModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  transactionData?: {
    transactionHash?: string;
    fiatAmount?: string;
    cryptoAmount?: string;
    coinCode?: string;
    orderId?: string;
  };
}

export default function OnrampSuccessModal({
  isOpen,
  setIsOpen,
  transactionData,
}: OnrampSuccessModalProps) {
  const t = useTranslations("BuyCrypto");

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog isOpen={isOpen} setIsOpen={setIsOpen}>
      <DialogHeader onClose={handleClose} title="Buy Crypto" />
      <div className="w-[500px] p-5 flex flex-col items-center text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-green rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Title */}
        <h3 className="text-20 font-bold text-primary-text mb-2">Successfully transferred</h3>

        {/* Description */}
        <p className="text-14 text-secondary-text mb-6">
          {transactionData?.fiatAmount && transactionData?.coinCode
            ? `$${transactionData.fiatAmount} has been successfully transferred to your bank account`
            : "Your transaction has been completed successfully"}
        </p>

        {/* Transaction Details */}
        {transactionData && (
          <div className="w-full rounded-3 p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-14 text-secondary-text">Successfully transferred</span>
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-green"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <svg
                  className="w-4 h-4 text-green"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
