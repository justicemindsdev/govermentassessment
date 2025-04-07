"""
Report Generator Module
---------------------
This module generates HTML reports from transcript analysis results.
"""

import os
import sys
import json
import logging
import shutil
from datetime import datetime
from jinja2 import Environment, FileSystemLoader

# Import local modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import config

class ReportGenerator:
    """Class for generating HTML reports from analysis results."""
    
    def __init__(self):
        """Initialize the report generator."""
        self.logger = logging.getLogger(__name__)
        
        # Set up Jinja2 environment
        template_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            config.REPORT_SETTINGS['template_dir']
        )
        self.env = Environment(loader=FileSystemLoader(template_dir))
    
    def generate_report(self, transcript_data, analysis_results, output_dir):
        """
        Generate an HTML report from analysis results.
        
        Args:
            transcript_data (dict): The transcript data
            analysis_results (dict): The analysis results
            output_dir (str): Directory to save the report
            
        Returns:
            str: Path to the generated report
        """
        self.logger.info(f"Generating report in {output_dir}")
        
        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)
        
        # Copy static files (CSS, JS)
        self._copy_static_files(output_dir)
        
        # Generate report data
        report_data = self._prepare_report_data(transcript_data, analysis_results)
        
        # Render the template
        template = self.env.get_template(config.REPORT_SETTINGS['main_template'])
        html_content = template.render(**report_data)
        
        # Write the report to file
        report_path = os.path.join(output_dir, config.REPORT_SETTINGS['report_filename'])
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        # Save the analysis results as JSON for reference
        json_path = os.path.join(output_dir, 'analysis_results.json')
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(analysis_results, f, indent=2)
        
        self.logger.info(f"Report generated: {report_path}")
        return report_path
    
    def _copy_static_files(self, output_dir):
        """
        Copy static files (CSS, JS) to the output directory.
        
        Args:
            output_dir (str): Directory to copy files to
        """
        # Get the template directory
        template_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            config.REPORT_SETTINGS['template_dir']
        )
        
        # Copy CSS file
        css_src = os.path.join(template_dir, config.REPORT_SETTINGS['css_filename'])
        css_dst = os.path.join(output_dir, config.REPORT_SETTINGS['css_filename'])
        if os.path.exists(css_src):
            shutil.copy2(css_src, css_dst)
        
        # Copy JS file
        js_src = os.path.join(template_dir, config.REPORT_SETTINGS['js_filename'])
        js_dst = os.path.join(output_dir, config.REPORT_SETTINGS['js_filename'])
        if os.path.exists(js_src):
            shutil.copy2(js_src, js_dst)
    
    def _prepare_report_data(self, transcript_data, analysis_results):
        """
        Prepare data for the report template.
        
        Args:
            transcript_data (dict): The transcript data
            analysis_results (dict): The analysis results
            
        Returns:
            dict: Data for the report template
        """
        # Get metadata
        metadata = transcript_data.get('metadata', {})
        title = metadata.get('title', 'Transcript Analysis')
        date = metadata.get('date', datetime.now().strftime('%Y-%m-%d'))
        participants = metadata.get('participants', [])
        
        # Get patterns by category
        patterns_by_category = {}
        for category in config.PATTERN_CATEGORIES:
            patterns_by_category[category] = []
        
        for pattern in analysis_results['patterns_found']:
            category = pattern['category']
            patterns_by_category[category].append(pattern)
        
        # Sort patterns by evidence level within each category
        for category, patterns in patterns_by_category.items():
            patterns_by_category[category] = sorted(
                patterns, 
                key=lambda x: x['evidence_level'], 
                reverse=True
            )
        
        # Get top patterns (highest evidence level)
        top_patterns = sorted(
            analysis_results['patterns_found'],
            key=lambda x: x['evidence_level'],
            reverse=True
        )[:5]
        
        # Get speaker statistics
        speakers = analysis_results['speakers']
        
        # Prepare data for the template
        report_data = {
            'title': title,
            'date': date,
            'participants': participants,
            'analysis_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'overall_analysis': analysis_results['overall_analysis'],
            'patterns_by_category': patterns_by_category,
            'top_patterns': top_patterns,
            'speakers': speakers,
            'categories': config.PATTERN_CATEGORIES,
            'evidence_levels': config.EVIDENCE_LEVELS,
            'frameworks': config.EXPERT_FRAMEWORKS,
            'transcript_segments': transcript_data['segments']
        }
        
        return report_data
