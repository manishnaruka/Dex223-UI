import "simplebar-react/dist/simplebar.min.css";

import { useVirtualizer } from "@tanstack/react-virtual";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import SimpleBar from "simplebar-react";
import ManageTokenItem from "web/components/manage-tokens/ManageTokenItem";
import { Currency } from "web/sdk_hybrid/entities/currency";

import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import { IIFE } from "@/functions/iife";

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  handlePick: (token: Currency) => void;
}

export default function PickTokenDialog({ isOpen, setIsOpen, handlePick }: Props) {
  const [tokens, setTokens] = useState<any[]>([]);

  useEffect(() => {
    IIFE(async () => {
      const data = await fetch(
        `https://api.simpleswap.io/get_all_currencies?api_key=${process.env.NEXT_PUBLIC_SIMPLE_SWAP_API_KEY}`,
      );
      const res = await data.json();

      if (res) {
        setTokens(res);
      }
    });
  }, []);

  const parentRef = React.useRef(null);

  const virtualizer = useVirtualizer({
    count: tokens.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
  });
  const items = virtualizer.getVirtualItems();

  const [paddingTop, paddingBottom] = useMemo(() => {
    return items.length > 0
      ? [items[0].start, Math.max(0, virtualizer.getTotalSize() - items[items.length - 1].end)]
      : [0, 0];
  }, [items]);
  return (
    <DrawerDialog isOpen={isOpen} setIsOpen={setIsOpen}>
      <DialogHeader onClose={() => setIsOpen(false)} title="Select token" />

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
                        handlePick(tokens[item.index]);
                        setIsOpen(false);
                      }}
                      key={item.key}
                      data-index={item.index}
                      ref={virtualizer.measureElement}
                    >
                      <div className="flex items-center gap-2 h-12">
                        <Image src={tokens[item.index].image} alt={""} width={32} height={32} />
                        {tokens[item.index].name}
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
