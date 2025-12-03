"use client";

/**
 * WALLET CONNECTION COMPONENT - Now Using Real Solana Wallets!
 *
 * This component uses the @solana/wallet-adapter-react library to connect
 * to real Solana wallets like Phantom, Solflare, etc.
 *
 * Key Hooks from the Library:
 * - useWallet(): Provides wallet connection state and methods
 *   - wallet: The currently selected wallet adapter
 *   - publicKey: The user's wallet address (null if not connected)
 *   - connected: Boolean - is the wallet connected?
 *   - connecting: Boolean - is connection in progress?
 *   - disconnect(): Function to disconnect the wallet
 *
 * - WalletMultiButton: Pre-built button component that handles:
 *   - Wallet selection (if multiple wallets installed)
 *   - Connection flow
 *   - Display of wallet address when connected
 */

import { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Card } from "@/components/ui/card";
import { Wallet } from "lucide-react";

interface WalletConnectionProps {
  onConnected: (connected: boolean) => void;
}

export default function WalletConnection({
  onConnected,
}: WalletConnectionProps) {
  // Get wallet state from the Solana wallet adapter
  const { publicKey, connected } = useWallet();

  // Update parent component whenever connection state changes
  useEffect(() => {
    onConnected(connected);
  }, [connected, onConnected]);

  // Format wallet address for display (show first and last few characters)
  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <Card className="p-6 border-2 border-primary/30">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Wallet className="w-6 h-6 text-accent flex-shrink-0" />
          <div className="min-w-0">
            <h3 className="text-lg font-semibold">Wallet Connection</h3>
            <p className="text-sm text-muted-foreground truncate">
              {connected && publicKey
                ? `Connected: ${formatAddress(publicKey.toBase58())}`
                : "No wallet connected"}
            </p>
          </div>
        </div>
        <WalletMultiButton className="!bg-accent hover:!bg-accent/90 !h-10 !px-4 !rounded-lg !font-semibold !transition-colors" />
      </div>

      {!connected && (
        <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">
            <strong>Need a wallet?</strong> Install{" "}
            <a
              href="https://phantom.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Phantom
            </a>{" "}
            browser extension to get started.
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Need Faucet?</strong>{" "}
            <a
              href="https://faucet.solana.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Get Faucet
            </a>{" "}
          </p>
        </div>
      )}
    </Card>
  );
}
