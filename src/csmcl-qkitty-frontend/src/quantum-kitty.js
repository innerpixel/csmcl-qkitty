// Import the auto-generated JavaScript bindings for our backend canister
import { csmcl_qkitty_backend } from 'declarations/csmcl-qkitty-backend';

// Import Internet Identity related modules
import { AuthClient } from '@dfinity/auth-client';
import { HttpAgent } from '@dfinity/agent';

/**
 * Quantum Kitty Controller
 * Handles interactions with the ICP backend canister
 */
class QuantumKittyController {
  constructor() {
    // Initialize state
    this.currentName = '';
    this.currentState = '';
    this.currentEnergyLevel = 0;
    this.currentZenMood = '';
    this.kittyName = '';
    
    // Internet Identity related state
    this.authClient = null;
    this.identity = null;
    this.principal = null;
    this.isAuthenticated = false;
    
    // Initialize auth client and event listeners
    this.initAuth();
    this.setupEventListeners();
    
    // Update global state every 30 minutes
    this.updateGlobalState();
    setInterval(() => this.updateGlobalState(), 30 * 60 * 1000);
  }
  
  /**
   * Initialize the Internet Identity authentication client
   */
  async initAuth() {
    try {
      this.authClient = await AuthClient.create();
      
      // Check if the user is already authenticated
      const isAuthenticated = await this.authClient.isAuthenticated();
      
      if (isAuthenticated) {
        this.identity = await this.authClient.getIdentity();
        this.principal = this.identity.getPrincipal().toString();
        this.isAuthenticated = true;
        this.updateAuthUI();
        
        // Load user's kitty data
        this.loadKittyData();
      }
    } catch (error) {
      console.error('Error initializing auth client:', error);
    }
  }
  
  /**
   * Handle Internet Identity login
   */
  async login() {
    try {
      // Show loading state
      document.getElementById('login-button').textContent = 'Connecting...';
      
      // Get the Internet Identity canister ID
      const iiCanisterId = 'uzt4z-lp777-77774-qaabq-cai'; // Local development canister ID
      
      await this.authClient.login({
        identityProvider: window.location.protocol === 'https:' 
          ? 'https://identity.ic0.app/#authorize' 
          : `http://${iiCanisterId}.localhost:4943/`,
        onSuccess: async () => {
          this.identity = await this.authClient.getIdentity();
          this.principal = this.identity.getPrincipal().toString();
          this.isAuthenticated = true;
          this.updateAuthUI();
          
          // Check if user has a kitty already
          this.loadKittyData();
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      document.getElementById('login-button').textContent = 'Connect with Internet Identity';
    }
  }
  
  /**
   * Handle Internet Identity logout
   */
  async logout() {
    try {
      await this.authClient.logout();
      this.identity = null;
      this.principal = null;
      this.isAuthenticated = false;
      this.kittyName = '';
      this.updateAuthUI();
      
      // Reset UI
      const detailsElement = document.getElementById('quantum-details');
      if (detailsElement) {
        detailsElement.innerHTML = '';
      }
      
      const greetingElement = document.getElementById('greeting');
      if (greetingElement) {
        greetingElement.className = 'greeting-inactive';
        greetingElement.textContent = 'Enter your name and interact with the quantum kitty!';
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  
  /**
   * Update the UI based on authentication state
   */
  updateAuthUI() {
    const loginSection = document.getElementById('login-section');
    const userSection = document.getElementById('user-section');
    const userPrincipal = document.getElementById('user-principal');
    const kittyNamingForm = document.getElementById('kitty-naming-form');
    const quantumGreetingForm = document.getElementById('quantum-greeting-form');
    
    if (this.isAuthenticated) {
      // User is logged in
      loginSection.style.display = 'none';
      userSection.style.display = 'flex';
      
      // Display shortened principal ID
      const shortPrincipal = this.principal.substring(0, 5) + '...' + this.principal.substring(this.principal.length - 5);
      userPrincipal.textContent = shortPrincipal;
      
      // Show kitty naming form if no kitty name exists
      if (!this.kittyName) {
        kittyNamingForm.style.display = 'block';
        quantumGreetingForm.style.display = 'none';
      } else {
        kittyNamingForm.style.display = 'none';
        quantumGreetingForm.style.display = 'none'; // Hide the legacy form
      }
    } else {
      // User is logged out
      loginSection.style.display = 'flex';
      userSection.style.display = 'none';
      kittyNamingForm.style.display = 'none';
      quantumGreetingForm.style.display = 'block'; // Show legacy form for now
    }
  }
  
  /**
   * Load the user's kitty data from the backend
   * Retrieves the quantum bond between user and kitty if it exists
   */
  async loadKittyData() {
    try {
      // Call the backend to check if user has a bonded kitty
      const savedKittyName = await csmcl_qkitty_backend.get_kitty_name();
      
      if (savedKittyName && savedKittyName.length > 0) {
        // User has a bonded kitty
        this.kittyName = savedKittyName[0];
        console.log(`Dimensional bond detected with ${this.kittyName}`);
        
        // Get the current kitty state
        const state = await csmcl_qkitty_backend.update_kitty_state();
        this.currentState = state.quantum_state;
        this.currentEnergyLevel = state.energy_level;
        this.currentZenMood = state.zen_mood;
        
        // Update UI with kitty data
        this.showKittyInfo();
        
        // Generate a special reunion greeting
        this.generateReunionGreeting();
      } else {
        // No bond detected, show the kitty naming form
        const kittyNamingForm = document.getElementById('kitty-naming-form');
        if (kittyNamingForm) {
          kittyNamingForm.style.display = 'block';
        }
      }
    } catch (error) {
      console.error('Error loading kitty data:', error);
    }
  }
  
  /**
   * Handle kitty naming submission
   * @param {string} name - The name for the kitty
   */
  async handleKittyNaming(name) {
    try {
      this.kittyName = name;
      
      // Show loading state
      this.showLoading('Creating quantum bond with your kitty...');
      
      // Save kitty name to backend to create a persistent dimensional bond
      await csmcl_qkitty_backend.save_kitty_name(name);
      
      // Get the current kitty state
      const state = await csmcl_qkitty_backend.update_kitty_state();
      this.currentState = state.quantum_state;
      this.currentEnergyLevel = state.energy_level;
      this.currentZenMood = state.zen_mood;
      
      // Generate a wisdom response for the new bond
      const wisdom = await csmcl_qkitty_backend.generate_kitty_wisdom(name, ['bonding', 'general']);
      
      // If the backend doesn't have bonding templates, create a special message
      if (wisdom.content.includes('meditating deeply')) {
        wisdom.content = `Your quantum kitty ${name} has formed a resonant bond with you across dimensions! The quantum field has acknowledged your connection.`;
      }
      
      // Update the UI with the response
      this.updateQuantumResponse(wisdom);
      
      // Add quantum bond animation effect
      const detailsElement = document.getElementById('quantum-details');
      if (detailsElement) {
        detailsElement.classList.add('quantum-bond-active');
        
        // Remove the class after animation completes
        setTimeout(() => {
          detailsElement.classList.remove('quantum-bond-active');
        }, 3000);
      }
      
      // Update auth UI to hide the naming form
      this.updateAuthUI();
    } catch (error) {
      console.error('Error naming kitty:', error);
      this.showError(`Quantum fluctuation detected: ${error.message}`);
    }
  }
  
  /**
   * Generate a special greeting for returning users with an existing kitty bond
   * This creates a sense of dimensional continuity and recognition
   */
  async generateReunionGreeting() {
    try {
      // Show loading state
      this.showLoading('Quantum bond resonating across dimensions...');
      
      // Generate a special reunion wisdom message
      const reunionContext = 'reunion';
      const wisdom = await csmcl_qkitty_backend.generate_kitty_wisdom(this.kittyName, [reunionContext, 'general']);
      
      // Update the greeting section with a special reunion message
      const greetingElement = document.getElementById('greeting');
      if (greetingElement) {
        greetingElement.className = 'quantum-active reunion-pulse';
        
        // If the backend doesn't have reunion templates, create a special message here
        if (wisdom.content.includes('meditating deeply')) {
          const reunionPhrases = [
            `${this.kittyName} recognizes your quantum signature across the dimensional fold!`,
            `The bond between you and ${this.kittyName} resonates through spacetime.`,
            `${this.kittyName} purrs with delight as your energies synchronize once again.`,
            `Your return causes ripples in ${this.kittyName}'s quantum field of awareness.`,
            `${this.kittyName} has been waiting for you in this dimension.`
          ];
          
          // Select a phrase based on current time for variety
          const phraseIndex = Math.floor(Date.now() / 1000) % reunionPhrases.length;
          greetingElement.textContent = reunionPhrases[phraseIndex];
        } else {
          greetingElement.textContent = wisdom.content;
        }
      }
      
      // Create the HTML for the quantum details
      this.updateQuantumResponse(wisdom);
      
    } catch (error) {
      console.error('Error generating reunion greeting:', error);
    }
  }
  
  /**
   * Display the kitty information for a returning user
   */
  showKittyInfo() {
    // Create a welcome back message
    const greetingElement = document.getElementById('greeting');
    if (greetingElement) {
      greetingElement.className = 'quantum-active';
      greetingElement.textContent = `Welcome back! Your quantum kitty ${this.kittyName} is ${this.currentState.toLowerCase()} with a ${this.currentZenMood.toLowerCase()} zen mood and energy level ${this.currentEnergyLevel}.`;
    }
    
    // Create energy level bars
    const energyBars = this.renderEnergyBars(this.currentEnergyLevel);
    
    // Create the HTML for the quantum details
    const html = `
      <div class="quantum-details">
        <div class="quantum-state-container">
          <div class="quantum-state">
            <h3>Quantum State</h3>
            <div class="state-badge ${this.currentState.toLowerCase()}">${this.currentState}</div>
          </div>
          
          <div class="zen-mood">
            <h3>Zen Mood</h3>
            <div class="mood-badge ${this.currentZenMood.toLowerCase()}">${this.currentZenMood}</div>
          </div>
          
          <div class="energy-level">
            <h3>Energy Level</h3>
            <div class="energy-meter">
              ${energyBars}
            </div>
            <div class="energy-value">${this.currentEnergyLevel}/10</div>
          </div>
        </div>
        
        <div class="kitty-actions">
          <button id="pet-kitty-button" class="quantum-button">Pet ${this.kittyName}</button>
          <button id="feed-kitty-button" class="quantum-button">Feed ${this.kittyName}</button>
          <button id="request-wisdom-button" class="quantum-button">Request Quantum Wisdom</button>
        </div>
      </div>
    `;
    
    // Update the quantum details element
    const detailsElement = document.getElementById('quantum-details');
    if (detailsElement) {
      detailsElement.innerHTML = html;
      
      // Add event listeners to the buttons
      const petButton = document.getElementById('pet-kitty-button');
      if (petButton) {
        petButton.addEventListener('click', () => this.handlePetKitty(this.kittyName));
      }
      
      const feedButton = document.getElementById('feed-kitty-button');
      if (feedButton) {
        feedButton.addEventListener('click', () => this.handleFeedKitty(this.kittyName));
      }
      
      const wisdomButton = document.getElementById('request-wisdom-button');
      if (wisdomButton) {
        wisdomButton.addEventListener('click', () => this.requestWisdom());
      }
    }
  }

  /**
   * Set up event listeners for form submissions and button clicks
   */
  setupEventListeners() {
    // Set up Internet Identity login button
    const loginButton = document.getElementById('login-button');
    if (loginButton) {
      loginButton.addEventListener('click', () => this.login());
    }
    
    // Set up Internet Identity logout button
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
      logoutButton.addEventListener('click', () => this.logout());
    }
    
    // Set up kitty naming form
    const kittyNamingForm = document.getElementById('kitty-naming-form');
    if (kittyNamingForm) {
      kittyNamingForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const kittyName = document.getElementById('kitty-name').value.trim();
        if (kittyName) {
          this.handleKittyNaming(kittyName);
        }
      });
    }
    
    // Make name suggestions clickable
    const suggestions = document.querySelectorAll('.suggestion');
    if (suggestions) {
      suggestions.forEach(suggestion => {
        suggestion.addEventListener('click', () => {
          const nameInput = document.getElementById('kitty-name');
          nameInput.value = suggestion.textContent;
          nameInput.focus();
          // Add a subtle quantum effect when selecting a name
          suggestion.style.transform = 'scale(1.1)';
          setTimeout(() => {
            suggestion.style.transform = 'translateY(-1px)';
          }, 200);
        });
      });
    }
    
    // Legacy greeting form
    const legacyGreetingForm = document.getElementById('greeting-form');
    if (legacyGreetingForm) {
      legacyGreetingForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = document.getElementById('name').value;
        if (name) {
          this.handleQuantumGreet(name);
        }
      });
    }
    
    // Quantum greeting form
    const greetingForm = document.getElementById('quantum-greeting-form');
    if (greetingForm) {
      greetingForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(greetingForm);
        const name = formData.get('name') || 'Quantum Explorer';
        this.handleQuantumGreet(name);
      });
    }
    
    // Set up pet kitty button
    const petButton = document.getElementById('pet-kitty-button');
    if (petButton) {
      petButton.addEventListener('click', () => {
        // If authenticated, pet the user's named kitty
        if (this.isAuthenticated && this.kittyName) {
          this.handlePetKitty(this.kittyName);
        } else {
          this.handlePetKitty();
        }
      });
    }
    
    // Set up feed kitty button
    const feedButton = document.getElementById('feed-kitty-button');
    if (feedButton) {
      feedButton.addEventListener('click', () => {
        // If authenticated, feed the user's named kitty
        if (this.isAuthenticated && this.kittyName) {
          this.handleFeedKitty(this.kittyName);
        } else {
          this.handleFeedKitty();
        }
      });
    }
  }

  /**
   * Handle the quantum greeting request
   * @param {string} name - The visitor's name
   */
  async handleQuantumGreet(name) {
    try {
      // Store the name for future interactions
      this.currentName = name;
      
      // Show loading state
      this.showLoading('Quantum calculation in progress...');
      
      // Call the backend canister
      const response = await csmcl_qkitty_backend.quantum_greet(name);
      
      // Update the UI with the response
      this.updateQuantumResponse(response);
    } catch (error) {
      console.error('Error calling quantum_greet:', error);
      this.showError(`Quantum fluctuation detected: ${error.message}`);
    }
  }

  /**
   * Handle petting the quantum kitty
   * @param {string} kittyName - Optional name of the kitty to pet
   */
  async handlePetKitty(kittyName) {
    try {
      // Show loading state
      this.showLoading('Quantum purring detected...');
      
      // For now, we'll just call quantum_greet since we don't have a pet_kitty function yet
      // In the future, you can implement a pet_kitty function in the backend
      const response = await csmcl_qkitty_backend.quantum_greet(this.currentName || 'Kitty Petter');
      
      // Modify the response to make it pet-specific
      if (kittyName) {
        response.greeting = `${kittyName} purrs contentedly as quantum particles dance around. The vibrations create a soothing pattern across dimensions.`;
      } else {
        response.greeting = response.greeting.replace('Meow there', 'Purrrr');
      }
      
      response.quantum_state = 'Contented';
      
      // Update the UI with the response
      this.updateQuantumResponse(response);
      
      // If we have a named kitty, store the updated state
      if (this.isAuthenticated && this.kittyName) {
        this.currentState = response.quantum_state;
        // TODO: Store updated state in backend
      }
    } catch (error) {
      console.error('Error petting kitty:', error);
      this.showError(`The quantum kitty is too energetic right now: ${error.message}`);
    }
  }

  /**
   * Handle feeding the quantum kitty
   * @param {string} kittyName - Optional name of the kitty to feed
   */
  async handleFeedKitty(kittyName) {
    try {
      // Show loading state
      this.showLoading('Quantum treats materializing...');
      
      // For now, we'll just call quantum_greet since we don't have a feed_kitty function yet
      // In the future, you can implement a feed_kitty function in the backend
      const response = await csmcl_qkitty_backend.quantum_greet(this.currentName || 'Kitty Feeder');
      
      // Modify the response to make it food-specific
      if (kittyName) {
        response.greeting = `${kittyName} devours the quantum treats, causing energy fluctuations across multiple dimensions!`;
      } else {
        response.greeting = 'Nom nom nom... The quantum kitty enjoys the treats across multiple dimensions!';
      }
      
      // Increase energy but cap at 10
      response.energy_level = Math.min(10, response.energy_level + 2);
      
      // Update the UI with the response
      this.updateQuantumResponse(response);
      
      // If we have a named kitty, store the updated energy level
      if (this.isAuthenticated && this.kittyName) {
        this.currentEnergyLevel = response.energy_level;
        // TODO: Store updated energy level in backend
      }
    } catch (error) {
      console.error('Error feeding kitty:', error);
      this.showError(`The quantum treats phased through reality: ${error.message}`);
    }
  }
  
  /**
   * Show loading state in the quantum details area
   * @param {string} message - The loading message to display
   */
  showLoading(message) {
    const detailsElement = document.getElementById('quantum-details');
    if (detailsElement) {
      detailsElement.innerHTML = `<div class="loading">${message}</div>`;
    }
  }
  
  /**
   * Show error state in the quantum details area
   * @param {string} message - The error message to display
   */
  showError(message) {
    const detailsElement = document.getElementById('quantum-details');
    if (detailsElement) {
      detailsElement.innerHTML = `<div class="error">${message}</div>`;
    }
    
    // Also update the greeting to show error state
    const greetingElement = document.getElementById('greeting');
    if (greetingElement) {
      greetingElement.className = 'quantum-error';
      greetingElement.textContent = 'The quantum kitty encountered a disturbance in the quantum field!';
    }
  }

  /**
   * Update the global state from the backend
   */
  async updateGlobalState() {
    try {
      // Call the backend to update the global kitty state
      const state = await csmcl_qkitty_backend.update_kitty_state();
      
      // Store the state for future interactions
      this.currentState = state.quantum_state;
      this.currentEnergyLevel = state.energy_level;
      this.currentZenMood = state.zen_mood;
      
      console.log('Global state updated:', state);
      
      // If we're authenticated and have a kitty, update the UI
      if (this.isAuthenticated && this.kittyName) {
        this.showKittyInfo();
      }
    } catch (error) {
      console.error('Error updating global state:', error);
    }
  }
  
  /**
   * Request wisdom from the quantum kitty
   * @param {string} context - The context for the wisdom (e.g., 'general', 'birthday', 'team')
   */
  async requestWisdom(context = 'general') {
    try {
      // Show loading state
      this.showLoading('Quantum wisdom materializing...');
      
      // Call the backend to generate wisdom
      const wisdom = await csmcl_qkitty_backend.generate_kitty_wisdom(this.kittyName, [context]);
      
      // Save state for future interactions
      this.currentState = wisdom.quantum_state;
      this.currentEnergyLevel = wisdom.energy_level;
      this.currentZenMood = wisdom.zen_mood;
      
      // Update the greeting section
      const greetingElement = document.getElementById('greeting');
      if (greetingElement) {
        greetingElement.className = 'quantum-active';
        greetingElement.textContent = wisdom.content;
      }
      
      // Create energy level bars
      const energyBars = this.renderEnergyBars(wisdom.energy_level);
      
      // Create the HTML for the quantum details
      const html = `
        <div class="quantum-details">
          <div class="wisdom-container">
            <div class="wisdom-content">${wisdom.content}</div>
            <div class="wisdom-context">${context}</div>
          </div>
          
          <div class="quantum-state-container">
            <div class="quantum-state">
              <h3>Quantum State</h3>
              <div class="state-badge ${wisdom.quantum_state.toLowerCase()}">${wisdom.quantum_state}</div>
            </div>
            
            <div class="zen-mood">
              <h3>Zen Mood</h3>
              <div class="mood-badge ${wisdom.zen_mood.toLowerCase()}">${wisdom.zen_mood}</div>
            </div>
            
            <div class="energy-level">
              <h3>Energy Level</h3>
              <div class="energy-meter">
                ${energyBars}
              </div>
              <div class="energy-value">${wisdom.energy_level}/10</div>
            </div>
          </div>
          
          <div class="wisdom-actions">
            <button class="wisdom-button" data-context="general">General Wisdom</button>
            <button class="wisdom-button" data-context="birthday">Birthday Wisdom</button>
            <button class="wisdom-button" data-context="team">Team Wisdom</button>
          </div>
        </div>
      `;
      
      // Update the quantum details element
      const detailsElement = document.getElementById('quantum-details');
      if (detailsElement) {
        detailsElement.innerHTML = html;
        
        // Add event listeners to wisdom buttons
        const wisdomButtons = detailsElement.querySelectorAll('.wisdom-button');
        wisdomButtons.forEach(button => {
          button.addEventListener('click', () => {
            const context = button.getAttribute('data-context');
            this.requestWisdom(context);
          });
        });
      }
    } catch (error) {
      console.error('Error requesting wisdom:', error);
      this.showError(`The quantum wisdom is currently folded: ${error.message}`);
    }
  }
  
  /**
   * Update the quantum response UI with the data from the backend
   * @param {Object} response - The response from the backend
   */
  updateQuantumResponse(response) {
    // Save state for future interactions
    this.currentState = response.quantum_state;
    this.currentEnergyLevel = response.energy_level;
    this.currentZenMood = response.zen_mood || 'Tranquil'; // Fallback for older responses
    
    // Update the greeting section
    const greetingElement = document.getElementById('greeting');
    if (greetingElement) {
      greetingElement.className = 'quantum-active';
      greetingElement.textContent = response.greeting;
    }
    
    // Create energy level bars
    const energyBars = this.renderEnergyBars(response.energy_level);
    
    // Create the HTML for the quantum details
    const html = `
      <div class="quantum-details">
        <div class="quantum-state">
          <h3>Quantum State</h3>
          <div class="state-badge ${response.quantum_state.toLowerCase()}">${response.quantum_state}</div>
        </div>
        
        ${response.zen_mood ? `
        <div class="zen-mood">
          <h3>Zen Mood</h3>
          <div class="mood-badge ${response.zen_mood.toLowerCase()}">${response.zen_mood}</div>
        </div>` : ''}
        
        <div class="energy-level">
          <h3>Energy Level</h3>
          <div class="energy-meter">
            ${energyBars}
          </div>
          <div class="energy-value">${response.energy_level}/10</div>
        </div>
        
        ${this.isAuthenticated && this.kittyName ? `
        <div class="wisdom-request">
          <button id="request-wisdom-button" class="quantum-button">Request Quantum Wisdom</button>
        </div>` : ''}
      </div>
    `;
    
    // Update the quantum details element
    const detailsElement = document.getElementById('quantum-details');
    if (detailsElement) {
      detailsElement.innerHTML = html;
      
      // Add event listener to wisdom button if it exists
      const wisdomButton = document.getElementById('request-wisdom-button');
      if (wisdomButton) {
        wisdomButton.addEventListener('click', () => this.requestWisdom());
      }
    }
  }

  /**
   * Render the energy level bars HTML
   * @param {number} level - Energy level (1-10)
   * @returns {string} HTML for the energy bars
   */
  renderEnergyBars(level) {
    const maxLevel = 10;
    let barsHtml = '';
    
    for (let i = 0; i < maxLevel; i++) {
      const isActive = i < level;
      const opacity = isActive ? (1 - (i * 0.1)) : 0.1;
      barsHtml += `<div class="energy-bar ${isActive ? 'active' : ''}" style="height: ${(i+1) * 3}px; opacity: ${opacity}"></div>`;
    }
    
    return barsHtml;
  }
}

// Initialize the controller when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.quantumKitty = new QuantumKittyController();
});

export default QuantumKittyController;
