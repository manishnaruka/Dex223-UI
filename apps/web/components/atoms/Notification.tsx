import { useTranslations } from "next-intl";
import React, { PropsWithChildren } from "react";

import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";
import Badge, { BadgeVariant } from "@/components/badges/Badge";
import IconButton, { IconButtonSize, IconButtonVariant } from "@/components/buttons/IconButton";
import { RecentTransactionLogo } from "@/components/common/RecentTransaction";
import { formatFloat } from "@/functions/formatFloat";
import { Standard } from "@/sdk_bi/standard";
import {
  IRecentTransactionTitle,
  RecentTransactionStatus,
  RecentTransactionTitleTemplate,
} from "@/stores/useRecentTransactionsStore";

export type NotificationTransactionStatus =
  | RecentTransactionStatus.ERROR
  | RecentTransactionStatus.SUCCESS;

interface Props {
  onDismiss: () => void;
  transactionTitle: IRecentTransactionTitle;
  transactionStatus: NotificationTransactionStatus;
}

function NotificationTitleText({ children }: PropsWithChildren) {
  return <span className="font-bold block max-md:text-14">{children}</span>;
}

function NotificationSubtitleText({ children }: PropsWithChildren) {
  return <span className="text-secondary-text max-md:text-12">{children}</span>;
}

export function NotificationSubTitle({ title }: { title: IRecentTransactionTitle }) {
  const t = useTranslations("RecentTransactions");

  switch (title.template) {
    case RecentTransactionTitleTemplate.APPROVE:
    case RecentTransactionTitleTemplate.DEPOSIT:
    case RecentTransactionTitleTemplate.WITHDRAW:
    case RecentTransactionTitleTemplate.CONVERT:
    case RecentTransactionTitleTemplate.UNWRAP:
      return (
        <NotificationSubtitleText>
          {t("single_subtitle", {
            amount: formatFloat(title.amount, { trimZero: true }),
            symbol: title.symbol,
          })}
        </NotificationSubtitleText>
      );
    case RecentTransactionTitleTemplate.SWAP:
    case RecentTransactionTitleTemplate.MARGIN_SWAP:
    case RecentTransactionTitleTemplate.REMOVE:
    case RecentTransactionTitleTemplate.COLLECT:
    case RecentTransactionTitleTemplate.ADD:
      return (
        <NotificationSubtitleText>
          {t("double_tokens_subtitle", {
            amount0: formatFloat(title.amount0, { trimZero: true }),
            amount1: formatFloat(title.amount1, { trimZero: true }),
            symbol0: title.symbol0,
            symbol1: title.symbol1,
          })}
        </NotificationSubtitleText>
      );
    case RecentTransactionTitleTemplate.LIST_SINGLE:
      return (
        <NotificationSubtitleText>{`${title.symbol} in "${title.autoListing}" list`}</NotificationSubtitleText>
      );
    case RecentTransactionTitleTemplate.LIST_DOUBLE:
      return (
        <NotificationSubtitleText>{`${title.symbol0} and ${title.symbol0} in "${title.autoListing}" list`}</NotificationSubtitleText>
      );
    case RecentTransactionTitleTemplate.CLOSE_LENDING_ORDER:
    case RecentTransactionTitleTemplate.OPEN_LENDING_ORDER:
    case RecentTransactionTitleTemplate.EDIT_LENDING_ORDER:
      return (
        <NotificationSubtitleText>{`${title.symbol} (ID: ${title.orderId})`}</NotificationSubtitleText>
      );
    case RecentTransactionTitleTemplate.CREATE_LENDING_ORDER:
      return <NotificationSubtitleText>{title.symbol}</NotificationSubtitleText>;
    case RecentTransactionTitleTemplate.CREATE_MARGIN_POSITION:
      return (
        <NotificationSubtitleText>{`${title.amountCollateral} ${title.symbolCollateral} collateral and ${title.amountFee} ${title.symbolFee} fee`}</NotificationSubtitleText>
      );
    case RecentTransactionTitleTemplate.LIQUIDATE_MARGIN_POSITION:
    case RecentTransactionTitleTemplate.WITHDRAW_FROM_CLOSED_POSITION:
    case RecentTransactionTitleTemplate.CLOSE_MARGIN_POSITION:
      return (
        <NotificationSubtitleText>{`${title.symbol} (ID: ${title.positionId})`}</NotificationSubtitleText>
      );
  }
}

function NotificationTitle({
  title,
  status,
}: {
  title: IRecentTransactionTitle;
  status: NotificationTransactionStatus;
}) {
  const t = useTranslations("RecentTransactions");

  switch (title.template) {
    case RecentTransactionTitleTemplate.APPROVE:
      return (
        <div className="flex items-center gap-1">
          <NotificationTitleText>
            {status === RecentTransactionStatus.SUCCESS
              ? t("approve_success_notification", { symbol: title.symbol })
              : t("approve_revert_notification", { symbol: title.symbol })}
          </NotificationTitleText>
        </div>
      );
    case RecentTransactionTitleTemplate.DEPOSIT:
      return (
        <NotificationTitleText>
          {status === RecentTransactionStatus.SUCCESS
            ? t("deposit_success_notification", { symbol: title.symbol })
            : t("deposit_revert_notification", { symbol: title.symbol })}
        </NotificationTitleText>
      );
    case RecentTransactionTitleTemplate.WITHDRAW:
      return (
        <div className="flex items-center gap-1">
          <NotificationTitleText>
            {status === RecentTransactionStatus.SUCCESS
              ? t("withdraw_success_notification", { symbol: title.symbol })
              : t("withdraw_revert_notification", { symbol: title.symbol })}
          </NotificationTitleText>
          <Badge variant={BadgeVariant.STANDARD} standard={Standard.ERC223} />
        </div>
      );
    case RecentTransactionTitleTemplate.CONVERT:
      return (
        <div className="flex items-center gap-1">
          <NotificationTitleText>
            {status === RecentTransactionStatus.SUCCESS
              ? t("conversion_success_notification", { standard: title.standard })
              : t("conversion_revert_notification")}
          </NotificationTitleText>
        </div>
      );
    case RecentTransactionTitleTemplate.UNWRAP:
      return (
        <div className="flex items-center gap-1">
          <NotificationTitleText>
            {status === RecentTransactionStatus.SUCCESS
              ? "Successfully unwrapped"
              : "Unwrapping WETH9 failed"}
          </NotificationTitleText>
        </div>
      );
    case RecentTransactionTitleTemplate.SWAP:
      return (
        <div className="flex items-center gap-1">
          <NotificationTitleText>
            {status === RecentTransactionStatus.SUCCESS
              ? t("swap_success_notification")
              : t("swap_revert_notification")}
          </NotificationTitleText>
        </div>
      );
    case RecentTransactionTitleTemplate.MARGIN_SWAP:
      return (
        <div className="flex items-center gap-1">
          <NotificationTitleText>
            {status === RecentTransactionStatus.SUCCESS
              ? "Margin swap successful"
              : "Failed to margin swap"}
          </NotificationTitleText>
        </div>
      );
    case RecentTransactionTitleTemplate.COLLECT:
      return (
        <NotificationTitleText>
          {status === RecentTransactionStatus.SUCCESS
            ? t("collect_success_notification")
            : t("collect_revert_notification")}
        </NotificationTitleText>
      );
    case RecentTransactionTitleTemplate.REMOVE:
      return (
        <NotificationTitleText>
          {status === RecentTransactionStatus.SUCCESS
            ? t("remove_liquidity_success_notification")
            : t("remove_liquidity_revert_notification")}
        </NotificationTitleText>
      );
    case RecentTransactionTitleTemplate.ADD:
      return (
        <NotificationTitleText>
          {status === RecentTransactionStatus.SUCCESS
            ? t("add_liquidity_success_notification")
            : t("add_liquidity_revert_notification")}
        </NotificationTitleText>
      );
    case RecentTransactionTitleTemplate.LIST_SINGLE:
      return (
        <NotificationTitleText>
          {status === RecentTransactionStatus.SUCCESS
            ? t("list_single_success_notification")
            : t("list_single_revert_notification")}
        </NotificationTitleText>
      );
    case RecentTransactionTitleTemplate.LIST_DOUBLE:
      return (
        <NotificationTitleText>
          {status === RecentTransactionStatus.SUCCESS
            ? t("list_double_success_notification")
            : t("list_double_revert_notification")}
        </NotificationTitleText>
      );
    case RecentTransactionTitleTemplate.OPEN_LENDING_ORDER:
      return (
        <NotificationTitleText>
          {status === RecentTransactionStatus.SUCCESS
            ? "Lending order opened successfully"
            : "Failed to open lending order"}
        </NotificationTitleText>
      );
    case RecentTransactionTitleTemplate.CLOSE_LENDING_ORDER:
      return (
        <NotificationTitleText>
          {status === RecentTransactionStatus.SUCCESS
            ? "Lending order closed successfully"
            : "Failed to close lending order"}
        </NotificationTitleText>
      );
    case RecentTransactionTitleTemplate.EDIT_LENDING_ORDER:
      return (
        <NotificationTitleText>
          {status === RecentTransactionStatus.SUCCESS
            ? "Lending order edited successfully"
            : "Failed to edit lending order"}
        </NotificationTitleText>
      );
    case RecentTransactionTitleTemplate.CREATE_LENDING_ORDER:
      return (
        <NotificationTitleText>
          {status === RecentTransactionStatus.SUCCESS
            ? "Lending order created successfully"
            : "Failed to create lending order"}
        </NotificationTitleText>
      );
    case RecentTransactionTitleTemplate.CREATE_MARGIN_POSITION:
      return (
        <NotificationTitleText>
          {status === RecentTransactionStatus.SUCCESS
            ? "Margin position created successfully"
            : "Failed to borrow funds"}
        </NotificationTitleText>
      );
    case RecentTransactionTitleTemplate.LIQUIDATE_MARGIN_POSITION:
      return (
        <NotificationTitleText>
          {status === RecentTransactionStatus.SUCCESS
            ? "Margin position liquidated successfully"
            : "Failed to borrow funds"}
        </NotificationTitleText>
      );
    case RecentTransactionTitleTemplate.FREEZE_MARGIN_POSITION:
      return (
        <NotificationTitleText>
          {status === RecentTransactionStatus.SUCCESS
            ? "Margin position freezed successfully"
            : "Failed to freeze position"}
        </NotificationTitleText>
      );
    case RecentTransactionTitleTemplate.WITHDRAW_FROM_CLOSED_POSITION:
      return (
        <NotificationTitleText>
          {status === RecentTransactionStatus.SUCCESS
            ? "Funds withdrawn successfully"
            : "Failed to withdraw funds"}
        </NotificationTitleText>
      );
    case RecentTransactionTitleTemplate.CLOSE_MARGIN_POSITION:
      return (
        <NotificationTitleText>
          {status === RecentTransactionStatus.SUCCESS
            ? "Margin position closed successfully"
            : "Failed to close margin position"}
        </NotificationTitleText>
      );
  }
}

export default function Notification({ onDismiss, transactionTitle, transactionStatus }: Props) {
  return (
    <div className="grid grid-cols-[1fr_48px] rounded-3 border border-secondary-border shadow-popover shadow-black/70 bg-primary-bg w-full">
      <div className="flex gap-2 md:py-5 md:pl-5 pl-4 py-3">
        {transactionStatus === RecentTransactionStatus.SUCCESS ? (
          <RecentTransactionLogo title={transactionTitle} />
        ) : (
          <div className="flex-shrink-0">
            <EmptyStateIcon size={48} iconName="warning" />
          </div>
        )}
        <div className="grid">
          <NotificationTitle title={transactionTitle} status={transactionStatus} />
          <NotificationSubTitle title={transactionTitle} />
        </div>
      </div>
      <IconButton
        buttonSize={IconButtonSize.LARGE}
        variant={IconButtonVariant.CLOSE}
        handleClose={onDismiss}
      />
    </div>
  );
}
