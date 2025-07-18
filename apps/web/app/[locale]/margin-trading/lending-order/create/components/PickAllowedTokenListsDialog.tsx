import ExternalTextLink from "@repo/ui/external-text-link";

import { useAllowedTokenListsDialogOpenedStore } from "@/app/[locale]/margin-trading/stores/dialogStates";
import { AutoListing } from "@/app/[locale]/token-listing/add/hooks/useAutoListing";
import useAutoListingContracts from "@/app/[locale]/token-listing/add/hooks/useAutoListingContracts";
import Dialog from "@/components/atoms/Dialog";
import DialogHeader from "@/components/atoms/DialogHeader";
import getExplorerLink, { ExplorerLinkType } from "@/functions/getExplorerLink";
import truncateMiddle from "@/functions/truncateMiddle";
import useCurrentChainId from "@/hooks/useCurrentChainId";

export default function PickAllowedTokenListsDialog({
  setAutoListing,
}: {
  setAutoListing: (autoListing: AutoListing) => void;
}) {
  const { isOpen, setIsOpen } = useAllowedTokenListsDialogOpenedStore();
  const autolistings = useAutoListingContracts();
  const chainId = useCurrentChainId();

  return (
    <Dialog isOpen={isOpen} setIsOpen={setIsOpen}>
      <DialogHeader onClose={() => setIsOpen(false)} title="Tokens allowed for trading" />

      {!!autolistings && autolistings?.length > 0 && (
        <div className="card-spacing-x">
          {autolistings.map((autolisting) => {
            return (
              <div
                key={autolisting.id}
                className="flex justify-between items-center min-h-[60px]"
                role="button"
                onClick={() => {
                  setAutoListing(autolisting);
                  setIsOpen(false);
                }}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{autolisting.name}</span>
                  <span className="text-12 text-secondary-text">
                    {autolisting.totalTokens} tokens
                  </span>
                </div>

                <span className="flex items-center gap-2">
                  Description:
                  <ExternalTextLink
                    text={truncateMiddle(autolisting.id, { charsFromStart: 6, charsFromEnd: 6 })}
                    href={getExplorerLink(ExplorerLinkType.ADDRESS, autolisting.id, chainId)}
                  />
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Dialog>
  );
}
