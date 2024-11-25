import Image from "next/image";

import Svg from "@/components/atoms/Svg";
import TokenAddressWithStandard from "@/components/atoms/TokenAddressWithStandard";
import Tooltip from "@/components/atoms/Tooltip";
import TrustBadge from "@/components/badges/TrustBadge";
import IconButton from "@/components/buttons/IconButton";
import { useTokenPortfolioDialogStore } from "@/components/dialogs/stores/useTokenPortfolioDialogStore";
import { Currency } from "@/sdk_hybrid/entities/currency";
import { Token } from "@/sdk_hybrid/entities/token";
import { Standard } from "@/sdk_hybrid/standard";

interface Props {
  tokenA: Currency | undefined;
  tokenB: Currency | undefined;
}
export default function SelectedTokensInfo({ tokenA, tokenB }: Props) {
  if (!tokenA && !tokenB) {
    return null;
  }

  return (
    <div className="w-full bg-primary-bg p-4 md:p-5 grid gap-3 rounded-5">
      {tokenA && <SelectedTokenInfoItem token={tokenA} />}
      {tokenB && <SelectedTokenInfoItem token={tokenB} />}
    </div>
  );
}

function AddressPair({ token }: { token: Token }) {
  return (
    <div className="flex gap-2 flex-col md:flex-row">
      <TokenAddressWithStandard
        tokenAddress={token.address0}
        standard={Standard.ERC20}
        chainId={token?.chainId}
      />
      <TokenAddressWithStandard
        tokenAddress={token.address1}
        standard={Standard.ERC223}
        chainId={token.chainId}
      />
    </div>
  );
}
export function SelectedTokenInfoItem({ token }: { token: Currency }) {
  const { handleOpen } = useTokenPortfolioDialogStore();

  return (
    <div className="bg-tertiary-bg rounded-3 py-2.5 px-5 flex flex-wrap justify-between items-center @container relative z-20">
      <div className="flex items-center gap-2 mr-auto md:mr-3">
        <Image
          src={token?.logoURI || "/tokens/placeholder.svg"}
          alt="Ethereum"
          width={32}
          height={32}
        />
        <div className="flex flex-col">
          <div className="flex gap-2 items-center">{token?.name}</div>
          <div className="text-secondary-text text-12">{token?.symbol}</div>
        </div>
      </div>
      {token?.isToken && (
        <div className="hidden @[620px]:block mr-3 md:mr-auto">
          <AddressPair token={token} />
        </div>
      )}
      {token?.isToken && (
        <div className="flex gap-2 items-center">
          {/*{token.rate && <TrustBadge rate={token?.rate} />}*/}
          {token.rate && (
            <div className="hidden @[620px]:block items-right">
              <TrustBadge rate={token?.rate} />
            </div>
          )}

          <Tooltip
            text={`Token belongs to ${token.lists?.length || 1} token lists`}
            renderTrigger={(ref, refProps) => {
              return (
                <span
                  ref={ref.setReference}
                  {...refProps}
                  className="flex gap-0.5 items-center text-secondary-text text-14 cursor-pointer"
                >
                  {token.lists?.length || 1}
                  <Svg className="text-tertiary-text" iconName="list" />
                </span>
              );
            }}
          />

          <Tooltip
            text={"Token details"}
            renderTrigger={(ref, refProps) => {
              return (
                <div
                  ref={ref.setReference}
                  {...refProps}
                  className="w-10 h-10 flex items-center justify-center"
                >
                  <IconButton iconName="details" onClick={() => handleOpen(token)} />
                </div>
              );
            }}
          />
        </div>
      )}
      {token?.isToken && (
        <div className="@[620px]:hidden w-full">
          {token.rate && (
            <div className="@[620px]:hidden flex">
              <TrustBadge rate={token?.rate} />
            </div>
          )}
          <div className="@[620px]:hidden w-full mt-3">
            <AddressPair token={token} />
          </div>
        </div>
      )}
    </div>
  );
}
