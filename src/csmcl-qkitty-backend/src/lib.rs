// Import required libraries for our ICP canister
use candid::CandidType;      // Enables Candid serialization for cross-language compatibility
use serde::Deserialize;      // Enables deserialization of data coming into the canister
use std::time::{SystemTime, UNIX_EPOCH};  // Used for time-based randomization

/// QuantumResponse represents the structured data our canister returns
/// 
/// - CandidType: Makes this struct serializable to Candid format for ICP communication
/// - Deserialize: Allows this struct to be created from incoming data
#[derive(CandidType, Deserialize)]
pub struct QuantumResponse {
    greeting: String,      // The personalized greeting message
    quantum_state: String, // The current quantum state (Superposition, Entangled, etc.)
    energy_level: u8,     // Energy level from 1-10 (using u8 for efficiency)
}

/// A query function that generates a quantum-themed greeting
/// 
/// This is marked as a query (not an update) because:
/// - It doesn't modify canister state
/// - It's faster (doesn't need consensus)
/// - It's cheaper in terms of cycles
/// 
/// The #[ic_cdk::query] macro exposes this function to the ICP network
#[ic_cdk::query]
fn quantum_greet(name: String) -> QuantumResponse {
    // Generate pseudo-randomness based on current time
    // In a production app, you might want a better source of randomness
    // ICP provides ic0.random_bytes() for true randomness
    let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis();
    let random_value = now % 4;
    
    // Select a greeting based on the random value (simulating quantum superposition)
    // The kitty exists in multiple greeting states until "observed"
    let greeting = match random_value {
        0 => format!("Meow there, {}! The quantum kitty purrs in your dimension!", name),
        1 => format!("*quantum paw tap* Hello {}! I exist in multiple states simultaneously!", name),
        2 => format!("Greetings {}! This kitty has folded through spacetime to meet you!", name),
        _ => format!("Quantum whiskers twitching... Ah, it's {}! Welcome to my resonance field!", name),
    };
    
    // Generate a quantum state - representing the kitty's quantum condition
    // These states are inspired by real quantum mechanics concepts
    let states = ["Superposition", "Entangled", "Coherent", "Resonating", "Folded"];
    let state_index = (now % states.len() as u128) as usize;
    
    // Generate an energy level (1-10)
    // This represents the quantum energy of the kitty's current state
    let energy = ((now % 10) + 1) as u8;
    
    // Return the complete QuantumResponse
    // In Rust, the last expression without a semicolon is the return value
    QuantumResponse {
        greeting,               // Using the shorthand syntax for greeting: greeting
        quantum_state: states[state_index].to_string(),
        energy_level: energy,
    }
}

/// A simpler greeting function kept for compatibility and demonstration
/// 
/// This shows how to return a simple String instead of a complex type
/// It's also useful for testing basic connectivity to the canister
#[ic_cdk::query]
fn greet(name: String) -> String {
    format!("Hello, {}! (The quantum kitty is sleeping in this function)", name)
}
