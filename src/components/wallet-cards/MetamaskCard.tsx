import { useTranslations } from "next-intl";
import { isMobile } from "react-device-detect";
import { useAccount, useConnect, useReconnect } from "wagmi";

import PickButton from "@/components/buttons/PickButton";
import {
  useConnectWalletDialogStateStore,
  useConnectWalletStore,
} from "@/components/dialogs/stores/useConnectWalletStore";
import { wallets } from "@/config/wallets";
import useDetectMetaMaskMobile from "@/hooks/useMetamaskMobile";
import usePreloaderTimeout from "@/hooks/usePreloader";
import addToast from "@/other/toast";

const { image, name } = wallets.metamask;
export default function MetamaskCard() {
  const t = useTranslations("Wallet");
  const { connectors, connectAsync, isPending } = useConnect();
  const { connector, isConnected, isConnecting } = useAccount();
  const { setName, chainToConnect } = useConnectWalletStore();
  const { setIsOpened } = useConnectWalletDialogStateStore();
  const isMetamaskMobile = useDetectMetaMaskMobile();

  const loading = usePreloaderTimeout({ isLoading: isPending });

  if (isMobile && !isMetamaskMobile) {
    return (
      <a href="https://metamask.app.link/dapp/dex-exchange-git-feature-metamask-mobile-absolute-wallet.vercel.app">
        <PickButton disabled={isConnecting} image={image} label={name} loading={loading} />
      </a>
    );
  }

  return (
    <PickButton
      disabled={isConnecting}
      onClick={() => {
        setName("metamask");
        console.log(connectors[2]);
        const connectorToConnect = connectors[2];

        console.log(connectorToConnect);
        if (!connectorToConnect) {
          return addToast(t("install_metamask"), "error");
        }

        connectAsync({
          connector: connectorToConnect,
          chainId: chainToConnect,
        })
          .then(() => {
            setIsOpened(false);
            addToast(t("successfully_connected"));
          })
          .catch((e) => {
            console.log(e);
            if (e.code && e.code === 4001) {
              addToast(t("user_rejected"), "error");
            } else {
              addToast(t("something_went_wrong"), "error");
            }
          });
      }}
      image={image}
      label={name}
      loading={loading}
    />
  );
}
