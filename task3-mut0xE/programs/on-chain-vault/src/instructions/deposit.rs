//-------------------------------------------------------------------------------
use crate::errors::VaultError;
use crate::events::DepositEvent;
use crate::state::Vault;
///
/// TASK: Implement the deposit functionality for the on-chain vault
///
/// Requirements:
/// - Verify that the user has enough balance to deposit
/// - Verify that the vault is not locked
/// - Transfer lamports from user to vault using CPI (Cross-Program Invocation)
/// - Emit a deposit event after successful transfer
///
///-------------------------------------------------------------------------------
use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke;
use anchor_lang::solana_program::system_instruction::transfer;

#[derive(Accounts)]
pub struct Deposit<'info> {
    // TODO: Add required accounts and constraints
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    pub system_program: Program<'info, System>,
}

pub fn _deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
    // TODO: Implement deposit functionality

    let vault_account = &ctx.accounts.vault;
    if vault_account.locked {
        return Err(error!(VaultError::VaultLocked));
    }

    let from_pubkey = ctx.accounts.user.to_account_info();
    let to_vault_address = ctx.accounts.vault.to_account_info();
    let _program_id = ctx.accounts.system_program.to_account_info();

    if from_pubkey.lamports() <= 0 {
        return Err(error!(VaultError::InsufficientBalance));
    }

    if ctx.accounts.user.lamports() < amount {
        return Err(error!(VaultError::InsufficientBalance));
    }
    to_vault_address
        .lamports()
        .checked_add(amount)
        .ok_or(VaultError::Overflow)?;

    let transfer_instruction = transfer(&*from_pubkey.key, &*to_vault_address.key, amount);
    invoke(
        &transfer_instruction,
        &[
            ctx.accounts.user.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
    )?;
    emit!(DepositEvent {
        vault: ctx.accounts.vault.key(),
        user: ctx.accounts.user.key(),
        amount,
    });
    Ok(())
}
