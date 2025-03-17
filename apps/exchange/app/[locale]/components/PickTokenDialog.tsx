import "simplebar-react/dist/simplebar.min.css";

import Preloader from "@repo/ui/preloader";
import { useVirtualizer } from "@tanstack/react-virtual";
import Image from "next/image";
import React, { useMemo, useState } from "react";
import SimpleBar from "simplebar-react";

import { ExchangeToken, FiatToken } from "@/app/[locale]/types";
import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import { SearchInput } from "@/components/atoms/Input";

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  handlePick: (token: ExchangeToken | FiatToken) => void;
  tokens: ExchangeToken[] | FiatToken[];
  tokensLoading?: boolean;
}

export default function PickTokenDialog({
  isOpen,
  setIsOpen,
  handlePick,
  tokens,
  tokensLoading = false,
}: Props) {
  const parentRef = React.useRef(null);
  const [searchValue, setSearchValue] = useState("");

  const filteredTokens = useMemo(() => {
    return tokens.filter(
      (token) =>
        token.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
        token.symbol?.toLowerCase().includes(searchValue.toLowerCase()),
    );
  }, [searchValue, tokens]);

  const virtualizer = useVirtualizer({
    count: filteredTokens.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
  });
  const items = virtualizer.getVirtualItems();

  const [paddingTop, paddingBottom] = useMemo(() => {
    return items.length > 0
      ? [items[0].start, Math.max(0, virtualizer.getTotalSize() - items[items.length - 1].end)]
      : [0, 0];
  }, [items, virtualizer]);

  return (
    <DrawerDialog isOpen={isOpen} setIsOpen={setIsOpen}>
      <DialogHeader onClose={() => setIsOpen(false)} title="Select token" />

      <div className="px-10">
        <SearchInput
          placeholder="Search tokens"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </div>
      <div className="w-full md:w-[600px] h-[580px] flex flex-col">
        <div className="flex flex-col flex-grow ">
          {tokensLoading && (
            <div className="flex items-center justify-center flex-grow flex-shrink-0">
              <Preloader size={36} />
            </div>
          )}

          {!tokensLoading && tokens.length && (
            <div style={{ flex: "1 1 auto" }} className="pb-[1px]">
              {Boolean(tokens.length) && (
                <SimpleBar
                  scrollableNodeProps={{
                    ref: parentRef,
                  }}
                  className="pt-3"
                  style={{ height: 580 }}
                  autoHide={false}
                >
                  <div
                    style={{
                      paddingTop,
                      paddingBottom,
                    }}
                  >
                    {items.map((item) => (
                      <button
                        className="pl-4 sm:pl-6 lg:pl-10 w-[calc(100%_-_14px)] block duration-200 hover:bg-tertiary-bg"
                        onClick={() => {
                          handlePick(filteredTokens[item.index]);
                          setIsOpen(false);
                        }}
                        key={item.key}
                        data-index={item.index}
                        ref={virtualizer.measureElement}
                      >
                        {filteredTokens[item.index].symbol ? (
                          filteredTokens[item.index].symbol
                        ) : (
                          <div className="flex items-center gap-2 h-12">
                            <Image
                              src={filteredTokens[item.index].image}
                              alt={""}
                              width={32}
                              height={32}
                            />
                            {filteredTokens[item.index].name}{" "}
                            {!filteredTokens[item.index].isFiat &&
                              `(${filteredTokens[item.index].network})`}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </SimpleBar>
              )}
            </div>
          )}
        </div>
      </div>
    </DrawerDialog>
  );
}
