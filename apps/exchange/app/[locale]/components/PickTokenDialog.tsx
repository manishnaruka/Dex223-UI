import "simplebar-react/dist/simplebar.min.css";

import { useVirtualizer } from "@tanstack/react-virtual";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import SimpleBar from "simplebar-react";
import ManageTokenItem from "web/components/manage-tokens/ManageTokenItem";
import { Currency } from "web/sdk_hybrid/entities/currency";

import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import { SearchInput } from "@/components/atoms/Input";
import { IIFE } from "@/functions/iife";

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  handlePick: (token: Currency) => void;
  tokens: any[];
}

export default function PickTokenDialog({ isOpen, setIsOpen, handlePick, tokens }: Props) {
  const parentRef = React.useRef(null);
  const [searchValue, setSearchValue] = useState("");

  const filteredTokens = useMemo(() => {
    return tokens.filter((token) => token.name.toLowerCase().includes(searchValue.toLowerCase()));
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
        <div className="flex flex-col flex-grow card-spacing-x">
          <div style={{ flex: "1 1 auto" }} className="pb-[1px] -mr-3 md:-mr-8">
            {Boolean(tokens.length) && (
              <SimpleBar
                scrollableNodeProps={{
                  ref: parentRef,
                }}
                className="pr-3 md:pr-8 pt-3"
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
                      className="w-full block"
                      onClick={() => {
                        handlePick(filteredTokens[item.index]);
                        setIsOpen(false);
                      }}
                      key={item.key}
                      data-index={item.index}
                      ref={virtualizer.measureElement}
                    >
                      <div className="flex items-center gap-2 h-12">
                        <Image
                          src={filteredTokens[item.index].image}
                          alt={""}
                          width={32}
                          height={32}
                        />
                        {filteredTokens[item.index].name} ({filteredTokens[item.index].network})
                      </div>
                    </button>
                  ))}
                </div>
              </SimpleBar>
            )}
          </div>
        </div>
      </div>
    </DrawerDialog>
  );
}
