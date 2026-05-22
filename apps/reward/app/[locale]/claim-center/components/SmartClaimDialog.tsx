"use client";

import Preloader from "@repo/ui/preloader";
import clsx from "clsx";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import DrawerDialog from "@/components/atoms/DrawerDialog";
import Input, { InputSize } from "@/components/atoms/Input";
import Svg from "@/components/atoms/Svg";
import Button, { ButtonColor, ButtonSize, ButtonVariant } from "@/components/buttons/Button";
import IconButton, { IconButtonVariant } from "@/components/buttons/IconButton";
import RadioButton from "@/components/buttons/RadioButton";

type SmartClaimStatus = "review" | "awaiting" | "executing" | "success";
type StepStatus = "idle" | "awaiting" | "executing" | "success";

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

const steps = [
  { chain: "Ethereum", accent: "bg-primary-text", badge: "E" },
  { chain: "Base", accent: "bg-secondary-text", badge: "B" },
  { chain: "BSC", accent: "bg-yellow-light", badge: "B" },
];

function TokenMark({ size = "default", muted = false }: { size?: "small" | "default" | "large"; muted?: boolean }) {
  const imageSize = size === "large" ? 56 : size === "default" ? 32 : 20;

  return (
    <Image
      src="/images/tokens/USDT.svg"
      alt=""
      width={imageSize}
      height={imageSize}
      className={clsx(
        "relative shrink-0 rounded-full",
        muted ? "opacity-50 grayscale" : "shadow-[0_0_18px_rgba(112,197,158,0.45)]",
        size === "small" && "h-5 w-5",
        size === "default" && "h-8 w-8",
        size === "large" && "h-14 w-14",
      )}
    />
  );
}

function ChainMark({
  badge,
  accent,
  muted,
}: {
  badge: string;
  accent: string;
  muted: boolean;
}) {
  return (
    <span className="relative">
      <TokenMark muted={muted} />
      <span
        className={clsx(
          "absolute -bottom-1 -right-1 grid h-4 w-4 place-items-center rounded-full border border-primary-bg text-8 font-bold text-black",
          accent,
        )}
      >
        {badge}
      </span>
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

function NetworkDetails() {
  return (
    <div className="flex flex-col gap-2 text-12">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1 text-secondary-text">
          <Svg iconName="info" size={14} />
          Chains
        </span>
        <span className="text-primary-text">Ethereum, Base, BSC</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1 text-secondary-text">
          <Svg iconName="info" size={14} />
          Contract
        </span>
        <span className="flex items-center gap-2 text-primary-text">
          0xabf...71d0
          <IconButton variant={IconButtonVariant.COPY} text="0xabf000000000000000000000000000000071d0" />
        </span>
      </div>
      <div className="mt-2 grid grid-cols-[1fr_1fr_1fr_auto_auto] items-center gap-2 rounded-3 bg-tertiary-bg px-4 py-3 text-secondary-text max-sm:grid-cols-3 max-sm:px-3 max-sm:py-3">
        <span>
          Gas price
          <span className="block text-primary-text">33.53 GWEI</span>
        </span>
        <span>
          Gas limit
          <span className="block text-primary-text">329000</span>
        </span>
        <span>
          Total network fee
          <span className="block text-primary-text">0.0031 ETH</span>
        </span>
        <span className="rounded-5 border border-secondary-border px-2 py-0.5 text-10 font-medium text-primary-text max-sm:col-start-1 max-sm:flex max-sm:h-9 max-sm:items-center max-sm:justify-center">
          Cheaper
        </span>
        <button
          type="button"
          className="rounded-5 bg-green-bg px-3 py-1 text-10 font-medium text-primary-text max-sm:col-span-2 max-sm:h-9"
        >
          Edit
        </button>
      </div>
    </div>
  );
}

function WalletAlert({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed bottom-0 left-0 z-[1000] w-full border-t border-green bg-green-bg shadow-notification">
      <div className="mx-auto flex max-w-[1680px] items-center justify-between gap-3 px-4 py-4 text-14 text-primary-text md:px-8">
        <div className="flex items-center gap-3">
          <Preloader type="linear" />
          <span>Please confirm action in your wallet</span>
        </div>
        <IconButton variant={IconButtonVariant.CLOSE} handleClose={onClose} />
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
  index,
  step,
  status,
}: {
  index: number;
  step: (typeof steps)[number];
  status: StepStatus;
}) {
  const isActive = status === "awaiting" || status === "executing";
  const isSuccess = status === "success";
  const isIdle = status === "idle";

  return (
    <div className="grid min-h-12 grid-cols-[32px_auto_1fr] items-center gap-2 max-sm:grid-cols-[32px_1fr_auto]">
      <div className="relative flex h-full items-center">
        {index > 0 ? (
          <span className="absolute -top-2 left-4 h-5 w-0.5 -translate-x-1/2 bg-green-bg" />
        ) : null}
        <ChainMark badge={step.badge} accent={step.accent} muted={isIdle || isSuccess} />
      </div>
      <span
        className={clsx(
          "text-14 font-medium",
          isActive ? "text-primary-text" : "text-secondary-text",
        )}
      >
        {status === "executing" ? "Executing token claims" : isSuccess ? "Successfully claimed" : "Confirm claiming"}
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
            <button className="rounded-5 bg-green-bg px-3 py-1 text-10 font-medium text-primary-text max-sm:min-w-[220px]">
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

function ProofPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const formattedProof = useMemo(() => JSON.stringify(proof, null, 2), []);

  return (
    <div className="rounded-3 bg-tertiary-bg">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex min-h-12 w-full items-center justify-between gap-3 px-4 text-left text-12 text-secondary-text"
      >
        <span className="flex items-center gap-2">
          <Svg iconName="info" size={16} />
          Merkle proof
        </span>
        <Svg
          iconName="small-expand-arrow"
          size={18}
          className={clsx("duration-200", isOpen && "rotate-180")}
        />
      </button>
      {isOpen ? (
        <pre className="max-h-[260px] overflow-auto whitespace-pre-wrap px-4 pb-4 text-12 leading-5 text-secondary-text">
          {formattedProof}
        </pre>
      ) : null}
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
      <SmartStepRow index={0} step={steps[0]} status="success" />
      <ProofPanel />
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
        if (activeStep < steps.length - 1) {
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
      return "idle";
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
          <div className="border-t border-secondary-border pt-4">
            {steps.map((step, index) => (
              <SmartStepRow
                key={step.chain}
                index={index}
                step={step}
                status={getStepStatus(index)}
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
              <label className="mb-2 block text-14 font-bold text-secondary-text">Wallet address</label>
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
        <NetworkDetails />
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
        <div className="max-h-[calc(100vh-8px)] w-full max-w-[600px] overflow-y-auto rounded-t-3 bg-primary-bg p-4 shadow-2xl sm:w-[calc(100vw-24px)] sm:rounded-5 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-18 font-bold text-primary-text sm:text-20">Smart claim</h2>
            <IconButton variant={IconButtonVariant.CLOSE} handleClose={() => onOpenChange(false)} />
          </div>
          {renderBody()}
        </div>
      </DrawerDialog>
      {showWalletAlert ? <WalletAlert onClose={() => setShowWalletAlert(false)} /> : null}
      {showToast ? <ClaimToast onDismiss={() => setShowToast(false)} /> : null}
    </>
  );
}
