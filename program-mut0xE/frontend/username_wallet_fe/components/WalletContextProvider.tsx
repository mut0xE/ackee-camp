"use client";

/**
 * WALLET PROVIDER COMPONENT - The Core Solana Setup
 *
 * This component is a "wrapper" that provides Solana wallet functionality to your entire app.
 * Think of it as the foundation that allows all other components to connect to wallets.
 *
 * What it does:
 * 1. Sets up the Solana network connection (devnet = test network, mainnet = real money)
 * 2. Configures which wallets users can connect with (Phantom, etc.)
 * 3. Provides the connection context to all child components
 *
 * Key Concepts for Beginners:
 * - WalletAdapterNetwork.Devnet = Test network (fake SOL, safe to experiment)
 * - clusterApiUrl = Official Solana RPC endpoint URL
 * - useMemo = React optimization to avoid recreating objects on every render
 */

import { ReactNode, useMemo } from "react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";

// Import Solana wallet styles
import "@solana/wallet-adapter-react-ui/styles.css";

interface SolanaWalletProviderProps {
  children: ReactNode;
}

export default function SolanaWalletProvider({
  children,
}: SolanaWalletProviderProps) {
  // Choose which Solana network to connect to
  // Devnet = test network (use this for development)
  // Mainnet-beta = real network (use for production)
  const network = WalletAdapterNetwork.Devnet;

  // Get the RPC endpoint URL for the selected network
  // This is the server that your app talks to for blockchain data
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Configure which wallet adapters to support
  // Each adapter connects to a different wallet (Phantom, Solflare, etc.)
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(), // Phantom is the most popular Solana wallet
      // You can add more wallets here, like:
      // new SolflareWalletAdapter(),
      // new TorusWalletAdapter(),
    ],
    [],
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
