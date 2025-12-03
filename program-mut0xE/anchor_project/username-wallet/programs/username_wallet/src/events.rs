use anchor_lang::prelude::*;
#[event]
pub struct UsernameRegistered {
    pub username: String,
    pub owner: Pubkey,
    pub timestamp: i64,
}
#[event]
pub struct SolSent {
    pub username: String,
    pub sender: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct SolWithdrawn {
    pub username: String,
    pub owner: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}
