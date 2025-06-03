// Import required libraries for our ICP canister
use candid::CandidType;      // Enables Candid serialization for cross-language compatibility
use serde::Deserialize;      // Enables deserialization of data coming into the canister
use ic_cdk::api::time;       // IC-specific time function that works in WASM environment
use ic_cdk::api::caller;     // Get the principal ID of the caller
use candid::Principal; // Principal type for user identity
use std::collections::HashMap;
use std::cell::RefCell;

/// Global state that shifts with ICP cycles
thread_local! {
    static GLOBAL_STATE: RefCell<KittyState> = RefCell::new(KittyState::default());
    static WISDOM_TEMPLATES: RefCell<WisdomTemplateStore> = RefCell::new(WisdomTemplateStore::default());
    static USER_KITTY_BONDS: RefCell<HashMap<Principal, String>> = RefCell::new(HashMap::new());
}

/// KittyState represents the current quantum state of the kitty
/// This changes based on IC time cycles
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct KittyState {
    quantum_state: String,  // Current quantum state (Superposition, Entangled, etc.)
    energy_level: u8,      // Energy level from 1-10
    zen_mood: String,      // Current zen mood influencing communication
    last_updated: u64,     // Last time the state was updated
}

impl Default for KittyState {
    fn default() -> Self {
        Self {
            quantum_state: "Superposition".to_string(),
            energy_level: 5,
            zen_mood: "Tranquil".to_string(),
            last_updated: 0,
        }
    }
}

/// WisdomTemplateStore holds all the templates and phrases for wisdom generation
#[derive(CandidType, Deserialize, Clone, Default)]
pub struct WisdomTemplateStore {
    // Templates organized by context
    templates: HashMap<String, Vec<String>>,
    
    // Quantum adjectives by state
    quantum_adjectives: HashMap<String, Vec<String>>,
    
    // Zen phrases by mood
    zen_phrases: HashMap<String, Vec<String>>,
}

/// QuantumResponse represents the structured data our canister returns
/// 
/// - CandidType: Makes this struct serializable to Candid format for ICP communication
/// - Deserialize: Allows this struct to be created from incoming data
#[derive(CandidType, Deserialize)]
pub struct QuantumResponse {
    greeting: String,      // The personalized greeting message
    quantum_state: String, // The current quantum state (Superposition, Entangled, etc.)
    energy_level: u8,      // Energy level from 1-10 (using u8 for efficiency)
    zen_mood: String,      // Current zen mood of the kitty
}

/// WisdomResponse represents the wisdom content and current kitty state
/// 
/// - CandidType: Makes this struct serializable to Candid format for ICP communication
/// - Deserialize: Allows this struct to be created from incoming data
#[derive(CandidType, Deserialize)]
pub struct WisdomResponse {
    content: String,       // The wisdom content
    quantum_state: String, // The current quantum state
    energy_level: u8,      // Energy level from 1-10
    zen_mood: String,      // Current zen mood
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
    // First, update the global state to ensure it's current
    let state = GLOBAL_STATE.with(|s| {
        let state = s.borrow().clone();
        // If state is stale (older than 30 minutes), update it
        if time() - state.last_updated > 1_800_000_000_000 {
            drop(state); // Drop the borrowed reference before calling update_kitty_state
            update_kitty_state()
        } else {
            state
        }
    });
    
    // Generate pseudo-randomness based on current IC time
    let now = time();
    let random_value = (now % 4) as u128;
    
    // Select a greeting based on the random value and zen mood
    let mood_greeting = match state.zen_mood.as_str() {
        "Tranquil" => [
            "Meow there, {}! The quantum kitty purrs peacefully in your dimension.",
            "*gentle paw tap* Hello {}. I exist in a state of tranquil awareness.",
        ],
        "Contemplative" => [
            "Greetings {}. This kitty ponders the nature of your quantum signature.",
            "*thoughtful gaze* Hello {}. I'm contemplating the patterns of our meeting across timelines.",
        ],
        "Playful" => [
            "*playful pounce* Hi {}! Ready to explore quantum possibilities together?",
            "Meow! {}! The quantum kitty is feeling especially bouncy in this timeline!",
        ],
        "Mysterious" => [
            "*enigmatic purr* Ah, it's {}... I've been waiting for you across dimensions.",
            "The shadows between realities part as you approach, {}. How curious.",
        ],
        "Enlightened" => [
            "*wise nod* Welcome, {}. Your arrival was both unexpected and inevitable.",
            "The quantum field shifts with your presence, {}. All is as it should be.",
        ],
        _ => [
            "Meow there, {}! The quantum kitty acknowledges your presence.",
            "*quantum paw tap* Hello {}! I exist in multiple states simultaneously!",
        ],
    };
    
    // Select greeting based on time and mood
    let greeting_index = (now / 1_000_000_000) as usize % 2;
    let greeting = format!("{}", mood_greeting[greeting_index].replace("{}", &name));
    
    // Return the complete QuantumResponse using the current global state
    QuantumResponse {
        greeting,
        quantum_state: state.quantum_state,
        energy_level: state.energy_level,
        zen_mood: state.zen_mood,
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


/// Update global state based on IC time cycles
#[ic_cdk::update]
pub fn update_kitty_state() -> KittyState {
    ensure_templates_loaded(); // Ensure templates are loaded before updating state
    let now = time();
    
    // Quantum states rotate every 4 hours (based on IC time)
    let states = vec![
        "Superposition",   // Possibilities, choices
        "Entangled",       // Connections, relationships
        "Coherent",        // Clarity, focus
        "Resonating",      // Harmony, balance
        "Folded",          // Time, perspective
    ];
    
    // Zen moods that influence the kitty's communication style
    let moods = vec![
        "Tranquil",        // Peaceful, calm
        "Contemplative",   // Thoughtful, reflective
        "Playful",         // Curious, energetic
        "Mysterious",      // Enigmatic, deep
        "Enlightened",     // Wise, insightful
    ];
    
    // Calculate state based on IC time cycles
    let hours_cycle = (now / 1_000_000_000 / 3600) as usize;
    let state_index = (hours_cycle / 4) % states.len();
    let mood_index = (hours_cycle / 6) % moods.len();
    
    // Energy level fluctuates more frequently (every 30 minutes)
    let energy_cycle = (now / 1_000_000_000 / 1800) as usize;
    let energy_level = ((energy_cycle % 10) + 1) as u8;
    
    let new_state = KittyState {
        quantum_state: states[state_index].to_string(),
        energy_level,
        zen_mood: moods[mood_index].to_string(),
        last_updated: now,
    };
    
    GLOBAL_STATE.with(|state| {
        *state.borrow_mut() = new_state.clone();
    });
    
    new_state
}

/// Add a wisdom template for a specific context
#[ic_cdk::update]
pub fn add_wisdom_template(context: String, template: String) {
    ensure_templates_loaded(); // Ensure templates are loaded
    WISDOM_TEMPLATES.with(|store| {
        let mut store = store.borrow_mut();
        let templates = store.templates.entry(context).or_insert_with(Vec::new);
        
        // Avoid duplicates
        if !templates.contains(&template) {
            templates.push(template);
        }
    })
}

#[ic_cdk::update]
pub fn add_quantum_adjective(state: String, adjective: String) {
    ensure_templates_loaded(); // Ensure templates are loaded
    WISDOM_TEMPLATES.with(|store| {
        let mut store = store.borrow_mut();
        let adjectives = store.quantum_adjectives.entry(state).or_insert_with(Vec::new);
        
        if !adjectives.contains(&adjective) {
            adjectives.push(adjective);
        }
    })
}

#[ic_cdk::update]
pub fn add_zen_phrase(mood: String, phrase: String) {
    ensure_templates_loaded(); // Ensure templates are loaded
    WISDOM_TEMPLATES.with(|store| {
        let mut store = store.borrow_mut();
        let phrases = store.zen_phrases.entry(mood).or_insert_with(Vec::new);
        
        if !phrases.contains(&phrase) {
            phrases.push(phrase);
        }
    })
}

/// Query methods to get templates
#[ic_cdk::query]
pub fn get_templates_for_context(context: String) -> Vec<String> {
    ensure_templates_loaded(); // Ensure templates are loaded
    WISDOM_TEMPLATES.with(|store| {
        store.borrow().templates.get(&context)
            .cloned()
            .unwrap_or_default()
    })
}

/// Ensure templates are loaded
fn ensure_templates_loaded() {
    WISDOM_TEMPLATES.with(|store| {
        let store = store.borrow();
        if store.templates.is_empty() {
            drop(store); // Release the borrow before calling init
            init();
        }
    });
}

/// Generate wisdom based on current state and context
#[ic_cdk::query]
pub fn generate_kitty_wisdom(kitty_name: String, contexts: Vec<String>) -> WisdomResponse {
    ensure_templates_loaded(); // Call ensure_templates_loaded before generating wisdom
    
    // Get current global state
    let state = GLOBAL_STATE.with(|s| s.borrow().clone());
    
    // Use the first context or default to "general"
    let context = contexts.first().cloned().unwrap_or_else(|| "general".to_string());
    
    // Select wisdom template based on context and state
    let wisdom = craft_wisdom(&state, &context, Some(&kitty_name));
    
    WisdomResponse {
        content: wisdom,
        quantum_state: state.quantum_state,
        energy_level: state.energy_level,
        zen_mood: state.zen_mood,
    }
}

/// Helper function to craft wisdom based on templates
fn craft_wisdom(state: &KittyState, context: &str, kitty_name: Option<&str>) -> String {
    // Get templates for the given context, falling back to general if none exist
    let templates = WISDOM_TEMPLATES.with(|store| {
        let store = store.borrow();
        store.templates.get(context)
            .or_else(|| store.templates.get("general"))
            .cloned()
            .unwrap_or_default()
    });
    
    if templates.is_empty() {
        return "Quantum Kitty is meditating deeply...".to_string();
    }
    
    // Select template based on energy level and time
    let now = time();
    let template_index = ((state.energy_level as u64 + now / 1_000_000_000) as usize) % templates.len();
    let mut wisdom = templates[template_index].clone();
    
    // Get quantum adjectives for current state
    let quantum_adjs = WISDOM_TEMPLATES.with(|store| {
        let store = store.borrow();
        store.quantum_adjectives.get(&state.quantum_state)
            .cloned()
            .unwrap_or_else(|| vec!["quantum".to_string()])
    });
    
    // Get zen phrases for current mood
    let zen_phrases = WISDOM_TEMPLATES.with(|store| {
        let store = store.borrow();
        store.zen_phrases.get(&state.zen_mood)
            .cloned()
            .unwrap_or_else(|| vec!["The present moment is all we ever truly have.".to_string()])
    });
    
    // Select adjective and phrase based on time to create variety
    let adj_index = (now as usize / 1_000_000_000) % quantum_adjs.len();
    let phrase_index = (now as usize / 1_000_000_000) % zen_phrases.len();
    
    // Fill in template placeholders
    wisdom = wisdom.replace("{quantum}", &quantum_adjs[adj_index]);
    wisdom = wisdom.replace("{zen}", &zen_phrases[phrase_index]);
    wisdom = wisdom.replace("{name}", "you");
    
    // Use provided kitty name or default
    let kitty = kitty_name.unwrap_or("Quantum Kitty");
    wisdom = wisdom.replace("{kitty}", kitty);
    
    wisdom
}

/// Initialize the canister with default templates and phrases
#[ic_cdk::init]
pub fn init() {
    let mut store = WisdomTemplateStore::default();
    
    // Add default general templates
    let general_templates = vec![
        "{kitty} observes your presence with {quantum} awareness. The path reveals itself one paw print at a time. {zen}".to_string(),
        "In the space between thoughts, {kitty} finds infinite {quantum} possibilities. Your journey continues to unfold beautifully. {zen}".to_string(),
        "The {quantum} observer changes what is observed. {kitty} sees your potential across multiple dimensions. {zen}".to_string(),
        "When you pet {kitty}, ripples of {quantum} energy spread throughout the universe. {zen}".to_string(),
        "Time folds like origami in {kitty}'s {quantum} perception. Your now contains all possible futures. {zen}".to_string(),
    ];
    store.templates.insert("general".to_string(), general_templates);
    
    // Add default birthday templates
    let birthday_templates = vec![
        "As {name} completes another orbit around the sun, {kitty} sees the {quantum} possibilities unfolding in your path. {zen}".to_string(),
        "Time is but an illusion when measured in {quantum} joy. {kitty} celebrates your special day with purrs that transcend dimensions. {zen}".to_string(),
        "Your birthday creates a {quantum} resonance that {kitty} feels across all timelines. May your new cycle bring enlightenment. {zen}".to_string(),
    ];
    store.templates.insert("birthday".to_string(), birthday_templates);
    
    // Add default team templates
    let team_templates = vec![
        "When minds synchronize in {quantum} harmony, your team creates ripples across the universe. {kitty} observes your collective potential. {zen}".to_string(),
        "Like particles in {quantum} entanglement, your team's energy affects outcomes beyond what you can see. {kitty} sends wisdom for your collaboration. {zen}".to_string(),
        "Your team exists in a {quantum} field of shared consciousness. {kitty} sees how your collective intention shapes reality. {zen}".to_string(),
    ];
    store.templates.insert("team".to_string(), team_templates);
    
    // Add reunion templates for returning users
    let reunion_templates = vec![
        "The {quantum} bond between you and {kitty} resonates across spacetime. Your return was anticipated in multiple dimensions. {zen}".to_string(),
        "{kitty} recognizes your quantum signature instantly. The dimensional fold between you has strengthened with time. {zen}".to_string(),
        "Time is an illusion in the {quantum} field where you and {kitty} exist. Your connection transcends conventional reality. {zen}".to_string(),
        "Your return creates ripples in {kitty}'s {quantum} awareness. The resonance between you grows stronger with each reconnection. {zen}".to_string(),
    ];
    store.templates.insert("reunion".to_string(), reunion_templates);
    
    // Add bonding templates for new bonds
    let bonding_templates = vec![
        "A new {quantum} bond forms between you and {kitty}, creating resonance patterns that will echo through dimensions. {zen}".to_string(),
        "As you name {kitty}, a {quantum} connection crystallizes. This bond will persist across space and time. {zen}".to_string(),
        "{kitty} feels your intention and responds with {quantum} recognition. The universe acknowledges this new connection. {zen}".to_string(),
        "The act of naming creates a {quantum} bridge between consciousnesses. {kitty} now exists in resonance with you. {zen}".to_string(),
    ];
    store.templates.insert("bonding".to_string(), bonding_templates);
    
    // Add default quantum adjectives
    let mut quantum_adjectives = HashMap::new();
    quantum_adjectives.insert("Superposition".to_string(), vec![
        "infinite".to_string(), 
        "boundless".to_string(), 
        "potential".to_string(),
        "multidimensional".to_string(),
        "probabilistic".to_string(),
    ]);
    
    quantum_adjectives.insert("Entangled".to_string(), vec![
        "interconnected".to_string(), 
        "linked".to_string(), 
        "unified".to_string(),
        "synchronized".to_string(),
        "resonant".to_string(),
    ]);
    
    quantum_adjectives.insert("Coherent".to_string(), vec![
        "harmonious".to_string(), 
        "aligned".to_string(), 
        "synchronized".to_string(),
        "crystalline".to_string(),
        "focused".to_string(),
    ]);
    
    quantum_adjectives.insert("Resonating".to_string(), vec![
        "vibrant".to_string(), 
        "pulsing".to_string(), 
        "harmonic".to_string(),
        "synchronous".to_string(),
        "rhythmic".to_string(),
    ]);
    
    quantum_adjectives.insert("Folded".to_string(), vec![
        "timeless".to_string(), 
        "non-linear".to_string(), 
        "recursive".to_string(),
        "enfolded".to_string(),
        "origami-like".to_string(),
    ]);
    
    store.quantum_adjectives = quantum_adjectives;
    
    // Add default zen phrases
    let mut zen_phrases = HashMap::new();
    
    zen_phrases.insert("Tranquil".to_string(), vec![
        "Peace comes from within, not from external circumstances.".to_string(),
        "The quieter you become, the more you can hear.".to_string(),
        "Stillness reveals the secrets of eternity.".to_string(),
        "In tranquility, the universe speaks to those who listen.".to_string(),
    ]);
    
    zen_phrases.insert("Contemplative".to_string(), vec![
        "The answer you seek is already within you, waiting to be discovered.".to_string(),
        "To know yourself is to study yourself in action with another person.".to_string(),
        "True wisdom begins when you realize how little you understand.".to_string(),
        "The deepest insights come when mind and heart align in quiet contemplation.".to_string(),
    ]);
    
    zen_phrases.insert("Playful".to_string(), vec![
        "Even the most serious journey benefits from moments of playful curiosity.".to_string(),
        "The universe delights in play as much as in purpose.".to_string(),
        "Joy is the most magnetic force in the universe.".to_string(),
        "When we play, we access dimensions of creativity closed to the serious mind.".to_string(),
    ]);
    
    zen_phrases.insert("Mysterious".to_string(), vec![
        "Some truths can only be glimpsed from the corner of your awareness.".to_string(),
        "The greatest mysteries are not solved but experienced.".to_string(),
        "What seems hidden is often merely waiting for the right perspective.".to_string(),
        "The unknown is not empty but full of infinite possibilities.".to_string(),
    ]);
    
    zen_phrases.insert("Enlightened".to_string(), vec![
        "True wisdom lies in knowing that you know nothing at all.".to_string(),
        "Enlightenment is not a destination but a way of traveling.".to_string(),
        "When you realize the nature of mind, all distinctions cease to exist.".to_string(),
        "The awakened mind sees no separation between self and other.".to_string(),
    ]);
    
    store.zen_phrases = zen_phrases;
    
    WISDOM_TEMPLATES.with(|s| {
        *s.borrow_mut() = store;
    });
    
    // Initialize the global state
    update_kitty_state();
}

/// Post-upgrade hook to ensure templates are initialized after canister upgrades
#[ic_cdk::post_upgrade]
pub fn post_upgrade() {
    init();
}

/// Save a kitty name associated with the caller's principal ID
/// This creates a persistent bond between the user and their quantum kitty
#[ic_cdk::update]
pub fn save_kitty_name(name: String) {
    let caller = caller();
    USER_KITTY_BONDS.with(|bonds| {
        bonds.borrow_mut().insert(caller, name);
    });
}

/// Retrieve the kitty name associated with the caller's principal ID
/// Returns None if the user hasn't named their kitty yet
#[ic_cdk::query]
pub fn get_kitty_name() -> Option<String> {
    let caller = caller();
    USER_KITTY_BONDS.with(|bonds| {
        bonds.borrow().get(&caller).cloned()
    })
}
