import { createStore } from "zustand/vanilla";
import { subscribeWithSelector } from "zustand/middleware";

import {
  PublicClient,
  WebSocketPublicClient,
  Config,
  getAccount,
  getNetwork,
} from "@wagmi/core";
import { WalletResult } from "../wallets/type";
import { SUPPORT_LANGUAGES } from "../helpers";
import zustandToSvelte from "../helpers/zustandToSvelte";
import { Theme } from "../type";
import { WalletConnectConnector } from "@wagmi/core/connectors/walletConnect";

type Tab = "browser" | "mobile";
type Page = "wallet" | "connect" | "download";
interface Store<
  TPublicClient extends PublicClient = PublicClient,
  TWebSocketPublicClient extends WebSocketPublicClient = WebSocketPublicClient
> {
  theme?: Theme;
  setTheme: (theme: Theme) => void;
  status: "connecting" | "reconnecting" | "connected" | "disconnected";
  open: boolean;
  openModal: (force?: boolean) => void;
  closeModal: () => void;

  language: SUPPORT_LANGUAGES;
  page: Page;
  activeTab: Tab;
  setTab: (activeTab: Tab) => void;

  currentWallet?: WalletResult;
  type?: Tab;

  wagmi?: Config<TPublicClient, TWebSocketPublicClient>;
  isConnected?: boolean;
  address?: string;
  chainId?: number;
  wallets?: WalletResult[];

  uri?: string;
  walletConnectConnector?: WalletConnectConnector;
}

export const useRKStore = createStore<Store<any, any>>()(
  subscribeWithSelector((set, get) => ({
    theme: "light",
    status: "disconnected",
    language: "en",
    page: "wallet",
    activeTab: "browser",
    open: false,
    openModal: (force = false) => {
      if (force || get().status !== "connected") {
        set({ open: true });
      }
    },
    closeModal: () => {
      set({ open: false });
    },
    setTab: (activeTab: Tab) => {
      set({ activeTab });
    },
    setTheme: (theme) => {
      set({ theme });
    },
  }))
);

export const modalOpenSubscribe = (fn: (open: boolean) => void) => {
  const unsubscribe = useRKStore.subscribe((s) => s.open, fn);
  return unsubscribe;
};

export function syncAccount() {
  const accountInfo = getAccount();
  const { address, isConnected, isDisconnected, status } = accountInfo;
  const { chain } = getNetwork();
  console.log("status", status);

  if (isConnected && address && chain) {
    useRKStore.setState({ isConnected, address, chainId: chain.id });
  } else if (!isConnected) {
    useRKStore.setState({ isConnected, address: undefined });
  }

  if (isDisconnected) {
    useRKStore.setState({ uri: undefined });
  }
  useRKStore.setState({ status: status });
}

export default zustandToSvelte(useRKStore);
