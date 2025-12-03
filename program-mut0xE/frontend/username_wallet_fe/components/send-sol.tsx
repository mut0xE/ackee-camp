"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Send,
  ExternalLink,
} from "lucide-react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  getProgram,
  getUsernameWalletPDA,
  getExplorerUrl,
} from "@/lib/program";
import { SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";

export default function SendSol() {
  const [recipientUsername, setRecipientUsername] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
    explorerLink?: string;
  }>({
    type: null,
    message: "",
  });

  const { connection } = useConnection();
  const wallet = useWallet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Frontend Validation - Check before hitting backend

    // Check recipient username
    if (!recipientUsername) {
      setStatus({
        type: "error",
        message: "Please enter a recipient username",
        explorerLink: undefined,
      });
      return;
    }

    // Validate recipient username format
    if (recipientUsername.length < 3) {
      setStatus({
        type: "error",
        message: "Username must be at least 3 characters",
        explorerLink: undefined,
      });
      return;
    }

    if (recipientUsername.length > 50) {
      setStatus({
        type: "error",
        message: "Username must be less than 50 characters",
        explorerLink: undefined,
      });
      return;
    }

    if (!/^[a-zA-Z0-9-]+$/.test(recipientUsername)) {
      setStatus({
        type: "error",
        message: "Username can only contain letters, numbers, and hyphens",
        explorerLink: undefined,
      });
      return;
    }

    // Check amount
    if (!amount) {
      setStatus({
        type: "error",
        message: "Please enter an amount",
        explorerLink: undefined,
      });
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setStatus({
        type: "error",
        message: "Please enter a valid amount greater than 0",
        explorerLink: undefined,
      });
      return;
    }

    if (amountValue > 1000000) {
      setStatus({
        type: "error",
        message: "Amount too large (max 1,000,000 SOL)",
        explorerLink: undefined,
      });
      return;
    }

    // Check wallet connection
    if (!wallet.connected || !wallet.publicKey) {
      setStatus({
        type: "error",
        message: "Please connect your wallet first",
        explorerLink: undefined,
      });
      return;
    }

    // All validations passed - proceed to blockchain
    setIsLoading(true);
    try {
      const program = getProgram(connection, wallet);

      // Convert SOL to lamports (1 SOL = 1 billion lamports)
      const amountInLamports = new anchor.BN(
        parseFloat(amount) * LAMPORTS_PER_SOL,
      );
      const usernamePda = getUsernameWalletPDA(recipientUsername);

      // Call the send_sol instruction
      const tx = await program.methods
        .sendSol(recipientUsername, amountInLamports)
        .accounts({
          sender: wallet.publicKey,
          userWallet: usernamePda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Send SOL transaction signature:", tx);
      const link = getExplorerUrl(tx);

      setStatus({
        type: "success",
        message: `Sent ${amount} SOL to @${recipientUsername}`,
        explorerLink: link,
      });
      setRecipientUsername("");
      setAmount("");
    } catch (error: any) {
      console.error("Send SOL error:", error);

      // Only handle unexpected backend errors
      let errorMessage = "Failed to send SOL. Please try again.";
      if (error.message?.includes("InvalidAmount")) {
        errorMessage = "Invalid amount specified";
      } else if (error.message?.includes("insufficient")) {
        errorMessage = "Insufficient balance";
      } else if (error.message?.includes("not found")) {
        errorMessage = "Username not found or hasn't registered yet";
      } else if (error.message?.includes("Signature verification failed")) {
        errorMessage = "Transaction signing failed. Please try again.";
      } else if (error.message?.includes("Insufficient funds")) {
        errorMessage = "Insufficient SOL balance for transaction fees";
      }

      setStatus({
        type: "error",
        message: errorMessage,
        explorerLink: undefined,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Send className="w-5 h-5 text-accent" />
        <h3 className="text-xl font-semibold">Send SOL</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="recipient" className="block text-sm font-medium mb-2">
            Recipient Username
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-muted-foreground">
              @
            </span>
            <Input
              id="recipient"
              type="text"
              placeholder="username"
              value={recipientUsername}
              onChange={(e) => setRecipientUsername(e.target.value)}
              disabled={isLoading}
              className="pl-8"
            />
          </div>
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium mb-2">
            Amount (SOL)
          </label>
          <div className="relative">
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isLoading}
              step="0.01"
              min="0"
            />
            <span className="absolute right-3 top-3 text-muted-foreground text-sm">
              SOL
            </span>
          </div>
        </div>

        <Button
          type="submit"
          disabled={
            isLoading || !recipientUsername || !amount || !wallet.connected
          }
          className="w-full bg-accent hover:bg-accent/90"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending on blockchain...
            </>
          ) : (
            "Send SOL"
          )}
        </Button>
      </form>

      {status.type && (
        <div
          className={`mt-4 p-4 rounded-lg flex items-gap-3 ${
            status.type === "success"
              ? "bg-accent/20 text-accent border border-accent/30"
              : "bg-destructive/20 text-destructive border border-destructive/30"
          }`}
        >
          <div className="flex items-center gap-3 flex-1">
            {status.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <p className="text-sm">{status.message}</p>
          </div>
          {status.type === "success" && status.explorerLink && (
            <a
              href={status.explorerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors"
            >
              View Transaction on Explorer
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
