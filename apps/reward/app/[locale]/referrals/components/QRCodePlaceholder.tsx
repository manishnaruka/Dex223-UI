"use client";

import Image from "next/image";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

interface Props {
  value: string;
  size?: number;
  logoSrc?: string;
}

export default function QRCodePlaceholder({
  value,
  size = 240,
  logoSrc = "/images/logo-short.svg",
}: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const logoBox = size * 0.22;

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value, {
      errorCorrectionLevel: "H",
      margin: 0,
      width: size,
      color: { dark: "#0A0A0B", light: "#FFFFFF" },
    })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  return (
    <div
      className="relative bg-white rounded-3 p-4"
      style={{ width: size + 32, height: size + 32 }}
    >
      {dataUrl ? (
        <Image
          src={dataUrl}
          alt="Referral QR code"
          width={size}
          height={size}
          unoptimized
          className="block"
        />
      ) : (
        <div style={{ width: size, height: size }} />
      )}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2 flex items-center justify-center"
        style={{ width: logoBox, height: logoBox }}
      >
        <Image src={logoSrc} alt="" width={logoBox * 0.7} height={logoBox * 0.7} />
      </div>
    </div>
  );
}
