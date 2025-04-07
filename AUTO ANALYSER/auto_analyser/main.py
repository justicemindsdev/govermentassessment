#!/usr/bin/env python3
"""
Automated Analysis System for Institutional Dynamics
---------------------------------------------------
This system analyzes transcripts to identify patterns of institutional gaslighting,
coercive control, and other problematic communication dynamics.

Usage:
    python main.py <transcript_file> [--output <output_dir>]
"""

import os
import sys
import argparse
from pdf_processing.pdf_extractor import PDFExtractor
from pattern_analysis.pattern_matcher import PatternMatcher
from report_generation.report_generator import ReportGenerator
import config

def parse_arguments():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description='Analyze transcripts for institutional dynamics patterns'
    )
    parser.add_argument(
        'transcript_file',
        help='Path to the transcript file (PDF or text)'
    )
    parser.add_argument(
        '--output', '-o',
        default='output',
        help='Directory to save the analysis results (default: output)'
    )
    return parser.parse_args()

def main():
    """Main entry point for the application."""
    args = parse_arguments()
    
    # Check if the transcript file exists
    if not os.path.exists(args.transcript_file):
        print(f"Error: Transcript file '{args.transcript_file}' not found.")
        sys.exit(1)
    
    # Create output directory if it doesn't exist
    os.makedirs(args.output, exist_ok=True)
    
    # Extract text from the transcript file
    print(f"Processing transcript: {args.transcript_file}")
    extractor = PDFExtractor()
    transcript = extractor.extract_text(args.transcript_file)
    
    # Analyze the transcript for patterns
    print("Analyzing transcript for patterns...")
    matcher = PatternMatcher()
    analysis_results = matcher.analyze(transcript)
    
    # Generate the report
    print("Generating analysis report...")
    generator = ReportGenerator()
    report_path = generator.generate_report(
        transcript, 
        analysis_results, 
        args.output
    )
    
    print(f"Analysis complete. Report saved to: {report_path}")

if __name__ == "__main__":
    main()
