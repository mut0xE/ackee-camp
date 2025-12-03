"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle2, ExternalLink, Loader2 } from "lucide-react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  getProgram,
  getUsernameWalletPDA,
  getExplorerUrl,
} from "@/lib/program";
import { SystemProgram } from "@solana/web3.js";

export default function RegisterUsername() {
  const [username, setUsername] = useState("");
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

    // Validate username length
    if (username.length < 3) {
      setStatus({
        type: "error",
        message: "Username must be at least 3 characters",
        explorerLink: undefined,
      });
      return;
    }
    if (username.length > 50) {
      setStatus({
        type: "error",
        message: "Username must be less than 50 characters",
        explorerLink: undefined,
      });
      return;
    }
    // Check valid format - only alphanumeric and hyphens
    if (!/^[a-zA-Z0-9-]+$/.test(username)) {
      setStatus({
        type: "error",
        message: "Username can only contain letters, numbers, and hyphens",
        explorerLink: undefined,
      });
      return;
    }
    if (!wallet.connected || !wallet.publicKey) {
      setStatus({
        type: "error",
        message: "Please connect your wallet first",
        explorerLink: undefined,
      });
      return;
    }
    const program = getProgram(connection, wallet);
    const usernamePda = getUsernameWalletPDA(username);
    setIsLoading(true);
    try {
      // Call the register_username instruction on your smart contract
      const tx = await program.methods
        .registerUsername(username)
        .accounts({
          user: wallet.publicKey,
          usernameVault: usernamePda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Registration transaction signature:", tx);
      const link = getExplorerUrl(tx);
      setStatus({
        type: "success",
        message: `Username "${username}" registered successfully!`,
        explorerLink: link,
      });
      setUsername("");
    } catch (error: any) {
      console.error("Registration error:", error);

      // Parse error message from Anchor
      let errorMessage = "Failed to register username.";
      if (error.code === 6000 || error.message?.includes("UsernameTooShort")) {
        errorMessage = "Username too short (min 3 characters)";
      } else if (
        error.code === 6001 ||
        error.message?.includes("UsernameTooLong")
      ) {
        errorMessage = "Username too long (max 50 characters)";
      } else if (
        error.code === 6002 ||
        error.message?.includes("InvalidFormat")
      ) {
        errorMessage =
          "Username can only contain letters, numbers, and hyphens";
      } else if (error.message?.includes("already in use")) {
        errorMessage = "Username already taken";
      } else if (error.message?.includes("Signature verification failed")) {
        errorMessage = "Transaction signing failed. Please try again.";
      } else if (error.message?.includes("Insufficient funds")) {
        errorMessage = "Insufficient SOL balance to pay transaction fees";
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
      <h3 className="text-xl font-semibold mb-4">Register a Username</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-2">
            Choose a Username
          </label>
          <Input
            id="username"
            type="text"
            placeholder="Enter your username (3-50 characters)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            className="text-base"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {username.length}/50 characters
          </p>
        </div>

        <Button
          type="submit"
          disabled={isLoading || !username || !wallet.connected}
          className="w-50 bg-primary hover:bg-primary/90"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Registering on blockchain...
            </>
          ) : (
            "Register Username"
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
        </div>
      )}
    </div>
  );
}
