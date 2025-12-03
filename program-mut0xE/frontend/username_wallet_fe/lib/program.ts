/**
 * PROGRAM UTILITY
 *
 * This file sets up the connection to your Solana smart contract (program).
 * Think of it as the "bridge" between your frontend and the blockchain.
 *
 * Key concepts:
 * - Program: Your smart contract on Solana
 * - Provider: Connects your wallet to the Solana network
 * - IDL: The "instruction manual" for your smart contract
 */
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { IDL } from "./idl";
// The address where your smart contract is deployed on Solana
export const PROGRAM_ID = new PublicKey(
  "BWEK6JuhkArseF8WhofrDSxK7wr9oDmRDvmbvALxsGML",
);
/**
 * Creates a program instance to interact with your smart contract
 * @param connection - Connection to Solana network
 * @param wallet - The user's connected wallet
 * @returns Program instance
 */
export function getProgram(connection: Connection, wallet: any) {
  // Create a provider (combines connection + wallet)
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  // Create and return the program instance using the IDL
  return new Program(IDL as any, provider);
}
/**
 * Derives the PDA (Program Derived Address) for a username wallet
 * PDA is like a "smart" address that your program controls
 * @param username - The username to get the wallet for
 * @returns The wallet's public key and bump seed
 */
export async function getUsernameWalletPDA(
  username: string,
): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("username_wallet"), Buffer.from(username)],
    PROGRAM_ID,
  );
}
export const getExplorerUrl = (
  txSignature: string,
  cluster: string = "devnet",
) => {
  return `https://explorer.solana.com/tx/${txSignature}?cluster=${cluster}`;
};
