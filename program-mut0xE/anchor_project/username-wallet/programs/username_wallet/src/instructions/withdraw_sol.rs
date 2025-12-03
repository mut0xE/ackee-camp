use anchor_lang::prelude::*;

use crate::{error::UsernameError, events::SolWithdrawn, state::UserNameWallet};
#[derive(Accounts)]
#[instruction(username: String)]
pub struct WithdrawSol<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(mut,constraint=signer.key() == user_wallet.owner @ UsernameError::Unauthorized,seeds=[b"username_wallet",username.as_bytes()],bump)]
    pub user_wallet: Account<'info, UserNameWallet>,
    pub system_program: Program<'info, System>,
}
impl<'info> WithdrawSol<'info> {
    pub fn withdraw_sol_from_wallet(&mut self, username: String, amount: u64) -> Result<()> {
        require!(amount > 0, UsernameError::InvalidAmount);
        require!(
            self.user_wallet.owner.key() == self.signer.key(),
            UsernameError::Unauthorized
        );
        require!(
            self.user_wallet.balance > 0,
            UsernameError::InsufficientBalance
        );
        let user_wallet_info = &mut self.user_wallet.to_account_info();
        let signer_info = &mut self.signer.to_account_info();

        let mut user_wallet_lamports = user_wallet_info.try_borrow_mut_lamports()?;
        let mut signer_lamports = signer_info.try_borrow_mut_lamports()?;

        // Direct SOL transfer using lamport manipulation
        **user_wallet_lamports = user_wallet_lamports
            .checked_sub(amount)
            .ok_or(UsernameError::BalanceUnderflow)?;
        **signer_lamports = signer_lamports
            .checked_add(amount)
            .ok_or(UsernameError::BalanceOverflow)?;
        self.user_wallet.balance = self
            .user_wallet
            .balance
            .checked_sub(amount)
            .ok_or(UsernameError::BalanceUnderflow)?;
        emit!(SolWithdrawn {
            username,
            owner: self.user_wallet.owner.key(),
            amount,
            timestamp: Clock::get()?.unix_timestamp,
        });
        Ok(())
    }
}
