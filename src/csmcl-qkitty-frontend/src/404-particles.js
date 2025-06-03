// Create quantum particles floating around the kitty
function createParticles() {
  console.log('Creating quantum particles...');
  const particlesContainer = document.getElementById('particles');
  
  if (!particlesContainer) {
    console.error('Particles container not found!');
    return;
  }
  
  // Clear any existing particles
  particlesContainer.innerHTML = '';
  
  const particleCount = 25; // More particles for a nicer effect
  console.log(`Creating ${particleCount} particles`);
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.classList.add('quantum-particle');
    
    // Random position
    particle.style.left = Math.random() * 80 + 10 + '%';
    particle.style.top = Math.random() * 80 + 10 + '%';
    
    // Random size
    const size = Math.random() * 15 + 5; // Smaller, more natural sizes
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    
    // Random animation delay and duration
    particle.style.animationDelay = Math.random() * 4 + 's';
    particle.style.animationDuration = (Math.random() * 6 + 4) + 's'; // Between 4-10s
    
    // Random color - beautiful quantum-themed gradients
    const hue = Math.random() * 60 + 240; // Blue to purple range
    particle.style.background = `radial-gradient(circle, hsla(${hue}, 80%, 60%, 0.8), hsla(${hue}, 80%, 60%, 0))`;
    particle.style.opacity = (Math.random() * 0.5 + 0.5).toString(); // Between 0.5 and 1.0
    
    particlesContainer.appendChild(particle);
  }
}

// Run immediately and also on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createParticles);
} else {
  createParticles();
}

// Also try again after a short delay
setTimeout(createParticles, 1000);
