import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { UsernameWallet } from "../target/types/username_wallet";
import { expect } from "chai";

describe("username-wallet", () => {
  // Configure the client to use the local cluster.
  let provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  let user1 = anchor.web3.Keypair.generate();
  let user2 = anchor.web3.Keypair.generate();
  const program = anchor.workspace.usernameWallet as Program<UsernameWallet>;
  before(async () => {
    user1 = anchor.web3.Keypair.generate();
    user2 = anchor.web3.Keypair.generate();

    // Airdrop SOL to test users
    const airdrop1 = await provider.connection.requestAirdrop(
      user1.publicKey,
      5 * anchor.web3.LAMPORTS_PER_SOL
    );
    const airdrop2 = await provider.connection.requestAirdrop(
      user2.publicKey,
      5 * anchor.web3.LAMPORTS_PER_SOL
    );

    // Wait for airdrop to complete
    await provider.connection.confirmTransaction(airdrop1, "confirmed");
    await provider.connection.confirmTransaction(airdrop2, "confirmed");
  });
  it("Should register a username", async () => {
    // Add your test here.
    const username = "alice-123";
    const [usernamePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("username_wallet"), Buffer.from(username)],
      program.programId
    );
    const tx = await program.methods
      .registerUsername(username)
      .accounts({
        user: user1.publicKey,
        usernameWallet: usernamePda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user1])
      .rpc();
    // console.log("Username registered:", tx);
    const wallet = await program.account.userNameWallet.fetch(usernamePda);

    // console.log("Username details:", wallet);

    expect(wallet.username).to.equal(username);
    expect(wallet.owner.toString()).to.equal(user1.publicKey.toString());
    expect(wallet.balance.toNumber()).to.equal(0);
  });
  it("Should register a username fail Because InvalidFormat", async () => {
    const username = "@alice123";
    const [usernamePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("username_wallet"), Buffer.from(username)],
      program.programId
    );
    let errorThrown = false;
    try {
      await program.methods
        .registerUsername(username)
        .accounts({
          user: user1.publicKey,
          usernameWallet: usernamePda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user1])
        .rpc({ commitment: "confirmed" });
    } catch (error) {
      errorThrown = true;
      expect(error.toString()).to.include("InvalidFormat");
    }
    expect(errorThrown).to.be.true;
  });
  it("Should fail when username already exists", async () => {
    let username = "bob";
    const [usernamePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("username_wallet"), Buffer.from(username)],
      program.programId
    );
    // First registration should succeed
    await program.methods
      .registerUsername(username)
      .accounts({
        user: user1.publicKey,
        usernameWallet: usernamePda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user1])
      .rpc();
    let errorThrown = false;
    // Second registration with same username should fail
    try {
      await program.methods
        .registerUsername(username)
        .accounts({
          user: user2.publicKey,
          usernameWallet: usernamePda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user2])
        .rpc();
    } catch (error) {
      errorThrown = true;
      expect(error.toString()).to.include("already in use");
    }
    expect(errorThrown).to.be.true;
  });
  it("Should reject username too short", async () => {
    const username = "ab";
    const [usernamePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("username_wallet"), Buffer.from(username)],
      program.programId
    );

    try {
      await program.methods
        .registerUsername(username)
        .accounts({
          user: user2.publicKey,
          usernameWallet: usernamePda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user2])
        .rpc();

      throw new Error("Should have failed");
    } catch (error) {
      expect(error.message).to.include("UsernameTooShort");
    }
  });

  it("Should Send Sol to username Successfully", async () => {
    // Add your test here.
    const username = "alice23";
    const [usernamePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("username_wallet"), Buffer.from(username)],
      program.programId
    );
    // First register the username
    const user_tx = await program.methods
      .registerUsername(username)
      .accounts({
        user: user1.publicKey,
        usernameWallet: usernamePda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user1])
      .rpc({ commitment: "confirmed" });
    const amount = new anchor.BN(5_000_000_00);
    const tx = await program.methods
      .sendSol(username, amount)
      .accounts({
        sender: user2.publicKey,
        userWallet: usernamePda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user2])
      .rpc({ commitment: "confirmed" });
    const wallet = await program.account.userNameWallet.fetch(usernamePda);

    // console.log("Username details after deposit:", wallet);

    expect(wallet.username).to.equal(username);
    expect(wallet.owner.toString()).to.equal(user1.publicKey.toString());
    expect(wallet.balance.toNumber()).to.equal(amount.toNumber());
  });
  it("Should fail when sending 0 SOL", async () => {
    const username = "bob123";
    const [usernamePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("username_wallet"), Buffer.from(username)],
      program.programId
    );

    // Register username
    await program.methods
      .registerUsername(username)
      .accounts({
        user: user1.publicKey,
        usernameWallet: usernamePda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user1])
      .rpc({ commitment: "confirmed" });

    // Try to send 0 SOL - should fail
    let errorThrown = false;
    try {
      await program.methods
        .sendSol(username, new anchor.BN(0))
        .accounts({
          sender: user2.publicKey,
          userWallet: usernamePda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user2])
        .rpc({ commitment: "confirmed" });
    } catch (error) {
      errorThrown = true;
      expect(error.toString()).to.include("InvalidAmount");
    }

    expect(errorThrown).to.be.true;
  });
  it("Should fail when sending SOL to non-existent username", async () => {
    const username = "charlie";
    const [usernamePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("username_wallet"), Buffer.from(username)],
      program.programId
    );

    // Try to send SOL without registering username first - should fail
    let errorThrown = false;
    try {
      await program.methods
        .sendSol(username, new anchor.BN(500_000_000))
        .accounts({
          sender: user1.publicKey,
          userWallet: usernamePda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user1])
        .rpc({ commitment: "confirmed" });
    } catch (error) {
      errorThrown = true;
      // console.log("Error:", error.toString());
    }

    expect(errorThrown).to.be.true;
  });
  it("Should fail when sender doesn't have enough SOL", async () => {
    const username = "charlie456";
    const [usernamePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("username_wallet"), Buffer.from(username)],
      program.programId
    );

    // Register username
    await program.methods
      .registerUsername(username)
      .accounts({
        user: user1.publicKey,
        usernameWallet: usernamePda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user1])
      .rpc({ commitment: "confirmed" });

    // Create a new user with no SOL
    const new_user = anchor.web3.Keypair.generate();

    // Try to send SOL without having enough - should fail
    let errorThrown = false;
    try {
      await program.methods
        .sendSol(username, new anchor.BN(5_000_000_000)) // 5 SOL
        .accounts({
          sender: new_user.publicKey,
          userWallet: usernamePda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([new_user])
        .rpc({ commitment: "confirmed" });
    } catch (error) {
      errorThrown = true;
      // console.log("Error:", error.toString());
    }

    expect(errorThrown).to.be.true;
  });
  it("Should withdraw SOL (owner only)", async () => {
    const username = "ven";
    const [usernamePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("username_wallet"), Buffer.from(username)],
      program.programId
    );
    //  Register username (owned by user1)
    await program.methods
      .registerUsername(username)
      .accounts({
        user: user1.publicKey,
        usernameWallet: usernamePda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user1])
      .rpc({ commitment: "confirmed" });
    const amount_sent = new anchor.BN(1_000_000_000);
    //  Send SOL from user2 → username PDA
    await program.methods
      .sendSol(username, amount_sent)
      .accounts({
        sender: user2.publicKey,
        userWallet: usernamePda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user2])
      .rpc({ commitment: "confirmed" });
    //  BALANCES BEFORE WITHDRAW
    const beforePdaLamports = await provider.connection.getBalance(usernamePda);
    const beforeUserLamports = await provider.connection.getBalance(
      user1.publicKey
    );
    // console.log(" BEFORE WITHDRAW:");
    // console.log(
    //   "PDA balance (SOL):",
    //   beforePdaLamports / anchor.web3.LAMPORTS_PER_SOL
    // );
    // console.log(
    //   "User1 balance (SOL):",
    //   beforeUserLamports / anchor.web3.LAMPORTS_PER_SOL
    // );

    const amount = new anchor.BN(0.5 * anchor.web3.LAMPORTS_PER_SOL);

    const tx = await program.methods
      .withdrawSol(username, amount)
      .accounts({
        signer: user1.publicKey,
        userWallet: usernamePda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user1])
      .rpc({ commitment: "confirmed" });

    // console.log(" SOL withdrawn:", tx);

    //   BALANCES AFTER WITHDRAW
    const afterPdaLamports = await provider.connection.getBalance(usernamePda);
    const afterUserLamports = await provider.connection.getBalance(
      user1.publicKey
    );

    // console.log(" AFTER WITHDRAW:");
    // console.log(
    //   "PDA balance (SOL):",
    //   afterPdaLamports / anchor.web3.LAMPORTS_PER_SOL
    // );
    // console.log(
    //   "User1 balance (SOL):",
    //   afterUserLamports / anchor.web3.LAMPORTS_PER_SOL
    // );

    // Check internal PDA struct balance

    const wallet = await program.account.userNameWallet.fetch(usernamePda);
    // console.log(
    //   "PDA account struct balance (lamports):",
    //   wallet.balance.toNumber() / anchor.web3.LAMPORTS_PER_SOL
    // );

    expect(afterPdaLamports).to.equal(beforePdaLamports - amount.toNumber());
    expect(afterUserLamports).to.be.greaterThan(beforeUserLamports);
  });

  it("Should reject unauthorized withdraw", async () => {
    const username = "test-unauthorized";
    const [usernamePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("username_wallet"), Buffer.from(username)],
      program.programId
    );

    // Register username (owned by user1)
    await program.methods
      .registerUsername(username)
      .accounts({
        user: user1.publicKey,
        usernameWallet: usernamePda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user1])
      .rpc({ commitment: "confirmed" });

    // Send SOL to the wallet
    await program.methods
      .sendSol(username, new anchor.BN(1_000_000_000))
      .accounts({
        sender: user2.publicKey,
        userWallet: usernamePda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user2])
      .rpc({ commitment: "confirmed" });

    // Try to withdraw as user2 (not the owner) - should fail
    let errorThrown = false;
    try {
      await program.methods
        .withdrawSol(username, new anchor.BN(500_000_000))
        .accounts({
          signer: user2.publicKey,
          userWallet: usernamePda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user2])
        .rpc({ commitment: "confirmed" });
    } catch (error) {
      errorThrown = true;
      expect(error.toString()).to.include("Unauthorized");
    }

    expect(errorThrown).to.be.true;
  });

  it("Should fail when withdrawing more than balance", async () => {
    const username = "sven";
    const [usernamePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("username_wallet"), Buffer.from(username)],
      program.programId
    );
    // Register username
    await program.methods
      .registerUsername(username)
      .accounts({
        user: user1.publicKey,
        usernameWallet: usernamePda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user1])
      .rpc({ commitment: "confirmed" });

    // Send 1 SOL
    const sent = new anchor.BN(1_000_000_000);
    await program.methods
      .sendSol(username, sent)
      .accounts({
        sender: user2.publicKey,
        userWallet: usernamePda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user2])
      .rpc({ commitment: "confirmed" });

    // Try to withdraw 2 SOL (more than balance) - should fail
    let errorThrown = false;
    try {
      await program.methods
        .withdrawSol(username, new anchor.BN(2_000_000_000))
        .accounts({
          signer: user1.publicKey,
          userWallet: usernamePda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user1])
        .rpc({ commitment: "confirmed" });
    } catch (error) {
      errorThrown = true;
      expect(error.toString()).to.include("BalanceUnderflow");
    }

    expect(errorThrown).to.be.true;
  });
  it("Should fail when withdrawing from empty wallet", async () => {
    const username = "test-empty";
    const [usernamePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("username_wallet"), Buffer.from(username)],
      program.programId
    );

    // Register username but don't send any SOL
    await program.methods
      .registerUsername(username)
      .accounts({
        user: user1.publicKey,
        usernameWallet: usernamePda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user1])
      .rpc({ commitment: "confirmed" });

    // Try to withdraw from empty wallet - should fail
    let errorThrown = false;
    try {
      await program.methods
        .withdrawSol(username, new anchor.BN(500_000_000))
        .accounts({
          signer: user1.publicKey,
          userWallet: usernamePda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user1])
        .rpc({ commitment: "confirmed" });
    } catch (error) {
      errorThrown = true;
      expect(error.toString()).to.include("InsufficientBalance");
    }

    expect(errorThrown).to.be.true;
  });
});
