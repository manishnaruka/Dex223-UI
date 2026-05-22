"use client";

import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  offset,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import Image from "next/image";
import { ReactNode, useMemo, useState } from "react";

import { InputSize, SearchInput } from "@/components/atoms/Input";
import Svg from "@/components/atoms/Svg";
import { clsxMerge } from "@/functions/clsxMerge";

export interface DropdownOption {
  value: string;
  label: string;
  logo?: string;
  icon?: ReactNode;
}

interface Props {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  buttonClassName?: string;
  panelWidth?: number;
  size?: "sm" | "md";
}

export default function FilterDropdown({
  label,
  value,
  onChange,
  options,
  placeholder,
  searchable = false,
  searchPlaceholder = "Search",
  buttonClassName,
  panelWidth,
  size = "md",
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(6), flip()],
    whileElementsMounted: autoUpdate,
    placement: "bottom-start",
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  const selected = options.find((opt) => opt.value === value);

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    const lower = search.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(lower));
  }, [options, search]);

  const heightClass = size === "sm" ? "h-8" : "h-10";
  const textClass = size === "sm" ? "text-12" : "text-14";

  return (
    <div className="flex min-w-0 flex-col gap-1">
      {label ? (
        <span
          className={clsxMerge(
            "text-secondary-text",
            textClass === "text-12" ? "text-12" : "text-12",
          )}
        >
          {label}
        </span>
      ) : null}
      <button
        ref={refs.setReference}
        type="button"
        {...getReferenceProps()}
        className={clsxMerge(
          "flex w-full items-center justify-between gap-2 rounded-2 border bg-green-bg px-3 duration-200",
          heightClass,
          textClass,
          isOpen
            ? "border-green text-primary-text"
            : "border-transparent text-secondary-text hocus:border-green hocus:text-primary-text",
          buttonClassName,
        )}
      >
        <span className="flex min-w-0 items-center gap-2 truncate">
          {selected?.logo ? <Image src={selected.logo} alt="" width={18} height={18} /> : null}
          {selected?.icon}
          <span className="truncate">{selected?.label ?? placeholder ?? ""}</span>
        </span>
        <Svg
          iconName="small-expand-arrow"
          size={16}
          className={clsxMerge("shrink-0 text-secondary-text duration-200", isOpen && "rotate-180")}
        />
      </button>

      {isOpen ? (
        <FloatingFocusManager context={context} modal={false}>
          <div
            ref={refs.setFloating}
            style={{
              ...floatingStyles,
              width: panelWidth ?? refs.reference.current?.getBoundingClientRect().width,
            }}
            {...getFloatingProps()}
            className="z-30 overflow-hidden rounded-3 border border-secondary-border bg-tertiary-bg shadow-2xl"
          >
            {searchable ? (
              <div className="border-b border-secondary-border p-2">
                <SearchInput
                  inputSize={InputSize.LARGE}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="h-9 rounded-2 bg-secondary-bg text-12"
                />
              </div>
            ) : null}
            <div className="max-h-[280px] overflow-y-auto py-1">
              {filteredOptions.map((opt) => {
                const isActive = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={clsxMerge(
                      "flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-14 duration-200 hocus:bg-quaternary-bg",
                      isActive ? "text-primary-text" : "text-secondary-text",
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-2 truncate">
                      {opt.logo ? <Image src={opt.logo} alt="" width={18} height={18} /> : null}
                      {opt.icon}
                      <span className="truncate">{opt.label}</span>
                    </span>
                    {isActive ? (
                      <Svg iconName="check" size={16} className="shrink-0 text-green" />
                    ) : null}
                  </button>
                );
              })}
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-12 text-tertiary-text">No results</div>
              ) : null}
            </div>
          </div>
        </FloatingFocusManager>
      ) : null}
    </div>
  );
}
