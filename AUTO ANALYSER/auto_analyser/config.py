"""
Configuration settings for the Automated Analysis System
"""

# Pattern categories based on Ben Mak assessments
PATTERN_CATEGORIES = {
    'system_navigation': {
        'name': 'System Navigation Knowledge',
        'description': 'Patterns demonstrating understanding of professional roles, organizational structures, and assessment frameworks.'
    },
    'advocacy': {
        'name': 'Advocacy Techniques',
        'description': 'Patterns showing sophisticated advocacy approaches that prevent defensive responses while maintaining accountability.'
    },
    'power_dynamics': {
        'name': 'Power Dynamics Management',
        'description': 'Patterns illustrating how traditional power dynamics between service provider and user are reshaped.'
    },
    'metacognitive': {
        'name': 'Metacognitive Awareness',
        'description': 'Patterns demonstrating ability to recognize systemic patterns and maintain self-awareness.'
    },
    'coercive_control': {
        'name': 'Coercive Control Recognition',
        'description': 'Patterns showing understanding of institutional coercion and strategies to navigate it.'
    },
    'causal_links': {
        'name': 'Causal Link Articulation',
        'description': 'Patterns demonstrating ability to articulate clear causal links between institutional actions and their impacts.'
    }
}

# Expert frameworks for citation
EXPERT_FRAMEWORKS = {
    'lipsky': {
        'name': "Lipsky's Street-Level Bureaucracy (1980)",
        'description': "Examines how frontline workers navigate complex systems and how organizational responses diminish as complexity increases."
    },
    'bronfenbrenner': {
        'name': "Bronfenbrenner's Ecological Systems Theory (1979)",
        'description': "Demonstrates awareness of how multiple systems interact and impact individual experiences."
    },
    'donabedian': {
        'name': "Donabedian's Healthcare Quality Framework (1966)",
        'description': "Examines structure, process, and outcome measures in service delivery."
    },
    'foucault': {
        'name': "Foucault's Power/Knowledge Framework (1980)",
        'description': "Analyzes how power operates through institutional knowledge and discourse."
    },
    'goffman': {
        'name': "Goffman's Total Institutions (1961)",
        'description': "Examines how institutions control individuals through various mechanisms."
    }
}

# Evidence level descriptions
EVIDENCE_LEVELS = {
    1: "Basic evidence - Pattern is present but limited in scope or clarity",
    2: "Moderate evidence - Pattern is clearly present with some supporting context",
    3: "Strong evidence - Pattern is well-articulated with clear supporting context",
    4: "Very strong evidence - Pattern is extensively demonstrated with multiple supporting elements",
    5: "Exceptional evidence - Pattern is comprehensively demonstrated with extensive supporting elements and theoretical alignment"
}

# Report generation settings
REPORT_SETTINGS = {
    'template_dir': 'templates',
    'main_template': 'report_template.html',
    'report_filename': 'analysis_report.html',
    'css_filename': 'report_style.css',
    'js_filename': 'report_script.js'
}

# PDF processing settings
PDF_SETTINGS = {
    'min_line_length': 10,  # Minimum characters for a line to be considered content
    'speaker_pattern': r'^([A-Za-z\s]+)\s+(\d+:\d+)$',  # Pattern to identify speaker and timestamp
}
