use anchor_lang::prelude::*;

#[error_code]
pub enum UsernameError {
    #[msg("Username too short (min 3 chars)")]
    UsernameTooShort,

    #[msg("Username too long (max 50 chars)")]
    UsernameTooLong,

    #[msg("Invalid username format")]
    InvalidFormat,

    #[msg("Insufficient balance to withdraw")]
    InsufficientBalance,

    #[msg("Unauthorized")]
    Unauthorized,

    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("OverFlow")]
    BalanceOverflow,
    #[msg("UnderFlow")]
    BalanceUnderflow,
}
