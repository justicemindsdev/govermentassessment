// Video player and transcript functionality
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const modal = document.getElementById('video-modal');
    const closeBtn = document.querySelector('.close-btn');
    const video = document.getElementById('evidence-video');
    const transcriptDisplay = document.getElementById('transcript-display');
    const clipProgressBar = document.querySelector('.clip-progress-bar');
    const clipTimeDisplay = document.querySelector('.clip-time');
    const loadingOverlay = document.querySelector('.loading-overlay');
    const searchInput = document.getElementById('search-input');
    const shareModal = document.getElementById('share-modal');
    const openShareModalBtn = document.getElementById('open-share-modal');
    const closeShareModalBtn = document.getElementById('close-share-modal');
    const copyLinkBtn = document.getElementById('copy-link-btn');
    const shareLink = document.getElementById('share-link');
    const generateLinkBtn = document.getElementById('generate-link-btn');
    const contentOptions = document.querySelectorAll('.share-content-option');
    
    // Variables for clip playback
    let isClipMode = false;
    let clipStartTime = 0;
    let clipEndTime = 0;
    let clipDuration = 0;
    let clipInterval = null;
    let currentClipKey = '';
    
    // Transcript segments data
    const transcriptSegments = {
        '10:09': {
            text: "I'd explained that I'd asked you for your work email and that you gave me the other one. And I said you shouldn't do that because that can get you into trouble because it's not a work one. I wasn't trying to get you into trouble and I didn't want to get you in trouble. I was actually raising it with integrity to see why they hadn't gave you one to stop you getting in trouble and also to stop Integrity getting in trouble because it's not proper process and it's not what you do in a setting a situation like this."
        },
        '10:58': {
            text: "And Jade was really nice and understanding and thanked me for letting them know. They also asked if I felt it would be best if you didn't. Be my worker. And I said, no, I want you to remain me worker. Because I didn't think it would be fair that if. And they weren't saying it, as in. As a. As a. As a punishment, orders or anything other than, did I want you to be moved from caring for me to someone else?"
        },
        '12:36': {
            text: "I also raised with Jade that it's important to know I don't speak French and I don't speak Arabic, and. And I don't speak probably as many languages as you, so we can't have weight, per se, in a holistic view, because I did raise that. You. You didn't know a hostel was. Now, I defended you in that essence, because ask me to say it in French, I won't be able to."
        },
        '13:42': {
            text: "I think it's better to not make it about you, make it about the situation. I think that's fairer and it doesn't make you feel you've got to get the answers right, because it's not about getting it right, it's about progress and not perfection. And I can assume that it's already a highly pressureful engagement because of how complex it is. And you've been expected, because I don't think people actually realize how little handover from the social workers Westminster have gave you."
        },
        '14:36': {
            text: "And Jane said it's standard procedure. All the support workers are very familiar with it. And that I don't. I have no qualms with, but I have qualms with not developing processes that could be more effective. So for me, this is not about scrutinizing you, this is just about looking at our engagement and the situation. I don't want you to be scrutinized."
        }
    };
    
    // Evidence summaries data
    const evidenceSummaries = {
        '10:09': {
            title: 'Professional Boundaries Understanding',
            description: 'Ben demonstrates exceptional understanding of professional boundaries and organizational liability.',
            framework: 'Professional Ethics and Organizational Processes',
            evidenceLevel: 'Strong',
            tags: ['Professional Boundaries', 'Organizational Liability', 'Process Requirements', 'Constructive Feedback'],
            points: [
                'Identifies proper use of work vs. personal email (10:09)',
                'Recognizes potential liability issues for both worker and organization (10:15)',
                'Demonstrates understanding of proper process requirements (10:25)',
                'Raises concerns constructively rather than punitively (10:35)'
            ]
        },
        '10:58': {
            title: 'Management Response Protocols',
            description: 'Ben shows sophisticated understanding of management response protocols and service user rights.',
            framework: 'Organizational Structures and Service User Rights',
            evidenceLevel: 'Strong',
            tags: ['Management Protocols', 'Service User Rights', 'Worker Assignment', 'Supportive Management'],
            points: [
                'Recognizes management's appropriate response to concerns (10:58)',
                'Understands how concerns can impact service provision (11:05)',
                'Demonstrates knowledge of service user rights regarding worker assignment (11:15)',
                'Distinguishes between punitive and supportive management responses (11:25)'
            ]
        },
        '12:36': {
            title: 'Contextualizing Knowledge Gaps',
            description: 'Ben demonstrates ability to contextualize perceived shortcomings and reframe criticism as systemic issues.',
            framework: 'Cultural Competence and Systemic Analysis',
            evidenceLevel: 'Strong',
            tags: ['Cultural Competence', 'Linguistic Differences', 'Knowledge Contextualization', 'Systemic Reframing'],
            points: [
                'Acknowledges linguistic and cultural differences (12:36)',
                'Normalizes knowledge gaps through personal comparison (12:45)',
                'Reframes potential criticism as systemic issues (12:50)',
                'Advocates with cultural and linguistic awareness (13:00)'
            ]
        },
        '13:42': {
            title: 'Systemic vs. Individual Framing',
            description: 'Ben demonstrates sophisticated understanding of systemic vs. individual framing and its impact.',
            framework: 'Systems Theory and Psychological Safety',
            evidenceLevel: 'Strong',
            tags: ['Systems Theory', 'Psychological Safety', 'Blame-Free Analysis', 'Handover Processes'],
            points: [
                'Focuses on situation rather than individual (13:42)',
                'Recognizes how framing impacts psychological safety (13:50)',
                'Identifies systemic failures without assigning individual blame (14:00)',
                'Acknowledges impact of inadequate handovers on service quality (14:15)'
            ]
        },
        '14:36': {
            title: 'Assessment Methodology Critique',
            description: 'Ben articulates a sophisticated critique of standard assessment approaches and proposes alternatives.',
            framework: 'Assessment Methodologies and Process Improvement',
            evidenceLevel: 'Strong',
            tags: ['Assessment Methodologies', 'Process Improvement', 'Holistic Evaluation', 'Non-Punitive Assessment'],
            points: [
                'Acknowledges standard procedures while identifying limitations (14:36)',
                'Proposes more effective alternative processes (14:45)',
                'Emphasizes non-scrutinizing assessment approaches (14:55)',
                'Demonstrates understanding of different assessment methodologies (15:05)'
            ]
        }
    };
    
    // Function to format time (MM:SS)
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }
    
    // Function to parse time string (MM:SS) to seconds
    function parseTimeToSeconds(timeString) {
        const [minutes, seconds] = timeString.split(':').map(Number);
        return minutes * 60 + seconds;
    }
    
    // Function to update transcript display with words that can be underscored during playback
    function updateTranscriptDisplay(clipKey) {
        if (transcriptDisplay) {
            const transcript = transcriptSegments[clipKey];
            
            if (transcript) {
                // Split text into words and create span elements for each
                const words = transcript.text.split(/\s+/);
                transcriptDisplay.innerHTML = '';
                
                words.forEach((word, index) => {
                    const wordSpan = document.createElement('span');
                    wordSpan.className = 'transcript-word';
                    wordSpan.textContent = word;
                    wordSpan.setAttribute('data-index', index);
                    transcriptDisplay.appendChild(wordSpan);
                    
                    // Add space after each word except the last one
                    if (index < words.length - 1) {
                        transcriptDisplay.appendChild(document.createTextNode(' '));
                    }
                });
            } else {
                transcriptDisplay.textContent = "Transcript not available for this clip.";
            }
        }
    }
    
    // Function to update the active word in the transcript based on current time
    function updateActiveWord(currentTime) {
        // Remove active class from all words
        document.querySelectorAll('.transcript-word').forEach(word => {
            word.classList.remove('active');
        });
        
        // Calculate which word should be active based on current time
        if (isClipMode && currentTime >= clipStartTime && currentTime <= clipEndTime) {
            const progress = (currentTime - clipStartTime) / clipDuration;
            const words = document.querySelectorAll('.transcript-word');
            const wordIndex = Math.floor(progress * words.length);
            
            // Set the active class on the current word
            if (wordIndex >= 0 && wordIndex < words.length) {
                words[wordIndex].classList.add('active');
                
                // Scroll to keep the active word visible
                if (transcriptDisplay) {
                    const activeWord = words[wordIndex];
                    const containerRect = transcriptDisplay.getBoundingClientRect();
                    const wordRect = activeWord.getBoundingClientRect();
                    
                    if (wordRect.bottom > containerRect.bottom || wordRect.top < containerRect.top) {
                        activeWord.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            }
        }
    }
    
    // Function to update evidence summary with timestamps for each point
    function updateEvidenceSummary(clipKey) {
        const evidenceDescription = document.getElementById('evidence-description');
        const evidenceTags = document.getElementById('evidence-tags');
        const evidencePoints = document.getElementById('evidence-points');
        
        if (evidenceDescription && evidenceTags && evidencePoints) {
            const summary = evidenceSummaries[clipKey];
            
            if (summary) {
                // Update description
                evidenceDescription.innerHTML = `
                    <strong>${summary.title}</strong><br>
                    ${summary.description}<br><br>
                    <strong>Framework:</strong> ${summary.framework}<br>
                    <strong>Evidence Level:</strong> ${summary.evidenceLevel}
                `;
                
                // Update tags
                evidenceTags.innerHTML = '';
                summary.tags.forEach(tag => {
                    const tagElement = document.createElement('span');
                    tagElement.className = 'evidence-tag';
                    tagElement.textContent = tag;
                    evidenceTags.appendChild(tagElement);
                });
                
                // Update points with timestamps
                evidencePoints.innerHTML = '';
                
                // Calculate timestamps for each point
                const pointCount = summary.points.length;
                const timePerPoint = clipDuration / pointCount;
                
                summary.points.forEach((point, index) => {
                    const pointStartTime = clipStartTime + (index * timePerPoint);
                    const formattedTime = formatTime(pointStartTime);
                    
                    const li = document.createElement('li');
                    li.className = 'evidence-point';
                    
                    const timestampLink = document.createElement('span');
                    timestampLink.className = 'timestamp-link';
                    timestampLink.textContent = formattedTime;
                    timestampLink.addEventListener('click', () => {
                        if (video) {
                            video.currentTime = pointStartTime;
                            if (video.paused) {
                                video.play();
                            }
                        }
                    });
                    
                    li.appendChild(timestampLink);
                    li.appendChild(document.createTextNode(' ' + point));
                    evidencePoints.appendChild(li);
                });
            } else {
                evidenceDescription.textContent = "No detailed evidence summary available for this clip.";
                evidenceTags.innerHTML = '';
                evidencePoints.innerHTML = '';
            }
        }
    }
    
    // Function to play a specific clip with moving underscore
    function playClip(startTime, endTime, clipKey) {
        if (!video) return;
        
        isClipMode = true;
        clipStartTime = startTime;
        clipEndTime = endTime;
        clipDuration = endTime - startTime;
        currentClipKey = clipKey;
        
        // Show loading overlay
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
        }
        
        // Set clip duration display
        if (clipTimeDisplay) {
            clipTimeDisplay.textContent = formatTime(clipDuration);
        }
        
        // Set video to start time
        video.currentTime = startTime;
        
        // Update transcript and evidence summary
        updateTranscriptDisplay(clipKey);
        updateEvidenceSummary(clipKey);
        
        // Wait for video to be ready at the start time
        video.addEventListener('canplay', function onCanPlay() {
            // Remove the event listener to prevent multiple calls
            video.removeEventListener('canplay', onCanPlay);
            
            // Hide loading overlay
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }
            
            // Start playing
            video.play();
            
            // Clear any existing interval
            if (clipInterval) clearInterval(clipInterval);
            
            // Set up progress tracking and word highlighting
            clipInterval = setInterval(() => {
                if (video.currentTime >= clipEndTime) {
                    video.pause();
                    clearInterval(clipInterval);
                    if (clipProgressBar) {
                        clipProgressBar.style.width = '100%';
                    }
                } else {
                    const progress = ((video.currentTime - clipStartTime) / clipDuration) * 100;
                    if (clipProgressBar) {
                        clipProgressBar.style.width = `${progress}%`;
                    }
                    
                    // Update active word
                    updateActiveWord(video.currentTime);
                }
            }, 100);
        }, { once: true });
    }
    
    // Event listeners for timestamps
    document.querySelectorAll('.timestamp').forEach(timestamp => {
        timestamp.addEventListener('click', function() {
            const startTime = parseTimeToSeconds(this.getAttribute('data-time'));
            const endTime = parseTimeToSeconds(this.getAttribute('data-end-time'));
            const clipKey = this.getAttribute('data-time');
            
            // Show modal
            if (modal) {
                modal.style.display = 'block';
            }
            
            // Play the clip
            playClip(startTime, endTime, clipKey);
        });
    });
    
    // Event listeners for thumbnails
    document.querySelectorAll('.clip-thumbnail').forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            const startTime = parseTimeToSeconds(this.getAttribute('data-time'));
            const endTime = parseTimeToSeconds(this.getAttribute('data-end-time'));
            const clipKey = this.getAttribute('data-time');
            
            // Show modal
            if (modal) {
                modal.style.display = 'block';
            }
            
            // Play the clip
            playClip(startTime, endTime, clipKey);
        });
    });
    
    // Close modal
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
            if (video) {
                video.pause();
            }
            if (clipInterval) {
                clearInterval(clipInterval);
            }
        });
    }
    
    // Add timeupdate event listener to video for word highlighting
    if (video) {
        video.addEventListener('timeupdate', () => {
            updateActiveWord(video.currentTime);
        });
    }
    
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            
            document.querySelectorAll('.claim').forEach(claim => {
                const claimText = claim.textContent.toLowerCase();
                if (claimText.includes(searchTerm)) {
                    claim.style.display = 'block';
                    
                    // Ensure the category is open
                    const category = claim.closest('.category');
                    if (category) {
                        category.classList.add('active');
                    }
                } else {
                    claim.style.display = 'none';
                }
            });
            
            // If search is empty, reset display
            if (searchTerm === '') {
                document.querySelectorAll('.claim').forEach(claim => {
                    claim.style.display = 'block';
                });
            }
        });
    }
    
    // Category toggle
    document.querySelectorAll('.category-header').forEach(header => {
        header.addEventListener('click', function() {
            const category = this.parentElement;
            category.classList.toggle('active');
            
            const toggleIcon = this.querySelector('.toggle-icon');
            if (toggleIcon) {
                toggleIcon.textContent = category.classList.contains('active') ? '▼' : '▲';
            }
        });
    });
    
    // Navigation links
    document.querySelectorAll('.nav-list a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            document.querySelectorAll('.nav-list a').forEach(l => {
                l.classList.remove('active');
            });
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Get the target category
            const targetId = this.getAttribute('href').substring(1);
            const targetCategory = document.getElementById(targetId);
            
            // Close all categories
            document.querySelectorAll('.category').forEach(category => {
                category.classList.remove('active');
                
                const toggleIcon = category.querySelector('.toggle-icon');
                if (toggleIcon) {
                    toggleIcon.textContent = '▲';
                }
            });
            
            // Open the target category
            if (targetCategory) {
                targetCategory.classList.add('active');
                
                const toggleIcon = targetCategory.querySelector('.toggle-icon');
                if (toggleIcon) {
                    toggleIcon.textContent = '▼';
                }
                
                // Scroll to the category
                targetCategory.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Share modal functionality
    if (openShareModalBtn) {
        openShareModalBtn.addEventListener('click', function() {
            if (shareModal) {
                shareModal.style.display = 'block';
            }
        });
    }
    
    if (closeShareModalBtn) {
        closeShareModalBtn.addEventListener('click', function() {
            if (shareModal) {
                shareModal.style.display = 'none';
            }
        });
    }
    
    // Content selection for sharing
    if (contentOptions) {
        contentOptions.forEach(option => {
            option.addEventListener('click', function() {
                this.classList.toggle('selected');
            });
        });
    }
    
    // Generate share link
    if (generateLinkBtn) {
        generateLinkBtn.addEventListener('click', function() {
            // Get selected content options
            const selectedOptions = [];
            document.querySelectorAll('.share-content-option.selected').forEach(option => {
                selectedOptions.push(option.getAttribute('data-category'));
            });
            
            // Generate a link with selected options as query parameters
            const baseUrl = window.location.href.split('?')[0];
            const queryParams = selectedOptions.length > 0 ? `?categories=${selectedOptions.join(',')}` : '';
            const fullUrl = baseUrl + queryParams;
            
            // Update share link input
            if (shareLink) {
                shareLink.value = fullUrl;
            }
        });
    }
    
    // Copy link to clipboard
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', function() {
            if (shareLink) {
                shareLink.select();
                document.execCommand('copy');
                
                // Show copied message
                this.textContent = 'Copied!';
                setTimeout(() => {
                    this.textContent = 'Copy Link';
                }, 2000);
            }
        });
    }
    
    // Check URL for shared categories
    function loadSharedCategories() {
        const urlParams = new URLSearchParams(window.location.search);
        const categories = urlParams.get('categories');
        
        if (categories) {
            const categoryIds = categories.split(',');
            
            // Close all categories first
            document.querySelectorAll('.category').forEach(category => {
                category.classList.remove('active');
            });
            
            // Open only the shared categories
            categoryIds.forEach(id => {
                const category = document.getElementById(id);
                if (category) {
                    category.classList.add('active');
                }
            });
        }
    }
    
    // Load shared categories on page load
    loadSharedCategories();
});
