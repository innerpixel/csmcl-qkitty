import { html, render } from 'lit-html';
// Import the auto-generated JavaScript bindings for our backend canister
// These are created by dfx during the build process based on the Candid interface
import { csmcl_qkitty_backend } from 'declarations/csmcl-qkitty-backend';

// Import assets and styles
import logo from './logo2.svg';

/**
 * Main application class that handles state and user interactions
 * This follows a simple component-based architecture
 */
class App {
  // Initialize state properties
  greeting = '';       // Stores the greeting message from the backend
  quantumState = '';   // Stores the quantum state (Superposition, Entangled, etc.)
  energyLevel = 0;     // Stores the energy level (1-10)
  showQuantumResponse = false;

  /**
   * Constructor to initialize the component
   */
  constructor() {
    // Render the initial UI
    this.#render();
  }

  /**
   * Handles form submission to call the backend canister's quantum_greet function
   * This demonstrates how to call a canister function from the frontend
   */
  #handleSubmit = async (e) => {
    // Prevent default form submission behavior
    e.preventDefault();
    
    // Get the name from the input field, or use a default
    const name = document.getElementById('name').value.toString() || 'Quantum Explorer';
    
    try {
      // Call the quantum_greet function from the backend canister
      // This uses the auto-generated bindings from 'declarations/csmcl-qkitty-backend'
      // The call is asynchronous and returns a Promise
      const response = await csmcl_qkitty_backend.quantum_greet(name);
      
      // Update the component state with the response data
      this.greeting = response.greeting;
      this.quantumState = response.quantum_state;
      this.energyLevel = response.energy_level;
      this.showQuantumResponse = true;
      
      // Re-render the UI with the new data
      this.#render();
    } catch (error) {
      console.error("Error calling quantum_greet:", error);
      // Fallback to regular greeting
      this.greeting = await csmcl_qkitty_backend.greet(name);
      this.showQuantumResponse = false;
      this.#render();
    }
  };

  /**
   * Renders the energy level bars based on the energy level (1-10)
   * This dynamically generates the visual energy meter
   */
  #renderEnergyLevel(level) {
    const maxLevel = 10;
    const bars = Array(maxLevel).fill().map((_, i) => 
      html`<div class="energy-bar ${i < level ? 'active' : ''}" style="height: ${(i+1) * 3}px"></div>`
    );
    return html`<div class="energy-meter">${bars}</div>`;
  }

  /**
   * Renders the application UI using lit-html
   * This creates a declarative template that efficiently updates the DOM
   */
  #render() {
    // Create energy level bars based on the energy level (1-10)
    // This dynamically generates the visual energy meter
    const energyBars = this.#renderEnergyLevel(this.energyLevel);

    // Define the template for our app using lit-html
    // This is a tagged template literal that efficiently creates DOM elements
    const body = html`
      <main>
        <h1>CSMCL Quantum Kitty</h1>
        <img src="${logo}" alt="Quantum Kitty logo" style="max-width: 150px;" />
        <br />
        <br />
        <form action="#">
          <label for="name">Enter your name to meet the quantum kitty: &nbsp;</label>
          <input id="name" alt="Name" type="text" placeholder="Your name here" />
          <button type="submit">Meow!</button>
        </form>
        <section id="greeting" class="${this.showQuantumResponse ? 'quantum-active' : ''}">
          ${this.greeting}
        </section>
        ${this.showQuantumResponse ? html`
          <div class="quantum-info">
            <div class="quantum-state">
              <span class="label">Quantum State:</span> 
              <span class="value">${this.quantumState}</span>
            </div>
            <div class="energy-container">
              <span class="label">Energy Level:</span> 
              <span class="value">${this.energyLevel}/10</span>
              ${energyBars}
            </div>
          </div>
        ` : ''}
      </main>
      <style>
        main {
          font-family: 'Arial', sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          text-align: center;
          background: linear-gradient(145deg, #f0f4ff, #e6eeff);
          border-radius: 15px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        h1 {
          color: #6a11cb;
          margin-bottom: 1rem;
        }
        form {
          margin: 2rem 0;
        }
        input {
          padding: 0.5rem;
          border: 2px solid #ccc;
          border-radius: 5px;
          margin-right: 0.5rem;
          font-size: 1rem;
        }
        button {
          background: linear-gradient(45deg, #6a11cb, #2575fc);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 5px;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.3s ease;
        }
        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        #greeting {
          margin: 2rem 0;
          padding: 1rem;
          font-size: 1.2rem;
          border-radius: 10px;
          transition: all 0.5s ease;
        }
        #greeting.quantum-active {
          background: linear-gradient(45deg, rgba(106, 17, 203, 0.1), rgba(37, 117, 252, 0.1));
          box-shadow: 0 0 15px rgba(106, 17, 203, 0.2);
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 15px rgba(106, 17, 203, 0.2); }
          50% { box-shadow: 0 0 25px rgba(37, 117, 252, 0.4); }
          100% { box-shadow: 0 0 15px rgba(106, 17, 203, 0.2); }
        }
        .quantum-info {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-top: 2rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 10px;
        }
        .quantum-state, .energy-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .label {
          font-weight: bold;
          color: #6a11cb;
        }
        .value {
          color: #2575fc;
          font-weight: bold;
        }
        .energy-meter {
          display: flex;
          align-items: flex-end;
          gap: 2px;
          height: 30px;
          margin-left: 10px;
        }
        .energy-bar {
          width: 4px;
          background-color: #ddd;
          border-radius: 1px;
        }
        .energy-bar.active {
          background: linear-gradient(to top, #6a11cb, #2575fc);
        }
      </style>
    `;
    render(body, document.getElementById('root'));
    document
      .querySelector('form')
      .addEventListener('submit', this.#handleSubmit);
  }
}

export default App;
