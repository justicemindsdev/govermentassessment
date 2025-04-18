/**
<<<<<<< HEAD
 * 4subs.js - API Integration and Cloudflare Services
 * Handles API calls, data fetching, and Cloudflare service integration
 */

// Cloudflare API configuration - REPLACE WITH ACTUAL VALUES
const CF_API_CONFIG = {
    accountId: "your-cloudflare-account-id",
    apiToken: "your-cloudflare-api-token",
    workerUrl: "https://your-worker.your-subdomain.workers.dev",
    kvNamespace: "your-kv-namespace-id"
};

// Initialize the API integration module
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing API integration module...');
    initializeCloudflareServices();
});

// Initialize Cloudflare services
function initializeCloudflareServices() {
    console.log('Connecting to Cloudflare services...');
    
    // In a real implementation, this would initialize connections to various Cloudflare services
    // For demonstration, we'll simulate successful connections
    
    // Simulate connection to Cloudflare Workers
    setTimeout(() => {
        console.log('Connected to Cloudflare Workers');
        fetchCaseData();
    }, 300);
}

// Fetch case data from Cloudflare KV or Workers
async function fetchCaseData() {
    console.log('Fetching case data from Cloudflare...');
    
    // In a real implementation, this would fetch data from Cloudflare KV or Workers
    // For example:
    // try {
    //     const response = await fetch(`${CF_API_CONFIG.workerUrl}/api/case/2025-MAK-001`, {
    //         headers: {
    //             'Authorization': `Bearer ${CF_API_CONFIG.apiToken}`
    //         }
    //     });
    //     const data = await response.json();
    //     if (data.success) {
    //         processCaseData(data.case);
    //     }
    // } catch (error) {
    //     console.error('Error fetching case data:', error);
    // }
    
    // For demonstration, we'll use mock data
    setTimeout(() => {
        const mockCaseData = {
            id: "2025-MAK-001",
            title: "Ben Mak v Newlyn PLC",
            status: "Active",
            filingDate: "2025-01-30",
            lastUpdated: "2025-04-10",
            claimant: {
                name: "Ben Mak",
                representation: "Self-represented"
            },
            defendant: {
                name: "Newlyn PLC",
                representation: "Internal Legal Team"
            },
            claims: [
                {
                    id: "claim-001",
                    description: "Misrepresentation of legal authority",
                    laws: ["MCOB 2.2A.3", "CPUTR Reg.9"]
                },
                {
                    id: "claim-002",
                    description: "Aggressive commercial practices",
                    laws: ["CPUTR Reg.7", "FCA PRIN 2.1.1"]
                }
            ],
            timeline: [
                {
                    date: "2025-01-15",
                    event: "Initial Contact",
                    description: "Defendant's representative made false assertions about legal authority"
                },
                {
                    date: "2025-01-18",
                    event: "Phone Call",
                    description: "Verbal threats and continued misrepresentation"
                },
                {
                    date: "2025-01-25",
                    event: "Formal Complaint",
                    description: "Claimant filed formal complaint with defendant"
                },
                {
                    date: "2025-01-30",
                    event: "Court Filing",
                    description: "Claim filed with High Court"
                }
            ]
        };
        
        processCaseData(mockCaseData);
    }, 500);
}

// Process case data and update UI
function processCaseData(caseData) {
    console.log('Processing case data...');
    
    // Store case data for other modules to access
    window.caseData = caseData;
    
    // Update timeline with additional items from case data
    updateTimeline(caseData.timeline);
    
    console.log('Case data processed successfully');
}

// Update timeline with data from API
function updateTimeline(timelineData) {
    // Get the timeline container
    const timelineContainer = document.querySelector('#timeline .flex-col');
    if (!timelineContainer) return;
    
    // We already have one timeline item in the HTML, so we'll add the rest
    // Skip the first item since it's already in the HTML
    const additionalItems = timelineData.slice(1);
    
    // Create HTML for each additional timeline item
    additionalItems.forEach(item => {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'flex';
        timelineItem.innerHTML = `
            <div class="timeline-marker rounded-full bg-white dark:bg-gray-800"></div>
            <div class="ml-4 flex-1">
                <div class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <h3 class="font-bold mb-2 dark:text-white">${item.date} - ${item.event}</h3>
                    <p class="text-gray-600 dark:text-gray-300">
                        ${item.description}
                    </p>
                </div>
            </div>
        `;
        
        timelineContainer.appendChild(timelineItem);
    });
    
    // Re-initialize UI enhancements for the new timeline items
    if (window.uiModule && window.uiModule.enhanceTimelineVisuals) {
        window.uiModule.enhanceTimelineVisuals();
    }
}

// Upload evidence to Cloudflare R2 or Workers
async function uploadEvidence(file, metadata) {
    console.log('Uploading evidence to Cloudflare...');
    
    // In a real implementation, this would upload a file to Cloudflare R2 or Workers
    // For example:
    // try {
    //     const formData = new FormData();
    //     formData.append('file', file);
    //     formData.append('metadata', JSON.stringify(metadata));
    //     
    //     const response = await fetch(`${CF_API_CONFIG.workerUrl}/api/evidence/upload`, {
    //         method: 'POST',
    //         headers: {
    //             'Authorization': `Bearer ${CF_API_CONFIG.apiToken}`
    //         },
    //         body: formData
    //     });
    //     
    //     const data = await response.json();
    //     return data.success;
    // } catch (error) {
    //     console.error('Error uploading evidence:', error);
    //     return false;
    // }
    
    // For demonstration, we'll simulate a successful upload
    return new Promise(resolve => {
        setTimeout(() => {
            console.log('Evidence uploaded successfully');
            resolve(true);
        }, 1000);
    });
}

// Fetch legal reference data from Cloudflare KV
async function fetchLegalReference(referenceKey) {
    console.log(`Fetching legal reference: ${referenceKey}`);
    
    // In a real implementation, this would fetch data from Cloudflare KV
    // For example:
    // try {
    //     const response = await fetch(`${CF_API_CONFIG.workerUrl}/api/legal-reference/${referenceKey}`, {
    //         headers: {
    //             'Authorization': `Bearer ${CF_API_CONFIG.apiToken}`
    //         }
    //     });
    //     
    //     const data = await response.json();
    //     return data.reference;
    // } catch (error) {
    //     console.error('Error fetching legal reference:', error);
    //     return null;
    // }
    
    // For demonstration, we'll use the data from 2subs.js
    return new Promise(resolve => {
        setTimeout(() => {
            if (window.coreModule && window.coreModule.legalDB && window.coreModule.legalDB[referenceKey]) {
                resolve(window.coreModule.legalDB[referenceKey]);
            } else {
                resolve(null);
            }
        }, 200);
    });
}

// Export functions for use in other modules
window.apiModule = {
    fetchCaseData,
    uploadEvidence,
    fetchLegalReference
};
=======
 * DataManager.js - Efficient data management and retrieval
 * 
 * This module handles all data-related operations:
 * - Optimized data storage and indexing
 * - High-performance search functionality
 * - Lazy loading of data for improved memory usage
 */

export class DataManager {
    constructor() {
        // Initialize data structures
        this.categories = {};
        this.evidenceData = {};
        this.searchIndex = {};
        
        // Track loaded data for lazy loading
        this.loadedCategories = new Set();
        
        // Load essential data immediately
        this._initializeData();
    }
    
    /**
     * Initialize essential data
     * @private
     */
    _initializeData() {
        // Load evidence data (timestamps, transcripts, etc.)
        this._loadEvidenceData();
        
        // Build initial search index
        this._buildSearchIndex();
    }
    
    /**
     * Load evidence data with optimized structure
     * @private
     */
    _loadEvidenceData() {
        // This would normally fetch from an API, but for demo we'll use static data
        this.evidenceData = {
            "10:09": {
                title: "Professional Roles and Boundaries",
                banner: "SERVICE USER DEMONSTRATES EXPERT KNOWLEDGE OF PROFESSIONAL BOUNDARIES",
                description: "Ben demonstrates understanding of professional boundaries and proper organizational processes",
                framework: "Professional Standards Framework",
                level: "High - Direct articulation of professional standards",
                points: [
                    { time: "10:15", text: "Identifies proper email protocol and professional boundaries" },
                    { time: "10:21", text: "Raises concern constructively to prevent future issues" },
                    { time: "10:28", text: "Shows understanding of organizational liability concerns" }
                ],
                tags: ["Professional Standards", "Organizational Policy", "Risk Management"],
                transcript: "I'd explained that I'd asked you for your work email and that you gave me the other one. And I said you shouldn't do that because that can get you into trouble because it's not a work one. I wasn't trying to get you into trouble and I didn't want to get you in trouble. I was actually raising it with integrity to see why they hadn't gave you one to stop you getting in trouble and also to stop Integrity getting in trouble because it's not proper process and it's not what you do in a setting a situation like this."
            },
            "10:58": {
                title: "Knowledge of Management Response Protocols",
                banner: "SERVICE USER DEMONSTRATES UNDERSTANDING OF MANAGEMENT PROTOCOLS",
                description: "Ben demonstrates understanding of management responses and service user rights",
                framework: "Service User Rights Framework",
                level: "High - Shows detailed understanding of organizational processes",
                points: [
                    { time: "11:05", text: "Recognizes non-punitive management intent" },
                    { time: "11:15", text: "Shows knowledge of service user rights regarding worker assignment" },
                    { time: "11:22", text: "Demonstrates ability to navigate management responses constructively" }
                ],
                tags: ["Management Protocols", "Service User Rights", "Professional Boundaries"],
                transcript: "And Jade was really nice and understanding and thanked me for letting them know. They also asked if I felt it would be best if you didn't. Be my worker. And I said, no, I want you to remain me worker. Because I didn't think it would be fair that if. And they weren't saying it, as in. As a. As a. As a punishment, orders or anything other than, did I want you to be moved from caring for me to someone else?"
            },
            "12:36": {
                title: "Advocacy Without Triggering Defensive Responses",
                banner: "SERVICE USER DEMONSTRATES ADVANCED ADVOCACY TECHNIQUES",
                description: "Ben demonstrates ability to advocate without triggering defensive responses",
                framework: "Advocacy Framework",
                level: "High - Shows sophisticated advocacy techniques",
                points: [
                    { time: "12:45", text: "Contextualizes perceived shortcomings" },
                    { time: "12:50", text: "Normalizes knowledge gaps through personal comparison" },
                    { time: "12:55", text: "Acknowledges cultural and linguistic differences" }
                ],
                tags: ["Advocacy", "Cultural Sensitivity", "Communication Skills"],
                transcript: "I also raised with Jade that it's important to know I don't speak French and I don't speak Arabic, and. And I don't speak probably as many languages as you, so we can't have weight, per se, in a holistic view, because I did raise that. You. You didn't know a hostel was. Now, I defended you in that essence, because ask me to say it in French, I won't be able to."
            },
            "13:42": {
                title: "Systemic Rather Than Individual Focus",
                banner: "SERVICE USER DEMONSTRATES SYSTEMS THINKING APPROACH",
                description: "Ben demonstrates understanding of systemic vs. individual framing",
                framework: "Systems Thinking Framework",
                level: "High - Shows sophisticated systems thinking",
                points: [
                    { time: "13:50", text: "Focuses on situation rather than individual" },
                    { time: "13:55", text: "Recognizes impact of framing on psychological safety" },
                    { time: "14:00", text: "Identifies systemic failures without assigning blame" }
                ],
                tags: ["Systems Thinking", "Psychological Safety", "Organizational Dynamics"],
                transcript: "I think it's better to not make it about you, make it about the situation. I think that's fairer and it doesn't make you feel you've got to get the answers right, because it's not about getting it right, it's about progress and not perfection. And I can assume that it's already a highly pressureful engagement because of how complex it is. And you've been expected, because I don't think people actually realize how little handover from the social workers Westminster have gave you."
            },
            "14:36": {
                title: "Critique of Standard Assessment Approaches",
                banner: "SERVICE USER PROVIDES EXPERT CRITIQUE OF ASSESSMENT METHODOLOGIES",
                description: "Ben shows sophisticated understanding of assessment methodologies",
                framework: "Assessment Methodology Framework",
                level: "High - Detailed critique of established practices",
                points: [
                    { time: "14:42", text: "Identifies limitations of standard procedures" },
                    { time: "14:50", text: "Proposes alternative, more holistic assessment approach" },
                    { time: "14:55", text: "Demonstrates person-centered perspective on assessment" }
                ],
                tags: ["Assessment Methodology", "Process Improvement", "Person-Centered Approach"],
                transcript: "And Jane said it's standard procedure. All the support workers are very familiar with it. And that I don't. I have no qualms with, but I have qualms with not developing processes that could be more effective. So for me, this is not about scrutinizing you, this is just about looking at our engagement and the situation. I don't want you to be scrutinized."
            },
            "18:20": {
                title: "Identifying Control Tactics",
                banner: "SERVICE USER DEMONSTRATES EXPERTISE IN COERCIVE CONTROL RECOGNITION",
                description: "Ben demonstrates ability to identify specific coercive control tactics",
                framework: "Coercive Control Framework",
                level: "High - Detailed understanding of control mechanisms",
                points: [
                    { time: "18:25", text: "Identifies isolation as control mechanism" },
                    { time: "18:30", text: "Recognizes communication monitoring as abuse" },
                    { time: "18:35", text: "Understands questioning patterns as control tactics" }
                ],
                tags: ["Coercive Control", "Abuse Recognition", "Safety Planning"],
                transcript: "I recognized that he was using isolation tactics by limiting who I could talk to and monitoring my communications. He would check my phone and question me about every conversation."
            },
            "22:15": {
                title: "Self-Reflection on Communication",
                banner: "SERVICE USER SHOWS EXCEPTIONAL METACOGNITIVE AWARENESS",
                description: "Ben demonstrates real-time awareness of his communication style",
                framework: "Metacognitive Framework",
                level: "High - Sophisticated metacognitive monitoring",
                points: [
                    { time: "22:20", text: "Shows awareness of communication volume" },
                    { time: "22:25", text: "Articulates communication intentions" },
                    { time: "22:30", text: "Recognizes impact on listener" }
                ],
                tags: ["Metacognition", "Communication Skills", "Self-Awareness"],
                transcript: "I'm aware that I'm talking a lot, and I'm aware that I'm probably overwhelming you with information. But I'm trying to give you context so that you understand where I'm coming from and why I'm saying what I'm saying."
            },
            "25:10": {
                title: "Connecting Experiences to Outcomes",
                banner: "SERVICE USER ARTICULATES ADVANCED CAUSAL RELATIONSHIPS",
                description: "Ben demonstrates ability to connect experiences to psychological outcomes",
                framework: "Psychological Impact Framework",
                level: "High - Clear articulation of cause-effect relationships",
                points: [
                    { time: "25:15", text: "Links monitoring to anxiety development" },
                    { time: "25:20", text: "Shows understanding of criticism impact on decision-making" },
                    { time: "25:25", text: "Identifies fear as control mechanism" }
                ],
                tags: ["Psychological Impact", "Causal Analysis", "Trauma-Informed Understanding"],
                transcript: "The constant monitoring and criticism led to me developing severe anxiety. I started second-guessing every decision because I was afraid of the consequences if I made a mistake."
            },
            "34:34": {
                title: "Reshaping Traditional Provider-User Dynamics",
                banner: "SERVICE USER INVERTS TRADITIONAL POWER DYNAMICS",
                description: "Ben demonstrates ability to reshape provider-user power dynamics",
                framework: "Power Dynamics Framework",
                level: "High - Strategic inversion of traditional hierarchies",
                points: [
                    { time: "34:38", text: "Inverts provider-user power dynamic" },
                    { time: "34:42", text: "Creates space for professional autonomy" },
                    { time: "34:46", text: "Establishes collaborative relationship model" }
                ],
                tags: ["Power Dynamics", "Collaborative Practice", "Professional Autonomy"],
                transcript: "So from what I've said, where do you feel you're going to be most effective and what would help?"
            }
        };
    }
    
    /**
     * Load category data with lazy loading pattern
     * @private
     * @param {string} categoryId - Category ID to load
     */
    _loadCategoryData(categoryId) {
        // Skip if already loaded
        if (this.loadedCategories.has(categoryId)) {
            return;
        }
        
        // Mark as loaded
        this.loadedCategories.add(categoryId);
        
        // Load category data (would normally fetch from API)
        switch (categoryId) {
            case 'system-navigation':
                this.categories[categoryId] = {
                    title: 'System Navigation Knowledge',
                    claims: [
                        {
                            title: 'Understanding of Professional Roles and Responsibilities',
                            timestamp: '10:09',
                            endTime: '10:45',
                            strength: 'Strong Evidence',
                            strengthClass: 'strong',
                            quote: "I'd explained that I'd asked you for your work email and that you gave me the other one. And I said you shouldn't do that because that can get you into trouble because it's not a work one. I wasn't trying to get you into trouble and I didn't want to get you in trouble. I was actually raising it with integrity to see why they hadn't gave you one to stop you getting in trouble and also to stop Integrity getting in trouble because it's not proper process and it's not what you do in a setting a situation like this.",
                            quoteTimestamp: '10:15',
                            analysis: 'Ben demonstrates exceptional understanding of professional boundaries (work vs. personal email), organizational liability, process requirements, and how to raise concerns constructively rather than punitively.',
                            points: [
                                { timestamp: '10:21', text: 'Cites proper process requirements in professional settings' },
                                { timestamp: '10:28', text: 'References organizational liability concerns' }
                            ]
                        },
                        {
                            title: 'Knowledge of Organizational Structures and Processes',
                            timestamp: '10:58',
                            endTime: '11:30',
                            strength: 'Strong Evidence',
                            strengthClass: 'strong',
                            quote: "And Jade was really nice and understanding and thanked me for letting them know. They also asked if I felt it would be best if you didn't. Be my worker. And I said, no, I want you to remain me worker. Because I didn't think it would be fair that if. And they weren't saying it, as in. As a. As a. As a punishment, orders or anything other than, did I want you to be moved from caring for me to someone else?",
                            quoteTimestamp: '11:05',
                            analysis: 'Ben shows sophisticated understanding of management response protocols, recognition of how concerns can impact service provision, knowledge of service user rights regarding worker assignment, and ability to distinguish between punitive and supportive management responses.',
                            points: [
                                { timestamp: '11:08', text: 'Demonstrates knowledge of professional boundaries' },
                                { timestamp: '11:15', text: 'Shows understanding of constructive vs. punitive approaches' }
                            ]
                        },
                        {
                            title: 'Understanding of Assessment Frameworks',
                            timestamp: '14:36',
                            endTime: '15:10',
                            strength: 'Strong Evidence',
                            strengthClass: 'strong',
                            quote: "And Jane said it's standard procedure. All the support workers are very familiar with it. And that I don't. I have no qualms with, but I have qualms with not developing processes that could be more effective. So for me, this is not about scrutinizing you, this is just about looking at our engagement and the situation. I don't want you to be scrutinized.",
                            quoteTimestamp: '14:42',
                            analysis: 'Ben articulates a sophisticated critique of standard assessment approaches and proposes more effective alternatives, demonstrating knowledge of different assessment methodologies and understanding of the limitations of standard approaches.',
                            points: [
                                { timestamp: '14:50', text: 'Articulates professional standards framework limitations' }
                            ]
                        }
                    ]
                };
                break;
                
            case 'advocacy-techniques':
                this.categories[categoryId] = {
                    title: 'Advocacy Techniques',
                    claims: [
                        {
                            title: 'Advocacy Without Triggering Defensive Responses',
                            timestamp: '12:36',
                            endTime: '13:10',
                            strength: 'Strong Evidence',
                            strengthClass: 'strong',
                            quote: "I also raised with Jade that it's important to know I don't speak French and I don't speak Arabic, and. And I don't speak probably as many languages as you, so we can't have weight, per se, in a holistic view, because I did raise that. You. You didn't know a hostel was. Now, I defended you in that essence, because ask me to say it in French, I won't be able to.",
                            quoteTimestamp: '12:45',
                            analysis: 'Ben demonstrates ability to contextualize perceived shortcomings, skill in reframing potential criticism as systemic issues, technique of normalizing knowledge gaps through personal comparison, and advocacy that acknowledges cultural and linguistic differences.',
                            points: [
                                { timestamp: '12:50', text: 'Demonstrates non-confrontational advocacy approach' }
                            ]
                        },
                        {
                            title: 'Systemic Rather Than Individual Focus',
                            timestamp: '13:42',
                            endTime: '14:20',
                            strength: 'Strong Evidence',
                            strengthClass: 'strong',
                            quote: "I think it's better to not make it about you, make it about the situation. I think that's fairer and it doesn't make you feel you've got to get the answers right, because it's not about getting it right, it's about progress and not perfection. And I can assume that it's already a highly pressureful engagement because of how complex it is. And you've been expected, because I don't think people actually realize how little handover from the social workers Westminster have gave you.",
                            quoteTimestamp: '13:50',
                            analysis: 'Ben demonstrates sophisticated understanding of systemic vs. individual framing, recognition of how framing impacts psychological safety, ability to identify systemic failures without assigning individual blame, and knowledge of how inadequate handovers impact service quality.',
                            points: [
                                { timestamp: '13:55', text: 'Shows advocacy skills focused on systems not individuals' }
                            ]
                        }
                    ]
                };
                break;
                
            case 'power-dynamics':
                this.categories[categoryId] = {
                    title: 'Power Dynamics Management',
                    claims: [
                        {
                            title: 'Reshaping Traditional Provider-User Dynamics',
                            timestamp: '34:34',
                            endTime: '34:50',
                            strength: 'Strong Evidence',
                            strengthClass: 'strong',
                            quote: "So from what I've said, where do you feel you're going to be most effective and what would help?",
                            quoteTimestamp: '34:38',
                            analysis: "By asking Mbalu where she feels she can be most effective, Ben inverts the typical dynamic where providers determine intervention, creates space for professional autonomy while maintaining guidance, demonstrates coaching rather than directing, and establishes collaborative rather than hierarchical relationship.",
                            points: [
                                { timestamp: '34:42', text: 'Inverts traditional power dynamic' }
                            ]
                        }
                    ]
                };
                break;
                
            case 'metacognitive':
                this.categories[categoryId] = {
                    title: 'Metacognitive Awareness',
                    claims: [
                        {
                            title: 'Self-Reflection on Communication',
                            timestamp: '22:15',
                            endTime: '22:45',
                            strength: 'Strong Evidence',
                            strengthClass: 'strong',
                            quote: "I'm aware that I'm talking a lot, and I'm aware that I'm probably overwhelming you with information. But I'm trying to give you context so that you understand where I'm coming from and why I'm saying what I'm saying.",
                            quoteTimestamp: '22:20',
                            analysis: 'Ben demonstrates real-time awareness of his communication style and its potential impact, showing sophisticated metacognitive monitoring, ability to articulate communication intentions, and recognition of how information volume affects understanding.',
                            points: [
                                { timestamp: '22:25', text: 'Shows real-time awareness of communication impact' }
                            ]
                        }
                    ]
                };
                break;
                
            case 'coercive-control':
                this.categories[categoryId] = {
                    title: 'Coercive Control Recognition',
                    claims: [
                        {
                            title: 'Identifying Control Tactics',
                            timestamp: '18:20',
                            endTime: '18:50',
                            strength: 'Strong Evidence',
                            strengthClass: 'strong',
                            quote: "I recognized that he was using isolation tactics by limiting who I could talk to and monitoring my communications. He would check my phone and question me about every conversation.",
                            quoteTimestamp: '18:25',
                            analysis: 'Ben demonstrates ability to identify specific coercive control tactics and their effects, showing knowledge of isolation as a control mechanism, understanding of communication monitoring as abuse, and recognition of questioning patterns as control tactics.',
                            points: [
                                { timestamp: '18:30', text: 'Names specific control tactics' }
                            ]
                        }
                    ]
                };
                break;
                
            case 'causal-links':
                this.categories[categoryId] = {
                    title: 'Causal Link Articulation',
                    claims: [
                        {
                            title: 'Connecting Experiences to Outcomes',
                            timestamp: '25:10',
                            endTime: '25:40',
                            strength: 'Strong Evidence',
                            strengthClass: 'strong',
                            quote: "The constant monitoring and criticism led to me developing severe anxiety. I started second-guessing every decision because I was afraid of the consequences if I made a mistake.",
                            quoteTimestamp: '25:15',
                            analysis: 'Ben demonstrates ability to connect specific experiences to psychological outcomes, showing understanding of how monitoring creates anxiety, knowledge of how criticism affects decision-making, and recognition of fear as a mechanism of control.',
                            points: [
                                { timestamp: '25:20', text: 'Articulates clear cause-effect relationship' }
                            ]
                        }
                    ]
                };
                break;
                
            default:
                // Category not found
                this.categories[categoryId] = { title: 'Unknown Category', claims: [] };
        }
    }
    
    /**
     * Build search index for efficient searching
     * @private
     */
    _buildSearchIndex() {
        // Build index from evidence data
        for (const timestamp in this.evidenceData) {
            const evidence = this.evidenceData[timestamp];
            
            // Add title to index
            this._addToIndex(evidence.title, timestamp, 'title', evidence.title);
            
            // Add description to index
            this._addToIndex(evidence.description, timestamp, 'description', evidence.description);
            
            // Add transcript to index
            this._addToIndex(evidence.transcript, timestamp, 'transcript', evidence.transcript);
            
            // Add tags to index
            if (evidence.tags) {
                evidence.tags.forEach(tag => {
                    this._addToIndex(tag, timestamp, 'tag', tag);
                });
            }
            
            // Add points to index
            if (evidence.points) {
                evidence.points.forEach(point => {
                    this._addToIndex(point.text, timestamp, 'point', point.text);
                });
            }
        }
    }
    
    /**
     * Add text to search index
     * @private
     * @param {string} text - Text to index
     * @param {string} timestamp - Associated timestamp
     * @param {string} type - Type of content
     * @param {string} context - Context for search result
     */
    _addToIndex(text, timestamp, type, context) {
        if (!text) return;
        
        // Convert to lowercase for case-insensitive search
        const lowerText = text.toLowerCase();
        
        // Create tokens (words) from text
        const tokens = lowerText
            .split(/\W+/)
            .filter(token => token.length > 2); // Filter out short words
        
        // Add each token to index
        tokens.forEach(token => {
            if (!this.searchIndex[token]) {
                this.searchIndex[token] = [];
            }
            
            // Add to index if not already present
            const exists = this.searchIndex[token].some(item => 
                item.timestamp === timestamp && item.type === type
            );
            
            if (!exists) {
                this.searchIndex[token].push({
                    timestamp,
                    type,
                    context: this._truncateContext(context),
                    score: this._calculateScore(type)
                });
            }
        });
    }
    
    /**
     * Truncate context to reasonable length
     * @private
     * @param {string} context - Original context
     * @returns {string} - Truncated context
     */
    _truncateContext(context) {
        if (!context) return '';
        
        const maxLength = 100;
        if (context.length <= maxLength) return context;
        
        return context.substring(0, maxLength) + '...';
    }
    
    /**
     * Calculate search result score based on content type
     * @private
     * @param {string} type - Content type
     * @returns {number} - Score value
     */
    _calculateScore(type) {
        switch (type) {
            case 'title': return 10;
            case 'tag': return 8;
            case 'description': return 6;
            case 'point': return 5;
            case 'transcript': return 3;
            default: return 1;
        }
    }
    
    /**
     * Get category data, loading if necessary
     * @public
     * @param {string} categoryId - Category ID
     * @returns {Object} - Category data
     */
    getCategoryData(categoryId) {
        // Load category data if not already loaded
        if (!this.categories[categoryId]) {
            this._loadCategoryData(categoryId);
        }
        
        return this.categories[categoryId];
    }
    
    /**
     * Get evidence data for a timestamp
     * @public
     * @param {string} timestamp - Timestamp
     * @returns {Object} - Evidence data
     */
    getEvidenceData(timestamp) {
        return this.evidenceData[timestamp] || null;
    }
    
    /**
     * Search content with optimized search algorithm
     * @public
     * @param {string} query - Search query
     * @returns {Array} - Search results
     */
    searchContent(query) {
        if (!query || query.length < 2) return [];
        
        // Split query into tokens
        const tokens = query.toLowerCase()
            .split(/\W+/)
            .filter(token => token.length > 2);
        
        if (tokens.length === 0) return [];
        
        // Track result scores by timestamp
        const resultScores = {};
        
        // Search for each token
        tokens.forEach(token => {
            // Find exact matches
            const exactMatches = this.searchIndex[token] || [];
            
            // Find partial matches
            const partialMatches = [];
            for (const indexedToken in this.searchIndex) {
                if (indexedToken.includes(token) && indexedToken !== token) {
                    // Add partial matches with lower score
                    this.searchIndex[indexedToken].forEach(match => {
                        partialMatches.push({
                            ...match,
                            score: match.score * 0.7 // Reduce score for partial matches
                        });
                    });
                }
            }
            
            // Combine all matches
            const allMatches = [...exactMatches, ...partialMatches];
            
            // Update result scores
            allMatches.forEach(match => {
                const { timestamp, score, type, context } = match;
                
                if (!resultScores[timestamp]) {
                    // Get title from evidence data
                    const title = this.evidenceData[timestamp]?.title || 'Unknown';
                    
                    resultScores[timestamp] = {
                        timestamp,
                        title,
                        score: 0,
                        types: new Set(),
                        context: ''
                    };
                }
                
                // Add to score and track matching content types
                resultScores[timestamp].score += score;
                resultScores[timestamp].types.add(type);
                
                // Use higher quality context if available
                if (type === 'title' || type === 'description' || !resultScores[timestamp].context) {
                    resultScores[timestamp].context = context;
                }
            });
        });
        
        // Convert to array and sort by score
        const results = Object.values(resultScores)
            .sort((a, b) => b.score - a.score);
        
        return results;
    }
    
    /**
     * Get timestamps in category order
     * @public
     * @returns {Array} - Ordered timestamps
     */
    getOrderedTimestamps() {
        const timestamps = [];
        
        // Load all categories if needed
        const categoryIds = [
            'system-navigation', 'advocacy-techniques', 'power-dynamics',
            'metacognitive', 'coercive-control', 'causal-links'
        ];
        
        categoryIds.forEach(categoryId => {
            if (!this.categories[categoryId]) {
                this._loadCategoryData(categoryId);
            }
            
            const category = this.categories[categoryId];
            if (category && category.claims) {
                category.claims.forEach(claim => {
                    if (claim.timestamp && !timestamps.includes(claim.timestamp)) {
                        timestamps.push(claim.timestamp);
                    }
                });
            }
        });
        
        return timestamps;
    }
}
>>>>>>> 99ba3185ee599157da77f07e412fe833119f990a
