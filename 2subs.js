/**
 * 2subs.js - Core Functionality and Cloudflare Authentication
 * Handles authentication, core functionality, and Cloudflare integration
 */

// Cloudflare credentials - REPLACE THESE WITH ACTUAL CREDENTIALS
const CLOUDFLARE_ACCOUNT_ID = "your-cloudflare-account-id";
const CLOUDFLARE_API_TOKEN = "your-cloudflare-api-token";
const CLOUDFLARE_ZONE_ID = "your-cloudflare-zone-id";

// Legal reference database
const legalDB = {
    'MCOB': {
        citation: 'Mortgage Conduct of Business Rules 2.2A.3',
        relevance: 'Prohibits false claims of official status',
        quote: 'A firm must not claim, nor give the impression, that it is acting for a government or public body...'
    },
    'CPUTR': {
        citation: 'Consumer Protection from Unfair Trading Regulations 2008 Reg.9',
        relevance: 'Prohibition of aggressive commercial practices',
        quote: 'A practice is aggressive if significantly impairs consumer freedom through coercion...'
    },
    'FCA': {
        citation: 'FCA Handbook PRIN 2.1.1',
        relevance: 'Principles for Businesses',
        quote: 'A firm must conduct its business with integrity and due skill, care and diligence...'
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing High Court Evidence System...');
    initializeCloudflare();
    setupEventListeners();
});

// Initialize Cloudflare connection
function initializeCloudflare() {
    console.log('Establishing secure connection to Cloudflare...');
    
    // This would be replaced with actual Cloudflare SDK initialization
    // For example: const cf = new Cloudflare.Client({ token: CLOUDFLARE_API_TOKEN });
    
    // For now, we'll simulate a successful connection
    setTimeout(() => {
        console.log('Cloudflare connection established');
        checkAuthentication();
    }, 500);
}

// Check user authentication status
function checkAuthentication() {
    // In a real implementation, this would verify the user's authentication status
    // with Cloudflare Access or similar service
    
    // For demonstration, we'll assume the user is authenticated
    console.log('User authenticated');
    loadCaseData();
}

// Load case data from Cloudflare KV or D1
function loadCaseData() {
    console.log('Loading case data from Cloudflare...');
    
    // In a real implementation, this would fetch data from Cloudflare KV or D1
    // For example: 
    // cf.kv.get('case-2025-MAK-001').then(data => {
    //     displayCaseData(JSON.parse(data));
    // });
    
    // For demonstration, we'll use setTimeout to simulate network request
    setTimeout(() => {
        console.log('Case data loaded');
        // We'll rely on the static data in the HTML for now
    }, 300);
}

// Set up event listeners
function setupEventListeners() {
    // Modal handling for legal references
    document.querySelectorAll('.legal-ref').forEach(el => {
        el.addEventListener('click', () => {
            const ref = el.dataset.ref;
            const data = legalDB[ref];
            if (data) {
                document.getElementById('modalTitle').textContent = data.citation;
                document.getElementById('modalContent').innerHTML = `
                    <p class="dark:text-gray-300"><strong>Relevance:</strong> ${data.relevance}</p>
                    <blockquote class="pl-4 border-l-2 border-blue-500 dark:text-gray-400">${data.quote}</blockquote>
                `;
                document.getElementById('legalModal').classList.remove('hidden');
            }
        });
    });

    // Close modal
    window.closeModal = function() {
        document.getElementById('legalModal').classList.add('hidden');
    };

    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        
        // In a real implementation, save preference to Cloudflare KV
        // cf.kv.put('user-preferences', JSON.stringify({ darkMode: document.documentElement.classList.contains('dark') }));
    });

    // Navigation highlighting
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('nav a');
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 150 && rect.bottom >= 150) {
                navLinks.forEach(link => {
                    link.classList.remove('bg-blue-100', 'dark:bg-blue-900');
                    if (link.getAttribute('href') === `#${section.id}`) {
                        link.classList.add('bg-blue-100', 'dark:bg-blue-900');
                    }
                });
            }
        });
    });
}

// Export functions for use in other modules
window.coreModule = {
    legalDB,
    checkAuthentication,
    loadCaseData
};
