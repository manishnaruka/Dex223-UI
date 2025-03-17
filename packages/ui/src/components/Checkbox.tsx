import { InputHTMLAttributes } from "react";

import { clsxMerge } from "../functions/clsxMerge";
import CheckIcon from "../icons/CheckIcon";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  checked: boolean;
  handleChange: (event?: any) => void; // InputHTMLAttributes<HTMLInputElement>["onChange"]
  id: string;
  label?: string;
  labelClassName?: string;
}

export default function Checkbox({
  checked,
  handleChange,
  id,
  label,
  labelClassName,
  className,
}: Props) {
  return (
    <div className="flex">
      <input
        id={id}
        className={clsxMerge(
          "ui-appearance-none ui-peer ui-shrink-0 ui-w-6 ui-h-6 ui-border ui-border-secondary-border ui-bg-secondary-bg ui-rounded-2 hocus:ui-border-green hocus:ui-bg-primary-bg checked:ui-hocus:shadow checked:ui-hocus:shadow-green/60 checked:ui-bg-green checked:hocus:ui-bg-green checked:ui-border-green checked:hocus:ui-border-green ui-cursor-pointer ui-relative ui-duration-200",
          className,
        )}
        type="checkbox"
        onChange={handleChange}
        checked={checked}
      />
      {label ? (
        <label className={clsxMerge("ui-pl-2 ui-cursor-pointer", labelClassName)} htmlFor={id}>
          {label}
        </label>
      ) : null}
      <CheckIcon
        className="ui-duration-200 ui-absolute ui-opacity-0 peer-checked:ui-opacity-100 ui-text-secondary-bg ui-pointer-events-none"
      />
    </div>
  );
}

export function CheckboxButton({ checked, handleChange, id, label }: Props) {
  return (
    <button
      type="button"
      className="w-full p-3 rounded-3 hocus:bg-green-bg duration-200 bg-tertiary-bg group"
      onClick={handleChange}
    >
      <Checkbox
        labelClassName="pointer-events-none"
        className="group-hocus:border-green pointer-events-none"
        checked={checked}
        handleChange={handleChange}
        id={id}
        label={label}
      />
    </button>
  );
}
