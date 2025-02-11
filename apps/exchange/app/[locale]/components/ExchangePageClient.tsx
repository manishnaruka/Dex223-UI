"use client";

import clsx from "clsx";
import Image from "next/image";
import QRCode from "qrcode";
import { useCallback, useEffect, useMemo, useState } from "react";

import CountdownTimer from "@/app/[locale]/components/Countdown";
import PickTokenDialog from "@/app/[locale]/components/PickTokenDialog";
import { useFilteredTokens } from "@/app/[locale]/hooks/useFilteredTokens";
import { useMinAmount } from "@/app/[locale]/hooks/useMinAmount";
import { useOutputAmount } from "@/app/[locale]/hooks/useOutputAmount";
import { ExchangeToken } from "@/app/[locale]/types";
import Alert from "@/components/atoms/Alert";
import Container from "@/components/atoms/Container";
import DetailsRow from "@/components/atoms/DetailsRow";
import ExternalTextLink from "@/components/atoms/ExternalTextLink";
import Skeleton from "@/components/atoms/Skeleton";
import Svg from "@/components/atoms/Svg";
import TextField from "@/components/atoms/TextField";
import Tooltip from "@/components/atoms/Tooltip";
import Button from "@/components/buttons/Button";
import IconButton, { IconButtonVariant } from "@/components/buttons/IconButton";
import SwapButton from "@/components/buttons/SwapButton";
import TokenInput from "@/components/common/TokenInput";
import Tab from "@/components/tabs/Tab";
import Tabs from "@/components/tabs/Tabs";
import { IconName } from "@/config/types/IconName";
import { clsxMerge } from "@/functions/clsxMerge";
import { IIFE } from "@/functions/iife";
import truncateMiddle from "@/functions/truncateMiddle";
import useDeepEffect from "@/hooks/useDeepEffect";
import addToast from "@/other/toast";

const cryptoExchangeStatuses = ["waiting", "confirming", "exchanging", "sending"] as const;
const extendedCryptoExchangeStatuses = [...cryptoExchangeStatuses, "finished"] as const;

type CryptoExchangeStatus = (typeof cryptoExchangeStatuses)[number];
type ExtendedCryptoExchangeStatus = (typeof extendedCryptoExchangeStatuses)[number];

const statusIconsMap: Record<CryptoExchangeStatus, IconName> = {
  waiting: "listing",
  confirming: "check",
  exchanging: "swap",
  sending: "sending",
};

const statusTextMap: Record<CryptoExchangeStatus, string> = {
  waiting: "Pending deposit",
  confirming: "Confirming",
  exchanging: "Exchanging",
  sending: "Sending",
};

const headingTextMap: Record<
  ExtendedCryptoExchangeStatus,
  { heading: string; subheading?: string }
> = {
  waiting: {
    heading: "Awaiting your deposit",
  },
  confirming: {
    heading: "Confirming the transaction",
    subheading: "Number of blockchain confirmations:",
  },
  exchanging: {
    heading: "Exchanging",
    subheading: "Your coins are safe and being exchanged",
  },
  sending: { heading: "Sending", subheading: "Coins are on the way" },
  finished: { heading: "Crypto exchanged successfully" },
};

function ExchangeStatus({
  status,
  isActive,
  isPassed,
}: {
  status: CryptoExchangeStatus;
  isActive?: boolean;
  isPassed?: boolean;
}) {
  return (
    <div
      className={clsxMerge(
        "relative",
        status !== "sending" &&
          "before:absolute before:h-0.5 before:w-5 before:bg-green-bg before:right-0 before:top-1/2 before:translate-x-full before:-translate-y-1/2",
        isPassed && "before:bg-green",
      )}
    >
      <div
        className={clsxMerge(
          "flex relative items-center justify-center  rounded-full mx-auto w-8 h-8 mb-2 text-secondary-bg",
          isActive ? "bg-green text-secondary-bg" : "text-tertiary-text bg-tertiary-bg",
          isPassed && "text-green bg-green-bg",
        )}
      >
        <Svg iconName={statusIconsMap[status]} />
      </div>
      <p
        className={clsxMerge(
          "text-center text-14 font-medium",
          (!isActive || isPassed) && "text-tertiary-text",
        )}
      >
        {statusTextMap[status]}
      </p>
    </div>
  );
}

const testExchange = {
  id: "1234567890",
  address_from: "0x1234567890",
  address_to: "0x1234567890",
  status: "waiting",
};

export default function ExchangePageClient({ tokens }: { tokens: ExchangeToken[] }) {
  const tokenMap = useMemo(() => new Map(tokens.map((token) => [token.symbol, token])), [tokens]);

  const [tokenA, setTokenA] = useState<ExchangeToken | undefined>(tokenMap.get("btc"));
  const [tokenB, setTokenB] = useState<ExchangeToken | undefined>(tokenMap.get("eth"));

  const [tokenAFiat, setTokenAFiat] = useState<ExchangeToken | undefined>(tokenMap.get("usd"));
  const [tokenBFiat, setTokenBFiat] = useState<ExchangeToken | undefined>(tokenMap.get("btc"));

  const [isFixed, setIsFixed] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [pickTokenContext, setPickTokenContext] = useState<"tokenA" | "tokenB">("tokenA");

  const [exchangeStatus, setExchangeStatus] = useState<ExtendedCryptoExchangeStatus>("waiting");

  const { availableTokens: tokensFrom, loading: tokensFromLoading } = useFilteredTokens(
    tokens,
    tokenB,
  );
  const { availableTokens: tokensTo, loading: tokensToLoading } = useFilteredTokens(tokens, tokenA);
  const { fiatTokens } = useFilteredTokens(tokens);

  const [exchange, setExchange] = useState<any>();

  const [addressQRUrl, setAddressQRUrl] = useState("");

  const [inputAmount, setInputAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  useEffect(() => {
    if (exchange?.address_from) {
      IIFE(async () => {
        const address = await QRCode.toDataURL(exchange.address_from);
        setAddressQRUrl(address);
      });
    }
  }, [exchange?.address_from]);

  const {
    minAmount,
    loading: isLoadingMinAmount,
    error: minAmountError,
  } = useMinAmount(tokenA, tokenB, isFixed);

  const handleChange = useCallback(
    (token: any) => {
      if (pickTokenContext === "tokenA") {
        setTokenA(token);
      } else {
        setTokenB(token);
      }
    },
    [pickTokenContext],
  );

  const handleChangeFiat = useCallback(
    (token: any) => {
      if (pickTokenContext === "tokenA") {
        setTokenAFiat(token);
      } else {
        setTokenBFiat(token);
      }
    },
    [pickTokenContext],
  );

  const {
    outputAmount,
    loading: isLoadingOutputAmount,
    error: outputAmountError,
  } = useOutputAmount(tokenA, tokenB, inputAmount, isFixed);

  useDeepEffect(() => {
    if (!!exchange) {
      const t = setInterval(async () => {
        const res = await fetch(
          `${window.location.origin}/api/simpleswap/get-exchange?exchangeId=${exchange.id}`,
        );
        const data = await res.json();

        if (data?.status) {
          setExchangeStatus(exchangeStatus);
        }

        if (data?.status === "finished") {
          clearInterval(t);
        }
        console.log(data);
      }, 5000);
    }
  }, [exchange]);

  const handleCreateExchange = useCallback(async () => {
    if (!tokenA || !tokenB) {
      addToast("Tokens are not selected");
      return;
    }
    // setExchange(testExchange);
    // return;

    const res = await fetch(`${window.location.origin}/api/simpleswap/create-exchange`, {
      method: "POST",
      body: JSON.stringify({
        fixed: isFixed,
        currency_from: tokenA.symbol,
        currency_to: tokenB.symbol,
        amount: inputAmount,
        address_to: recipient,

        extra_id_to: "",
        user_refund_address: "",
        user_refund_extra_id: "",
      }),
    });

    const data = await res.json();

    setExchange(data);
    console.log(data);
  }, [inputAmount, isFixed, recipient, tokenA?.symbol, tokenB?.symbol]);

  console.log(exchangeStatus);
  console.log(addressQRUrl);
  return (
    <Container className="px-4">
      <div className="mx-auto w-[600px]">
        <Tabs fullWidth>
          <Tab title="Exchange">
            {exchange ? (
              <>
                <div className="bg-primary-bg py-1 pl-5 pr-2 rounded-3 flex justify-between items-center my-5">
                  <div className="flex items-center gap-1">
                    <span className="text-secondary-text">Exchange ID:</span>
                    {exchange.id}
                    <IconButton variant={IconButtonVariant.COPY} text={exchange.id} />
                  </div>
                  <a
                    className="flex items-center justify-center w-10 h-10 text-tertiary-text"
                    href="#"
                  >
                    <Svg iconName="support" />
                  </a>
                </div>

                <div className="px-10 pb-10 pt-8 rounded-5 bg-primary-bg flex flex-col gap-5">
                  <div>
                    {exchangeStatus === "finished" && (
                      <span className="flex justify-center">
                        <Image src="/images/success-exchange.svg" alt={""} width={80} height={80} />
                      </span>
                    )}
                    <h2 className="font-bold text-20 text-center">
                      {headingTextMap[exchangeStatus].heading}
                    </h2>

                    {exchange.valid_until && <CountdownTimer validUntil={exchange.valid_until} />}
                    {exchangeStatus === "finished" && (
                      <div className="flex justify-center items-center gap-2 mt-1">
                        <div className="flex items-center gap-2">
                          <Image
                            width={24}
                            height={24}
                            src={tokenA?.image || "/images/tokens/placeholder.svg"}
                            alt={""}
                          />
                          <span className="font-medium">
                            {inputAmount} {tokenA?.symbol}{" "}
                          </span>
                        </div>
                        <Svg className="text-tertiary-text" iconName="next" />
                        <div className="flex items-center gap-2">
                          <Image
                            width={24}
                            height={24}
                            src={tokenA?.image || "/images/tokens/placeholder.svg"}
                            alt={""}
                          />
                          <span className="font-medium">
                            {inputAmount} {tokenA?.symbol}{" "}
                          </span>
                        </div>
                      </div>
                    )}
                    <p className="text-secondary-text mt-1 text-center">
                      {headingTextMap[exchangeStatus].subheading}
                      {exchangeStatus === "confirming" && " 1"}
                    </p>
                  </div>
                  {exchangeStatus === "waiting" && (
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-secondary-text">Send deposit:</span>
                      <Image
                        width={32}
                        height={32}
                        src={tokenA?.image || "/images/tokens/placeholder.svg"}
                        alt={""}
                      />
                      <span className="font-medium">
                        {inputAmount} {tokenA?.symbol}{" "}
                        <span className="text-secondary-text">(Network: {tokenA?.network})</span>
                      </span>
                    </div>
                  )}

                  {addressQRUrl && exchangeStatus === "waiting" && (
                    <div className="flex pl-5 pb-5 pt-3 pr-2 bg-tertiary-bg rounded-3 gap-5">
                      <div className="overflow-hidden rounded-2 flex-shrink-0">
                        <Image src={addressQRUrl} alt={""} width={86} height={86} />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-center">
                          <span className="text-secondary-text font-bold">Deposit address:</span>
                          <div className="flex items-center">
                            <a
                              target="_blank"
                              href="#"
                              className="flex items-center justify-center h-10 w-10 group"
                            >
                              <IconButton iconName="forward" />
                            </a>
                            <IconButton
                              variant={IconButtonVariant.COPY}
                              text={exchange.address_from}
                            />
                          </div>
                        </div>
                        <span className="text-14 font-medium">{exchange.address_from}</span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-4 gap-5">
                    {cryptoExchangeStatuses.map((status) => (
                      <ExchangeStatus
                        isPassed={
                          exchangeStatus === "finished" ||
                          cryptoExchangeStatuses.findIndex((s) => s === status) <
                            cryptoExchangeStatuses.findIndex((s) => s === exchangeStatus)
                        }
                        isActive={status === exchangeStatus}
                        key={status}
                        status={status}
                      />
                    ))}
                  </div>

                  {exchangeStatus === "waiting" && (
                    <Alert
                      text="If you sent the coins and the status did not change immediately, do not worry. Our system needs a few minutes to detect the transaction."
                      type="info"
                    />
                  )}

                  <div className="bg-tertiary-bg rounded-3 px-5 pb-4">
                    <h3 className="py-3.5 text-14 text-tertiary-text">Operation details</h3>
                    <DetailsRow
                      title="You get"
                      value={
                        <div className="flex items-center gap-2">
                          <Image
                            width={20}
                            height={20}
                            src={tokenB?.image || "/images/tokens/placeholder.svg"}
                            alt=""
                          />
                          <span>
                            {outputAmount} {tokenB?.symbol}
                          </span>
                        </div>
                      }
                      tooltipText={""}
                    />
                    <DetailsRow
                      title="Recipient address"
                      value={
                        <div className="flex items-center gap-1">
                          <ExternalTextLink
                            text={truncateMiddle(recipient || "", {
                              charsFromEnd: 3,
                              charsFromStart: 4,
                            })}
                            href={"#"}
                          />
                          <IconButton variant={IconButtonVariant.COPY} text={recipient} />
                        </div>
                      }
                      tooltipText={""}
                    />

                    {exchangeStatus !== "waiting" && (
                      <>
                        <div className="h-px  bg-secondary-border my-4" />
                        <DetailsRow
                          title="You sent"
                          value={
                            <div className="flex items-center gap-2">
                              <Image
                                width={20}
                                height={20}
                                src={tokenA?.image || "/images/tokens/placeholder.svg"}
                                alt=""
                              />
                              <span>
                                {inputAmount} {tokenA?.symbol}
                              </span>
                            </div>
                          }
                          tooltipText={""}
                        />
                        <DetailsRow
                          title="Deposit address"
                          value={
                            <div className="flex items-center gap-1">
                              <ExternalTextLink
                                text={truncateMiddle(exchange?.address_from || "", {
                                  charsFromEnd: 3,
                                  charsFromStart: 4,
                                })}
                                href={"#"}
                              />
                              <IconButton
                                variant={IconButtonVariant.COPY}
                                text={exchange?.address_from}
                              />
                            </div>
                          }
                          tooltipText={""}
                        />
                        <DetailsRow
                          title="Hash in"
                          value={
                            <div className="flex items-center gap-1">
                              <ExternalTextLink
                                text={truncateMiddle(recipient || "", {
                                  charsFromEnd: 3,
                                  charsFromStart: 4,
                                })}
                                href={"#"}
                              />
                              <IconButton variant={IconButtonVariant.COPY} text={recipient} />
                            </div>
                          }
                          tooltipText={""}
                        />
                      </>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="mt-5 bg-primary-bg px-10 pb-10 rounded-5">
                <h1 className="py-3.5 text-20 font-bold">Crypto exchange</h1>
                <TokenInput
                  handleClick={() => {
                    setIsOpen(true);
                    setPickTokenContext("tokenA");
                  }}
                  token={tokenA}
                  value={inputAmount}
                  onInputChange={(value) => {
                    setInputAmount(value);
                  }}
                  label="You send"
                  minAmount={minAmount || undefined}
                  minAmountLoading={isLoadingMinAmount}
                  setMinAmount={() => setInputAmount(minAmount || "")}
                />
                <div className="relative h-8 z-10">
                  <div className="absolute left-5 flex gap-1 items-center h-full top-0">
                    <button
                      onClick={() => setIsFixed(!isFixed)}
                      className="group flex items-center gap-1"
                    >
                      <span
                        className={clsx(
                          "rounded-full w-6 h-6 flex items-center justify-center relative duration-200 before:duration-200 before:absolute before:h-[calc(100%_+_8px)] before:left-1/2 before:w-px  before:-translate-x-1/2 z-30 before:z-20",
                          isFixed
                            ? "group-hover:before:bg-green-hover group-hover:bg-green-hover before:bg-green bg-green"
                            : "group-hover:before:bg-green-bg group-hover:bg-green-bg before:bg-secondary-bg bg-secondary-bg ",
                        )}
                      >
                        {isFixed ? (
                          <Svg className="z-40 text-secondary-bg" size={16} iconName="lock" />
                        ) : (
                          <Svg
                            className="duration-200 z-40 text-tertiary-text group-hover:text-primary-text"
                            size={16}
                            iconName="floating"
                          />
                        )}
                      </span>
                      <span
                        className={clsx(
                          "text-12 ",
                          isFixed ? "text-primary-text" : "text-tertiary-text",
                        )}
                      >
                        {isFixed ? "Fixed rate" : "Floating rate"}
                      </span>
                    </button>

                    <Tooltip iconSize={16} text="Tooltip floating rate" />
                  </div>

                  <SwapButton
                    onClick={() => {
                      setTokenB(tokenA);
                      setTokenA(tokenB);
                      setInputAmount(outputAmount || "");
                    }}
                  />
                </div>
                <TokenInput
                  handleClick={() => {
                    setIsOpen(true);
                    setPickTokenContext("tokenB");
                  }}
                  isLoadingAmount={isLoadingOutputAmount}
                  readOnly
                  token={tokenB}
                  value={outputAmount || ""}
                  onInputChange={() => {}}
                  label="You send"
                />
                <div className="my-3 ">
                  <TextField
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    label="The recepient's wallet address"
                    placeholder="0x..."
                  />
                </div>

                <Button
                  disabled={
                    !recipient ||
                    isLoadingMinAmount ||
                    isLoadingOutputAmount ||
                    !outputAmount ||
                    !minAmount
                  }
                  onClick={() => handleCreateExchange()}
                  fullWidth
                >
                  Create an exchange
                </Button>
              </div>
            )}

            <PickTokenDialog
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              handlePick={handleChange}
              tokens={pickTokenContext === "tokenA" ? tokensFrom : tokensTo}
              tokensLoading={pickTokenContext === "tokenA" ? tokensFromLoading : tokensToLoading}
            />
          </Tab>
          <Tab title="Buy/Sell Crypto">
            <div className="mt-5 bg-primary-bg px-10 pb-10 rounded-5">
              <h1 className="py-3.5 text-20 font-bold">Crypto exchange</h1>
              <TokenInput
                handleClick={() => {
                  setIsOpen(true);
                  setPickTokenContext("tokenA");
                }}
                token={tokenAFiat}
                value={inputAmount}
                onInputChange={(value) => {
                  setInputAmount(value);
                }}
                label="You send"
                minAmount={minAmount || undefined}
                minAmountLoading={isLoadingMinAmount}
                setMinAmount={() => setInputAmount(minAmount || "")}
              />
              <div className="relative h-8 z-10">
                <div className="absolute left-5 flex gap-1 items-center h-full top-0">
                  <button
                    onClick={() => setIsFixed(!isFixed)}
                    className="group flex items-center gap-1"
                  >
                    <span
                      className={clsx(
                        "rounded-full w-6 h-6 flex items-center justify-center relative duration-200 before:duration-200 before:absolute before:h-[calc(100%_+_8px)] before:left-1/2 before:w-px  before:-translate-x-1/2 z-30 before:z-20",
                        isFixed
                          ? "group-hover:before:bg-green-hover group-hover:bg-green-hover before:bg-green bg-green"
                          : "group-hover:before:bg-green-bg group-hover:bg-green-bg before:bg-secondary-bg bg-secondary-bg ",
                      )}
                    >
                      {isFixed ? (
                        <Svg className="z-40 text-secondary-bg" size={16} iconName="lock" />
                      ) : (
                        <Svg
                          className="duration-200 z-40 text-tertiary-text group-hover:text-primary-text"
                          size={16}
                          iconName="floating"
                        />
                      )}
                    </span>
                    <span
                      className={clsx(
                        "text-12 ",
                        isFixed ? "text-primary-text" : "text-tertiary-text",
                      )}
                    >
                      {isFixed ? "Fixed rate" : "Floating rate"}
                    </span>
                  </button>

                  <Tooltip iconSize={16} text="Tooltip floating rate" />
                </div>

                <SwapButton
                  onClick={() => {
                    setTokenB(tokenA);
                    setTokenA(tokenB);
                    setInputAmount(outputAmount || "");
                  }}
                />
              </div>
              <TokenInput
                handleClick={() => {
                  setIsOpen(true);
                  setPickTokenContext("tokenB");
                }}
                isLoadingAmount={isLoadingOutputAmount}
                readOnly
                token={tokenBFiat}
                value={outputAmount || ""}
                onInputChange={() => {}}
                label="You send"
              />
              <div className="my-3 ">
                <TextField
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  label="The recepient's wallet address"
                  placeholder="0x..."
                />
              </div>

              <Button
                disabled={
                  !recipient ||
                  isLoadingMinAmount ||
                  isLoadingOutputAmount ||
                  !outputAmount ||
                  !minAmount
                }
                onClick={() => handleCreateExchange()}
                fullWidth
              >
                Create an exchange
              </Button>
            </div>

            <PickTokenDialog
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              handlePick={handleChangeFiat}
              tokens={pickTokenContext === "tokenA" ? fiatTokens : tokensTo}
              tokensLoading={pickTokenContext === "tokenA" ? false : tokensToLoading}
            />
          </Tab>
        </Tabs>
      </div>
    </Container>
  );
}
