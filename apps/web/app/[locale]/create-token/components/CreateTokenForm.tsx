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
                onChange={(e) => props.setFieldValue("name", e.target.value)}
              />
              <TextField
                label="Symbol"
                tooltipText="tooltip_text"
                placeholder="Add token symbol (e.g. USDT)"
                value={props.values.symbol}
                onChange={(e) => props.setFieldValue("symbol", e.target.value)}
              />
              <TextField
                label="Total supply"
                tooltipText="tooltip_text"
                placeholder="Enter total supply"
                value={props.values.totalSupply}
                onChange={(e) => props.setFieldValue("totalSupply", e.target.value)}
              />
              <TextField
                label="Image  URL (optional)"
                tooltipText="tooltip_text"
                placeholder="https:// "
                value={props.values.imageURL}
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

            <Button fullWidth>Create token</Button>
          </form>
        )}
      </Formik>
      <ConfirmCreateTokenDialog createTokenSettings={createTokenSettings} />
    </>
  );
}
