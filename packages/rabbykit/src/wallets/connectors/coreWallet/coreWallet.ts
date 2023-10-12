import { Chain, WindowProvider } from "@wagmi/core";
import type { InjectedConnectorOptions } from "@wagmi/core/connectors/injected";
import { InjectedConnector } from "wagmi/connectors/injected";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { WalletResult } from "../../type";
import { getWalletConnectUri } from "../../../helpers/getWalletConnectUri";
import { isAndroid, isMobile } from "../../../helpers/browser";
import logo from "./logo";

declare global {
  interface Window {
    evmproviders?: Record<string, WindowProvider>;
    avalanche?: WindowProvider;
  }
}

export interface CoreWalletOptions {
  projectId: string;
  chains: Chain[];
  walletConnectOptions?: Omit<WalletConnectConnector["options"], "projectId">;
}

function getCoreWalletInjectedProvider(): WindowProvider | undefined {
  const injectedProviderExist =
    typeof window !== "undefined" && typeof window.ethereum !== "undefined";

  // No injected providers exist.
  if (!injectedProviderExist) {
    return;
  }

  // Core implements EIP-5749 and creates the window.evmproviders
  if (window["evmproviders"]?.["core"]) {
    return window["evmproviders"]?.["core"];
  }

  // Core was injected into window.avalanche.
  if (window.avalanche) {
    return window.avalanche;
  }

  // Core was injected into window.ethereum.
  if (
    typeof window !== "undefined" &&
    typeof window.ethereum !== "undefined" &&
    window.ethereum.isAvalanche === true
  ) {
    return window.ethereum;
  }
}

export const coreWallet = ({
  chains,
  projectId,
  ...options
}: CoreWalletOptions & InjectedConnectorOptions): WalletResult => {
  const isCoreInjected = Boolean(getCoreWalletInjectedProvider());

  const walletConnector = new WalletConnectConnector({
    chains,
    options: {
      projectId,
      showQrModal: false,
      ...options?.walletConnectOptions,
    },
  });
  const getUri = async () => {
    const uri = await getWalletConnectUri(walletConnector);
    return isMobile()
      ? isAndroid()
        ? uri
        : `https://metamask.app.link/wc?uri=${encodeURIComponent(uri)}`
      : uri;
  };
  return {
    id: "core",
    name: "Core",
    installed: isCoreInjected,
    logo,
    downloadUrls: {
      android: "https://play.google.com/store/apps/details?id=com.avaxwallet",
      ios: "https://apps.apple.com/us/app/core-wallet/id6443685999",
      chrome:
        "https://chrome.google.com/webstore/detail/core-crypto-wallet-nft-ex/agoakfejjabomempkjlepdflaleeobhb",
    },
    connector: {
      browser: new InjectedConnector({
        chains,
        options: {
          getProvider: getCoreWalletInjectedProvider,
          ...options,
        },
      }),
      mobile: { getUri },
      qrCode: {
        getUri,
      },
    },
  };
};
