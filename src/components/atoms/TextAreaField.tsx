import clsx from "clsx";
import { FieldProps } from "formik";
import { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

import Input from "@/components/atoms/Input";
import TextArea from "@/components/atoms/TextArea";
import { HelperText } from "@/components/atoms/TextField";
import Tooltip from "@/components/atoms/Tooltip";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  helperText?: ReactNode;
  field?: FieldProps;
  tooltipText?: string;
} & (
    | {
        error?: string;
        warning?: never;
      }
    | { warning?: string; error?: never }
  );

export default function TextAreaField({
  label,
  helperText,
  error,
  warning,
  tooltipText,
  ...props
}: Props) {
  return (
    <div>
      <p
        className={clsx(
          "text-16 font-bold mb-1 flex items-center gap-1",
          props.disabled && "opacity-50",
        )}
      >
        {label}
        {tooltipText && <Tooltip iconSize={20} text={tooltipText} />}
      </p>
      <TextArea isError={Boolean(error)} isWarning={Boolean(warning)} {...props} />
      <HelperText helperText={helperText} error={error} warning={warning} />
    </div>
  );
}
