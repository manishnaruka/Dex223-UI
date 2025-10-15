import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { useCallback, useEffect, useState } from "react";
import { Address, encodeFunctionData, Log } from "viem";
import { MULTISIG_ABI } from "@/config/abis/Multisig";
import { useTransactionSendDialogStore } from "@/stores/useTransactionSendDialogStore";
import { getTransactionWithRetries } from "@/functions/getTransactionWithRetries";
import { useRecentTransactionsStore, stringifyObject, RecentTransactionTitleTemplate } from "@/stores/useRecentTransactionsStore";

import { useGlobalFees } from "@/shared/hooks/useGlobalFees";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { getGasSettings } from "@/functions/gasSettings";
import { GasOption } from "@/stores/factories/createGasPriceStore";

export interface MultisigTransaction {
  to: Address;
  value: bigint;
  data: `0x${string}`;
  proposed_timestamp: bigint;
  executed: boolean;
  num_approvals: bigint;
  num_votes: bigint;
  required_approvals: bigint;
}

export interface TransactionProposedEvent {
  txId: bigint;
  proposer: Address;
  to: Address;
  value: bigint;
  data: `0x${string}`;
}

export interface MultisigConfig {
  numOwners: bigint;
  votePassThreshold: bigint;
  executionDelay: bigint;
  numTxs: bigint;
}

// const MULTISIG_CONTRACT_ADDRESS = process.env.MSIG_CONTRACT_ADDRESS as Address;
const MULTISIG_CONTRACT_ADDRESS = "0xE0CbccaBB9a7987bC94287D555A1Aa440Efa30bf" as Address;

export default function useMultisigContract() {
  const { address, chainId } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { addRecentTransaction } = useRecentTransactionsStore();
  const { baseFee, gasPrice, priorityFee } = useGlobalFees();
  const currentChainId = useCurrentChainId();
  const {
    openDialog,
    closeDialog,
    updateStatus,
  } = useTransactionSendDialogStore();
  const [latestEvent, setLatestEvent] = useState<TransactionProposedEvent | null>(null);

  const readContract = useCallback(async (functionName: string, args: unknown[] = []) => {
    if (!publicClient) return null;
    
    try {
      return await publicClient.readContract({
        address: MULTISIG_CONTRACT_ADDRESS,
        abi: MULTISIG_ABI,
        functionName: functionName as any,
        args,
      });
    } catch (error) {
      return null;
    }
  }, [publicClient]);

  const writeContract = useCallback(async (
    functionName: string,
    args: unknown[],
    title: string,
    onHashReceive?: (hash: string) => void,
    onReceiptReceive?: (receipt: unknown) => void
  ) => {
    if (!publicClient || !walletClient || !address) {
      throw new Error("Missing required clients or address");
    }
    
    const params = {
      abi: MULTISIG_ABI,
      address: MULTISIG_CONTRACT_ADDRESS,
      functionName: functionName as any,
      args,
    };

    try {

      const estimatedGas = await publicClient.estimateContractGas({
        account: address as Address,
        ...params,
      });

      const gasToUse = estimatedGas + BigInt(30000);

      const gasSettings = getGasSettings({
        baseFee,
        chainId: currentChainId,
        gasPrice,
        priorityFee,
        gasPriceOption: GasOption.FAST,
        gasPriceSettings: {
          model: 0,
          maxFeePerGas: undefined,
          maxPriorityFeePerGas: undefined,
        },
      });

      const hash = await walletClient.writeContract({
        ...params,
        account: address as Address,
        ...gasSettings,
        gas: gasToUse,
      });

      onHashReceive?.(hash);

      const transaction = await getTransactionWithRetries({
        hash,
        publicClient,
      });

      if (transaction) {
        const nonce = transaction.nonce;
        
        addRecentTransaction(
          {
            hash,
            nonce,
            chainId: chainId!,
            gas: {
              ...stringifyObject({ ...gasSettings }),
              gas: gasToUse.toString(),
            },
            params: {
              ...stringifyObject(params),
            },
            title: {
              template: RecentTransactionTitleTemplate.TRANSFER,
              symbol: "MULTISIG",
              amount: "0",
              logoURI: "/images/tokens/placeholder.svg",
            },
          },
          address,
        );
      }

      onReceiptReceive?.(transaction);
      return hash;
    } catch (error) {
      throw error;
    }
  }, [publicClient, walletClient, address, baseFee, currentChainId, gasPrice, priorityFee, addRecentTransaction, chainId]);

  const getTransaction = useCallback(async (txId: bigint): Promise<MultisigTransaction | null> => {
    const result = await readContract("txs", [txId]);
    if (!result) return null;

    const [to, value, data, proposed_timestamp, executed, num_approvals, num_votes, required_approvals] = result as any[];
    
    return {
      to,
      value,
      data,
      proposed_timestamp,
      executed,
      num_approvals,
      num_votes,
      required_approvals,
    };
  }, [readContract]);

  const getAllTransactions = useCallback(async (): Promise<MultisigTransaction[]> => {
    const numTxs = await readContract("num_TXs");
    if (!numTxs) return [];

    const transactions: MultisigTransaction[] = [];
    for (let i = 0; i < Number(numTxs); i++) {
      const tx = await getTransaction(BigInt(i));
      if (tx) {
        transactions.push(tx);
      }
    }
    return transactions;
  }, [readContract, getTransaction]);

  const getConfig = useCallback(async (): Promise<MultisigConfig | null> => {
    const [numOwners, votePassThreshold, executionDelay, numTxs] = await Promise.all([
      readContract("num_owners"),
      readContract("vote_pass_threshold"),
      readContract("execution_delay"),
      readContract("num_TXs"),
    ]);

    if (!numOwners || !votePassThreshold || !executionDelay || !numTxs) return null;

    return {
      numOwners: BigInt(numOwners as string),
      votePassThreshold: BigInt(votePassThreshold as string),
      executionDelay: BigInt(executionDelay as string),
      numTxs: BigInt(numTxs as string),
    };
  }, [readContract]);

  const isOwner = useCallback(async (address: Address): Promise<boolean> => {
    const result = await readContract("owner", [address]);
    return Boolean(result);
  }, [readContract]);

  const isTransactionAllowed = useCallback(async (txId: bigint): Promise<boolean> => {
    const result = await readContract("txAllowed", [txId]);
    return Boolean(result);
  }, [readContract]);

  const approveTransaction = useCallback(async (txId: bigint) => {
    openDialog("sending", { transactionId: txId.toString() });
    
    let txHash: string | undefined;
    try {
      const hash = await writeContract(
        "approveTx",
        [txId],
        "Approve Transaction",
        (hash) => {
          // txHash = hash;
          updateStatus("success", {
            transactionId: txId.toString(),
            transactionHash: hash,
          });
        },
        (receipt) => {
          updateStatus("success", {
            transactionId: txId.toString(),
            transactionHash: txHash!,
          });
        }
      );
      return hash;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      updateStatus("failed", {
        transactionId: txId.toString(),
        errorMessage,
      });
      throw new Error(errorMessage);
    }
  }, [writeContract, openDialog, updateStatus]);

  const declineTransaction = useCallback(async (txId: bigint) => {
    openDialog("sending", { transactionId: txId.toString() });
    
    let txHash: string | undefined;
    try {
      const hash = await writeContract(
        "declineTx",
        [txId],
        "Decline Transaction",
        (hash) => {
          // txHash = hash;
          updateStatus("success", {
            transactionId: txId.toString(),
            transactionHash: hash,
          });
        },
        (receipt) => {
          updateStatus("success", {
            transactionId: txId.toString(),
            transactionHash: txHash!,
          });
        }
      );
      return hash;
    } catch (error) {
      updateStatus("failed", {
        transactionId: txId.toString(),
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }, [writeContract, openDialog, updateStatus]);

  const executeTransaction = useCallback(async (txId: bigint) => {
    openDialog("sending", { transactionId: txId.toString() });
    
    let txHash: string | undefined;
    try {
      const hash = await writeContract(
        "executeTx",
        [txId],
        "Execute Transaction",
        (hash) => {
          // txHash = hash;
          updateStatus("success", {
            transactionId: txId.toString(),
            transactionHash: hash,
          });
        },
        (receipt) => {
          updateStatus("success", {
            transactionId: txId.toString(),
            transactionHash: txHash!,
          });
        }
      );
      return hash;
    } catch (error) {
      updateStatus("failed", {
        transactionId: txId.toString(),
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }, [writeContract, openDialog, updateStatus]);

  const proposeTransaction = useCallback(async (
    to: Address,
    value: bigint,
    data: `0x${string}`
  ) => {
    openDialog("sending", { transactionId: "proposing" });
    
    let txHash: string | undefined;
    try {
      const hash = await writeContract(
        "proposeTx",
        [to, value, data],
        "Propose Transaction",
        (hash) => {
          updateStatus("success", {
            transactionId: "proposed",
            transactionHash: hash,
          });
        },
        (receipt) => {
          updateStatus("success", {
            transactionId: "proposed",
            transactionHash: txHash!,
          });
        }
      );
      return hash;
    } catch (error) {
      updateStatus("failed", {
        transactionId: "proposed",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }, [writeContract, openDialog, updateStatus]);

  // Add owner
  const addOwner = useCallback(async (newOwner: Address) => {
    openDialog("sending", { transactionId: "adding_owner" });
    
    let txHash: string | undefined;
    try {
      const hash = await writeContract(
        "addOwner",
        [newOwner],
        "Add Owner",
        (hash) => {
          txHash = hash;
        },
        (receipt) => {
          updateStatus("success", {
            transactionId: "owner_added",
            transactionHash: txHash!,
          });
        }
      );
      return hash;
    } catch (error) {
      updateStatus("failed", {
        transactionId: "owner_added",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }, [writeContract, openDialog, updateStatus]);

  // Remove owner
  const removeOwner = useCallback(async (owner: Address) => {
    openDialog("sending", { transactionId: "removing_owner" });
    
    let txHash: string | undefined;
    try {
      const hash = await writeContract(
        "removeOwner",
        [owner],
        "Remove Owner",
        (hash) => {
          txHash = hash;
        },
        (receipt) => {
          updateStatus("success", {
            transactionId: "owner_removed",
            transactionHash: txHash!,
          });
        }
      );
      return hash;
    } catch (error) {
      updateStatus("failed", {
        transactionId: "owner_removed",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }, [writeContract, openDialog, updateStatus]);

  // Setup delay
  const setupDelay = useCallback(async (newDelay: bigint) => {
    openDialog("sending", { transactionId: "setting_delay" });
    
    let txHash: string | undefined;
    try {
      const hash = await writeContract(
        "setupDelay",
        [newDelay],
        "Setup Delay",
        (hash) => {
          txHash = hash;
        },
        (receipt) => {
          updateStatus("success", {
            transactionId: "delay_set",
            transactionHash: txHash!,
          });
        }
      );
      return hash;
    } catch (error) {
      updateStatus("failed", {
        transactionId: "delay_set",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }, [writeContract, openDialog, updateStatus]);

  // Setup threshold
  const setupThreshold = useCallback(async (newThreshold: bigint) => {
    openDialog("sending", { transactionId: "setting_threshold" });
    
    let txHash: string | undefined;
    try {
      const hash = await writeContract(
        "setupThreshold",
        [newThreshold],
        "Setup Threshold",
        (hash) => {
          txHash = hash;
        },
        (receipt) => {
          updateStatus("success", {
            transactionId: "threshold_set",
            transactionHash: txHash!,
          });
        }
      );
      return hash;
    } catch (error) {
      updateStatus("failed", {
        transactionId: "threshold_set",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }, [writeContract, openDialog, updateStatus]);

  // Reduce approvals threshold
  const reduceApprovalsThreshold = useCallback(async (txId: bigint) => {
    openDialog("sending", { transactionId: txId.toString() });
    
    let txHash: string | undefined;
    try {
      const hash = await writeContract(
        "reduceApprovalsThreshold",
        [txId],
        "Reduce Approvals Threshold",
        (hash) => {
          txHash = hash;
        },
        (receipt) => {
          updateStatus("success", {
            transactionId: txId.toString(),
            transactionHash: txHash!,
          });
        }
      );
      return hash;
    } catch (error) {
      updateStatus("failed", {
        transactionId: txId.toString(),
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }, [writeContract, openDialog, updateStatus]);

  // Get token transfer data
  const getTokenTransferData = useCallback(async (destination: Address, amount: bigint): Promise<`0x${string}`> => {
    const result = await readContract("getTokenTransferData", [destination, amount]);
    return result as `0x${string}`;
  }, [readContract]);

  const generateTransactionData = useCallback((functionName: string, args: unknown[]): `0x${string}` => {
    return encodeFunctionData({
      abi: MULTISIG_ABI,
      functionName: functionName as any,
      args,
    });
  }, []);

  const getTransactionDeadline = useCallback(async (txId: bigint): Promise<bigint | null> => {
    const [transaction, config] = await Promise.all([
      getTransaction(txId),
      getConfig(),
    ]);
    if (!transaction || !config) return null;
    return transaction.proposed_timestamp + config.executionDelay;
  }, [getTransaction, getConfig]);

  // Watch for TransactionProposed events
  useEffect(() => {
    if (!publicClient) return;

    let unwatch: (() => void) | undefined;

    const watchEvents = async () => {
      try {
        unwatch = publicClient.watchContractEvent({
          address: MULTISIG_CONTRACT_ADDRESS,
          abi: MULTISIG_ABI,
          eventName: "TransactionProposed",
          onLogs: (logs) => {
            logs.forEach((log) => {
              const { args } = log as any;
              if (args) {
                const event: TransactionProposedEvent = {
                  txId: args.txId,
                  proposer: args.proposer,
                  to: args.to,
                  value: args.value,
                  data: args.data,
                };
                setLatestEvent(event);
              }
            });
          },
        });
      } catch (error) {
        console.error("Error watching TransactionProposed event:", error);
      }
    };

    watchEvents();

    return () => {
      if (unwatch) {
        unwatch();
      }
    };
  }, [publicClient]);

  const getProposerFromEvents = useCallback(async (txId: bigint): Promise<Address | null> => {
    if (!publicClient) return null;

    try {
      const logs = await publicClient.getLogs({
        address: MULTISIG_CONTRACT_ADDRESS,
        event: {
          type: "event",
          name: "TransactionProposed",
          inputs: [
            { type: "uint256", indexed: true, name: "txId" },
            { type: "address", indexed: true, name: "proposer" },
            { type: "address", indexed: true, name: "to" },
            { type: "uint256", indexed: false, name: "value" },
            { type: "bytes", indexed: false, name: "data" },
          ],
        },
        args: {
          txId: txId,
        },
        fromBlock: 'earliest',
        toBlock: 'latest',
      });

      if (logs.length > 0) {
        const log = logs[0] as any;
        return log.args?.proposer || null;
      }
      return null;
    } catch (error) {
      console.error("Error fetching proposer from events:", error);
      return null;
    }
  }, [publicClient]);

  return {
    getTransaction,
    getAllTransactions,
    getConfig,
    isOwner,
    isTransactionAllowed,
    approveTransaction,
    declineTransaction,
    executeTransaction,
    proposeTransaction,
    addOwner,
    removeOwner,
    setupDelay,
    setupThreshold,
    reduceApprovalsThreshold,
    getTokenTransferData,
    generateTransactionData,
    getTransactionDeadline,
    getProposerFromEvents,
    latestEvent,
  };
}
