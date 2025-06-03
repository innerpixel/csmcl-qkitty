// Import the auto-generated JavaScript bindings for our backend canister
import { csmcl_qkitty_backend } from 'declarations/csmcl-qkitty-backend';

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
    
    // Initialize direct event listeners
    this.setupEventListeners();
  }

  /**
   * Set up event listeners for form submissions and button clicks
   */
  setupEventListeners() {
    // Set up form submission
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
        this.handlePetKitty();
      });
    }
    
    // Set up feed kitty button
    const feedButton = document.getElementById('feed-kitty-button');
    if (feedButton) {
      feedButton.addEventListener('click', () => {
        this.handleFeedKitty();
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
   * This is a placeholder for future implementation
   */
  async handlePetKitty() {
    try {
      // Show loading state
      this.showLoading('Quantum purring detected...');
      
      // For now, we'll just call quantum_greet since we don't have a pet_kitty function yet
      // In the future, you can implement a pet_kitty function in the backend
      const response = await csmcl_qkitty_backend.quantum_greet(this.currentName || 'Kitty Petter');
      
      // Modify the response to make it pet-specific
      response.greeting = response.greeting.replace('Meow there', 'Purrrr');
      response.quantum_state = 'Contented';
      
      // Update the UI with the response
      this.updateQuantumResponse(response);
    } catch (error) {
      console.error('Error petting kitty:', error);
      this.showError(`The quantum kitty is too energetic right now: ${error.message}`);
    }
  }

  /**
   * Handle feeding the quantum kitty
   * This is a placeholder for future implementation
   */
  async handleFeedKitty() {
    try {
      // Show loading state
      this.showLoading('Quantum treats materializing...');
      
      // For now, we'll just call quantum_greet since we don't have a feed_kitty function yet
      // In the future, you can implement a feed_kitty function in the backend
      const response = await csmcl_qkitty_backend.quantum_greet(this.currentName || 'Kitty Feeder');
      
      // Modify the response to make it food-specific
      response.greeting = 'Nom nom nom... The quantum kitty enjoys the treats across multiple dimensions!';
      response.energy_level = Math.min(10, response.energy_level + 2); // Increase energy
      
      // Update the UI with the response
      this.updateQuantumResponse(response);
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
