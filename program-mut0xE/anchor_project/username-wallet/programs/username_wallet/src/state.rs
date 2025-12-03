use anchor_lang::prelude::*;
pub const MAX_LENGTH: u8 = 50;

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
