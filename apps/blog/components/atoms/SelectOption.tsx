import clsx from "clsx";
import Image from "next/image";
import { PropsWithChildren } from "react";

import Svg from "@/components/atoms/Svg";

export default function SelectOption({
  onClick,
  isActive,
  disabled = false,
  children,
}: PropsWithChildren<{ onClick: any; isActive: boolean; disabled?: boolean }>) {
  return (
    <button
      onClick={onClick}
      className={clsx(
<<<<<<< HEAD:apps/blog/components/atoms/SelectOption.tsx
<<<<<<< HEAD:src/components/atoms/SelectOption.tsx
<<<<<<< HEAD
        "flex gap-2 items-center py-3 px-5 bg-primary-bg hocus:bg-green-bg duration-200 w-full",
=======
        "flex gap-2 items-center py-3 px-5 bg-primary-bg hocus:bg-quaternary-bg duration-200 w-full",
>>>>>>> b44a3b58fd2a351d754c5c9202d7c40eb76eeaed
=======
        "flex gap-2 items-center py-3 px-5 bg-primary-bg hocus:bg-quaternary-bg duration-200 w-full",
>>>>>>> 7fd4a53ec6c645e446246dc346612120c7273989:apps/blog/components/atoms/SelectOption.tsx
=======
        "flex gap-2 items-center py-3 px-5 bg-primary-bg hocus:bg-quaternary-bg duration-200 w-full",
>>>>>>> 5d243a0bdeb943767553d5d6b596f3498883f159:src/components/atoms/SelectOption.tsx
        isActive && "text-green pointer-events-none",
        disabled && "opacity-50 pointer-events-none",
      )}
    >
      {children}

      {isActive && <Svg className="ml-auto" iconName="check" />}
    </button>
  );
}
