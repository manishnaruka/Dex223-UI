"use client";

import { OnrampWebSDK } from "@onramp.money/onramp-web-sdk";
import Image from "next/image";
import { useTranslations } from "next-intl";
import React, { useCallback, useState } from "react";
import { NumericFormat } from "react-number-format";
import { useAccount } from "wagmi";

import Select from "@/components/atoms/Select";
import SelectButton from "@/components/atoms/SelectButton";
import Button, { ButtonColor, ButtonSize } from "@/components/buttons/Button";
import TokenStandardSelector from "@/components/common/TokenStandardSelector";
import PickTokenDialog from "@/components/dialogs/PickTokenDialog";
import { useConnectWalletDialogStateStore } from "@/components/dialogs/stores/useConnectWalletStore";
import { ThemeColors } from "@/config/theme/colors";
import { formatFloat } from "@/functions/formatFloat";
import useTokenBalances from "@/hooks/useTokenBalances";
import { Currency } from "@/sdk_bi/entities/currency";
import { Standard } from "@/sdk_bi/standard";

import OnrampFailureModal from "./OnrampFailureModal";
import OnrampSuccessModal from "./OnrampSuccessModal";

// Mock data for regions - in a real app this would come from an API or config
const regions = [
  { value: "US", label: "🇺🇸 United States" },
  { value: "CA", label: "🇨🇦 Canada" },
  { value: "GB", label: "🇬🇧 United Kingdom" },
  { value: "DE", label: "🇩🇪 Germany" },
  { value: "FR", label: "🇫🇷 France" },
  { value: "JP", label: "🇯🇵 Japan" },
  { value: "AU", label: "🇦🇺 Australia" },
];

export default function SellCryptoForm() {
  const tWallet = useTranslations("Wallet");
  const t = useTranslations("Swap");
  const { isConnected, address } = useAccount();
  const { setIsOpened: setWalletConnectOpened } = useConnectWalletDialogStateStore();
  const [selectedRegion, setSelectedRegion] = useState("US");
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState<Currency | undefined>();
  const [isTokenPickerOpen, setIsTokenPickerOpen] = useState(false);
  const [tokenStandard, setTokenStandard] = useState<Standard>(Standard.ERC20);
  const [onrampInstance, setOnrampInstance] = useState<any>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isFailureModalOpen, setIsFailureModalOpen] = useState(false);
  const [transactionData, setTransactionData] = useState<any>(null);
  // Get token balances
  const {
    balance: { erc20Balance: token0Balance, erc223Balance: token1Balance },
  } = useTokenBalances(selectedToken);

  const handlePick = useCallback((token: Currency) => {
    setSelectedToken(token);
    setIsTokenPickerOpen(false);
  }, []);

  const handleSellCrypto = useCallback(async () => {
    if (!isConnected || !address || !selectedToken || !amount) {
      console.log("Missing required fields:", { isConnected, address, selectedToken, amount });
      return;
    }

    try {
      const sdk = new OnrampWebSDK({
        appId: 2,
        coinCode: "usdt",
        network: "erc20",
        fiatAmount: 10,
        fiatType: 20,
        flowType: 2,
        walletAddress: address || "",
        lang: "en",
      });

      // Set up event listeners
      sdk.on("TX_EVENTS", (e: any) => {
        console.log("Transaction event:", e);
        if (e.type === "ONRAMP_WIDGET_TX_COMPLETED") {
          const {
            transactionHash,
            walletAddress,
            fiatAmount,
            cryptoAmount,
            coinCode,
            network,
            orderId,
            orderStatus,
            networkData,
          } = e.data;

          const record = {
            user_id: address,
            transactionHash,
            walletAddress,
            coinCode,
            orderId,
            orderStatus,
            fromAmount: cryptoAmount, // Crypto amount being sold
            toAmount: fiatAmount, // Fiat amount received
            networkName: network,
            networkId: networkData?.networkId,
            hashLink: networkData?.hashLink,
            type: "sell",
          };

          console.log("Sell transaction completed:", record);
          // Handle successful sell transaction
          setTransactionData({
            transactionHash,
            fiatAmount,
            cryptoAmount,
            coinCode,
            orderId,
          });
          setIsSuccessModalOpen(true);
        } else if (e.type === "ONRAMP_WIDGET_TX_FAILED") {
          const { fiatAmount, coinCode, orderId, error } = e.data || {};
          setTransactionData({
            fiatAmount,
            coinCode,
            orderId,
            errorMessage: error?.message || "Transaction failed",
          });
          setIsFailureModalOpen(true);
        }
      });

      sdk.on("WIDGET_EVENTS", (e: any) => {
        console.log("Widget event:", e);
        if (e.type === "ONRAMP_WIDGET_CLOSE_REQUEST_CONFIRMED") {
          sdk.close();
          setOnrampInstance(null);
        }
      });

      setOnrampInstance(sdk);
      sdk.show();
    } catch (error) {
      console.error("Error initializing sell crypto:", error);
    }
  }, [isConnected, address, selectedToken, amount, tokenStandard]);

  const handleRetryTransaction = useCallback(() => {
    if (onrampInstance && amount && selectedToken) {
      onrampInstance.show();
    }
  }, [onrampInstance, amount, selectedToken]);

  return (
    <div className="card-spacing pt-2.5 bg-primary-bg rounded-5">
      <div className="flex justify-between items-center mb-2.5">
        <h3 className="font-bold text-20">Sell Crypto</h3>
      </div>

      {/* Region Selector */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-14 block text-secondary-text">Select your region</span>
        </div>
        <Select
          options={regions}
          value={selectedRegion}
          onChange={setSelectedRegion}
          placeholder="Select region"
          extendWidth
        />
      </div>

      <div className="p-5 bg-secondary-bg rounded-3 relative mb-5">
        <div className="flex justify-between items-center mb-5 h-[22px]">
          <span className="text-14 block text-secondary-text">you&apos;re selling</span>
          <ul className="text-12 inline-flex gap-2 text-tertiary-text ">
            <li className="p-1 bg-primary-bg rounded-1">$100</li>
            <li className="p-1 bg-primary-bg rounded-1">$300</li>
            <li className="p-1 bg-primary-bg rounded-1">$1000</li>
          </ul>
        </div>

        <div className="flex items-center mb-5 justify-between">
          <div className="flex-1">
            <NumericFormat
              inputMode="decimal"
              placeholder="0"
              className="bg-transparent border-0 outline-0 text-24 font-bold w-full"
              type="text"
              value={amount}
              onValueChange={(values) => {
                setAmount(values.value);
              }}
              thousandSeparator=" "
              allowNegative={false}
              prefix="$"
            />
            {selectedToken && (
              <div className="text-12 text-secondary-text mt-1">
                Balance:{" "}
                {tokenStandard === Standard.ERC20
                  ? token0Balance && Boolean(token0Balance.value)
                    ? formatFloat(token0Balance.formatted)
                    : "0"
                  : token1Balance && Boolean(token1Balance.value)
                    ? formatFloat(token1Balance.formatted)
                    : "0"}{" "}
                {selectedToken.symbol}
              </div>
            )}
          </div>
          <SelectButton
            type="button"
            className="flex-shrink-0"
            variant="rounded"
            onClick={() => setIsTokenPickerOpen(true)}
            size="large"
            colorScheme={ThemeColors.PURPLE}
          >
            <span className="flex gap-2 items-center">
              {selectedToken ? (
                <>
                  <Image
                    className="flex-shrink-0"
                    src={selectedToken.logoURI || "/images/tokens/placeholder.svg"}
                    alt={selectedToken.name || "Token"}
                    width={32}
                    height={32}
                  />
                  <span className="max-w-[100px] md:max-w-[150px] overflow-ellipsis overflow-hidden whitespace-nowrap">
                    {selectedToken.symbol || "Unknown"}
                  </span>
                </>
              ) : (
                <span className="text-14">Select Token</span>
              )}
            </span>
          </SelectButton>
        </div>
        <TokenStandardSelector
          selectedStandard={tokenStandard}
          handleStandardSelect={(standard) => setTokenStandard(standard)}
          disabled={!selectedToken}
          symbol={selectedToken?.symbol}
          balance0={token0Balance?.formatted || "0"}
          balance1={token1Balance?.formatted || "0"}
          colorScheme={ThemeColors.PURPLE}
          allowedErc223={true}
        />
      </div>

      {/* Connect Wallet Button */}
      {!isConnected ? (
        <Button
          onClick={() => setWalletConnectOpened(true)}
          fullWidth
          size={ButtonSize.EXTRA_LARGE}
          mobileSize={ButtonSize.LARGE}
          colorScheme={ButtonColor.PURPLE}
        >
          {tWallet("connect_wallet")}
        </Button>
      ) : (
        <Button
          onClick={handleSellCrypto}
          fullWidth
          size={ButtonSize.EXTRA_LARGE}
          mobileSize={ButtonSize.LARGE}
          colorScheme={ButtonColor.PURPLE}
          disabled={!amount || !selectedToken || !selectedRegion}
        >
          {selectedToken ? `Sell Crypto` : "Select Token"}
        </Button>
      )}

      <PickTokenDialog
        handlePick={handlePick}
        isOpen={isTokenPickerOpen}
        setIsOpen={setIsTokenPickerOpen}
      />

      <OnrampSuccessModal
        isOpen={isSuccessModalOpen}
        setIsOpen={setIsSuccessModalOpen}
        transactionData={transactionData}
      />

      <OnrampFailureModal
        isOpen={isFailureModalOpen}
        setIsOpen={setIsFailureModalOpen}
        transactionData={transactionData}
        onRetry={handleRetryTransaction}
      />
    </div>
  );
}
