# Username Wallet Frontend

This repository contains the frontend application for the Username Wallet Solana dApp. This application provides a user-friendly interface to interact with the on-chain Solana program, allowing users to register usernames, send SOL to username-based vaults, withdraw SOL from their own vaults, and view vault information.

## Features

The frontend application facilitates the following interactions with the Username Wallet Solana program:

*   **Wallet Connection:** Securely connect to Solana wallets (e.g., Phantom, Solflare).
*   **Register Username:** Create a unique, human-readable username and associate it with a Solana vault (Program Derived Address).
*   **Send SOL:** Transfer SOL to other users' username vaults by simply providing their username and the amount.
*   **Withdraw SOL:** Allow the owner of a username vault to withdraw SOL from their vault back to their connected wallet.
*   **View Vault Info:** Search and display details of any username vault, including its address, current balance, owner, and creation timestamp.

## Technologies Used

This frontend is built using modern web technologies to provide a robust and responsive user experience:

*   **Next.js:** A React framework for building fast, scalable applications.
*   **React:** A JavaScript library for building user interfaces.
*   **TypeScript:** A typed superset of JavaScript that compiles to plain JavaScript.
*   **Tailwind CSS:** A utility-first CSS framework for rapidly styling components.
*   **Shadcn/ui:** A collection of reusable components built with Radix UI and Tailwind CSS.
*   **Solana Web3.js:** A JavaScript library for interacting with the Solana blockchain.
*   **Wallet-Adapter:** Solana's wallet adapter standard for connecting to various wallets.
*   **Anchor (Client-side):** For interacting with the Anchor-based Solana program.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js
*   npm or Yarn (npm is used in examples)
*   A Solana wallet extension (e.g., Phantom, Solflare) installed in your browser.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/mut0xE/username-wallet.git
    cd username-wallet/frontend/username_wallet_fe
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

### Running the Application

1.  **Start the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
2.  Open your browser and navigate to `http://localhost:3000`.

The application will automatically reload if you make changes to the source code.

## Interacting with the dApp

Once the application is running:

1.  **Connect Your Wallet:** Click the "Connect Wallet" button (usually in the header) and select your preferred Solana wallet.
2.  **Register a Username:** Navigate to the registration section, enter a unique username (3-50 alphanumeric characters or hyphens), and confirm the transaction.
3.  **Send SOL:** Go to the "Send SOL" section. Enter the recipient's registered username and the amount of SOL to send. Confirm the transaction.
4.  **Withdraw SOL:** Visit the "Withdraw SOL" section. Enter your username and the amount you wish to withdraw. Confirm the transaction to receive SOL back into your connected wallet.
5.  **View Vault Info:** Use the search functionality to enter any username. The dApp will display the associated vault's public key, current SOL balance, owner, and creation timestamp.
