import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { useCallback } from "react";
import { Address, encodeFunctionData } from "viem";
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

export interface MultisigConfig {
  numOwners: bigint;
  votePassThreshold: bigint;
  executionDelay: bigint;
  numTxs: bigint;
}

const MULTISIG_CONTRACT_ADDRESS = "0x70Bd62719a6ebECeF19314950a7E92EC65DA9cC0" as const;

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
        account: "0x28703bce6EFada7d4652e77cB450CFd07cF25650",
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
        account: "0x28703bce6EFada7d4652e77cB450CFd07cF25650",
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
    
    try {
      const hash = await writeContract(
        "approveTx",
        [txId],
        "Approve Transaction",
        (hash) => {
          updateStatus("success", {
            transactionId: txId.toString(),
            transactionHash: hash,
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
    
    try {
      const hash = await writeContract(
        "declineTx",
        [txId],
        "Decline Transaction",
        (hash) => {
          updateStatus("success", {
            transactionId: txId.toString(),
            transactionHash: hash,
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
    
    try {
      const hash = await writeContract(
        "executeTx",
        [txId],
        "Execute Transaction",
        (hash) => {
          updateStatus("success", {
            transactionId: txId.toString(),
            transactionHash: hash,
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
    
    try {
      const hash = await writeContract(
        "addOwner",
        [newOwner],
        "Add Owner",
        (hash) => {
          updateStatus("success", {
            transactionId: "owner_added",
            transactionHash: hash,
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
    
    try {
      const hash = await writeContract(
        "removeOwner",
        [owner],
        "Remove Owner",
        (hash) => {
          updateStatus("success", {
            transactionId: "owner_removed",
            transactionHash: hash,
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
    
    try {
      const hash = await writeContract(
        "setupDelay",
        [newDelay],
        "Setup Delay",
        (hash) => {
          updateStatus("success", {
            transactionId: "delay_set",
            transactionHash: hash,
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
    
    try {
      const hash = await writeContract(
        "setupThreshold",
        [newThreshold],
        "Setup Threshold",
        (hash) => {
          updateStatus("success", {
            transactionId: "threshold_set",
            transactionHash: hash,
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
    
    try {
      const hash = await writeContract(
        "reduceApprovalsThreshold",
        [txId],
        "Reduce Approvals Threshold",
        (hash) => {
          updateStatus("success", {
            transactionId: txId.toString(),
            transactionHash: hash,
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
  };
}
