#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, String, symbol_short};

#[contract]
pub struct BlockTalkContract;

#[contractimpl]
impl BlockTalkContract {
    pub fn send_message(env: Env, sender: Address, recipient: Address, message: String) {
        sender.require_auth();

        if sender == recipient {
            panic!("Cannot send message to yourself");
        }

        if message.len() == 0 {
            panic!("Message cannot be empty");
        }

        if message.len() > 256 {
            panic!("Message too long");
        }

        // Emit an event. Topics: ["Message", sender, recipient]. Data: message
        let topics = (symbol_short!("Message"), sender, recipient);
        env.events().publish(topics, message);
    }
}

mod test;
