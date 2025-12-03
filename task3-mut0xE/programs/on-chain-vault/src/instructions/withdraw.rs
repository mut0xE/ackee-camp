//-------------------------------------------------------------------------------
use crate::errors::VaultError;
use crate::events::WithdrawEvent;
use crate::state::Vault;
///
/// TASK: Implement the withdraw functionality for the on-chain vault
///
/// Requirements:
/// - Verify that the vault is not locked
/// - Verify that the vault has enough balance to withdraw
/// - Transfer lamports from vault to vault authority
/// - Emit a withdraw event after successful transfer
///
///-------------------------------------------------------------------------------
use anchor_lang::prelude::*;
#[derive(Accounts)]
pub struct Withdraw<'info> {
    // TODO: Add required accounts and constraints
    #[account(mut)]
    pub vault_authority: Signer<'info>,
    #[account(mut,seeds = [b"vault", vault_authority.key().as_ref()],
            bump,)]
    pub vault: Account<'info, Vault>,
    pub system_program: Program<'info, System>,
}

pub fn _withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    // TODO: Implement withdraw functionality
    let vault = &ctx.accounts.vault;
    let signer_address = &ctx.accounts.vault_authority;
    if vault.locked {
        return Err(error!(VaultError::VaultLocked));
    };
    let vault_info = vault.to_account_info();
    if vault_info.lamports() <= amount {
        return Err(error!(VaultError::InsufficientBalance));
    };
    let signer_info = signer_address.to_account_info();
    let mut vault_lamports = vault_info.try_borrow_mut_lamports()?;
    let mut signer_lamports = signer_info.try_borrow_mut_lamports()?;
    **vault_lamports = vault_lamports
        .checked_sub(amount)
        .ok_or(VaultError::InsufficientBalance)?;

    **signer_lamports = signer_lamports
        .checked_add(amount)
        .ok_or(VaultError::Overflow)?;

    emit!(WithdrawEvent {
        amount,
        vault_authority: signer_address.key(),
        vault: vault.key()
    });
    Ok(())
}
