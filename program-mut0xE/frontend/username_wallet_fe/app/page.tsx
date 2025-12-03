"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { getUsernameWalletPDA, getProgram } from "@/lib/program";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  Wallet,
  RefreshCw,
  UserPlus,
  Send,
  ArrowDownToLine,
} from "lucide-react";
import WalletConnection from "@/components/wallet-connection";
import RegisterUsername from "@/components/register-username";
import SendSol from "@/components/send-sol";
import WithdrawSol from "@/components/withdraw-sol";

type ViewType = "register" | "send" | "withdraw";

interface VaultData {
  username: string;
  vaultAddress: string;
  balance: number;
}

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>("register");

  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const wallet = useWallet();

  const [vaults, setVaults] = useState<VaultData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchUserVault = async () => {
    if (!connected || !publicKey) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const program = getProgram(connection, wallet);

      const accounts = await program.account.userNameWallet.all([
        {
          memcmp: {
            offset: 8,
            bytes: publicKey.toBase58(),
          },
        },
      ]);

      if (accounts.length === 0) {
        setError("No username registered. Please register a username first.");
        setVaults([]);
        return;
      }

      const vaultDataArray: VaultData[] = [];

      for (const userAccount of accounts) {
        const accountData = userAccount.account as any;
        const fetchedUsername = accountData.username;

        const [vaultPDA] = await getUsernameWalletPDA(fetchedUsername);
        const vaultBalance = Number(accountData.balance) / LAMPORTS_PER_SOL;

        vaultDataArray.push({
          username: fetchedUsername,
          vaultAddress: vaultPDA.toBase58(),
          balance: vaultBalance,
        });
      }

      setVaults(vaultDataArray);
    } catch (err: any) {
      setError(err.message || "Failed to fetch vault information");
      console.error("Error fetching vault:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connected && publicKey) {
      fetchUserVault();
      setIsConnected(true);
    } else {
      setVaults([]);
      setError("");
      setIsConnected(false);
    }
  }, [connected, publicKey]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Solana Wallet
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your username wallet & SOL transactions
              </p>
            </div>

            <div className="text-sm text-muted-foreground">
              Status:{" "}
              <span
                className={
                  isConnected
                    ? "text-accent font-semibold"
                    : "text-destructive font-semibold"
                }
              >
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Wallet Connect */}
        <div className="mb-10">
          <WalletConnection onConnected={setIsConnected} />
        </div>

        {isConnected && (
          <div className="mb-12">
            <Card className="p-8 border-2 bg-card shadow-lg">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-primary">
                      <Wallet className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">
                        Your Vault{vaults.length > 1 ? "s" : ""}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {vaults.length > 0
                          ? `${vaults.length} vault${vaults.length > 1 ? "s" : ""} found`
                          : "Automatically loaded from blockchain"}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={fetchUserVault}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                    />
                    Refresh
                  </Button>
                </div>

                {loading && (
                  <div className="p-4 rounded-lg bg-muted/30 border border-border">
                    <p className="text-sm text-muted-foreground">
                      Loading vault information...
                    </p>
                  </div>
                )}

                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                {!loading && !error && vaults.length > 0 && (
                  <div className="space-y-6">
                    {vaults.map((vault, index) => (
                      <div key={vault.vaultAddress} className="space-y-2">
                        {vaults.length > 1 && (
                          <h4 className="text-sm font-semibold text-muted-foreground">
                            Vault {index + 1}
                          </h4>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="p-5 rounded-xl bg-card border-2 border-border hover:border-primary transition-colors">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                              Username
                            </p>
                            <p className="text-2xl font-bold text-foreground">
                              @{vault.username}
                            </p>
                          </div>

                          <div className="p-5 rounded-xl bg-card border-2 border-border hover:border-accent transition-colors">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                              Vault Address (PDA)
                            </p>
                            <p className="text-xs font-mono text-accent break-all">
                              {vault.vaultAddress.slice(0, 24)}...
                            </p>
                          </div>

                          <div className="p-5 rounded-xl bg-muted border-2 border-border hover:border-primary transition-colors">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                              Balance
                            </p>
                            <p className="text-3xl font-bold text-foreground">
                              {vault.balance.toFixed(4)} SOL
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {isConnected ? (
          <div className="space-y-8">
            <div className="flex gap-4 justify-center mb-8">
              <Button
                onClick={() => setCurrentView("register")}
                variant={currentView === "register" ? "default" : "outline"}
                className="gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Register
              </Button>
              <Button
                onClick={() => setCurrentView("send")}
                variant={currentView === "send" ? "default" : "outline"}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                Send SOL
              </Button>
              <Button
                onClick={() => setCurrentView("withdraw")}
                variant={currentView === "withdraw" ? "default" : "outline"}
                className="gap-2"
              >
                <ArrowDownToLine className="w-4 h-4" />
                Withdraw
              </Button>
            </div>

            {currentView === "register" && (
              <div className="group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-muted group-hover:bg-secondary transition-colors">
                    <UserPlus className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      Register Username
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Create your unique Solana username
                    </p>
                  </div>
                </div>
                <Card className="border-2 transition-colors shadow-md">
                  <RegisterUsername />
                </Card>
              </div>
            )}

            {currentView === "send" && (
              <div className="group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-muted group-hover:bg-secondary transition-colors">
                    <Send className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      Send SOL
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Transfer SOL to any username
                    </p>
                  </div>
                </div>
                <Card className="border-2 transition-colors shadow-md">
                  <SendSol />
                </Card>
              </div>
            )}

            {currentView === "withdraw" && (
              <div className="group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-muted group-hover:bg-secondary transition-colors">
                    <ArrowDownToLine className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      Withdraw SOL
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Withdraw funds from your vault
                    </p>
                  </div>
                </div>
                <Card className="border-2 transition-colors shadow-md">
                  <WithdrawSol />
                </Card>
              </div>
            )}
          </div>
        ) : (
          <Card className="p-12 text-center border-2 border-dashed border-border hover:border-primary transition-colors">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                <Wallet className="w-8 h-8 text-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Connect Your Wallet
              </h3>
              <p className="text-muted-foreground">
                Connect your wallet above to access all features and manage your
                SOL
              </p>
            </div>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-sm text-muted-foreground text-center"></p>
        </div>
      </footer>
    </div>
  );
}
