"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import React, { useCallback, useEffect, useState } from "react";
import { NumericFormat } from "react-number-format";
import { useAccount } from "wagmi";
import { OnrampWebSDK } from "@onramp.money/onramp-web-sdk";
import Button, { ButtonColor, ButtonSize } from "@/components/buttons/Button";
import Select from "@/components/atoms/Select";
import SelectButton from "@/components/atoms/SelectButton";
import { useConnectWalletDialogStateStore } from "@/components/dialogs/stores/useConnectWalletStore";
import { ThemeColors } from "@/config/theme/colors";
import PickTokenDialog from "@/components/dialogs/PickTokenDialog";
import { Currency } from "@/sdk_bi/entities/currency";
import OnrampSuccessModal from "./OnrampSuccessModal";
import OnrampFailureModal from "./OnrampFailureModal";

const regions = [
  { value: "us", label: "🇺🇸 United States" },
  { value: "ca", label: "🇨🇦 Canada" },
  { value: "gb", label: "🇬🇧 United Kingdom" },
  { value: "de", label: "🇩🇪 Germany" },
  { value: "fr", label: "🇫🇷 France" },
  { value: "jp", label: "🇯🇵 Japan" },
  { value: "au", label: "🇦🇺 Australia" },
];


export default function BuyCryptoForm() {
  const tWallet = useTranslations("Wallet");
  const tNav = useTranslations("Navigation");
  const tBuyCrypto = useTranslations("BuyCrypto");
  const { isConnected, address } = useAccount();
  const { setIsOpened: setWalletConnectOpened } = useConnectWalletDialogStateStore();
  const [selectedRegion, setSelectedRegion] = useState("us");
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState<Currency | undefined>();
  const [isTokenPickerOpen, setIsTokenPickerOpen] = useState(false);
  const [onrampInstance, setOnrampInstance] = useState<any>(null);
  const [isWidgetShown, setIsWidgetShown] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isFailureModalOpen, setIsFailureModalOpen] = useState(false);
  const [transactionData, setTransactionData] = useState<any>(null);

  const handlePick = useCallback(
    (token: Currency) => {
      setSelectedToken(token);
      setIsTokenPickerOpen(false);
    },
    [],
  );

  useEffect(() => {
    if (isConnected && address) {
      const sdk = new OnrampWebSDK({
        merchantRecognitionId: address,
        appId: Number(process.env.NEXT_ONRAMP_APP_ID) || 2,
        flowType: 1, // Buy crypto
        lang: 'en',
        // sandbox: true,
        // coinCode: "USDT",
        // network: "polygon",
        walletAddress: address,
      });

      // Set up event listeners
      sdk.on('TX_EVENTS', (e: any) => {    
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
            networkData
          } = e.data;
          
          const record = {
            user_id: address || null,
            transactionHash,
            walletAddress,
            coinCode,
            orderId, 
            orderStatus,
            fromAmount: fiatAmount,
            toAmount: cryptoAmount,
            networkName: network,
            networkId: networkData?.networkId,
            hashLink: networkData?.hashLink,
          };
          
          console.log('Transaction completed:', record);
          
          // Set transaction data and show success modal
          setTransactionData({
            transactionHash,
            fiatAmount,
            cryptoAmount,
            coinCode,
            orderId
          });
          setIsSuccessModalOpen(true);
          setIsWidgetShown(false);
        } else if (e.type === "ONRAMP_WIDGET_TX_FAILED") {
          const {
            fiatAmount,
            coinCode,
            orderId,
            error
          } = e.data || {};
          
          console.log('Transaction failed:', e.data);
          
          // Set transaction data and show failure modal
          setTransactionData({
            fiatAmount,
            coinCode,
            orderId,
            errorMessage: error?.message || "Transaction failed"
          });
          setIsFailureModalOpen(true);
          setIsWidgetShown(false);
        }
      });

      sdk.on('WIDGET_EVENTS', (e: any) => {
        if (e.type === "ONRAMP_WIDGET_CLOSE_REQUEST_CONFIRMED") {
          if (isWidgetShown) {
            sdk.close();
            setIsWidgetShown(false);
            setSelectedRegion("US");
            setAmount("");
            setSelectedToken(undefined);
            setTransactionData(null);
          }
        }
      });

      setOnrampInstance(sdk);
    }
  }, [isConnected, address, isWidgetShown]);

  const handleBuyCrypto = useCallback(() => {
    if (onrampInstance && amount && selectedToken) {
      try {
        onrampInstance.show();
        setIsWidgetShown(true);
      } catch (error) {
        console.error('Error showing OnRamp widget:', error);
      }
    }
  }, [onrampInstance, amount, selectedToken]);

  const handleRetryTransaction = useCallback(() => {
    if (onrampInstance && amount && selectedToken) {
      try {
        onrampInstance.show();
        setIsWidgetShown(true);
      } catch (error) {
        console.error('Error showing OnRamp widget:', error);
      }
    }
  }, [onrampInstance, amount, selectedToken]);

  return (
    <div className="card-spacing pt-2.5 bg-primary-bg rounded-5">
      <div className="flex justify-between items-center mb-2.5">
        <h3 className="font-bold text-20">{tNav("buy_crypto")}</h3>
      </div>

      {/* Region Selector */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-14 block text-secondary-text">{tBuyCrypto("select_region")}</span>
        </div>
        <Select
          options={regions}
          value={selectedRegion}
          onChange={setSelectedRegion}
          placeholder={tBuyCrypto("select_region")}
          extendWidth
        />
      </div>

      <div className="p-5 bg-secondary-bg rounded-3 relative mb-5">
        <div className="flex justify-between items-center mb-5 h-[22px]">
          <span className="text-14 block text-secondary-text">{tBuyCrypto("amount_label")}</span>
          <ul className="text-12 inline-flex gap-2 text-tertiary-text ">
            <li className="p-1 bg-primary-bg rounded-1 w-full">$100</li>
            <li className="p-1 bg-primary-bg rounded-1 w-full">$300</li>
            <li className="p-1 bg-primary-bg rounded-1">$1000</li>
          </ul>
        </div>

        <div className="flex items-center mb-5 justify-between">
          <div className="flex-1">
            <NumericFormat
              allowedDecimalSeparators={[","]}
              decimalScale={2}
              inputMode="decimal"
              placeholder="0"
              className="h-12 bg-transparent outline-0 border-0 text-32 w-full peer placeholder:text-tertiary-text"
              type="text"
              value={amount}
              onValueChange={(values) => {
                setAmount(values.value);
              }}
              allowNegative={false}
              prefix="$"
            />
            {amount && parseFloat(amount) < 100 && (
              <span className="text-12 text-red-500 mt-1 block">
                {tBuyCrypto("minimum_amount_notice")}
              </span>
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
                <span className="text-14">{tBuyCrypto("select_token")}</span>
              )}
            </span>
          </SelectButton>
        </div>
      </div>

      {!isConnected ? (
        <>
          <Button
            onClick={() => setWalletConnectOpened(true)}
            fullWidth
            size={ButtonSize.EXTRA_LARGE}
            mobileSize={ButtonSize.LARGE}
            colorScheme={ButtonColor.PURPLE}
          >
            {tBuyCrypto("connect_and_buy")}
          </Button>
        </>
      ) : (
        <Button
          onClick={handleBuyCrypto}
          fullWidth
          size={ButtonSize.EXTRA_LARGE}
          mobileSize={ButtonSize.LARGE}
          colorScheme={ButtonColor.PURPLE}
          disabled={!amount || !selectedToken || !selectedRegion}
        >
          {selectedToken ? 'Continue' : 'Select Token'}
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