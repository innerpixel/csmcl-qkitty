// Import our styles
import './index.scss';

// Import HTMX locally - this avoids Content Security Policy issues
import './htmx.min.js';

// Import our Quantum Kitty controller
import QuantumKittyController from './quantum-kitty';

// Initialize the controller when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Create a new instance of our controller
  window.quantumKitty = new QuantumKittyController();
  
  console.log('🐱 Quantum Kitty initialized and ready for interaction!');
});
