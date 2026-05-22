import Image from "next/image";
import { useMemo } from "react";

interface Props {
  value: string;
  size?: number;
  gridSize?: number;
  logoSrc?: string;
}

const hashString = (input: string) => {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const buildGrid = (value: string, gridSize: number): boolean[][] => {
  const seed = hashString(value);
  const grid: boolean[][] = Array.from({ length: gridSize }, () => new Array(gridSize).fill(false));

  const isFinderRegion = (row: number, col: number) =>
    (row < 7 && col < 7) || (row < 7 && col >= gridSize - 7) || (row >= gridSize - 7 && col < 7);

  for (let row = 0; row < gridSize; row += 1) {
    for (let col = 0; col < gridSize; col += 1) {
      if (isFinderRegion(row, col)) continue;
      const cell = (seed * (row + 1) * (col + 3) + row * 31 + col * 17) % 7;
      grid[row][col] = cell > 2;
    }
  }

  const drawFinder = (rowStart: number, colStart: number) => {
    for (let r = 0; r < 7; r += 1) {
      for (let c = 0; c < 7; c += 1) {
        const onOuter = r === 0 || r === 6 || c === 0 || c === 6;
        const onInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        grid[rowStart + r][colStart + c] = onOuter || onInner;
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, gridSize - 7);
  drawFinder(gridSize - 7, 0);

  return grid;
};

export default function QRCodePlaceholder({
  value,
  size = 240,
  gridSize = 29,
  logoSrc = "/images/logo-short.svg",
}: Props) {
  const grid = useMemo(() => buildGrid(value, gridSize), [value, gridSize]);
  const cellSize = size / gridSize;
  const logoBox = size * 0.22;

  return (
    <div
      className="relative bg-white rounded-3 p-4"
      style={{ width: size + 32, height: size + 32 }}
    >
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="block" aria-hidden>
        {grid.map((row, r) =>
          row.map((isFilled, c) =>
            isFilled ? (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize}
                height={cellSize}
                fill="#0A0A0B"
              />
            ) : null,
          ),
        )}
      </svg>
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2 flex items-center justify-center"
        style={{ width: logoBox, height: logoBox }}
      >
        <Image src={logoSrc} alt="" width={logoBox * 0.7} height={logoBox * 0.7} />
      </div>
    </div>
  );
}
