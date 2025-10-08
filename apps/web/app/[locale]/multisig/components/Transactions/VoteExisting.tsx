import { SearchInput } from "@/components/atoms/Input";
import { useEffect, useState, useCallback } from "react";
import Button, { ButtonVariant, ButtonColor } from "@/components/buttons/Button";
import GasSettingsBlock from "@/components/common/GasSettingsBlock";
import { useAccount } from "wagmi";
import Preloader from "@repo/ui/preloader";
import { useConnectWalletDialogStateStore } from "@/components/dialogs/stores/useConnectWalletStore";
import TransactionSendDialog from "@/components/dialogs/TransactionSendDialog";
import { useTransactionSendDialogStore } from "@/stores/useTransactionSendDialogStore";
import useMultisigContract from "../../hooks/useMultisigContract";
import useMultisigTransactions, { TransactionDisplayData } from "../../hooks/useMultisigTransactions";
import { TransactionInfoCard } from "../shared";

export default function VoteExisting() {
    const [transactionId, setTransactionId] = useState("");
    const { isConnected } = useAccount();
    const [loading, setLoading] = useState(false);
    const [currentTransaction, setCurrentTransaction] = useState<TransactionDisplayData | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const { setIsOpened: setWalletConnectOpened } = useConnectWalletDialogStateStore();
    const {
        isOpen: isTransactionDialogOpen,
        status: transactionStatus,
        transactionId: dialogTransactionId,
        transactionHash,
        explorerUrl,
        closeDialog,
    } = useTransactionSendDialogStore();
    
    const {
        approveTransaction,
        declineTransaction,
        executeTransaction,
        generateTransactionData,
    } = useMultisigContract();
    
    const { loadTransaction } = useMultisigTransactions();

    const loadTransactionData = useCallback(async (txId: string) => {
        if (!txId) {
            setCurrentTransaction(null);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const tx = await loadTransaction(txId);
            if (tx) {
                setCurrentTransaction(tx);
            } else {
                setError("Transaction not found");
                setCurrentTransaction(null);
            }
        } catch (err) {
            console.error(err);
            setCurrentTransaction(null);
        } finally {
            setLoading(false);
        }
    }, [loadTransaction]);

    const handleApproveTransaction = useCallback(async () => {
        if (!transactionId || !currentTransaction) return;
        
        try {
            await approveTransaction(BigInt(transactionId));
            await loadTransactionData(transactionId);
        } catch (error) {
            console.error(error);
        }
    }, [transactionId, currentTransaction, approveTransaction, loadTransactionData]);

    const handleRejectTransaction = useCallback(async () => {
        if (!transactionId || !currentTransaction) return;
        
        try {
            await declineTransaction(BigInt(transactionId));
            await loadTransactionData(transactionId);
        } catch (error) {
            console.error(error);
        }
    }, [transactionId, currentTransaction, declineTransaction, loadTransactionData]);

    const handleExecuteTransaction = useCallback(async () => {
        if (!transactionId || !currentTransaction) return;
        try {
            await executeTransaction(BigInt(transactionId));
            await loadTransactionData(transactionId);
        } catch (error) {
            console.error(error);
        }
    }, [transactionId, currentTransaction, executeTransaction, loadTransactionData]);

    const generateApproveData = useCallback(() => {
        if (!transactionId) return "";
        return generateTransactionData("approveTx", [BigInt(transactionId)]);
        
    }, [transactionId, generateTransactionData]);

    useEffect(() => {
        if (transactionId) {
            loadTransactionData(transactionId);
        }
    }, [transactionId, loadTransactionData]);

    useEffect(() => {
        if (transactionStatus === "success" || transactionStatus === "failed" && isTransactionDialogOpen) {
            setTransactionId("");
            setCurrentTransaction(null);
            setError(null);
        }
    }, [transactionStatus, isTransactionDialogOpen]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
                <h3 className="text-18 font-bold text-primary-text">Transaction ID</h3>
                <div className="relative">
                    <SearchInput
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="Enter ID"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-6">
                {loading && (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <Preloader size={80} />
                    </div>
                )}
                {!loading && currentTransaction && transactionId && (
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-4">
                            <h3 className="text-18 font-bold text-primary-text">Transaction Information</h3>
                            <TransactionInfoCard transaction={currentTransaction} />
                        </div>

                        <div className="flex flex-col gap-4">
                            <h3 className="text-18 font-bold text-primary-text">Data</h3>
                            <div className="bg-tertiary-bg px-5 py-4 h-[150px] flex justify-between items-center rounded-3 flex-col xs:flex-row overflow-y-auto">
                                <div className="flex flex-col text-tertiary-text break-all whitespace-pre-wrap h-full">
                                    {generateApproveData() || "Transaction data for approving will be displayed here"}
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-secondary-border pt-6">
                            <GasSettingsBlock />
                        </div>

                        {!isConnected ? (
                            <Button
                                variant={ButtonVariant.CONTAINED}
                                fullWidth
                                onClick={() => { setWalletConnectOpened(true) }}
                            >
                                Connect wallet
                            </Button>
                        ) : (
                            <div className="flex gap-3">
                                <Button
                                    colorScheme={ButtonColor.RED}
                                    fullWidth
                                    onClick={handleRejectTransaction}
                                >
                                    REJECT TRANSACTION
                                </Button>
                                <Button
                                    variant={ButtonVariant.CONTAINED}
                                    fullWidth
                                    onClick={handleApproveTransaction}
                                >
                                    APPROVE TRANSACTION
                                </Button>
                            </div>
                        )}
                    </div>
                )}
                {!loading && !currentTransaction && transactionId && (
                    <div className="flex flex-col justify-center items-center h-full min-h-[300px] bg-primary-bg rounded-5 gap-1 bg-empty-not-found-token bg-no-repeat bg-right-top max-md:bg-size-180">
                        <span className="text-secondary-text">Transaction not found</span>
                    </div>
                )}
            </div>

            <TransactionSendDialog
                isOpen={isTransactionDialogOpen}
                setIsOpen={closeDialog}
                status={transactionStatus}
                transactionId={dialogTransactionId}
                transactionHash={transactionHash}
                explorerUrl={explorerUrl}
            />
        </div>

    );
}