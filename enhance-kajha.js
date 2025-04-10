// This script enhances the kajha.html file with more interactive and visually stimulating effects
// It also fixes the JavaScript error in the rotateChartBtn event listener

document.addEventListener('DOMContentLoaded', function() {
    // Fix the rotateChartBtn event listener
    const rotateChartBtn = document.getElementById('rotateChartBtn');
    if (rotateChartBtn) {
        // Remove the existing event listener with the error
        rotateChartBtn.removeEventListener('click', null);
        // Add the correct event listener
        rotateChartBtn.addEventListener('click', rotateChart);
    }

    // Add particle background
    loadParticles();
    
    // Add 3D depth effects to cards
    addDepthEffects();
    
    // Add gradient text animation
    addGradientTextEffects();
    
    // Add ripple effects to buttons
    addRippleEffects();
    
    // Add GSAP animations
    addGSAPAnimations();
    
    // Add parallax scrolling effects
    addParallaxEffects();
});

// Function to load particles.js
function loadParticles() {
    // Check if particles.js is loaded
    if (typeof particlesJS === 'undefined') {
        // Load particles.js script
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js';
        script.onload = initParticles;
        document.head.appendChild(script);
    } else {
        initParticles();
    }
}

// Initialize particles
function initParticles() {
    // Create particles container if it doesn't exist
    if (!document.getElementById('particles-js')) {
        const particlesContainer = document.createElement('div');
        particlesContainer.id = 'particles-js';
        particlesContainer.style.position = 'fixed';
        particlesContainer.style.width = '100%';
        particlesContainer.style.height = '100%';
        particlesContainer.style.top = '0';
        particlesContainer.style.left = '0';
        particlesContainer.style.zIndex = '-1';
        particlesContainer.style.pointerEvents = 'none';
        document.body.insertBefore(particlesContainer, document.body.firstChild);
    }

    // Configure particles
    particlesJS('particles-js', {
        "particles": {
            "number": {
                "value": 30,
                "density": {
                    "enable": true,
                    "value_area": 800
                }
            },
            "color": {
                "value": "#5D5CDE"
            },
            "shape": {
                "type": "circle",
                "stroke": {
                    "width": 0,
                    "color": "#000000"
                },
                "polygon": {
                    "nb_sides": 5
                }
            },
            "opacity": {
                "value": 0.3,
                "random": true,
                "anim": {
                    "enable": true,
                    "speed": 1,
                    "opacity_min": 0.1,
                    "sync": false
                }
            },
            "size": {
                "value": 5,
                "random": true,
                "anim": {
                    "enable": true,
                    "speed": 2,
                    "size_min": 0.1,
                    "sync": false
                }
            },
            "line_linked": {
                "enable": true,
                "distance": 150,
                "color": "#5D5CDE",
                "opacity": 0.2,
                "width": 1
            },
            "move": {
                "enable": true,
                "speed": 1,
                "direction": "none",
                "random": true,
                "straight": false,
                "out_mode": "out",
                "bounce": false,
                "attract": {
                    "enable": false,
                    "rotateX": 600,
                    "rotateY": 1200
                }
            }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": {
                    "enable": true,
                    "mode": "grab"
                },
                "onclick": {
                    "enable": true,
                    "mode": "push"
                },
                "resize": true
            },
            "modes": {
                "grab": {
                    "distance": 140,
                    "line_linked": {
                        "opacity": 0.5
                    }
                },
                "bubble": {
                    "distance": 400,
                    "size": 40,
                    "duration": 2,
                    "opacity": 8,
                    "speed": 3
                },
                "repulse": {
                    "distance": 200,
                    "duration": 0.4
                },
                "push": {
                    "particles_nb": 4
                },
                "remove": {
                    "particles_nb": 2
                }
            }
        },
        "retina_detect": true
    });
}

// Add 3D depth effects to cards
function addDepthEffects() {
    // Add perspective to body
    document.body.classList.add('perspective-1000');
    
    // Add depth effect to cards
    const cards = document.querySelectorAll('.card-gradient, .framework-card, .highlight');
    cards.forEach(card => {
        card.classList.add('depth-card');
        
        // Add tilt effect on mouse move
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const xPercent = (x / rect.width - 0.5) * 20;
            const yPercent = (y / rect.height - 0.5) * 20;
            
            this.style.transform = `perspective(1000px) rotateX(${-yPercent}deg) rotateY(${xPercent}deg) translateZ(10px)`;
        });
        
        // Reset on mouse leave
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
    
    // Add shadow effect
    const containers = document.querySelectorAll('.tab-btn, .card-gradient, .framework-card');
    containers.forEach(container => {
        container.classList.add('depth-shadow');
    });
}

// Add gradient text animation
function addGradientTextEffects() {
    const headings = document.querySelectorAll('h1, h2, h3');
    headings.forEach(heading => {
        heading.classList.add('gradient-text');
    });
}

// Add ripple effects to buttons
function addRippleEffects() {
    const buttons = document.querySelectorAll('button, .tab-btn');
    buttons.forEach(button => {
        button.classList.add('ripple');
    });
}

// Add GSAP animations
function addGSAPAnimations() {
    // Check if GSAP is loaded
    if (typeof gsap === 'undefined') {
        // Load GSAP script
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.4/gsap.min.js';
        script.onload = initGSAP;
        document.head.appendChild(script);
    } else {
        initGSAP();
    }
}

// Initialize GSAP animations
function initGSAP() {
    // Animate header elements
    gsap.from('header h1', { 
        duration: 1.5, 
        y: -50, 
        opacity: 0, 
        ease: 'power3.out' 
    });
    
    gsap.from('header p', { 
        duration: 1.5, 
        y: -30, 
        opacity: 0, 
        delay: 0.3, 
        ease: 'power3.out' 
    });
    
    // Animate tab buttons
    gsap.from('.tab-btn', { 
        duration: 0.8, 
        y: 30, 
        opacity: 0, 
        stagger: 0.1, 
        delay: 0.5, 
        ease: 'back.out(1.7)' 
    });
    
    // Animate content cards
    gsap.from('.card-gradient', { 
        duration: 1, 
        y: 50, 
        opacity: 0, 
        stagger: 0.2, 
        delay: 0.8, 
        ease: 'power2.out' 
    });
    
    // Add scroll animations
    document.querySelectorAll('.tab-content').forEach(content => {
        const elements = content.querySelectorAll('.card-gradient, .framework-card, .highlight');
        
        elements.forEach(element => {
            gsap.from(element, {
                scrollTrigger: {
                    trigger: element,
                    start: 'top bottom-=100',
                    toggleActions: 'play none none none'
                },
                duration: 0.8,
                y: 50,
                opacity: 0,
                ease: 'power2.out'
            });
        });
    });
}

// Add parallax effects
function addParallaxEffects() {
    // Add parallax effect to background
    const bg = document.querySelector('.fixed.inset-0');
    if (bg) {
        bg.classList.add('parallax-bg');
    }
    
    // Add parallax effect on scroll
    window.addEventListener('scroll', function() {
        const scrollY = window.scrollY;
        
        // Parallax for header
        const header = document.querySelector('header');
        if (header) {
            header.style.transform = `translateY(${scrollY * 0.1}px)`;
        }
        
        // Parallax for background
        if (bg) {
            bg.style.transform = `translateY(${scrollY * 0.05}px) translateZ(-10px) scale(2)`;
        }
    });
}

// Rotate chart function (fixed version)
function rotateChart() {
    if (!window.skillsChart) return;
    
    window.chartRotation = window.chartRotation || 0;
    window.chartRotation += 60;
    window.skillsChart.options.rotation = window.chartRotation * Math.PI / 180;
    window.skillsChart.update();
}
