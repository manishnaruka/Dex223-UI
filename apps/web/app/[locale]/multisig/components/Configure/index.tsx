import Preloader from "@repo/ui/preloader";
import { Formik, FormikProps } from "formik";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatEther, formatGwei } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import * as Yup from "yup";

import Select from "@/components/atoms/Select";
import TextField, { InputLabel } from "@/components/atoms/TextField";
import Button, { ButtonVariant } from "@/components/buttons/Button";
import MSigTransactionDialog from "@/components/dialogs/MSigTransactionDialog";
import NetworkFeeConfigDialog from "@/components/dialogs/NetworkFeeConfigDialog";
import { useConnectWalletDialogStateStore } from "@/components/dialogs/stores/useConnectWalletStore";
import { formatFloat } from "@/functions/formatFloat";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { useGlobalFees } from "@/shared/hooks/useGlobalFees";
import { GasOption } from "@/stores/factories/createGasPriceStore";
import { GasFeeModel } from "@/stores/useRecentTransactionsStore";
import { useTransactionSendDialogStore } from "@/stores/useTransactionSendDialogStore";

import useMultisigContract from "../../hooks/useMultisigContract";
import { GasFeeBlock } from "../shared";
import {
  useMultisigGasLimitStore,
  useMultisigGasModeStore,
  useMultisigGasPriceStore,
} from "../stores/useMultisigGasSettingsStore";

const initialValues = {
  type: "",
  newOwnerAddress: "",
  newThreshold: "",
  newDelay: "",
  data: "",
};

const schema = Yup.object({
  type: Yup.string().required("Type is required"),
  newOwnerAddress: Yup.string().when("type", {
    is: (val: string) => val === "addOwner" || val === "removeOwner",
    then: (schema) =>
      schema
        .required("Address is required")
        .matches(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
    otherwise: (schema) => schema.notRequired(),
  }),
  newThreshold: Yup.string().when("type", {
    is: "setupThreshold",
    then: (schema) =>
      schema
        .required("Threshold is required")
        .test("is-positive", "Threshold must be positive", (value) => {
          if (!value) return false;
          const num = parseInt(value);
          return !isNaN(num) && num > 0;
        }),
    otherwise: (schema) => schema.notRequired(),
  }),
  newDelay: Yup.string().when("type", {
    is: "setupDelay",
    then: (schema) =>
      schema
        .required("Delay is required")
        .test("is-positive", "Delay must be positive", (value) => {
          if (!value) return false;
          const num = parseInt(value);
          return !isNaN(num) && num > 0;
        }),
    otherwise: (schema) => schema.notRequired(),
  }),
  data: Yup.string(),
});

const configurationOptions = [
  { label: "Add Owner", value: "addOwner" },
  { label: "Remove Owner", value: "removeOwner" },
  { label: "Setup Threshold", value: "setupThreshold" },
  { label: "Setup Delay", value: "setupDelay" },
];

export default function Configure() {
  const { isConnected } = useAccount();
  const { setIsOpened: setWalletConnectOpened } = useConnectWalletDialogStateStore();
  const {
    addOwner,
    removeOwner,
    setupThreshold,
    setupDelay,
    generateTransactionData,
    fetchEstimatedDeadline,
    estimatedDeadline,
    estimatedDeadlineLoading,
  } = useMultisigContract();
  const [transactionData, setTransactionData] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const publicClient = usePublicClient();
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isOpenedFee, setIsOpenedFee] = useState(false);
  const {
    isOpen: isTransactionDialogOpen,
    status: transactionStatus,
    transactionId: dialogTransactionId,
    transactionHash,
    explorerUrl,
    closeDialog,
    errorMessage,
  } = useTransactionSendDialogStore();
  const formikRef = useRef<FormikProps<typeof initialValues>>(null);

  const chainId = useCurrentChainId();

  const {
    gasPriceOption,
    gasPriceSettings,
    setGasPriceOption,
    setGasPriceSettings,
    updateDefaultState,
  } = useMultisigGasPriceStore();
  const { estimatedGas, customGasLimit, setEstimatedGas, setCustomGasLimit } =
    useMultisigGasLimitStore();
  const { isAdvanced, setIsAdvanced } = useMultisigGasModeStore();
  const { baseFee, priorityFee, gasPrice } = useGlobalFees();

  useEffect(() => {
    updateDefaultState(chainId);
  }, [chainId, updateDefaultState]);

  const computedGasSpending = useMemo(() => {
    if (gasPriceSettings.model === GasFeeModel.LEGACY && gasPriceSettings.gasPrice) {
      return formatFloat(formatGwei(gasPriceSettings.gasPrice));
    }

    if (gasPriceSettings.model === GasFeeModel.LEGACY && gasPrice) {
      return formatFloat(formatGwei(gasPrice));
    }

    if (
      gasPriceSettings.model === GasFeeModel.EIP1559 &&
      gasPriceSettings.maxFeePerGas &&
      gasPriceSettings.maxPriorityFeePerGas &&
      baseFee &&
      gasPriceOption === GasOption.CUSTOM
    ) {
      const lowerFeePerGas =
        gasPriceSettings.maxFeePerGas > baseFee ? baseFee : gasPriceSettings.maxFeePerGas;

      return formatFloat(formatGwei(lowerFeePerGas + gasPriceSettings.maxPriorityFeePerGas));
    }

    if (
      gasPriceSettings.model === GasFeeModel.EIP1559 &&
      baseFee &&
      priorityFee &&
      gasPriceOption !== GasOption.CUSTOM
    ) {
      return formatFloat(formatGwei(baseFee + priorityFee));
    }

    return undefined;
  }, [baseFee, gasPrice, gasPriceOption, gasPriceSettings, priorityFee]);

  const computedGasSpendingETH = useMemo(() => {
    if (gasPriceSettings.model === GasFeeModel.LEGACY && gasPriceSettings.gasPrice) {
      return formatFloat(formatEther(gasPriceSettings.gasPrice * estimatedGas));
    }

    if (
      gasPriceSettings.model === GasFeeModel.EIP1559 &&
      gasPriceSettings.maxFeePerGas &&
      gasPriceSettings.maxPriorityFeePerGas &&
      baseFee &&
      gasPriceOption === GasOption.CUSTOM
    ) {
      const lowerFeePerGas =
        gasPriceSettings.maxFeePerGas > baseFee ? baseFee : gasPriceSettings.maxFeePerGas;

      return formatFloat(
        formatEther((lowerFeePerGas + gasPriceSettings.maxPriorityFeePerGas) * estimatedGas),
      );
    }

    if (
      gasPriceSettings.model === GasFeeModel.EIP1559 &&
      baseFee &&
      priorityFee &&
      gasPriceOption !== GasOption.CUSTOM
    ) {
      return formatFloat(formatEther((baseFee + priorityFee) * estimatedGas));
    }

    return undefined;
  }, [baseFee, estimatedGas, gasPriceOption, gasPriceSettings, priorityFee]);

  const generateTransactionDataForForm = (values: typeof initialValues): string => {
    if (!values.type) return "";

    try {
      switch (values.type) {
        case "addOwner":
          if (!values.newOwnerAddress) return "";
          return generateTransactionData("addOwner", [values.newOwnerAddress]);
        case "removeOwner":
          if (!values.newOwnerAddress) return "";
          return generateTransactionData("removeOwner", [values.newOwnerAddress]);
        case "setupThreshold":
          if (!values.newThreshold) return "";
          return generateTransactionData("setupThreshold", [BigInt(values.newThreshold)]);
        case "setupDelay":
          if (!values.newDelay) return "";
          return generateTransactionData("setupDelay", [BigInt(values.newDelay)]);
        default:
          return "";
      }
    } catch (error) {
      console.error(error);
      return "";
    }
  };

  const handleSubmit = async (values: typeof initialValues) => {
    setHasSubmitted(true);

    if (!isConnected) {
      setWalletConnectOpened(true);
      return;
    }
    setLoading(true);

    try {
      switch (values.type) {
        case "addOwner":
          if (!values.newOwnerAddress) throw new Error("Address is required");
          await addOwner(values.newOwnerAddress as `0x${string}`);
          break;
        case "removeOwner":
          if (!values.newOwnerAddress) throw new Error("Address is required");
          await removeOwner(values.newOwnerAddress as `0x${string}`);
          break;
        case "setupThreshold":
          if (!values.newThreshold) throw new Error("Threshold is required");
          await setupThreshold(BigInt(values.newThreshold));
          break;
        case "setupDelay":
          if (!values.newDelay) throw new Error("Delay is required");
          await setupDelay(BigInt(values.newDelay));
          break;
        default:
          throw new Error("Invalid configuration type");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstimatedDeadline();
  }, [fetchEstimatedDeadline]);

  useEffect(() => {
    if (
      (transactionStatus === "confirming" ||
        transactionStatus === "success" ||
        transactionStatus === "failed" ||
        transactionStatus === "error") &&
      isTransactionDialogOpen
    ) {
      setTransactionData("");
      setHasSubmitted(false);
      fetchEstimatedDeadline();
      formikRef.current?.resetForm();
    }
  }, [transactionStatus, isTransactionDialogOpen, fetchEstimatedDeadline]);

  return (
    <div className="bg-primary-bg rounded-3 p-6">
      <div className="flex flex-col gap-6">
        <Formik
          innerRef={formikRef}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          validationSchema={schema}
        >
          {(props) => {
            // useEffect(() => {
            //   const newData = generateTransactionDataForForm(props.values);
            //   if (newData !== transactionData) {
            //     setTransactionData(newData);
            //   }
            // }, [props.values]);

            return (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  props.handleSubmit();
                }}
                className="flex flex-col gap-6"
              >
                <div className="flex flex-col gap-4">
                  <div>
                    <InputLabel
                      label="Select Type"
                      tooltipText="Select the type of configuration change"
                    />
                    <Select
                      buttonType="button"
                      value={props.values.type}
                      onChange={(e) => {
                        props.setFieldValue("type", e);
                        props.setFieldValue("newOwnerAddress", "");
                        props.setFieldValue("newThreshold", "");
                        props.setFieldValue("newDelay", "");
                        props.setFieldTouched("type", false);
                        props.validateField("type");
                      }}
                      placeholder="Select Type"
                      extendWidth
                      optionsHeight={200}
                      options={configurationOptions}
                    />
                    {hasSubmitted && props.errors.type && (
                      <div className="text-red-light text-12 mt-1">{props.errors.type}</div>
                    )}
                  </div>

                  {(props.values.type === "addOwner" || props.values.type === "removeOwner") && (
                    <TextField
                      label="Owner Address"
                      tooltipText="Enter the owner address"
                      placeholder="Enter owner address"
                      value={props.values.newOwnerAddress}
                      error={
                        hasSubmitted && props.errors.newOwnerAddress
                          ? props.errors.newOwnerAddress
                          : ""
                      }
                      onChange={(e) => props.setFieldValue("newOwnerAddress", e.target.value)}
                    />
                  )}

                  {props.values.type === "setupThreshold" && (
                    <TextField
                      label="New Threshold"
                      tooltipText="Enter the new vote threshold"
                      placeholder="Enter threshold number"
                      value={props.values.newThreshold}
                      error={
                        hasSubmitted && props.errors.newThreshold ? props.errors.newThreshold : ""
                      }
                      onChange={(e) => props.setFieldValue("newThreshold", e.target.value)}
                    />
                  )}

                  {props.values.type === "setupDelay" && (
                    <TextField
                      label="New Delay (seconds)"
                      tooltipText="Enter the new execution delay in seconds"
                      placeholder="Enter delay in seconds"
                      value={props.values.newDelay}
                      error={hasSubmitted && props.errors.newDelay ? props.errors.newDelay : ""}
                      onChange={(e) => props.setFieldValue("newDelay", e.target.value)}
                    />
                  )}

                  <div className="relative">
                    {estimatedDeadlineLoading ? (
                      <Preloader className="absolute right-2 top-0" size={24} type="linear" />
                    ) : null}
                    <TextField
                      label="Deadline"
                      tooltipText="Set transaction deadline"
                      placeholder="DD.MM.YYYY HH:MM:ss aa"
                      value={estimatedDeadline}
                      readOnly={true}
                    />
                  </div>

                  <div className="flex flex-col gap-4">
                    <h3 className="text-18 font-bold text-primary-text">Data</h3>
                    <div className="bg-tertiary-bg px-5 py-4 h-[150px] flex justify-between items-center rounded-3 flex-col xs:flex-row overflow-y-auto">
                      <div className="flex flex-col text-tertiary-text break-all whitespace-pre-wrap h-full">
                        {transactionData || "Data will be displayed here"}
                      </div>
                    </div>
                  </div>
                </div>

                <GasFeeBlock
                  computedGasSpending={computedGasSpending}
                  computedGasSpendingETH={computedGasSpendingETH}
                  gasPriceOption={gasPriceOption}
                  onEditClick={() => setIsOpenedFee(true)}
                />

                {!isConnected ? (
                  <Button
                    variant={ButtonVariant.CONTAINED}
                    fullWidth
                    onClick={() => setWalletConnectOpened(true)}
                  >
                    Connect wallet
                  </Button>
                ) : (
                  <Button
                    variant={ButtonVariant.CONTAINED}
                    fullWidth
                    disabled={loading || (hasSubmitted && Object.keys(props.errors).length > 0)}
                    onClick={async () => {
                      setHasSubmitted(true);
                      const errors = await props.validateForm();
                      if (Object.keys(errors).length > 0) {
                        return;
                      }

                      props.handleSubmit();
                    }}
                  >
                    {loading ? "Confirming..." : "Confirm"}
                  </Button>
                )}
              </form>
            );
          }}
        </Formik>
      </div>
      <MSigTransactionDialog
        isOpen={isTransactionDialogOpen}
        setIsOpen={closeDialog}
        status={transactionStatus}
        transactionId={dialogTransactionId}
        transactionHash={transactionHash}
        explorerUrl={explorerUrl}
        errorMessage={errorMessage}
      />

      <NetworkFeeConfigDialog
        isAdvanced={isAdvanced}
        setIsAdvanced={setIsAdvanced}
        estimatedGas={estimatedGas}
        setEstimatedGas={setEstimatedGas}
        gasPriceSettings={gasPriceSettings}
        gasPriceOption={gasPriceOption}
        customGasLimit={customGasLimit}
        setCustomGasLimit={setCustomGasLimit}
        setGasPriceOption={setGasPriceOption}
        setGasPriceSettings={setGasPriceSettings}
        isOpen={isOpenedFee}
        setIsOpen={setIsOpenedFee}
      />
    </div>
  );
}
