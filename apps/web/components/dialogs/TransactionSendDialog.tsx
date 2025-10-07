import React from "react";
import Dialog from "@/components/atoms/Dialog";
import IconButton, { IconButtonVariant } from "@/components/buttons/IconButton";
import Preloader from "@repo/ui/preloader";
import ExternalTextLink from "@repo/ui/external-text-link";
import Svg from "../atoms/Svg";

export type TransactionSendStatus = "sending" | "success" | "failed";

interface TransactionSendDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  status: TransactionSendStatus;
  transactionId?: string;
  transactionHash?: string;
  explorerUrl?: string;
}

export default function TransactionSendDialog({
  isOpen,
  setIsOpen,
  status,
  transactionId,
  transactionHash,
  explorerUrl,
}: TransactionSendDialogProps) {
  const handleClose = () => {
    setIsOpen(false);
  };

  const renderContent = () => {
    switch (status) {
      case "sending":
        return (
          <div className="flex flex-col items-center justify-center gap-4 p-6">
            <div className="w-16 h-16 flex items-center justify-center">
              <Preloader size={48} />
            </div>
            <div className="text-center">
              <h3 className="text-18 font-semibold text-primary-text mb-2">
                Transaction sending
              </h3>
              <p className="text-14 text-secondary-text">
                The transaction is in progress
              </p>
            </div>
          </div>
        );

      case "success":
        return (
          <div className="flex flex-col items-center justify-center gap-4 p-6">
            <div className="w-16 h-16 bg-green rounded-full flex items-center justify-center">
              <Svg className="text-white" iconName="check" size={70} />
            </div>
            <div className="text-center">
              <h3 className="text-18 font-semibold text-primary-text mb-2">
                Successfully sent
              </h3>
              {transactionId && (
                <p className="text-14 text-secondary-text mb-2">
                  Transaction ID: {transactionId}
                </p>
              )}
              {transactionHash && explorerUrl && (
                <ExternalTextLink
                  text="Transaction link"
                  href={`${explorerUrl}/tx/${transactionHash}`}
                  className="text-green hover:text-green-hover"
                >
                  Transaction link
                </ExternalTextLink>
              )}
            </div>
          </div>
        );

      case "failed":
        return (
          <div className="flex flex-col items-center justify-center gap-4 p-6">
            <div className="w-16 h-16 bg-red rounded-full flex items-center justify-center">
              <Svg className="text-white" iconName="warning" size={70} />
            </div>
            <div className="text-center">
              <h3 className="text-18 font-semibold text-red mb-2">
                Failed to send
              </h3>
              {transactionId && (
                <p className="text-14 text-secondary-text mb-2">
                  Transaction ID: {transactionId}
                </p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="w-[500px] relative">
        <div className="flex items-center justify-between p-4 border-secondary-border">
          <h2 className="text-18 font-semibold text-primary-text">
            Transaction send
          </h2>
          <IconButton
            variant={IconButtonVariant.CLOSE}
            handleClose={handleClose}
          />
        </div>
        {renderContent()}
      </div>
    </Dialog>
  );
}
