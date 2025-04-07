"""
Pattern Database Module
----------------------
This module defines the patterns to look for in transcripts,
based on the Ben Mak assessments.
"""

import re
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import config

# Define patterns for each category
PATTERNS = {
    # System Navigation Knowledge patterns
    'system_navigation': [
        {
            'id': 'sn_professional_boundaries',
            'name': 'Professional Boundaries Understanding',
            'description': 'Recognition of proper professional boundaries and organizational liability',
            'keywords': [
                r'work email', r'personal email', r'proper process', r'get you into trouble',
                r'professional boundaries', r'liability', r'documentation', r'protocol'
            ],
            'frameworks': ['lipsky', 'goffman'],
            'example': "I'd explained that I'd asked you for your work email and that you gave me the other one. And I said you shouldn't do that because that can get you into trouble because it's not a work one."
        },
        {
            'id': 'sn_assessment_framework',
            'name': 'Assessment Framework Knowledge',
            'description': 'Understanding of assessment methodologies and their limitations',
            'keywords': [
                r'spotlight observation', r'scrutin(ous|y)', r'complex case review', 
                r'assessment', r'framework', r'holistic', r'surgical', r'clinical'
            ],
            'frameworks': ['donabedian', 'bronfenbrenner'],
            'example': "I said, I would like that not to happen because a spotlight observation is too scrutinous. And by that I mean it's too surgical and clinical and as though being looked to find fault."
        },
        {
            'id': 'sn_professional_certification',
            'name': 'Professional Certification Knowledge',
            'description': 'Demonstration of formal qualification knowledge',
            'keywords': [
                r'certification', r'safeguard', r'level three', r'remit', 
                r'qualification', r'training', r'authority', r'professional'
            ],
            'frameworks': ['lipsky'],
            'example': "I know what your remit is and I know what you can and can't do. I know because I'm a level three safeguard and vulnerable adult."
        }
    ],
    
    # Advocacy Techniques patterns
    'advocacy': [
        {
            'id': 'adv_non_triggering',
            'name': 'Non-Triggering Advocacy',
            'description': 'Advocacy that contextualizes perceived shortcomings to prevent defensiveness',
            'keywords': [
                r'defended you', r'not trying to get you into trouble', r'not your fault',
                r'context', r'understand', r'perspective', r'language barrier'
            ],
            'frameworks': ['bronfenbrenner'],
            'example': "I also raised with Jade that it's important to know I don't speak French and I don't speak Arabic, and I don't speak probably as many languages as you, so we can't have weight, per se, in a holistic view."
        },
        {
            'id': 'adv_systemic_focus',
            'name': 'Systemic Rather Than Individual Focus',
            'description': 'Reframing individual issues as systemic problems',
            'keywords': [
                r'not about you', r'about the situation', r'progress not perfection',
                r'system', r'broader picture', r'handover', r'pressureful', r'complex'
            ],
            'frameworks': ['bronfenbrenner', 'lipsky'],
            'example': "I think it's better to not make it about you, make it about the situation. I think that's fairer and it doesn't make you feel you've got to get the answers right."
        },
        {
            'id': 'adv_accountability',
            'name': 'Creating Accountability Structures',
            'description': 'Establishing clear documentation and witnessing processes',
            'keywords': [
                r'bear witness', r'accountability', r'seen him do', r'evidence',
                r'document', r'record', r'verify', r'confirm'
            ],
            'frameworks': ['foucault'],
            'example': "I'm just asking you to bear witness to. I am doing that. It's sort of like accountability for me. You're saying, yeah, he's done that. I've seen him do this, he is doing that."
        }
    ],
    
    # Power Dynamics Management patterns
    'power_dynamics': [
        {
            'id': 'pd_reshaping',
            'name': 'Reshaping Traditional Provider-User Dynamics',
            'description': 'Inverting typical dynamics where providers determine intervention',
            'keywords': [
                r'where do you feel', r'what would help', r'what do you think',
                r'effective', r'your perspective', r'your opinion', r'your thoughts'
            ],
            'frameworks': ['foucault'],
            'example': "So from what I've said, where do you feel you're going to be most effective and what would help?"
        },
        {
            'id': 'pd_empowerment',
            'name': 'Empowerment Through Knowledge Transfer',
            'description': 'Explicitly acknowledging and reinforcing professional authority',
            'keywords': [
                r'you do have authority', r'your authority', r'reminded', r'not a robot',
                r'human', r'power', r'without fear', r'vulnerable'
            ],
            'frameworks': ['foucault', 'goffman'],
            'example': "And that's what you said. That plan of action is perfect... And it gives you a good grasp of testing your authority because you do have authority."
        },
        {
            'id': 'pd_strategic_vulnerability',
            'name': 'Strategic Use of Vulnerability',
            'description': 'Appropriate self-disclosure to build rapport while maintaining boundaries',
            'keywords': [
                r'getting by', r'progress', r'focus on this', r'change',
                r'circle', r'same place', r'vulnerability', r'disclosure'
            ],
            'frameworks': ['goffman'],
            'example': "I'm getting by as much as I can and this is progress. So I want to focus on this right now because this is what it's all about."
        }
    ],
    
    # Metacognitive Awareness patterns
    'metacognitive': [
        {
            'id': 'meta_systemic_patterns',
            'name': 'Recognition of Systemic Patterns',
            'description': 'Ability to identify inverse correlation between need and support',
            'keywords': [
                r'needs have went up', r'supporters went down', r'graph', r'authorities',
                r'responses', r'pattern', r'correlation', r'system', r'complexity'
            ],
            'frameworks': ['lipsky', 'bronfenbrenner'],
            'example': "As my needs have went up, the supporters went down. In the initial stages of me reaching out for support, I've got about 270 people of authorities going through my inbox."
        },
        {
            'id': 'meta_institutional_limitations',
            'name': 'Awareness of Institutional Limitations',
            'description': 'Understanding of information deficits and cascading problems',
            'keywords': [
                r'not blame', r'facts', r'more information', r'concerted effort',
                r'no documentation', r'cascading problems', r'figure it out'
            ],
            'frameworks': ['lipsky', 'donabedian'],
            'example': "And that's not to appoint blame at them. It's not blame, it's facts. You need more information on this situation and there needs it to be a more concerted effort."
        },
        {
            'id': 'meta_self_awareness',
            'name': 'Self-Awareness of Own Condition and Needs',
            'description': 'Sophisticated understanding of own condition and its manifestations',
            'keywords': [
                r'autism', r'autistic', r'rejection sensitivity', r'energy', r'strength',
                r'how I am', r'makes me happy', r'doing me well'
            ],
            'frameworks': ['bronfenbrenner'],
            'example': "So this I am happy with. It gives me more energy than you realize. I know it's odd, but I've got autisticness and this is just how I am."
        }
    ],
    
    # Coercive Control Recognition patterns
    'coercive_control': [
        {
            'id': 'cc_subtle_control',
            'name': 'Identification of Subtle Control Mechanisms',
            'description': 'Recognition of how inadequate support creates feelings of incompetence',
            'keywords': [
                r'abyss', r'doing everything wrong', r'not fair', r'not given',
                r'armbands', r'map', r'coat on', r'swimming'
            ],
            'frameworks': ['foucault', 'goffman'],
            'example': "And you've just sunk into this abyss of I don't know what next. And it just seems like I'm doing everything wrong. And that's not fair because it's not that you're doing it wrong."
        },
        {
            'id': 'cc_institutional_gaslighting',
            'name': 'Prevention of Institutional Gaslighting',
            'description': 'Preemptive reframing to prevent blame',
            'keywords': [
                r'not about pinpointing fault', r'broader picture', r'moving forward',
                r'hesitant', r'certainty', r'unknown', r'what you didn\'t do'
            ],
            'frameworks': ['foucault'],
            'example': "So I'd say, I hear what you're saying and I want to just reiterate. This is not about pinpointing fault with you. It's about looking at a broader picture."
        },
        {
            'id': 'cc_clear_boundaries',
            'name': 'Establishment of Clear Boundaries',
            'description': 'Clear articulation of role boundaries and mutual protection',
            'keywords': [
                r'remit', r'what you can and can\'t do', r'never put you', r'fighting line',
                r'boundaries', r'protection', r'safeguard', r'certification'
            ],
            'frameworks': ['goffman'],
            'example': "I know what your remit is and I know what you can and can't do. I know because I'm a level three safeguard and vulnerable adult."
        }
    ],
    
    # Causal Link Articulation patterns
    'causal_links': [
        {
            'id': 'cl_cause_effect',
            'name': 'Clear Articulation of Cause-Effect Relationships',
            'description': 'Ability to trace specific institutional failures',
            'keywords': [
                r'spoke to', r'didn\'t know what to say', r'passed to', r'people',
                r'had to wait', r'didn\'t get an answer', r'not a laser on you'
            ],
            'frameworks': ['lipsky', 'donabedian'],
            'example': "Because outside of our engagement I spoke to like four people in Integrity, so. And everyone didn't know what to say or do and it got passed to four different people."
        },
        {
            'id': 'cl_structural_barriers',
            'name': 'Identification of Structural Barriers',
            'description': 'Recognition of how cascading crises impact service engagement',
            'keywords': [
                r'kicked out', r'one thing after another', r'simple exchange', r'impacted',
                r'threatened', r'enforcement', r'extra support', r'no one\'s listening'
            ],
            'frameworks': ['bronfenbrenner', 'lipsky'],
            'example': "Because it's like I couldn't even think because it's just been kicked out the hostel as you know. And it was just like one thing after. Another that caused and was and should have just been a simple exchange."
        },
        {
            'id': 'cl_disability_barriers',
            'name': 'Articulation of Disability-Specific Barriers',
            'description': 'Explanation of how autism creates specific barriers',
            'keywords': [
                r'autism', r'rejection sensitivity', r'feel rejected', r'shut down',
                r'body freezes', r'can\'t move', r'can\'t do certain things', r'articulate'
            ],
            'frameworks': ['bronfenbrenner'],
            'example': "It's hard because people with autism have a thing called rejection sensitivity. It's like if someone doesn't hear them, they can feel rejected and, and go completely inwards and shut down."
        }
    ]
}

def get_all_patterns():
    """Return all patterns from all categories."""
    all_patterns = []
    for category, patterns in PATTERNS.items():
        for pattern in patterns:
            pattern['category'] = category
            all_patterns.append(pattern)
    return all_patterns

def get_patterns_by_category(category):
    """Return patterns for a specific category."""
    if category not in PATTERNS:
        return []
    
    patterns = PATTERNS[category]
    for pattern in patterns:
        pattern['category'] = category
    
    return patterns

def get_pattern_by_id(pattern_id):
    """Return a specific pattern by its ID."""
    for category, patterns in PATTERNS.items():
        for pattern in patterns:
            if pattern['id'] == pattern_id:
                pattern['category'] = category
                return pattern
    return None
