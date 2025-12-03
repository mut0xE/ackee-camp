use anchor_lang::prelude::*;

use crate::{error::UsernameError, events::UsernameRegistered, state::UserNameWallet};

#[derive(Accounts)]
#[instruction(username:String)]
pub struct RegisterUsername<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(init,payer=user,space=8+UserNameWallet::INIT_SPACE,seeds=[b"username_wallet",username.as_bytes() ],bump)]
    pub username_vault: Account<'info, UserNameWallet>,
    pub system_program: Program<'info, System>,
}
impl<'info> RegisterUsername<'info> {
    pub fn register_username(
        &mut self,
        username: String,
        bump: &RegisterUsernameBumps,
    ) -> Result<()> {
        // Validate username length
        require!(username.len() >= 3, UsernameError::UsernameTooShort);
        require!(username.len() <= 50, UsernameError::UsernameTooLong);
        require!(
            username.chars().all(|c| c.is_alphanumeric() || c == '-'),
            UsernameError::InvalidFormat
        );
        self.username_vault.set_inner(UserNameWallet {
            owner: self.user.key(),
            username: username.clone(),
            balance: 0,
            created_at: Clock::get()?.unix_timestamp,
            bump: bump.username_vault,
        });
        emit!(UsernameRegistered {
            username,
            owner: self.user.key(),
            timestamp: Clock::get()?.unix_timestamp,
        });
        Ok(())
    }
}
