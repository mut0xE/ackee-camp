//-------------------------------------------------------------------------------
///
/// TASK: Implement the remove reaction functionality for the Twitter program
///
/// Requirements:
/// - Verify that the tweet reaction exists and belongs to the reaction author
/// - Decrement the appropriate counter (likes or dislikes) on the tweet
/// - Close the tweet reaction account and return rent to reaction author
///
///-------------------------------------------------------------------------------
use anchor_lang::prelude::*;

use crate::errors::TwitterError;
use crate::states::*;

pub fn remove_reaction(ctx: Context<RemoveReactionContext>) -> Result<()> {
    // TODO: Implement remove reaction functionality
    let tweet_reaction_acc = &mut ctx.accounts.tweet_reaction;
    let tweet_acc = &mut ctx.accounts.tweet;
    let reaction_author = &ctx.accounts.reaction_author;
    if tweet_reaction_acc.reaction_author != *reaction_author.key {
        return Err(TwitterError::TopicTooLong.into());
    };
    match tweet_reaction_acc.reaction {
        ReactionType::Like => {
            if tweet_acc.likes == 0 {
                return Err(TwitterError::MinLikesReached.into());
            }
            tweet_acc.likes -= 1;
        }
        ReactionType::Dislike => {
            if tweet_acc.dislikes == 0 {
                return Err(TwitterError::MinDislikesReached.into());
            }
            tweet_acc.dislikes -= 1;
        }
    }

    Ok(())
}

#[derive(Accounts)]
pub struct RemoveReactionContext<'info> {
    // TODO: Add required account constraints
    #[account(mut)]
    pub reaction_author: Signer<'info>,
    #[account(mut,close=reaction_author,has_one=reaction_author)]
    pub tweet_reaction: Account<'info, Reaction>,
    #[account(mut)]
    pub tweet: Account<'info, Tweet>,
}
