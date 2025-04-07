"""
PDF Extractor Module
-------------------
This module handles the extraction of text from PDF transcript files,
including speaker identification and timestamp parsing.
"""

import os
import re
import io
import PyPDF2
from pdfminer.high_level import extract_text
from pdfminer.layout import LAParams
import logging

# Import configuration
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import config

class PDFExtractor:
    """Class for extracting text and metadata from PDF transcripts."""
    
    def __init__(self):
        """Initialize the PDF extractor."""
        self.logger = logging.getLogger(__name__)
        self.min_line_length = config.PDF_SETTINGS['min_line_length']
        self.speaker_pattern = re.compile(config.PDF_SETTINGS['speaker_pattern'])
    
    def extract_text(self, file_path):
        """
        Extract text from a PDF file.
        
        Args:
            file_path (str): Path to the PDF file
            
        Returns:
            dict: A dictionary containing the transcript data with the following keys:
                - metadata: Dictionary of metadata (title, date, etc.)
                - segments: List of transcript segments with speaker, timestamp, and text
        """
        if not os.path.exists(file_path):
            self.logger.error(f"File not found: {file_path}")
            raise FileNotFoundError(f"File not found: {file_path}")
        
        # Check if the file is a PDF
        if not file_path.lower().endswith('.pdf'):
            self.logger.error(f"File is not a PDF: {file_path}")
            raise ValueError(f"File is not a PDF: {file_path}")
        
        try:
            # First try with PyPDF2
            text = self._extract_with_pypdf2(file_path)
            
            # If PyPDF2 fails or returns empty text, try with pdfminer
            if not text or len(text.strip()) < 100:  # Arbitrary threshold
                self.logger.info("PyPDF2 extraction yielded insufficient text, trying pdfminer")
                text = self._extract_with_pdfminer(file_path)
            
            # Process the extracted text
            transcript_data = self._process_transcript(text)
            
            return transcript_data
            
        except Exception as e:
            self.logger.error(f"Error extracting text from PDF: {str(e)}")
            raise
    
    def _extract_with_pypdf2(self, file_path):
        """Extract text using PyPDF2."""
        text = ""
        try:
            with open(file_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                for page in reader.pages:
                    text += page.extract_text() + "\n"
            return text
        except Exception as e:
            self.logger.warning(f"PyPDF2 extraction failed: {str(e)}")
            return ""
    
    def _extract_with_pdfminer(self, file_path):
        """Extract text using pdfminer.six."""
        try:
            laparams = LAParams()
            text = extract_text(file_path, laparams=laparams)
            return text
        except Exception as e:
            self.logger.error(f"pdfminer extraction failed: {str(e)}")
            raise
    
    def _process_transcript(self, text):
        """
        Process the extracted text to identify speakers, timestamps, and segments.
        
        Args:
            text (str): The extracted text from the PDF
            
        Returns:
            dict: A dictionary containing the transcript data
        """
        lines = text.split('\n')
        metadata = self._extract_metadata(lines)
        segments = self._extract_segments(lines)
        
        return {
            'metadata': metadata,
            'segments': segments
        }
    
    def _extract_metadata(self, lines):
        """
        Extract metadata from the transcript.
        
        Args:
            lines (list): List of text lines
            
        Returns:
            dict: Dictionary of metadata
        """
        metadata = {
            'title': '',
            'date': '',
            'participants': []
        }
        
        # Look for metadata in the first 20 lines
        for i, line in enumerate(lines[:20]):
            line = line.strip()
            
            # Skip empty lines
            if not line:
                continue
            
            # Look for title
            if 'Meeting with' in line or 'Transcript' in line:
                metadata['title'] = line
            
            # Look for date
            date_match = re.search(r'\d{1,2}/\d{1,2}/\d{4}', line)
            if date_match:
                metadata['date'] = date_match.group(0)
            
            # Look for participants
            if 'Participants' in line or 'Attendees' in line:
                # Collect participant names from subsequent lines
                j = i + 1
                while j < len(lines) and j < i + 10:  # Look at next 10 lines max
                    participant = lines[j].strip()
                    if participant and len(participant) > 2 and 'Transcript' not in participant:
                        metadata['participants'].append(participant)
                    j += 1
        
        return metadata
    
    def _extract_segments(self, lines):
        """
        Extract transcript segments with speaker, timestamp, and text.
        
        Args:
            lines (list): List of text lines
            
        Returns:
            list: List of segment dictionaries
        """
        segments = []
        current_speaker = None
        current_timestamp = None
        current_text = []
        
        # Skip header lines (metadata)
        start_idx = 0
        for i, line in enumerate(lines):
            if 'Transcription' in line or 'Transcript' in line:
                start_idx = i + 1
                break
        
        # Process transcript lines
        for line in lines[start_idx:]:
            line = line.strip()
            
            # Skip empty or too short lines
            if not line or len(line) < self.min_line_length:
                continue
            
            # Check if this line starts a new speaker segment
            speaker_match = re.search(r'^([A-Za-z\s]+)\s+(\d+:\d+)$', line)
            
            if speaker_match:
                # If we have a current segment, save it
                if current_speaker and current_text:
                    segments.append({
                        'speaker': current_speaker,
                        'timestamp': current_timestamp,
                        'text': ' '.join(current_text)
                    })
                
                # Start a new segment
                current_speaker = speaker_match.group(1).strip()
                current_timestamp = speaker_match.group(2)
                current_text = []
            else:
                # Check if this is a continuation line with just a timestamp
                timestamp_match = re.search(r'^(\d+:\d+)$', line)
                
                if timestamp_match:
                    # This is just a timestamp line, skip it
                    continue
                
                # This is content for the current speaker
                if current_speaker:
                    current_text.append(line)
        
        # Add the last segment if there is one
        if current_speaker and current_text:
            segments.append({
                'speaker': current_speaker,
                'timestamp': current_timestamp,
                'text': ' '.join(current_text)
            })
        
        return segments
