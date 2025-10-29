"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { flip } from "@floating-ui/core";
import {
    autoUpdate,
    FloatingFocusManager,
    offset,
    useClick,
    useDismiss,
    useFloating,
    useInteractions,
    useRole,
} from "@floating-ui/react";
import clsx from "clsx";
import Image from "next/image";
import { SearchInput } from "@/components/atoms/Input";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import { useAddNewListDialogStore } from "../stores/useAddNewListDialogStore";
import AddNewList from "./AddNewList";

export interface TokenListOption {
    id: string;
    name: string;
    icon?: string;
    isDefault?: boolean;
    isPaid?: boolean;
    isFree?: boolean;
}

interface TokenListDropdownProps {
    options: TokenListOption[];
    selectedOptions: Set<string>;
    onSelectionChange: (selectedIds: Set<string>) => void;
    placeholder?: string;
    className?: string;
    searchPlaceholder?: string;
}

export default function TokenListDropdown({
    options,
    selectedOptions,
    onSelectionChange,
    placeholder = "Select lists",
    className,
    searchPlaceholder = "Search list name",
}: TokenListDropdownProps) {
    const [searchValue, setSearchValue] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const ref = useRef<HTMLButtonElement>(null);
    const { isOpen, setIsOpen, content, setContent } = useAddNewListDialogStore();
    const { setActiveTab } = useAddNewListDialogStore();

    const handleClose = useCallback(() => {
        setIsOpen(false);
        setTimeout(() => {
          setContent("default");
          setActiveTab(0);
        }, 400);
      }, [setIsOpen, setContent, setActiveTab]);

    const { refs, floatingStyles, context } = useFloating({
        elements: {
            reference: ref.current,
        },
        middleware: [offset(8), flip()],
        whileElementsMounted: autoUpdate,
        open: isDropdownOpen,
        onOpenChange: setIsDropdownOpen,
    });

    const click = useClick(context);
    const dismiss = useDismiss(context);
    const role = useRole(context);

    const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

    const filteredOptions = options.filter(option =>
        option.name.toLowerCase().includes(searchValue.toLowerCase())
    );

    const handleSelectAll = () => {
        if (selectedOptions.size === filteredOptions.length) {
            const newSelection = new Set(selectedOptions);
            filteredOptions.forEach(option => newSelection.delete(option.id));
            onSelectionChange(newSelection);
        } else {
            const newSelection = new Set(selectedOptions);
            filteredOptions.forEach(option => newSelection.add(option.id));
            onSelectionChange(newSelection);
        }
    };

    const handleOptionSelect = (optionId: string) => {
        const newSelection = new Set(selectedOptions);
        if (newSelection.has(optionId)) {
            newSelection.delete(optionId);
        } else {
            newSelection.add(optionId);
        }
        onSelectionChange(newSelection);
    };

    const allFilteredSelected = filteredOptions.every(option => selectedOptions.has(option.id));

    const getSelectedOptions = () => {
        return options.filter(option => selectedOptions.has(option.id));
    };

    const getOptionIcon = (option: TokenListOption) => {
        if (option.icon) {
            return (
                <Image
                    src={option.icon}
                    alt={option.name}
                    width={16}
                    height={16}
                    className="w-4 h-4 rounded"
                />
            );
        }
    };

    const selectedOptionsList = getSelectedOptions();
    const maxVisibleTags = 2;
    const visibleTags = selectedOptionsList.slice(0, maxVisibleTags);
    const remainingCount = selectedOptionsList.length - maxVisibleTags;

    return (
        <>
            <div className={clsx("relative", className)}>
                <div
                    {...getReferenceProps()}
                    ref={refs.setReference}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={clsx(
                        "duration-200 border-none rounded-3 h-10 md:h-12 px-3 flex items-center gap-2 cursor-pointer w-full min-w-[200px]",
                        "bg-primary-bg text-primary-text",
                        "hocus:shadow hocus:shadow-green/60 focus:shadow focus:shadow-green focus:border-green",
                        isDropdownOpen && "border-green bg-green-bg shadow shadow-green/60"
                    )}
                >
                    {selectedOptionsList.length === 0 ? (
                        <span className="text-secondary-text">{placeholder}</span>
                    ) : (
                        <>
                            {visibleTags.map((option) => (
                                <div
                                    key={option.id}
                                    className="flex items-center gap-1 bg-tertiary-bg border border-secondary-border rounded-2 px-2 py-1 text-12 text-secondary-text"
                                >
                                    {/* <div className="w-4 h-4 flex-shrink-0">
                                        {getOptionIcon(option)}
                                    </div> */}
                                    <span className="truncate max-w-[100px]">{option.name}</span>
                                </div>
                            ))}

                            {remainingCount > 0 && (
                                <span className="text-secondary-text text-12">...</span>
                            )}

                            <div className="flex items-center gap-1 bg-tertiary-bg border border-secondary-border rounded-2 px-2 py-1 text-12 text-primary-text">
                                <span>{selectedOptionsList.length}</span>
                            </div>
                        </>
                    )}
                </div>

                {isDropdownOpen && (
                    <FloatingFocusManager context={context} modal={false} initialFocus={-1}>
                        <div
                            ref={refs.setFloating}
                            style={floatingStyles}
                            className="absolute z-[101] bg-tertiary-bg overflow-hidden rounded-3 min-w-[450px] shadow-lg border border-secondary-border"
                            {...getFloatingProps()}
                        >
                            <div className="px-3 py-3 border-b border-secondary-border">
                                <SearchInput
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    placeholder={searchPlaceholder}
                                    className="h-9 text-12 bg-secondary-bg"
                                    noCloseIcon={searchValue === ""}
                                />
                            </div>

                            <div
                                onClick={handleSelectAll}
                                className="cursor-pointer h-10 bg-tertiary-bg hover:bg-quaternary-bg flex justify-between items-center px-4 border-b border-secondary-border"
                            >
                                <span className="text-primary-text text-14">Select all</span>
                                <div className={clsx(
                                    "w-4 h-4 rounded border-2 flex items-center justify-center",
                                    allFilteredSelected
                                        ? "bg-green border-green"
                                        : "border-secondary-border"
                                )}>
                                    {allFilteredSelected && (
                                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    )}
                                </div>
                            </div>

                            <div className="max-h-60 overflow-y-auto">
                                {filteredOptions.map((option) => {
                                    const isSelected = selectedOptions.has(option.id);
                                    return (
                                        <div
                                            key={option.id}
                                            onClick={() => handleOptionSelect(option.id)}
                                            className="cursor-pointer h-10 bg-tertiary-bg hover:bg-quaternary-bg flex items-center gap-3 px-4"
                                        >
                                            {getOptionIcon(option)}
                                            <span className="text-primary-text flex-1 truncate text-14">{option.name}</span>
                                            <div className={clsx(
                                                "w-4 h-4 rounded border-2 flex items-center justify-center",
                                                isSelected
                                                    ? "bg-green border-green"
                                                    : "border-secondary-border"
                                            )}>
                                                {isSelected && (
                                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="border-t border-secondary-border px-4 py-3">
                                <button
                                    onClick={() => {
                                        setIsDropdownOpen(false);
                                        setIsOpen(true);
                                        setContent("import-list");
                                    }}
                                    className="w-full flex items-center justify-between text-primary-text text-14 font-medium hover:text-green transition-colors duration-200"
                                >
                                    <span>Add new list</span>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </FloatingFocusManager>
                )}
            </div>
            
            <DrawerDialog isOpen={content === "import-list"} setIsOpen={handleClose}>
                <AddNewList  setContent={setContent} handleClose={handleClose}/>
            </DrawerDialog>
        </>
    );
}
