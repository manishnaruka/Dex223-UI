import TextField, { InputLabel } from "@/components/atoms/TextField";
import GasSettingsBlock from "@/components/common/GasSettingsBlock";
import Button, { ButtonVariant } from "@/components/buttons/Button";
import { Formik } from "formik";
import * as Yup from "yup";
import TextAreaField from "@/components/atoms/TextAreaField";
import { useAccount, usePublicClient } from "wagmi";
import { useConnectWalletDialogStateStore } from "@/components/dialogs/stores/useConnectWalletStore";
import useMultisigContract from "../../hooks/useMultisigContract";
import { parseUnits, encodeFunctionData } from "viem";
import { useCallback, useState, useEffect } from "react";
import { useTransactionSendDialogStore } from "@/stores/useTransactionSendDialogStore";
import { Currency } from "@/sdk_bi/entities/currency";
import SelectButton from "@/components/atoms/SelectButton";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useTokens } from "@/hooks/useTokenLists";
import SelectOption from "@/components/atoms/SelectOption";
import Popover from "@/components/atoms/Popover";
import { MULTISIG_ABI } from "@/config/abis/Multisig";


const initialValues = {
    asset: "",
    amount: "",
    sendTo: "",
    data: "",
};

const schema = Yup.object({
    asset: Yup.string().required("Asset is required"),
    amount: Yup.string()
        .required("Amount is required")
        .test("is-positive", "Amount must be positive", (value) => {
            if (!value) return false;
            const num = parseFloat(value);
            return !isNaN(num) && num > 0;
        }),
    sendTo: Yup.string()
        .required("Send to is required")
        .matches(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
    data: Yup.string(),
});

export default function ProposeNewTransaction() {
    const { isConnected } = useAccount();
    const publicClient = usePublicClient();
    const { setIsOpened: setWalletConnectOpened } = useConnectWalletDialogStateStore();
    const [isOpenedAssetSelect, setIsOpenedAssetSelect] = useState(false);
    const { proposeTransaction, generateTransactionData, getConfig } = useMultisigContract();
    const [loading, setLoading] = useState(false);
    const tokens = useTokens();
    const [selectedToken, setSelectedToken] = useState<Currency | null>(null);
    const [proposeData, setProposeData] = useState<string>("");
    const [estimatedDeadline, setEstimatedDeadline] = useState<string>("");
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const t = useTranslations("Swap");

    const {
        isOpen: isTransactionDialogOpen,
        status: transactionStatus,
    } = useTransactionSendDialogStore();

    const getTokenBySymbol = useCallback((symbol: string) => {
        return tokens.find(token => token.symbol === symbol) || null;
    }, [tokens]);

    const generateTransactionDataForForm = (values: typeof initialValues): string => {
        const token = getTokenBySymbol(values.asset);
        if (!token || !values.amount || !values.sendTo) return "";

        try {
            const amount = parseUnits(values.amount, token.decimals);

            if (token.isNative) {
                return "0x";
            } else {
                return encodeFunctionData({
                    abi: MULTISIG_ABI,
                    functionName: "transfer",
                    args: [values.sendTo as `0x${string}`, amount],
                });
            }
        } catch (error) {
            return "";
        }
    };

    const generateProposeData = useCallback((values: typeof initialValues): string => {
        const token = getTokenBySymbol(values.asset);
        if (!token || !values.amount || !values.sendTo) return "";

        try {
            const amount = parseUnits(values.amount, token.decimals);
            const to = values.sendTo as `0x${string}`;
            const data = values.data || generateTransactionDataForForm(values);

            return generateTransactionData("proposeTx", [to, amount, data as `0x${string}`]);
        } catch (error) {
            return "";
        }
    }, [getTokenBySymbol, generateTransactionDataForForm, generateTransactionData]);

    const handleSubmit = async (values: typeof initialValues) => {
        if(!schema.isValidSync(values)) {
            return;
        }
        setHasSubmitted(true);
        
        if (!isConnected) {
            setWalletConnectOpened(true);
            return;
        }
        setLoading(true);
        try {
            const token = getTokenBySymbol(values.asset);
            if (!token) {
                return;
            }

            const amount = parseUnits(values.amount, token.decimals);
            const to = values.sendTo as `0x${string}`;
            const data = (values.data || generateTransactionDataForForm(values)) as `0x${string}`;
            await proposeTransaction(to, amount, data);
        } catch (error) {
            console.error("Error proposing transaction:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEstimatedDeadline = useCallback(async () => {
        if (!publicClient) return;

        try {
            const config = await getConfig();
            if (!config) return;

            const currentBlock = await publicClient.getBlock({ blockTag: 'latest' });
            const estimatedDeadlineTimestamp = currentBlock.timestamp + config.executionDelay;
            const deadlineDate = new Date(Number(estimatedDeadlineTimestamp) * 1000);
            setEstimatedDeadline(deadlineDate.toLocaleString());
        } catch (error) {
            console.error(error);
        }
    }, [publicClient, getConfig]);

    useEffect(() => {
        fetchEstimatedDeadline();
    }, [fetchEstimatedDeadline]);

    useEffect(() => {
        if (transactionStatus === "success" || transactionStatus === "failed" && isTransactionDialogOpen) {
            setSelectedToken(null);
            setProposeData("");
            setHasSubmitted(false);
            fetchEstimatedDeadline();
        }
    }, [transactionStatus, isTransactionDialogOpen, fetchEstimatedDeadline]);


    return (
        <div className="flex flex-col gap-6">
            <Formik
                initialValues={initialValues}
                onSubmit={handleSubmit}
                validationSchema={schema}
                validateOnBlur={false}
                validateOnChange={false}
                validateOnMount={false}
            >
                {(props) => {
                    const newProposeData = generateProposeData(props.values);
                    if (newProposeData !== proposeData) {
                        setProposeData(newProposeData);
                    }

                    return (
                        <>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    props.handleSubmit();
                                }}
                            >
                                <div className="flex flex-col gap-4">
                                    <div>
                                        <InputLabel className="font-bold flex items-center gap-1 text-secondary-text text-16 mb-1" label="Select Asset" tooltipText="Select the asset to transfer" />
                                        <Popover
                                            isOpened={isOpenedAssetSelect}
                                            setIsOpened={setIsOpenedAssetSelect}
                                            placement="bottom-start"
                                            trigger={
                                                <SelectButton
                                                    className="pl-2 pr-1 py-1 xl:py-2 gap-0 md:gap-2 xl:px-3 text-secondary-text w-full h-12 border"
                                                    isOpen={isOpenedAssetSelect}
                                                    onClick={() => setIsOpenedAssetSelect(!isOpenedAssetSelect)}
                                                    withArrow={true}
                                                    fullWidth={true}
                                                >
                                                    {selectedToken ? (
                                                        <span className="flex items-center gap-2 xl:min-w-[110px]">
                                                            {selectedToken.logoURI && (
                                                                <Image
                                                                    src={selectedToken.logoURI}
                                                                    alt={selectedToken.symbol || "Token"}
                                                                    width={24}
                                                                    height={24}
                                                                />
                                                            )}
                                                            <span className="hidden xl:inline">{selectedToken.symbol}</span>
                                                        </span>
                                                    ) : (
                                                        "Select asset"
                                                    )}
                                                </SelectButton>
                                            }
                                        >
                                            <div className="py-1 text-16 bg-primary-bg rounded-2 min-w-[560px] shadow-popover shadow-black/70 overflow-y-auto max-h-[300px]">
                                                <div>
                                                    {tokens.map((token: Currency) => {
                                                        const tokenKey = token.isToken ? token.address0 : token.symbol || 'native';
                                                        const selectedKey = selectedToken ? (selectedToken.isToken ? selectedToken.address0 : selectedToken.symbol || 'native') : null;
                                                        return (
                                                            <SelectOption
                                                                key={tokenKey}
                                                                onClick={() => {
                                                                    setSelectedToken(token);
                                                                    props.setFieldValue("asset", token.symbol || "");
                                                                    setIsOpenedAssetSelect(false);
                                                                }}
                                                                isActive={selectedKey === tokenKey}
                                                            >
                                                                {token.logoURI && (
                                                                    <Image
                                                                        src={token.logoURI}
                                                                        alt={token.symbol || "Token"}
                                                                        width={24}
                                                                        height={24}
                                                                    />
                                                                )}
                                                                {token.symbol} {token.name && `(${token.name})`}
                                                            </SelectOption>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </Popover>
                                        {hasSubmitted && props.errors.asset && (
                                            <div className="text-red-light text-12 mt-1">{props.errors.asset}</div>
                                        )}
                                    </div>

                                    <TextField
                                        label="Amount"
                                        tooltipText="Enter the amount to transfer"
                                        placeholder="Enter amount"
                                        value={props.values.amount}
                                        error={hasSubmitted && props.errors.amount ? props.errors.amount : ""}
                                        onChange={(e) => props.setFieldValue("amount", e.target.value)}
                                    />

                                    <TextField
                                        label="Send to"
                                        tooltipText="Enter the recipient wallet address"
                                        placeholder="Enter wallet address"
                                        value={props.values.sendTo}
                                        error={hasSubmitted && props.errors.sendTo ? props.errors.sendTo : ""}
                                        onChange={(e) => props.setFieldValue("sendTo", e.target.value)}
                                    />

                                    <TextField
                                        label="Deadline"
                                        tooltipText="Set transaction deadline"
                                        placeholder="DD.MM.YYYY HH:MM:ss aa"
                                        value={estimatedDeadline}
                                        readOnly={true}
                                    />

                                    <div className="flex flex-col gap-4">
                                        <h3 className="text-18 font-bold text-primary-text">Data</h3>
                                        <div className="bg-tertiary-bg px-5 py-4 h-[150px] flex justify-between items-center rounded-3 flex-col xs:flex-row overflow-y-auto">
                                            <div className="flex flex-col text-tertiary-text break-all whitespace-pre-wrap h-full">
                                                {generateProposeData(props.values) || "Transaction data for approving will be displayed here"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-secondary-border pt-6 mt-4">
                                    <GasSettingsBlock />
                                </div>

                                {!isConnected ? (
                                    <Button
                                        type="button"
                                        variant={ButtonVariant.CONTAINED}
                                        fullWidth
                                        onClick={() => setWalletConnectOpened(true)}
                                    >
                                        Connect wallet
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        variant={ButtonVariant.CONTAINED}
                                        fullWidth
                                        disabled={loading || (hasSubmitted && Object.keys(props.errors).length > 0)}
                                    >
                                        {loading ? "Proposing..." : "Propose Transaction"}
                                    </Button>
                                )}
                            </form>
                        </>
                    );
                }}
            </Formik>
        </div>
    );
}