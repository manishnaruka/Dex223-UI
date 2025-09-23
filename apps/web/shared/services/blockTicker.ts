import { watchBlockNumber } from "@wagmi/core";
import { create } from "zustand";

import { config } from "@/config/wagmi/config";
import { DexChainId } from "@/sdk_bi/chains";

type BlockTickerState = {
  lastBlock?: bigint;
  started: boolean;
};

const useBlockTickerStore = create<BlockTickerState>(() => ({
  lastBlock: undefined,
  started: false,
}));

let stopWatcher: (() => void) | null = null;

/**
 * Глобальна підписка на нові блоки (один інстанс на весь застосунок).
 * Безпечна для багаторазового виклику — повторні виклики просто no-op.
 */
export function useBlockTicker(opts?: { pollingIntervalMs?: number; chainId?: DexChainId }) {
  const started = useBlockTickerStore.getState().started;

  if (!started) {
    useBlockTickerStore.setState({ started: true });

    stopWatcher = watchBlockNumber(config, {
      emitOnBegin: true,
      poll: true,
      pollingInterval: opts?.pollingIntervalMs ?? 4000,
      chainId: opts?.chainId, // опційно: зафіксувати конкретний чейн
      onBlockNumber: (blockNumber) => {
        useBlockTickerStore.setState({ lastBlock: blockNumber });
      },
      onError: (err) => {
        console.error(err);
      },
    });
  }

  const lastBlock = useBlockTickerStore((s) => s.lastBlock);
  return { lastBlock };
}

/** Опціональна зупинка (зазвичай не потрібна) */
export function stopBlockTicker() {
  if (stopWatcher) {
    stopWatcher();
    stopWatcher = null;
    useBlockTickerStore.setState({ started: false, lastBlock: undefined });
  }
}
