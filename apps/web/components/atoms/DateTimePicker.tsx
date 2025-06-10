import { InputHTMLAttributes, ReactNode } from "react";
import { NumericFormat } from "react-number-format";

import Input, { InputSize, SearchInput } from "@/components/atoms/Input";
import Svg from "@/components/atoms/Svg";
import TextField, { HelperText, InputLabel } from "@/components/atoms/TextField";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  helperText?: ReactNode;
  tooltipText?: string;
  internalText?: string | ReactNode;
  internalTextClassName?: string;
  isError?: boolean;
  isWarning?: boolean;
  inputSize?: InputSize;
  noMargin?: boolean;
} & (
    | {
        error?: boolean | string;
        warning?: never;
      }
    | { warning?: string | boolean; error?: never }
  );

export default function DateTimePicker({
  label,
  helperText,
  error,
  warning,
  tooltipText,
  isError = false,
  isWarning = false,
  inputSize = InputSize.LARGE,
  ...props
}: Props) {
  return (
    <div>
      <InputLabel inputSize={inputSize} label={label} tooltipText={tooltipText} />
      <div className="relative">
        <Input
          className="h-12 text-16 rounded-2 md:rounded-3 appearence-none duration-200 focus:outline-0 pl-4 md:pl-5 placeholder:text-tertiary-text w-full bg-secondary-bg border text-primary-text"
          type="datetime-local"
          isError={Boolean(error) || isError}
          isWarning={Boolean(warning) || isWarning}
          {...props}
        />
        <Svg
          iconName="date"
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-tertiary-text"
        />
      </div>

      <HelperText
        helperText={helperText}
        error={error}
        warning={warning}
        disabled={props.disabled}
      />
    </div>
  );
}
