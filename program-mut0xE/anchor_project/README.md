# Username Wallet Solana Program

This repository contains the Solana program (smart contract) for the Username Wallet dApp, built using the Anchor framework. The program enables a decentralized wallet system where users can register human-readable usernames and send/receive SOL tokens through these usernames instead of complex public keys. Each user's wallet funds are managed within a Program Derived Address (PDA) specific to their username.

## Project Overview

The Username Wallet dApp showcases core Solana program development concepts such as Program Derived Addresses (PDAs), custom account creation, fund transfers, and secure on-chain state management. It aims to provide a more user-friendly experience for SOL transactions by abstracting away lengthy public keys with simple usernames.

## Program ID

The deployed program ID for the Username Wallet is:
`BWEK6JuhkArseF8WhofrDSxK7wr9oDmRDvmbvALxsGML`

## Program Architecture

The program employs a robust architecture centered around a single main account type and three core instructions, all managed securely via Anchor.

### PDA Usage

Program Derived Addresses (PDAs) are crucial to this dApp, enabling deterministic and unique wallet vaults for each registered username.

-   **Username Vault PDA:**
    -   Derived from the seeds: `["username_wallet", username_bytes]`
    -   Each PDA represents a unique, on-chain account for a specific username.
    -   This PDA directly holds the SOL funds associated with the username.
    -   The deterministic nature ensures that the same username always resolves to the same PDA.
    -   Withdrawals from a username vault can only be authorized by the original wallet that registered that username.
    -   This mechanism prevents username conflicts and ensures secure, isolated fund management for each user.

### Program Instructions

The Solana program implements the following instructions:

1.  **`register_username`**
    -   **Purpose:** Allows a user to create a new `UserNameWallet` account (a PDA) for a chosen username.
    -   **Inputs:** `username: String` (3-50 alphanumeric characters or hyphens).
    -   **Accounts:**
        -   `user`: The `Signer` and `Payer` who is registering the username.
        -   `username_vault`: The `UserNameWallet` PDA account to be initialized.
        -   `system_program`: The Solana `System Program` for account creation.
    -   **Validations:** Enforces username length constraints (3-50 characters) and valid character format (alphanumeric or hyphen).
    -   **Emits:** `UsernameRegistered` event upon successful creation.

2.  **`send_sol`**
    -   **Purpose:** Facilitates the transfer of a specified amount of SOL from the `sender`'s wallet to an existing `UserNameWallet` PDA associated with a target `username`.
    -   **Inputs:** `username: String` (recipient's username), `amount: u64` (amount of SOL to send).
    -   **Accounts:**
        -   `sender`: The `Signer` initiating the SOL transfer.
        -   `user_wallet`: The mutable `UserNameWallet` PDA account of the recipient.
        -   `system_program`: The Solana `System Program` for initiating the transfer.
    -   **Validations:** Ensures `amount` is greater than 0.
    -   **Emits:** `SolSent` event upon successful transfer.

3.  **`withdraw_sol`**
    -   **Purpose:** Enables the owner of a `UserNameWallet` PDA to withdraw a specified amount of SOL from their vault back to their connected wallet.
    -   **Inputs:** `username: String` (the owner's username), `amount: u64` (amount of SOL to withdraw).
    -   **Accounts:**
        -   `signer`: The `Signer` who is the owner of the `user_wallet` and the recipient of the withdrawn SOL.
        -   `user_wallet`: The mutable `UserNameWallet` PDA account from which SOL is withdrawn.
        -   `system_program`: The Solana `System Program`.
    -   **Validations:** Checks that `amount` is greater than 0, the `signer` is indeed the `owner` of the `user_wallet`, and there is `sufficient balance` in the vault.
    -   **Emits:** `SolWithdrawn` event upon successful withdrawal.

### Account Structure

The primary account used in this program is `UserNameWallet`, which stores the state for each registered username vault:

```
pub struct UserNameWallet {
    pub owner: Pubkey,        // The public key of the wallet that owns this username vault.
    #[max_len(MAX_LENGTH)]
    pub username: String,     // The human-readable username associated with this vault (max 50 characters).
    pub balance: u64,         // The current SOL balance held in this vault (in lamports).
    pub created_at: i64,      // Unix timestamp of when the username vault was created.
    pub bump: u8,             // The bump seed used to derive this PDA.
}
```

## Building the Program

To build the Solana program, navigate to the `anchor_project/username-wallet` directory and use the

Anchor CLI:

```bash
cd username-wallet
anchor build
```

This will compile the Rust program and generate the IDL (Interface Definition Language) file, which is essential for frontend interactions.

## Testing

The program includes a comprehensive suite of tests to ensure its functionality and robustness.

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

To execute the tests, use the Anchor CLI:

```bash
cd username-wallet
anchor test
```

## Deployment

To deploy the program to a Solana cluster (e.g., Devnet, Testnet, or Mainnet-beta):

```bash
cd username-wallet
anchor deploy
```

Make sure your `Anchor.toml` is configured with the correct cluster and wallet.

## Error Handling

The program defines a custom error enum (`UsernameError`) to provide descriptive error messages for various failure scenarios, such as:

-   `UsernameTooShort`: Username provided is less than 3 characters.
-   `UsernameTooLong`: Username provided is more than 50 characters.
-   `InvalidFormat`: Username contains invalid characters.
-   `InvalidAmount`: Transfer or withdrawal amount is zero or negative.
-   `Unauthorized`: The signer is not the owner of the username vault.
-   `InsufficientBalance`: The username vault does not have enough SOL for the withdrawal.
-   `BalanceUnderflow` / `BalanceOverflow`: Arithmetic errors during balance updates.
