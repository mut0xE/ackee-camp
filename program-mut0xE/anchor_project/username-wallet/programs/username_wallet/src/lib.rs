use anchor_lang::prelude::*;

declare_id!("BWEK6JuhkArseF8WhofrDSxK7wr9oDmRDvmbvALxsGML");
pub mod error;
pub mod events;
pub mod instructions;
pub mod state;
use instructions::register_username::*;
use instructions::send_sol::*;
use instructions::withdraw_sol::*;
#[program]
pub mod username_wallet {

    use super::*;
    pub fn register_username(ctx: Context<RegisterUsername>, username: String) -> Result<()> {
        msg!("Greetings from Username Registration: {:?}", ctx.program_id);
        ctx.accounts
            .register_username(username.clone(), &ctx.bumps)?;
        Ok(())
    }
    pub fn send_sol(ctx: Context<SendSol>, username: String, amount: u64) -> Result<()> {
        msg!(
            "Greetings from sending sol to Username : {:?}",
            ctx.accounts.user_wallet.username
        );
        ctx.accounts.send_sol_by_username(username, amount)?;

        Ok(())
    }
    pub fn withdraw_sol(ctx: Context<WithdrawSol>, username: String, amount: u64) -> Result<()> {
        msg!(
            "Greetings from withdraw sol to Username : {:?}",
            ctx.accounts.user_wallet.username
        );
        ctx.accounts.withdraw_sol_from_wallet(username, amount)?;

        Ok(())
    }
}
