import Checkbox from "@repo/ui/checkbox";
import { Formik } from "formik";
import React, { useState } from "react";

import ConfirmCreateTokenDialog from "@/app/[locale]/create-token/components/ConfirmCreateTokenDialog";
import { useCreateTokenDialogStore } from "@/app/[locale]/create-token/hooks/useCreateTokenDialogStore";
import { OrderActionMode, OrderActionStep } from "@/app/[locale]/margin-trading/types";
import TextField from "@/components/atoms/TextField";
import Button from "@/components/buttons/Button";
import GasSettingsBlock from "@/components/common/GasSettingsBlock";

const initialCreateTokenSettings = {
  name: "",
  symbol: "",
  totalSupply: "",
  imageURL: "",
  allowMintForOwner: false,
  createERC20: false,
};

import * as Yup from "yup";

const isValidHttpsUrl = (value?: string) => {
  try {
    if (!value) return true; // handled by required on other fields
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
};

const isValidIpfsUrl = (value?: string) => {
  if (!value) return true;
  return /^ipfs:\/\/.+/i.test(value);
};

const createTokenSchema = Yup.object({
  name: Yup.string().trim().required("Token name is required"),
  symbol: Yup.string().trim().required("Symbol is required"),
  totalSupply: Yup.string().trim().required("Total supply is required"),
  imageURL: Yup.string()
    .trim()
    .notRequired()
    .test(
      "ipfs-or-https",
      "Must be a valid ipfs://… or https://… URL",
      (val) => !val || isValidIpfsUrl(val) || isValidHttpsUrl(val),
    ),
});

export default function CreateTokenForm() {
  const { isOpen, setIsOpen } = useCreateTokenDialogStore();
  const [createTokenSettings, setCreateTokenSettings] = useState(initialCreateTokenSettings);

  return (
    <>
      <Formik
        initialValues={createTokenSettings}
        onSubmit={(values) => {
          setIsOpen(true);
          setCreateTokenSettings(values);
        }}
        validationSchema={createTokenSchema}
      >
        {(props) => (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              props.handleSubmit();
            }}
          >
            <div className="flex flex-col gap-1 mb-3">
              <TextField
                label="Token name"
                tooltipText="tooltip_text"
                placeholder="Name your token"
                value={props.values.name}
                error={props.touched.name && props.errors.name}
                onChange={(e) => props.setFieldValue("name", e.target.value)}
              />
              <TextField
                label="Symbol"
                tooltipText="tooltip_text"
                placeholder="Add token symbol (e.g. USDT)"
                value={props.values.symbol}
                error={props.touched.symbol && props.errors.symbol}
                onChange={(e) => props.setFieldValue("symbol", e.target.value)}
              />
              <TextField
                label="Total supply"
                isNumeric
                tooltipText="tooltip_text"
                placeholder="Enter total supply"
                value={props.values.totalSupply}
                error={props.touched.totalSupply && props.errors.totalSupply}
                onChange={(e) => props.setFieldValue("totalSupply", e.target.value)}
              />
              <TextField
                label="Image  URL (optional)"
                tooltipText="tooltip_text"
                placeholder="https:// "
                value={props.values.imageURL}
                error={props.touched.imageURL && props.errors.imageURL}
                onChange={(e) => props.setFieldValue("imageURL", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-4 mb-5">
              <Checkbox
                checked={props.values.allowMintForOwner}
                label="Allow owner (you) to issue new tokens"
                handleChange={() =>
                  props.setFieldValue("allowMintForOwner", !props.values.allowMintForOwner)
                }
                id="allow-issue-new-tokens"
              />
              <Checkbox
                label="Make ERC-20 version"
                checked={props.values.createERC20}
                handleChange={() => props.setFieldValue("createERC20", !props.values.createERC20)}
                id="make-erc20-version"
              />
            </div>

            <GasSettingsBlock />

            <Button
              disabled={
                Object.keys(props.touched).length > 0 && Object.keys(props.errors).length > 0
              }
              fullWidth
            >
              Create token
            </Button>
          </form>
        )}
      </Formik>
      <ConfirmCreateTokenDialog createTokenSettings={createTokenSettings} />
    </>
  );
}
