use anchor_lang::{
    prelude::*,
    solana_program::{program::invoke, system_instruction},
};

use crate::{error::UsernameError, events::SolSent, state::UserNameWallet};

#[derive(Accounts)]
#[instruction(username: String)]
pub struct SendSol<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,
    #[account(mut,seeds=[b"username_wallet",username.as_bytes()],bump=user_wallet.bump)]
    pub user_wallet: Account<'info, UserNameWallet>,
    pub system_program: Program<'info, System>,
}
impl<'info> SendSol<'info> {
    pub fn send_sol_by_username(&mut self, username: String, amount: u64) -> Result<()> {
        require!(amount > 0, UsernameError::InvalidAmount);
        // Transfer SOL from sender to username wallet PDA
        let transfer_instruction =
            system_instruction::transfer(&self.sender.key(), &self.user_wallet.key(), amount);
        invoke(
            &transfer_instruction,
            &[
                self.sender.to_account_info(),
                self.user_wallet.to_account_info(),
                self.system_program.to_account_info(),
            ],
        )?;
        // Update balance
        self.user_wallet.balance = self
            .user_wallet
            .balance
            .checked_add(amount)
            .ok_or(UsernameError::InvalidAmount)?;

        emit!(SolSent {
            username,
            sender: self.sender.key(),
            amount,
            timestamp: Clock::get()?.unix_timestamp,
        });
        Ok(())
    }
}
