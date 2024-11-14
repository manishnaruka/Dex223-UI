export function formatFloat(
  value: number | string,
  options?: {
    significantDigits?: number;
    trimZero?: boolean;
  },
) {
  const numberValue = Number(value);
  const maximumSignificantDigits = options?.significantDigits || 2;

  if (numberValue < 1e-10) {
    if (options?.trimZero) {
      return "0";
    }

    return (0).toFixed(maximumSignificantDigits);
  }

  if (numberValue < 1) {
    return numberValue.toLocaleString("en-US", {
      maximumSignificantDigits: maximumSignificantDigits,
    });
  } else {
    const _value = numberValue.toFixed(maximumSignificantDigits);
    if (options?.trimZero) {
      return _value.replace(/0*$/g, "").replace(/.$/g, "");
    }
    return _value;
  }
}

export function formatNumber(num: string, maxPrecision = 15) {
  const [integerPart] = num.toString().split(".");

  if (integerPart.length >= maxPrecision) {
    // If the integer part alone exceeds or matches the precision, return it as-is
    return parseFloat(num)
      .toPrecision(maxPrecision)
      .replace(/\.?0+$/, "");
  } else {
    // Limit the total length to maxPrecision
    const precisionNeeded = maxPrecision - integerPart.length;
    return parseFloat(num)
      .toPrecision(precisionNeeded)
      .replace(/\.?0+$/, "");
  }
}
