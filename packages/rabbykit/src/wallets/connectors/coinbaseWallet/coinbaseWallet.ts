import { Chain } from "@wagmi/core";
import { CoinbaseWalletConnector } from "@wagmi/core/connectors/coinbaseWallet";

import { WalletResult } from "../../type";
import { isIOS } from "../../../helpers/browser";

export interface CoinbaseWalletOptions {
  appName: string;
  chains: Chain[];
}

export const coinbaseWallet = ({
  appName,
  chains,
  ...options
}: CoinbaseWalletOptions): WalletResult => {
  const isCoinbaseWalletInjected =
    typeof window !== "undefined" && window.ethereum?.isCoinbaseWallet === true;

  return {
    id: "coinbase",
    name: "Coinbase Wallet",
    shortName: "Coinbase",
    logos: {
      default: "",
    },

    installed: isCoinbaseWalletInjected || undefined,
    downloadUrls: {
      android: "https://play.google.com/store/apps/details?id=org.toshi",
      ios: "https://apps.apple.com/us/app/coinbase-wallet-store-crypto/id1278383455",
      mobile: "https://coinbase.com/wallet/downloads",
      qrCode: "https://coinbase-wallet.onelink.me/q5Sx/fdb9b250",
      chrome:
        "https://chrome.google.com/webstore/detail/coinbase-wallet-extension/hnfanknocfeofbddgcijnmhnfnkdnaad",
      browserExtension: "https://coinbase.com/wallet",
    },
    createConnector: () => {
      const ios = isIOS();

      const connector = new CoinbaseWalletConnector({
        chains,
        options: {
          appName,
          // headlessMode: true,
          ...options,
        },
      });

      const getUri = async () => (await connector.getProvider()).qrUrl;

      return {
        connector,
        getUri,
      };
    },
  };
};