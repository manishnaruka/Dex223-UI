import Select from "@/components/atoms/Select";
import TextField, { InputLabel } from "@/components/atoms/TextField";
import GasSettingsBlock from "@/components/common/GasSettingsBlock";
import Button, { ButtonVariant } from "@/components/buttons/Button";
import { Formik } from "formik";
import * as Yup from "yup";
import TextAreaField from "@/components/atoms/TextAreaField";
import { useAccount } from "wagmi";
import { useConnectWalletDialogStateStore } from "@/components/dialogs/stores/useConnectWalletStore";
import useMultisigContract from "../../hooks/useMultisigContract";
import { useState } from "react";

const initialValues = {
    type: "",
    newOwnerAddress: "",
    newThreshold: "",
    newDelay: "",
    data: "",
    deadline: "",
};

const schema = Yup.object({
    type: Yup.string().required("Type is required"),
    newOwnerAddress: Yup.string().when("type", {
        is: (val: string) => val === "addOwner" || val === "removeOwner",
        then: (schema) => schema.required("Address is required").matches(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
        otherwise: (schema) => schema.notRequired(),
    }),
    newThreshold: Yup.string().when("type", {
        is: "setupThreshold",
        then: (schema) => schema.required("Threshold is required").test("is-positive", "Threshold must be positive", (value) => {
            if (!value) return false;
            const num = parseInt(value);
            return !isNaN(num) && num > 0;
        }),
        otherwise: (schema) => schema.notRequired(),
    }),
    newDelay: Yup.string().when("type", {
        is: "setupDelay",
        then: (schema) => schema.required("Delay is required").test("is-positive", "Delay must be positive", (value) => {
            if (!value) return false;
            const num = parseInt(value);
            return !isNaN(num) && num > 0;
        }),
        otherwise: (schema) => schema.notRequired(),
    }),
    data: Yup.string(),
    deadline: Yup.string().required("Deadline is required"),
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
    const { addOwner, removeOwner, setupThreshold, setupDelay, generateTransactionData } = useMultisigContract();
    const [transactionData, setTransactionData] = useState<string>("");
    const [loading, setLoading] = useState(false);

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

    return (
        <div className="bg-primary-bg rounded-3 p-6">
            <div className="flex flex-col gap-6">
                <Formik
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                    validationSchema={schema}
                >
                    {(props) => {
                        const newData = generateTransactionDataForForm(props.values);
                        if (newData !== transactionData) {
                            setTransactionData(newData);
                        }

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
                                            <InputLabel label="Select Type" tooltipText="Select the type of configuration change" />
                                            <Select
                                                value={props.values.type}
                                                onChange={(e) => {
                                                    props.setFieldValue("type", e);
                                                    props.setFieldValue("newOwnerAddress", "");
                                                    props.setFieldValue("newThreshold", "");
                                                    props.setFieldValue("newDelay", "");
                                                    props.setFieldValue("deadline", "");
                                                }}
                                                placeholder="Select Type"
                                                extendWidth
                                                optionsHeight={200}
                                                options={configurationOptions}
                                            />
                                            {props.touched.type && props.errors.type && (
                                                <div className="text-red-light text-12 mt-1">{props.errors.type}</div>
                                            )}
                                        </div>

                                        {(props.values.type === "addOwner" || props.values.type === "removeOwner") && (
                                            <TextField
                                                label="Owner Address"
                                                tooltipText="Enter the owner address"
                                                placeholder="Enter owner address"
                                                value={props.values.newOwnerAddress}
                                                error={props.touched.newOwnerAddress && props.errors.newOwnerAddress ? props.errors.newOwnerAddress : ""}
                                                onChange={(e) => props.setFieldValue("newOwnerAddress", e.target.value)}
                                            />
                                        )}

                                        {props.values.type === "setupThreshold" && (
                                            <TextField
                                                label="New Threshold"
                                                tooltipText="Enter the new vote threshold"
                                                placeholder="Enter threshold number"
                                                value={props.values.newThreshold}
                                                error={props.touched.newThreshold && props.errors.newThreshold ? props.errors.newThreshold : ""}
                                                onChange={(e) => props.setFieldValue("newThreshold", e.target.value)}
                                            />
                                        )}

                                        {props.values.type === "setupDelay" && (
                                            <TextField
                                                label="New Delay (seconds)"
                                                tooltipText="Enter the new execution delay in seconds"
                                                placeholder="Enter delay in seconds"
                                                value={props.values.newDelay}
                                                error={props.touched.newDelay && props.errors.newDelay ? props.errors.newDelay : ""}
                                                onChange={(e) => props.setFieldValue("newDelay", e.target.value)}
                                            />
                                        )}

                                        <TextField
                                            label="Deadline"
                                            tooltipText="Set transaction deadline"
                                            placeholder="DD.MM.YYYY HH:MM:ss aa"
                                            value={props.values.deadline}
                                            error={props.touched.deadline && props.errors.deadline ? props.errors.deadline : ""}
                                            onChange={(e) => props.setFieldValue("deadline", e.target.value)}
                                        />

                                        <TextAreaField
                                            id="data"
                                            name="data"
                                            onChange={(e) => { }}
                                            onBlur={() => { }}
                                            label="Data"
                                            rows={6}
                                            value={transactionData}
                                            error=""
                                        />
                                    </div>

                                    <div className="border-t border-secondary-border pt-6">
                                        <GasSettingsBlock />
                                    </div>

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
                                            disabled={!props.isValid || !props.dirty || Object.keys(props.errors).length > 0 || loading}
                                            onClick={() => props.handleSubmit()}
                                        >
                                            {loading ? "Confirming..." : "Confirm"}
                                        </Button>
                                    )}
                                </form>
                            );
                        }}
                    </Formik>
            </div>
        </div>
    );
}