# Project Description
Username Wallet - Solana dApp
A decentralized wallet system built on Solana that allows users to register usernames and send/receive SOL tokens through human-readable addresses instead of complex public keys. Each user has their own wallet vault derived from their username.

**Deployed Frontend URL:** https://solana-username-wallet-o73c.vercel.app/

**Solana Program ID:** BWEK6JuhkArseF8WhofrDSxK7wr9oDmRDvmbvALxsGML

## Project Overview

### Description
This dApp demonstrates Solana program development concepts including Program Derived Addresses (PDAs), account creation, fund transfers, and on-chain state management. Users interact with a username-based wallet system where each wallet maintains an account identified by a human-readable username instead of complex wallet addresses.

### Key Features

- Register Username - Create a unique username for your wallet vault. Usernames must be between 3 and 50 characters, and can only contain alphanumeric characters or hyphens.
- Send SOL - Transfer SOL to any username vault on the network.
- Withdraw SOL - Withdraw your SOL from your own username vault back to your connected wallet. Only the owner of the username vault can withdraw.
- View Vault Info - Display vault address, balance, owner, and creation timestamp. (This feature would typically be part of the frontend, interacting with the on-chain data).

### How to Use the dApp
[TODO: Provide step-by-step instructions for users to interact with your dApp]

1.  **Connect Wallet**
2.  **Register Username:**
    *   Connect your Solana wallet to the dApp.
    *   Enter a desired unique username (3-50 alphanumeric characters or hyphens).
    *   Confirm the transaction to create your username vault.
3.  **Send SOL:**
    *   Enter the username of the recipient's vault.
    *   Specify the amount of SOL you wish to send.
    *   Confirm the transaction to transfer SOL from your wallet to the recipient's username vault.
4.  **Withdraw SOL:**
    *   Enter your registered username.
    *   Specify the amount of SOL you wish to withdraw from your vault.
    *   Confirm the transaction to transfer SOL from your username vault back to your connected wallet.

## Program Architecture
The Username Wallet dApp uses a sophisticated architecture with one main account type and three core instructions. The program leverages PDAs to create deterministic, unique wallet vaults for each username, enabling users to send and receive funds using usernames instead of complex public keys.

### PDA Usage
The program uses Program Derived Addresses to create deterministic wallet vaults for each username. PDAs are derived using a combination of the program ID, predefined seeds, and a bump value, making them reproducible without on-chain storage.

**PDAs Used:**
- PDA 1: Username Vault PDA: Derived from seeds ["username_wallet", username_bytes]
Creates a unique PDA for each registered username.
This PDA becomes the actual SOL-holding account that receives and stores funds.
Deterministic generation means the same username will always derive to the same address.
Only the original owner (the wallet that created the username) can authorize withdrawals.
Prevents username conflicts and ensures data isolation between different users.

### Program Instructions

**Instructions Implemented:**
- **register_username**: Allows a user to create a unique `UserNameWallet` account (a PDA) associated with a chosen username. It takes a `String` `username` as input and initializes the vault with the `user` as the owner, 0 balance, and the current timestamp.
- **send_sol**: Enables a `sender` to transfer a specified `amount` of SOL to an existing `UserNameWallet` associated with a given `username`. It updates the `balance` of the recipient's `username_vault`.
- **withdraw_sol**: Allows the `owner` of a `UserNameWallet` to withdraw a specified `amount` of SOL from their vault back to their connected wallet. It checks for authorization (only the owner can withdraw) and sufficient balance before transferring.

### Account Structure

```
#[account]
#[derive(Debug, InitSpace)]
pub struct UserNameWallet {
    pub owner: Pubkey,
    #[max_len(MAX_LENGTH)]
    pub username: String,
    pub balance: u64,
    pub created_at: i64,
    pub bump: u8,
}
```
The `UserNameWallet` account stores the following information for each username vault:
- `owner`: The `Pubkey` of the wallet that registered and owns this username vault.
- `username`: A unique `String` representing the human-readable username associated with this vault (maximum length 50 characters).
- `balance`: A `u64` representing the current SOL balance held within this vault.
- `created_at`: An `i64` timestamp indicating when the username vault was created.
- `bump`: A `u8` value used in the PDA derivation to ensure uniqueness.

## Testing

### Test Coverage
**Happy Path Tests:**
- Test 1: Register Username - Successfully creates a new vault with correct owner, zero balance, and timestamp.
- Test 2: Send SOL to Username - Properly transfers SOL from sender wallet to recipient vault and updates recipient balance correctly.
- Test 3: Withdraw SOL (Owner Only) - Correctly transfers SOL from vault back to owner wallet, updates PDA and struct balance, and updates lamports.

**Unhappy Path Tests:**
- Test 1: Reject Invalid Format - Fails when registering username with special characters (e.g., "@alice123").
- Test 2: Username Too Short - Rejects usernames with less than 3 characters.
- Test 3: Username Already Exists - Fails when attempting to register a username that is already taken.
- Test 4: Send Zero SOL - Fails when attempting to send 0 SOL amount.
- Test 5: Send to Non-existent Username - Fails when sending SOL to a username that hasn't been registered.
- Test 6: Insufficient Sender Balance - Fails when sender doesn't have enough SOL to send.
- Test 7: Unauthorized Withdraw - Fails when a non-owner wallet attempts to withdraw from someone else's vault.
- Test 8: Withdraw More Than Balance - Fails when attempting to withdraw more SOL than the vault contains.
- Test 9: Withdraw From Empty Wallet - Fails when attempting to withdraw from a vault with zero balance.

### Running Tests
```bash
anchor build
# Commands to run your tests
yarn install
anchor test
```

## Tech Stack

- Solana • Anchor Framework
- TypeScript • Next.js (Frontend)

### Additional Notes for Evaluators

This dApp provides a foundational example of a username-based wallet system on Solana, leveraging Anchor for secure and efficient program development. It demonstrates core Solana concepts such as PDAs for deterministic account addressing, instruction processing for state changes, and robust error handling. The design prioritizes security through owner-only withdrawal mechanisms and input validation for usernames and amounts. Future enhancements could include token transfers, more complex access control, or integration with other Solana programs.
