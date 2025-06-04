import Alert from "@repo/ui/alert";
import debounce from "lodash.debounce";
import { useTranslations } from "next-intl";
import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { FeeAmount } from "@/sdk_bi/constants";
import { Currency } from "@/sdk_bi/entities/currency";
import { Price } from "@/sdk_bi/entities/fractions/price";
import { Token } from "@/sdk_bi/entities/token";

import { ZOOM_LEVELS } from "../../../hooks/types";
import { Chart } from "./Chart";
import { formatDelta, useDensityChartData } from "./hooks";
import { Bound } from "./types";

const ChartWrapper = ({ children, ...props }: any) => (
  <div
    className="relative w-full lg:h-auto md:h-[300px] h-[200px] justify-center items-center"
    style={{
      // maxWidth: "510px",
      width: "100%",
      height: "auto",
    }}
    {...props}
    // className="relative w-full lg:h-auto h-[220px] justify-center items-center"
    // {...props}
  >
    {children}
  </div>
);

function InfoBox({ message, icon }: { message?: ReactNode; icon: ReactNode }) {
  return (
    <div style={{ height: "100%", justifyContent: "center" }}>
      {icon}
      {" icon: "}
      {message && (
        //   <ThemedText.DeprecatedMediumHeader padding={10} marginTop="20px" textAlign="center">
        //   {message}
        // </ThemedText.DeprecatedMediumHeader>
        <span>{message}</span>
      )}
    </div>
  );
}

export default function LiquidityChartRangeInput({
  currencyA,
  currencyB,
  feeAmount,
  ticksAtLimit,
  price,
  priceLower,
  priceUpper,
  onLeftRangeInput,
  onRightRangeInput,
  interactive,
}: {
  currencyA?: Currency;
  currencyB?: Currency;
  feeAmount?: FeeAmount;
  ticksAtLimit: { [bound in Bound]?: boolean | undefined };
  price?: number;
  priceLower?: Price<Token, Token>;
  priceUpper?: Price<Token, Token>;
  onLeftRangeInput: (typedValue: string) => void;
  onRightRangeInput: (typedValue: string) => void;
  interactive: boolean;
}) {
  const prevDomainRef = useRef<[number, number] | null>(null);
  const t = useTranslations("Liquidity");
  const chartWrapperRef = useRef<HTMLDivElement | null>(null);

  const isSorted = currencyA && currencyB && currencyA?.wrapped.sortsBefore(currencyB?.wrapped);

  const densityParams = useMemo(() => {
    return {
      currencyA,
      currencyB,
      feeAmount,
    };
  }, [currencyA, currencyB, feeAmount]);
  const [pendingDomain, setPendingDomain] = useState<[number, number] | undefined>(undefined);
  const { isLoading, error, formattedData } = useDensityChartData(densityParams);

  const onBrushDomainChangeEnded = useCallback(
    debounce((domain: [number, number]) => {
      setPendingDomain(domain); // Save immediately for chart

      const [left, right] = domain;
      const prev = prevDomainRef.current;
      prevDomainRef.current = domain;

      if (!prev) return;

      const [prevLeft, prevRight] = prev;

      if (left !== prevLeft) onLeftRangeInput(left.toFixed(10));
      if (right !== prevRight) onRightRangeInput(right.toFixed(10));
    }, 100),
    [onLeftRangeInput, onRightRangeInput],
  );

  const externalDomain: [number, number] | undefined = useMemo(() => {
    const lower = priceLower?.toSignificant(6);
    const upper = priceUpper?.toSignificant(6);

    if (!lower || !upper) return undefined;

    return [parseFloat(lower), parseFloat(upper)];
  }, [priceLower, priceUpper]);

  // sync when app state catches up
  useEffect(() => {
    if (
      pendingDomain &&
      externalDomain &&
      Math.abs(pendingDomain[0] - externalDomain[0]) < 1e-8 &&
      Math.abs(pendingDomain[1] - externalDomain[1]) < 1e-8
    ) {
      setPendingDomain(undefined); // external state caught up
    }
  }, [externalDomain, pendingDomain]);

  useEffect(() => {
    // If externalDomain changed while user isn't dragging (i.e., no pendingDomain)
    if (!pendingDomain && externalDomain) {
      prevDomainRef.current = externalDomain;
    }

    // If pendingDomain is stale compared to external inputs, update it
    if (
      pendingDomain &&
      externalDomain &&
      (Math.abs(pendingDomain[0] - externalDomain[0]) > 1e-6 ||
        Math.abs(pendingDomain[1] - externalDomain[1]) > 1e-6)
    ) {
      // External inputs changed → update chart domain to match
      setPendingDomain(undefined);
      prevDomainRef.current = null;
    }
  }, [externalDomain, pendingDomain]);

  const brushDomain = pendingDomain ?? externalDomain;

  interactive = interactive && Boolean(formattedData?.length);

  // const brushDomain: [number, number] | undefined = useMemo(() => {
  //   const leftPrice = isSorted ? priceLower : priceUpper?.invert();
  //   const rightPrice = isSorted ? priceUpper : priceLower?.invert();
  //
  //   return leftPrice && rightPrice
  //     ? [parseFloat(leftPrice?.toSignificant(6)), parseFloat(rightPrice?.toSignificant(6))]
  //     : undefined;
  // }, [isSorted, priceLower, priceUpper]);

  const brushLabelValue = useCallback(
    (d: "w" | "e", x: number) => {
      if (!price) return "";

      if (d === "w" && (ticksAtLimit[isSorted ? Bound.LOWER : Bound.UPPER] || x <= 1e-6))
        return "0";

      if (d === "e" && (ticksAtLimit[isSorted ? Bound.UPPER : Bound.LOWER] || x >= 1e35))
        return "∞";

      const percent =
        (x < price ? -1 : 1) * ((Math.max(x, price) - Math.min(x, price)) / price) * 100;

      return price ? `${(Math.sign(percent) < 0 ? "-" : "") + formatDelta(percent)}` : "";
    },
    [isSorted, price, ticksAtLimit],
  );

  const isUninitialized = !currencyA || !currencyB || (formattedData === undefined && !isLoading);

  const zoomLevels = ZOOM_LEVELS[feeAmount ?? FeeAmount.MEDIUM];

  // // SET DEFAULT PRICE RANGE
  // useEffect(() => {
  //   if (price && !brushDomain) {
  //     onBrushDomainChangeEnded(
  //       [price * zoomLevels.initialMin, price * zoomLevels.initialMax],
  //       undefined,
  //     );
  //   }
  // }, [brushDomain, onBrushDomainChangeEnded, price, zoomLevels.initialMin, zoomLevels.initialMax]);

  // const isMobile = useMediaQuery({ query: "(max-width: 640px)" });
  // State to manage chart dimensions
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>(() => {
    const isMobile = typeof window !== "undefined" ? window.innerWidth <= 768 : false;
    return isMobile ? { width: 252, height: 170 } : { width: 510, height: 312 };
  });

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      const height = chartWrapperRef.current?.clientHeight || (isMobile ? 170 : 312);
      setDimensions({ width: isMobile ? 252 : 510, height });
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Set initial dimensions
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    // <AutoColumn gap="md" style={{ minHeight: "200px" }}>
    <div
      style={{
        minHeight: "200px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {isUninitialized ? (
        <Alert type="info" text={t("price_chart_data_will_appear_here")} />
      ) : // <InfoBox
      //   message={<span>{t("price_chart_data_will_appear_here")}</span>}
      //   // icon={<Inbox size={56} stroke={theme.neutral1} />}
      //   icon={"Inbox"}
      // />
      isLoading ? (
        <Alert type="info" text="Loader" />
      ) : // <InfoBox icon={<span>Loader</span>} />
      error ? (
        <Alert type="error" text={t("price_chart_data_not_available")} />
      ) : // <InfoBox
      //   message={<span>{t("price_chart_data_not_available")}</span>}
      //   // icon={<CloudOff size={56} stroke={theme.neutral2} />}
      //   icon={<span>CloudOff</span>}
      // />
      // ) : !formattedData || formattedData.length === 0 || !price ? (
      !price ? (
        <Alert type="error" text={t("price_chart_no_data")} />
      ) : (
        // <InfoBox
        //   message={<span>{t("price_chart_no_data")}</span>}
        //   // icon={<BarChart2 size={56} stroke={theme.neutral2} />}
        //   icon={<span>BarChart2 </span>}
        // />
        <ChartWrapper>
          <Chart
            data={{ series: formattedData!, current: price }}
            // data={{ series: [], current: price }}
            dimensions={dimensions}
            margins={{ top: 10, right: 2, bottom: 20, left: 0 }}
            styles={{
              area: {
                selection: "#FC72FF",
              },
              brush: {
                handle: {
                  // west: saturate(0.1, tokenAColor) ?? theme.critical,
                  // east: saturate(0.1, tokenBColor) ?? theme.accent1,
                  west: "#8089BD",
                  east: "#8089BD",
                },
              },
            }}
            interactive={interactive}
            brushLabels={brushLabelValue}
            brushDomain={brushDomain}
            onBrushDomainChange={onBrushDomainChangeEnded}
            zoomLevels={zoomLevels}
            ticksAtLimit={ticksAtLimit}
          />
        </ChartWrapper>
      )}
    </div>
  );
}
