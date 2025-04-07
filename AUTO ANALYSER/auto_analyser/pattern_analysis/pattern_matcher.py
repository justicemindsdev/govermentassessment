"""
Pattern Matcher Module
--------------------
This module analyzes transcript text to identify patterns of
institutional gaslighting, coercive control, and other dynamics.
"""

import re
import os
import sys
import logging
from collections import defaultdict
import nltk
from nltk.tokenize import sent_tokenize
from nltk.sentiment import SentimentIntensityAnalyzer

# Import local modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import config
from pattern_analysis.pattern_database import get_all_patterns, get_patterns_by_category, get_pattern_by_id

# Download NLTK resources if not already downloaded
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('sentiment/vader_lexicon.zip')
except LookupError:
    nltk.download('punkt')
    nltk.download('vader_lexicon')

class PatternMatcher:
    """Class for analyzing transcripts to identify patterns."""
    
    def __init__(self):
        """Initialize the pattern matcher."""
        self.logger = logging.getLogger(__name__)
        self.patterns = get_all_patterns()
        self.sia = SentimentIntensityAnalyzer()
    
    def analyze(self, transcript_data):
        """
        Analyze the transcript for patterns.
        
        Args:
            transcript_data (dict): Dictionary containing transcript data
                - metadata: Dictionary of metadata
                - segments: List of transcript segments with speaker, timestamp, and text
                
        Returns:
            dict: Analysis results with the following structure:
                - patterns_found: List of pattern matches with evidence
                - speakers: Dictionary of speaker statistics
                - overall_analysis: Overall analysis of the transcript
        """
        self.logger.info("Analyzing transcript...")
        
        # Initialize results structure
        results = {
            'patterns_found': [],
            'speakers': defaultdict(lambda: {
                'segment_count': 0,
                'word_count': 0,
                'patterns': defaultdict(int),
                'sentiment': {'positive': 0, 'negative': 0, 'neutral': 0, 'compound': 0}
            }),
            'overall_analysis': {
                'total_segments': len(transcript_data['segments']),
                'category_counts': defaultdict(int),
                'pattern_counts': defaultdict(int)
            }
        }
        
        # Analyze each segment
        for segment in transcript_data['segments']:
            speaker = segment['speaker']
            text = segment['text']
            timestamp = segment['timestamp']
            
            # Update speaker statistics
            results['speakers'][speaker]['segment_count'] += 1
            results['speakers'][speaker]['word_count'] += len(text.split())
            
            # Analyze sentiment
            sentiment = self.sia.polarity_scores(text)
            results['speakers'][speaker]['sentiment']['positive'] += sentiment['pos']
            results['speakers'][speaker]['sentiment']['negative'] += sentiment['neg']
            results['speakers'][speaker]['sentiment']['neutral'] += sentiment['neu']
            results['speakers'][speaker]['sentiment']['compound'] += sentiment['compound']
            
            # Find patterns in the segment
            segment_patterns = self._find_patterns_in_text(text, speaker, timestamp)
            
            # Add patterns to results
            for pattern_match in segment_patterns:
                results['patterns_found'].append(pattern_match)
                
                # Update counts
                pattern_id = pattern_match['pattern_id']
                category = pattern_match['category']
                
                results['overall_analysis']['category_counts'][category] += 1
                results['overall_analysis']['pattern_counts'][pattern_id] += 1
                results['speakers'][speaker]['patterns'][pattern_id] += 1
        
        # Normalize sentiment values by segment count
        for speaker, stats in results['speakers'].items():
            if stats['segment_count'] > 0:
                stats['sentiment']['positive'] /= stats['segment_count']
                stats['sentiment']['negative'] /= stats['segment_count']
                stats['sentiment']['neutral'] /= stats['segment_count']
                stats['sentiment']['compound'] /= stats['segment_count']
        
        # Calculate evidence levels for each pattern found
        self._calculate_evidence_levels(results)
        
        # Generate overall analysis
        self._generate_overall_analysis(results)
        
        return results
    
    def _find_patterns_in_text(self, text, speaker, timestamp):
        """
        Find patterns in a segment of text.
        
        Args:
            text (str): The text to analyze
            speaker (str): The speaker of the text
            timestamp (str): The timestamp of the segment
            
        Returns:
            list: List of pattern matches
        """
        pattern_matches = []
        
        # Split text into sentences for more granular analysis
        sentences = sent_tokenize(text)
        
        # Check each pattern against the text
        for pattern in self.patterns:
            # Check if any keywords match
            keyword_matches = []
            for keyword in pattern['keywords']:
                regex = re.compile(keyword, re.IGNORECASE)
                matches = regex.finditer(text)
                
                for match in matches:
                    # Find the sentence containing the match
                    match_start = match.start()
                    match_end = match.end()
                    match_text = match.group(0)
                    
                    # Find which sentence contains this match
                    sentence_idx = 0
                    char_count = 0
                    for i, sentence in enumerate(sentences):
                        if char_count <= match_start < char_count + len(sentence) + 1:  # +1 for space
                            sentence_idx = i
                            break
                        char_count += len(sentence) + 1  # +1 for space
                    
                    # Get context (the sentence containing the match)
                    context = sentences[sentence_idx] if sentence_idx < len(sentences) else text
                    
                    keyword_matches.append({
                        'keyword': keyword,
                        'match_text': match_text,
                        'context': context,
                        'sentence_idx': sentence_idx
                    })
            
            # If we have matches, create a pattern match entry
            if keyword_matches:
                # Calculate confidence based on number of keyword matches
                confidence = min(1.0, len(keyword_matches) / len(pattern['keywords']))
                
                pattern_match = {
                    'pattern_id': pattern['id'],
                    'pattern_name': pattern['name'],
                    'category': pattern['category'],
                    'description': pattern['description'],
                    'speaker': speaker,
                    'timestamp': timestamp,
                    'text': text,
                    'keyword_matches': keyword_matches,
                    'confidence': confidence,
                    'frameworks': pattern['frameworks'],
                    'evidence_level': 0  # Will be calculated later
                }
                
                pattern_matches.append(pattern_match)
        
        return pattern_matches
    
    def _calculate_evidence_levels(self, results):
        """
        Calculate evidence levels for each pattern found.
        
        Args:
            results (dict): Analysis results
        """
        for pattern_match in results['patterns_found']:
            # Base evidence level on confidence and number of keyword matches
            confidence = pattern_match['confidence']
            num_matches = len(pattern_match['keyword_matches'])
            
            # Calculate evidence level (1-5 scale)
            if confidence < 0.2 or num_matches == 1:
                evidence_level = 1  # Basic evidence
            elif confidence < 0.4 or num_matches == 2:
                evidence_level = 2  # Moderate evidence
            elif confidence < 0.6 or num_matches == 3:
                evidence_level = 3  # Strong evidence
            elif confidence < 0.8 or num_matches <= 5:
                evidence_level = 4  # Very strong evidence
            else:
                evidence_level = 5  # Exceptional evidence
            
            pattern_match['evidence_level'] = evidence_level
    
    def _generate_overall_analysis(self, results):
        """
        Generate overall analysis of the transcript.
        
        Args:
            results (dict): Analysis results
        """
        # Sort patterns by evidence level
        results['patterns_found'].sort(key=lambda x: x['evidence_level'], reverse=True)
        
        # Calculate dominant categories
        category_counts = results['overall_analysis']['category_counts']
        if category_counts:
            dominant_category = max(category_counts.items(), key=lambda x: x[1])[0]
            results['overall_analysis']['dominant_category'] = dominant_category
            
            # Get category name from config
            category_name = config.PATTERN_CATEGORIES[dominant_category]['name']
            results['overall_analysis']['dominant_category_name'] = category_name
        
        # Calculate speaker with most patterns
        speaker_pattern_counts = {
            speaker: sum(stats['patterns'].values())
            for speaker, stats in results['speakers'].items()
        }
        
        if speaker_pattern_counts:
            dominant_speaker = max(speaker_pattern_counts.items(), key=lambda x: x[1])[0]
            results['overall_analysis']['dominant_speaker'] = dominant_speaker
        
        # Calculate top patterns
        pattern_counts = results['overall_analysis']['pattern_counts']
        if pattern_counts:
            top_patterns = sorted(pattern_counts.items(), key=lambda x: x[1], reverse=True)[:5]
            results['overall_analysis']['top_patterns'] = [
                {
                    'id': pattern_id,
                    'name': get_pattern_by_id(pattern_id)['name'],
                    'count': count
                }
                for pattern_id, count in top_patterns
            ]
        
        # Calculate overall sentiment
        overall_sentiment = {
            'positive': 0,
            'negative': 0,
            'neutral': 0,
            'compound': 0
        }
        
        total_segments = results['overall_analysis']['total_segments']
        if total_segments > 0:
            for speaker, stats in results['speakers'].items():
                segment_ratio = stats['segment_count'] / total_segments
                overall_sentiment['positive'] += stats['sentiment']['positive'] * segment_ratio
                overall_sentiment['negative'] += stats['sentiment']['negative'] * segment_ratio
                overall_sentiment['neutral'] += stats['sentiment']['neutral'] * segment_ratio
                overall_sentiment['compound'] += stats['sentiment']['compound'] * segment_ratio
        
        results['overall_analysis']['sentiment'] = overall_sentiment
