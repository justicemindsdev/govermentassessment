# Institutional Dynamics Analyzer

An automated system for analyzing transcripts to identify patterns of institutional gaslighting, coercive control, and other problematic communication dynamics.

## Overview

This system analyzes transcripts of conversations to identify patterns based on the Ben Mak expertise assessment framework. It can detect various patterns across six categories:

1. **System Navigation Knowledge**: Understanding of professional roles, organizational structures, and assessment frameworks
2. **Advocacy Techniques**: Sophisticated advocacy approaches that prevent defensive responses while maintaining accountability
3. **Power Dynamics Management**: Reshaping traditional power dynamics between service provider and user
4. **Metacognitive Awareness**: Ability to recognize systemic patterns and maintain self-awareness
5. **Coercive Control Recognition**: Understanding of institutional coercion and strategies to navigate it
6. **Causal Link Articulation**: Ability to articulate clear causal links between institutional actions and their impacts

## Features

- PDF transcript processing with speaker and timestamp identification
- Pattern recognition based on the Ben Mak expertise assessment framework
- Evidence scoring on a 1-5 scale
- Interactive HTML report generation
- Sentiment analysis for each speaker
- Expert framework citations and alignment

## Installation

### Prerequisites

- Python 3.8 or higher
- pip (Python package installer)

### Dependencies

Install the required dependencies:

```bash
pip install PyPDF2 pdfminer.six nltk jinja2
```

## Usage

### Basic Usage

```bash
python main.py <transcript_file> [--output <output_dir>]
```

### Arguments

- `transcript_file`: Path to the transcript file (PDF)
- `--output`, `-o`: Directory to save the analysis results (default: output)

### Example

```bash
python main.py /path/to/transcript.pdf --output results
```

## Output

The system generates:

1. An interactive HTML report with:
   - Executive summary
   - Participant statistics
   - Pattern analysis by category
   - Full transcript
   - Evidence scoring and framework alignment

2. A JSON file containing the raw analysis results

## System Architecture

The system consists of several components:

1. **PDF Processing**: Extracts text from PDF transcripts, identifies speakers and timestamps
2. **Pattern Analysis**: Analyzes the transcript for patterns of institutional dynamics
3. **Report Generation**: Generates an interactive HTML report from the analysis results

## Pattern Database

The pattern database is based on the Ben Mak expertise assessment framework and includes patterns across six categories. Each pattern includes:

- Keywords for identification
- Description of the pattern
- Example text
- Associated expert frameworks

## Customization

The system can be customized by modifying:

- `config.py`: Configuration settings for the system
- `pattern_database.py`: Patterns to look for in transcripts
- Templates in the `templates` directory: HTML, CSS, and JavaScript for the report

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Based on the Ben Mak expertise assessment framework
- Inspired by research on institutional gaslighting and coercive control
