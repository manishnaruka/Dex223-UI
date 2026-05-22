"use client";

import Preloader from "@repo/ui/preloader";
import clsx from "clsx";
import { useEffect, useState } from "react";

import DrawerDialog from "@/components/atoms/DrawerDialog";
import Input, { InputSize } from "@/components/atoms/Input";
import Svg from "@/components/atoms/Svg";
import Button, { ButtonColor, ButtonSize, ButtonVariant } from "@/components/buttons/Button";
import IconButton, { IconButtonVariant } from "@/components/buttons/IconButton";
import RadioButton from "@/components/buttons/RadioButton";
import NetworkFeeConfigDialog from "@/components/dialogs/NetworkFeeConfigDialog";

import {
  useClaimGasLimitStore,
  useClaimGasModeStore,
  useClaimGasPriceStore,
} from "../stores/useClaimGasSettingsStore";
import {
  NetworkDetails,
  ProofPanel,
  TokenMark,
  WalletAlert,
} from "./_claim-shared";

type SmartClaimStatus = "review" | "awaiting" | "executing" | "success";
type StepStatus = "idle" | "next" | "awaiting" | "executing" | "success";

interface Props {
  isOpen: boolean;
  onOpenChange: (value: boolean) => void;
}

const proof = {
  claim_index: 42,
  claimed_amount: "3,232.23 USDT",
  chains: ["Ethereum", "Base", "BSC"],
  token_contract_address: "0x1234567890abcdef1234567890abcdef12345678",
  recipient_wallet_address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
  merkle_proof_hashes: [
    "0xa1b2c3d4e5f67890123456789abcdefabcdefabcdefabcdefabcdefabcdefabc",
    "0xb2c3d4e5f67890123456789abcdefabcdefabcdefabcdefabcdefabcdefabcde",
    "0xc3d4e5f67890123456789abcdefabcdefabcdefabcdefabcdefabcdefabcdef",
  ],
};

const chainSteps = ["Ethereum", "Base", "BSC"];

function StepStatusBadge({ status }: { status: StepStatus }) {
  const config = (() => {
    switch (status) {
      case "success":
        return { bg: "bg-green", icon: "done" as const, iconClass: "text-primary-bg" };
      case "awaiting":
      case "executing":
        return { bg: "bg-green", icon: "arrow-bottom" as const, iconClass: "text-primary-bg" };
      case "next":
        return { bg: "bg-yellow-light", icon: "minus" as const, iconClass: "text-primary-bg" };
      case "idle":
      default:
        return { bg: "bg-tertiary-text", icon: "minus" as const, iconClass: "text-primary-bg" };
    }
  })();

  return (
    <span
      className={clsx(
        "absolute -bottom-1 -right-1 grid h-4 w-4 place-items-center rounded-full border border-primary-bg",
        config.bg,
      )}
    >
      <Svg iconName={config.icon} size={10} className={config.iconClass} />
    </span>
  );
}

function ChainMark({ status }: { status: StepStatus }) {
  const muted = status === "idle" || status === "next" || status === "success";
  return (
    <span className="relative">
      <TokenMark muted={muted} />
      <StepStatusBadge status={status} />
    </span>
  );
}

function SmartClaimSummary() {
  return (
    <div className="flex items-center justify-between rounded-3 bg-tertiary-bg p-4 md:p-5">
      <div className="flex flex-col gap-1">
        <span className="text-12 text-secondary-text">You claim</span>
        <span className="text-20 font-medium text-primary-text">3,232.23</span>
        <span className="text-12 text-secondary-text">$3,232.23</span>
      </div>
      <div className="flex items-center gap-2 text-18 font-medium text-primary-text">
        <TokenMark />
        USDT
      </div>
    </div>
  );
}

function ClaimToast({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="fixed right-4 top-4 z-[1000] flex w-[360px] max-w-[calc(100vw-32px)] items-start gap-3 rounded-3 border border-secondary-border bg-primary-bg p-4 shadow-2xl">
      <TokenMark size="large" />
      <div className="min-w-0 flex-1">
        <p className="font-bold text-primary-text">Successfully claimed</p>
        <p className="text-14 text-secondary-text">3,232.23 USDT</p>
      </div>
      <IconButton variant={IconButtonVariant.CLOSE} handleClose={onDismiss} />
    </div>
  );
}

function SmartStepRow({
  status,
  isLast,
}: {
  status: StepStatus;
  isLast: boolean;
}) {
  const isActive = status === "awaiting" || status === "executing";
  const isSuccess = status === "success";

  return (
    <div className="relative grid min-h-12 grid-cols-[32px_auto_1fr] items-center gap-2 max-sm:grid-cols-[32px_1fr_auto]">
      {!isLast ? (
        <span className="absolute left-4 top-1/2 h-full w-px -translate-x-1/2 bg-green-bg" />
      ) : null}
      <div className="relative z-10">
        <ChainMark status={status} />
      </div>
      <span
        className={clsx(
          "text-14 font-medium",
          isActive ? "text-primary-text" : "text-secondary-text",
        )}
      >
        {status === "executing"
          ? "Executing token claims"
          : isSuccess
            ? "Successfully claimed"
            : "Confirm claiming"}
      </span>
      <div className="flex items-center justify-end gap-3 text-12 text-secondary-text max-sm:col-start-2 max-sm:col-end-4 max-sm:justify-start">
        {status === "awaiting" ? (
          <>
            <Preloader type="linear" />
            Proceed in your wallet
          </>
        ) : null}
        {status === "executing" ? (
          <>
            <button className="inline-flex h-6 items-center rounded-full bg-green-bg px-3 text-10 font-medium text-primary-text max-sm:min-w-[220px]">
              Speed up
            </button>
            <Svg iconName="forward" size={18} className="text-green" />
            <Preloader size={18} />
          </>
        ) : null}
        {isSuccess ? (
          <>
            <Svg iconName="forward" size={18} className="text-green" />
            <Svg iconName="done" size={20} className="text-green" />
          </>
        ) : null}
      </div>
    </div>
  );
}

function SuccessBody() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-green-bg text-green shadow-[0_0_26px_rgba(112,197,158,0.45)]">
          <Svg iconName="done" size={40} />
        </span>
        <div>
          <h3 className="text-20 font-bold text-primary-text">Successfully claimed</h3>
          <div className="mt-2 flex items-center justify-center gap-2 text-16 text-primary-text">
            <TokenMark size="small" />
            3,232.23 USDT
          </div>
        </div>
      </div>
      <SmartStepRow status="success" isLast />
      <ProofPanel proof={proof} />
    </div>
  );
}

export default function SmartClaimDialog({ isOpen, onOpenChange }: Props) {
  const [status, setStatus] = useState<SmartClaimStatus>("review");
  const [recipient, setRecipient] = useState<"connected" | "another">("connected");
  const [address, setAddress] = useState("");
  const [showAddressError, setShowAddressError] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [showWalletAlert, setShowWalletAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isGasSettingsOpen, setIsGasSettingsOpen] = useState(false);

  const { gasPriceOption, gasPriceSettings, setGasPriceOption, setGasPriceSettings } =
    useClaimGasPriceStore();
  const { customGasLimit, estimatedGas, setCustomGasLimit, setEstimatedGas } =
    useClaimGasLimitStore();
  const { isAdvanced, setIsAdvanced } = useClaimGasModeStore();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setStatus("review");
    setRecipient("connected");
    setAddress("");
    setShowAddressError(false);
    setActiveStep(0);
    setShowWalletAlert(false);
    setShowToast(false);
  }, [isOpen]);

  useEffect(() => {
    if (status === "awaiting") {
      setShowWalletAlert(true);
      const id = setTimeout(() => {
        setShowWalletAlert(false);
        setStatus("executing");
      }, 1300);
      return () => clearTimeout(id);
    }

    if (status === "executing") {
      const id = setTimeout(() => {
        if (activeStep < chainSteps.length - 1) {
          setActiveStep((step) => step + 1);
          setStatus("awaiting");
          return;
        }

        setStatus("success");
        setShowToast(true);
      }, 1300);
      return () => clearTimeout(id);
    }
  }, [activeStep, status]);

  const getStepStatus = (index: number): StepStatus => {
    if (status === "success" || index < activeStep) {
      return "success";
    }

    if (index > activeStep) {
      return index === activeStep + 1 ? "next" : "idle";
    }

    if (status === "executing") {
      return "executing";
    }

    if (status === "awaiting") {
      return "awaiting";
    }

    return "idle";
  };

  const handleConfirm = () => {
    if (recipient === "another" && !address.trim()) {
      setShowAddressError(true);
      return;
    }
    setStatus("awaiting");
  };

  const renderBody = () => {
    if (status === "success") {
      return <SuccessBody />;
    }

    if (status === "awaiting" || status === "executing") {
      return (
        <div className="flex flex-col gap-4">
          <SmartClaimSummary />
          <div className="flex flex-col gap-2 border-t border-secondary-border pt-4">
            {chainSteps.map((chain, index) => (
              <SmartStepRow
                key={chain}
                status={getStepStatus(index)}
                isLast={index === chainSteps.length - 1}
              />
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        <SmartClaimSummary />
        <div className="rounded-3 bg-tertiary-bg p-4">
          <p className="mb-3 text-14 font-bold text-secondary-text">Send tokens to</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
            <RadioButton
              isActive={recipient === "connected"}
              bgColor="bg-quaternary-bg"
              className="min-h-10 rounded-2 py-2 text-16 sm:text-12 md:text-14"
              onClick={() => {
                setRecipient("connected");
                setShowAddressError(false);
              }}
            >
              Connected wallet
            </RadioButton>
            <RadioButton
              isActive={recipient === "another"}
              bgColor="bg-quaternary-bg"
              className="min-h-10 rounded-2 py-2 text-16 sm:text-12 md:text-14"
              onClick={() => setRecipient("another")}
            >
              Another address
            </RadioButton>
          </div>
          {recipient === "another" ? (
            <div className="mt-4">
              <label className="mb-2 block text-14 font-bold text-secondary-text">
                Wallet address
              </label>
              <Input
                inputSize={InputSize.DEFAULT}
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setShowAddressError(false);
                }}
                placeholder="0x..."
                isError={showAddressError}
                className="bg-global-bg"
              />
              {showAddressError ? (
                <p className="mt-2 text-12 text-red-light">Please provide the wallet address</p>
              ) : null}
            </div>
          ) : null}
        </div>
        <NetworkDetails
          chainLabel="Ethereum"
          chainsLabel="Ethereum, Base, BSC"
          onEdit={() => setIsGasSettingsOpen(true)}
        />
        <div className="grid grid-cols-2 gap-3 pt-1">
          <Button
            variant={ButtonVariant.CONTAINED}
            colorScheme={ButtonColor.LIGHT_GREEN}
            size={ButtonSize.LARGE}
            mobileSize={ButtonSize.MEDIUM}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant={ButtonVariant.CONTAINED}
            colorScheme={ButtonColor.GREEN}
            size={ButtonSize.LARGE}
            mobileSize={ButtonSize.MEDIUM}
            onClick={handleConfirm}
            disabled={recipient === "another" && showAddressError}
          >
            Confirm claiming
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      <DrawerDialog isOpen={isOpen} setIsOpen={onOpenChange} maxMobileWidth="520px">
        <div className="flex max-h-[calc(100dvh-8px)] w-[calc(100vw-24px)] max-w-[600px] flex-col rounded-t-3 bg-primary-bg shadow-2xl sm:rounded-5">
          <div className="flex flex-shrink-0 items-center justify-between px-4 pb-3 pt-4 md:px-6 md:pb-4 md:pt-6">
            <h2 className="text-18 font-bold text-primary-text md:text-20">Smart claim</h2>
            <IconButton variant={IconButtonVariant.CLOSE} handleClose={() => onOpenChange(false)} />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 md:px-6 md:pb-6">
            {renderBody()}
          </div>
        </div>
      </DrawerDialog>
      {showWalletAlert ? <WalletAlert onClose={() => setShowWalletAlert(false)} /> : null}
      {showToast ? <ClaimToast onDismiss={() => setShowToast(false)} /> : null}
      <NetworkFeeConfigDialog
        isOpen={isGasSettingsOpen}
        setIsOpen={setIsGasSettingsOpen}
        isAdvanced={isAdvanced}
        setIsAdvanced={setIsAdvanced}
        gasPriceOption={gasPriceOption}
        gasPriceSettings={gasPriceSettings}
        setGasPriceOption={setGasPriceOption}
        setGasPriceSettings={setGasPriceSettings}
        customGasLimit={customGasLimit}
        estimatedGas={estimatedGas}
        setCustomGasLimit={setCustomGasLimit}
        setEstimatedGas={setEstimatedGas}
      />
    </>
  );
}
