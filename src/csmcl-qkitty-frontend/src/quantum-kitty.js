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
    this.kittyName = '';
    
    // Internet Identity related state
    this.authClient = null;
    this.identity = null;
    this.principal = null;
    this.isAuthenticated = false;
    
    // Initialize auth client and event listeners
    this.initAuth();
    this.setupEventListeners();
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
   */
  async loadKittyData() {
    try {
      // TODO: Implement backend call to get user's kitty data
      // For now, we'll use mock data
      
      // Mock check if user has a kitty
      const hasKitty = false; // This would come from the backend
      
      if (hasKitty) {
        // Mock kitty data
        this.kittyName = 'Qubit'; // This would come from the backend
        this.currentState = 'Superposition';
        this.currentEnergyLevel = 7;
        
        // Update UI with kitty data
        this.showKittyInfo();
      } else {
        // Show the kitty naming form
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
      
      // TODO: Store kitty name in backend
      // For now, we'll just call quantum_greet
      const response = await csmcl_qkitty_backend.quantum_greet(name);
      
      // Modify the response to be kitty-specific with quantum-inspired language
      response.greeting = `Your quantum kitty ${name} has formed a resonant bond with you across dimensions! The quantum field has acknowledged your connection.`;
      
      // Update the UI with the response
      this.updateQuantumResponse(response);
      
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
   * Display the kitty information for a returning user
   */
  showKittyInfo() {
    // Create a welcome back message
    const greetingElement = document.getElementById('greeting');
    if (greetingElement) {
      greetingElement.className = 'quantum-active';
      greetingElement.textContent = `Welcome back! Your quantum kitty ${this.kittyName} is ${this.currentState.toLowerCase()} with energy level ${this.currentEnergyLevel}.`;
    }
    
    // Create energy level bars
    const energyBars = this.renderEnergyBars(this.currentEnergyLevel);
    
    // Create the HTML for the quantum details
    const html = `
      <div class="quantum-details">
        <div class="quantum-state">
          <h3>Quantum State</h3>
          <div class="state-badge ${this.currentState.toLowerCase()}">${this.currentState}</div>
        </div>
        
        <div class="energy-level">
          <h3>Energy Level</h3>
          <div class="energy-meter">
            ${energyBars}
          </div>
          <div class="energy-value">${this.currentEnergyLevel}/10</div>
        </div>
      </div>
    `;
    
    // Update the quantum details element
    const detailsElement = document.getElementById('quantum-details');
    if (detailsElement) {
      detailsElement.innerHTML = html;
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
   * Update the quantum response UI with the data from the backend
   * @param {Object} response - The response from the backend
   */
  updateQuantumResponse(response) {
    // Save state for future interactions
    this.currentState = response.quantum_state;
    this.currentEnergyLevel = response.energy_level;
    
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
        
        <div class="energy-level">
          <h3>Energy Level</h3>
          <div class="energy-meter">
            ${energyBars}
          </div>
          <div class="energy-value">${response.energy_level}/10</div>
        </div>
      </div>
    `;
    
    // Update the quantum details element
    const detailsElement = document.getElementById('quantum-details');
    if (detailsElement) {
      detailsElement.innerHTML = html;
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
