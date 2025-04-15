/**
 * 3subds.js - UI Enhancement and Visual Elements
 * Handles UI improvements and visual elements for the legal evidence system
 */

// Initialize the UI enhancement module
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing UI enhancement module...');
    enhanceTimelineVisuals();
    setupAnimations();
    initializeResponsiveElements();
});

// Enhance timeline visuals with additional styling and effects
function enhanceTimelineVisuals() {
    console.log('Enhancing timeline visuals...');
    
    // Add visual indicators for timeline items
    const timelineItems = document.querySelectorAll('.timeline-marker');
    timelineItems.forEach((marker, index) => {
        // Add a slight delay to each marker for a staggered animation effect
        setTimeout(() => {
            marker.classList.add('animate-pulse');
            setTimeout(() => {
                marker.classList.remove('animate-pulse');
            }, 1000);
        }, index * 300);
    });
    
    // Add hover effects to timeline items
    const timelineContainers = document.querySelectorAll('.timeline-marker + div .p-4');
    timelineContainers.forEach(container => {
        container.addEventListener('mouseenter', () => {
            container.classList.add('shadow-lg');
            container.style.transform = 'translateY(-2px)';
            container.style.transition = 'all 0.3s ease';
        });
        
        container.addEventListener('mouseleave', () => {
            container.classList.remove('shadow-lg');
            container.style.transform = 'translateY(0)';
        });
    });
}

// Set up animations for page elements
function setupAnimations() {
    console.log('Setting up animations...');
    
    // Fade in sections as they come into view
    const sections = document.querySelectorAll('section');
    
    // Create an intersection observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    // Apply initial styles and observe each section
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(section);
    });
    
    // Add subtle animation to legal references
    const legalRefs = document.querySelectorAll('.legal-ref');
    legalRefs.forEach(ref => {
        ref.addEventListener('mouseenter', () => {
            ref.style.color = '#3b82f6';
            ref.style.transition = 'color 0.3s ease';
        });
        
        ref.addEventListener('mouseleave', () => {
            ref.style.color = '';
        });
    });
}

// Initialize responsive elements
function initializeResponsiveElements() {
    console.log('Initializing responsive elements...');
    
    // Make navigation sticky and responsive
    const nav = document.querySelector('nav');
    const navLinks = document.querySelectorAll('nav a');
    
    // Handle navigation on smaller screens
    function adjustNavigation() {
        if (window.innerWidth < 640) {
            navLinks.forEach(link => {
                link.classList.add('text-sm');
                link.classList.add('px-2');
                link.classList.remove('px-4');
            });
        } else {
            navLinks.forEach(link => {
                link.classList.remove('text-sm');
                link.classList.remove('px-2');
                link.classList.add('px-4');
            });
        }
    }
    
    // Call once on load
    adjustNavigation();
    
    // Add resize listener
    window.addEventListener('resize', adjustNavigation);
    
    // Enhance modal with animation
    const modal = document.getElementById('legalModal');
    const modalContent = modal.querySelector('div');
    
    // Override the closeModal function to add animation
    window.closeModal = function() {
        modalContent.style.transform = 'translateY(10px)';
        modalContent.style.opacity = '0';
        
        setTimeout(() => {
            modal.classList.add('hidden');
            // Reset for next opening
            modalContent.style.transform = '';
            modalContent.style.opacity = '';
        }, 300);
    };
    
    // Enhance modal opening
    document.querySelectorAll('.legal-ref').forEach(el => {
        el.addEventListener('click', () => {
            // Prepare animation
            modalContent.style.transform = 'translateY(10px)';
            modalContent.style.opacity = '0';
            modalContent.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
            
            // Show modal
            modal.classList.remove('hidden');
            
            // Trigger animation
            setTimeout(() => {
                modalContent.style.transform = 'translateY(0)';
                modalContent.style.opacity = '1';
            }, 10);
        });
    });
}

// Add logo enhancement functionality
function enhanceLogo() {
    const logo = document.querySelector('img[alt="Legal Logo"]');
    if (logo) {
        // Add subtle animation to logo on page load
        logo.style.opacity = '0';
        logo.style.transform = 'translateY(-10px)';
        logo.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        // Trigger animation after a short delay
        setTimeout(() => {
            logo.style.opacity = '1';
            logo.style.transform = 'translateY(0)';
        }, 300);
        
        // Add hover effect
        logo.addEventListener('mouseenter', () => {
            logo.style.transform = 'scale(1.05)';
            logo.style.transition = 'transform 0.3s ease';
        });
        
        logo.addEventListener('mouseleave', () => {
            logo.style.transform = 'scale(1)';
        });
    }
}

// Call logo enhancement after DOM is loaded
document.addEventListener('DOMContentLoaded', enhanceLogo);

// Export functions for use in other modules
window.uiModule = {
    enhanceTimelineVisuals,
    setupAnimations,
    initializeResponsiveElements,
    enhanceLogo
};
