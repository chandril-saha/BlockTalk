#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::{Events, Address as _}, Env, String, IntoVal, TryFromVal};

#[test]
fn test_send_message_success() {
    let env = Env::default();
    let contract_id = env.register(BlockTalkContract, ());
    let client = BlockTalkContractClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);
    let message = String::from_str(&env, "Hello NeoBrutalism");

    // Send mock auth since we're using require_auth
    env.mock_all_auths();
    
    client.send_message(&sender, &recipient, &message);

    // Verify event
    let events = env.events().all();
    assert_eq!(events.len(), 1);
    let event = events.last().unwrap();
    
    // Check topics
    let expected_topics = (symbol_short!("Message"), sender.clone(), recipient.clone()).into_val(&env);
    assert_eq!(event.1, expected_topics);
    
    // Check data: Convert Val back to String for comparison
    let event_data: String = String::try_from_val(&env, &event.2).unwrap();
    assert_eq!(event_data, message);
}

#[test]
#[should_panic(expected = "Message cannot be empty")]
fn test_send_empty_message_fails() {
    let env = Env::default();
    let contract_id = env.register(BlockTalkContract, ());
    let client = BlockTalkContractClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);
    let message = String::from_str(&env, "");

    env.mock_all_auths();
    
    client.send_message(&sender, &recipient, &message);
}

#[test]
#[should_panic(expected = "Cannot send message to yourself")]
fn test_send_to_self_fails() {
    let env = Env::default();
    let contract_id = env.register(BlockTalkContract, ());
    let client = BlockTalkContractClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let message = String::from_str(&env, "Talking to myself");

    env.mock_all_auths();
    
    client.send_message(&sender, &sender, &message);
}
