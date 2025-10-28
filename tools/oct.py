#!/usr/bin/env python3
"""
OCT - Open Clinical Terminology Tool

A command-line tool for managing the Open Clinical Terminology.
"""

import click
import secrets
import os
from pathlib import Path


# Crockford Base32 alphabet (excludes 0, 1, I, L, O, U to avoid confusion)
CROCKFORD_BASE32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"


def generate_crockford_base32_id(length=6):
    """
    Generate a random identifier using Crockford Base32 encoding.
    
    Args:
        length (int): Length of the identifier to generate
        
    Returns:
        str: Random identifier using Crockford Base32 characters
    """
    return ''.join(secrets.choice(CROCKFORD_BASE32) for _ in range(length))


def get_terms_directory():
    """Get the path to the terms directory."""
    # Assume we're in tools/ and terms/ is a sibling directory
    tools_dir = Path(__file__).parent
    terms_dir = tools_dir.parent / "terms"
    return terms_dir


@click.group()
@click.version_option(version="0.1.0")
def cli():
    """OCT - Open Clinical Terminology Tool"""
    pass


@cli.command()
@click.option('--directory', '-d', default=None, 
              help='Directory to create the file in (defaults to terms/)')
@click.option('--language', '-l', default='en-GB',
              help='Language code for the concept (defaults to en-GB)')
def new(directory, language):
    """Create a new concept file with a unique Crockford Base32 identifier."""
    
    # Determine target directory
    if directory:
        target_dir = Path(directory)
    else:
        target_dir = get_terms_directory() / language
    
    # Ensure target directory exists
    target_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate unique identifier
    max_attempts = 1000
    for attempt in range(max_attempts):
        identifier = generate_crockford_base32_id()
        filepath = target_dir / f"{identifier}"
        
        # Check if file already exists
        if not filepath.exists():
            # Create empty file
            filepath.touch()
            click.echo(f"Created new concept file: {filepath}")
            click.echo(f"Concept ID: {identifier}")
            return
    
    # If we get here, we couldn't generate a unique ID
    click.echo(f"Error: Could not generate unique identifier after {max_attempts} attempts", err=True)
    exit(1)


if __name__ == '__main__':
    cli()