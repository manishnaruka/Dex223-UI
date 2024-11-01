import clsx from "clsx";
import { InputHTMLAttributes, ReactNode } from "react";
import { NumericFormat } from "react-number-format";

import Input, { SearchInput } from "@/components/atoms/Input";
import Tooltip from "@/components/atoms/Tooltip";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  helperText?: ReactNode;
  tooltipText?: string;
  variant?: "default" | "search";
  internalText?: string | ReactNode;
  internalTextClassName?: string;
  isError?: boolean;
  isWarning?: boolean;
} & (
    | {
        error?: boolean | string;
        warning?: never;
      }
    | { warning?: string | boolean; error?: never }
  ) &
  (
    | {
        isNumeric?: never;
      }
    | {
        isNumeric?: true;
        defaultValue?: string | number | null | undefined;
        value?: string | number | null | undefined;
        type?: "tel" | "text" | "password";
        decimalScale?: number;
      }
  );

export function InputLabel({ label, tooltipText, ...props }: Omit<Props, "helperText">) {
  return (
    <p
      className={clsx(
        "text-16 font-bold mb-1 flex items-center gap-1 text-secondary-text",
        props.disabled && "opacity-50",
      )}
    >
      {label}
      {tooltipText && <Tooltip iconSize={24} text={tooltipText} />}
    </p>
  );
}

export function HelperText({
  helperText,
  error,
  warning,
  disabled,
}: Pick<Props, "helperText" | "error" | "warning" | "disabled">) {
  return (
    <div className="text-12 mt-1 min-h-4">
      {typeof helperText !== "undefined" && !error && (
        <div className={clsx("text-12 text-secondary-text mt-1 h-4", disabled && "opacity-50")}>
          {helperText}
        </div>
      )}
      {typeof error !== "undefined" && <p className="text-12 text-red-light mt-1">{error}</p>}
      {warning && <p className="text-12 text-orange mt-1">{warning}</p>}
    </div>
  );
}
//TODO: add custom copmonent to pass instead of Input, for example Search Input
export default function TextField({
  label,
  helperText,
  error,
  warning,
  tooltipText,
  variant = "default",
  internalText,
  isError = false,
  isWarning = false,
  ...props
}: Props) {
  return (
    <div>
      <InputLabel label={label} tooltipText={tooltipText} />
      {variant === "default" ? (
        <div className="relative">
          {props.isNumeric ? (
            <NumericFormat
              isError={Boolean(error) || isError}
              isWarning={Boolean(warning) || isWarning}
              customInput={Input}
              {...props}
              decimalScale={props.decimalScale}
            />
          ) : (
            <Input
              isError={Boolean(error) || isError}
              isWarning={Boolean(warning) || isWarning}
              {...props}
            />
          )}
          {internalText && (
            <span className="absolute right-5 text-tertiary-text top-1/2 -translate-y-1/2">
              {internalText}
            </span>
          )}
        </div>
      ) : (
        <SearchInput isError={Boolean(error)} isWarning={Boolean(warning)} {...props} />
      )}

      <HelperText
        helperText={helperText}
        error={error}
        warning={warning}
        disabled={props.disabled}
      />
    </div>
  );
}
