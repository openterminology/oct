#!/usr/bin/env python3
"""
OCT - Open Clinical Terminology Tool

A command-line tool for managing the Open Clinical Terminology.
"""

import click
import secrets
from datetime import datetime, timezone
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Crockford Base32 alphabet in lowercase (excludes i, l, o, u to avoid confusion)
CROCKFORD_BASE32 = "0123456789abcdefghjkmnpqrstvwxyz"


def generate_crockford_base32_id(length=6):
    """
    Generate a random identifier using Crockford Base32 encoding.

    Args:
        length (int): Length of the identifier to generate

    Returns:
        str: Random identifier using Crockford Base32 characters
    """
    return "".join(secrets.choice(CROCKFORD_BASE32) for _ in range(length))


def get_terms_directory():
    """Get the path to the terms directory."""
    # Assume we're in tools/ and terms/ is a sibling directory
    tools_dir = Path(__file__).parent
    terms_dir = tools_dir.parent / "terms"
    return terms_dir


def log_term_creation(identifier):
    """Append a creation log entry for the new term."""
    terms_dir = get_terms_directory()
    log_path = terms_dir / "terms"

    timestamp = datetime.now().replace(microsecond=0).isoformat()

    log_path.parent.mkdir(parents=True, exist_ok=True)

    with log_path.open("a", encoding="utf-8") as log_file:
        log_file.write(f"{timestamp} {identifier}\n")


@click.group()
@click.version_option(version="0.1.1")
def cli():
    """OCT - Open Clinical Terminology Tool"""
    pass


@cli.command()
@click.option(
    "--directory",
    "-d",
    default=None,
    help="Directory to create the file in (defaults to terms/)",
)
@click.option(
    "--language",
    "-l",
    default="en-GB",
    help="Language code for the concept (defaults to en-GB)",
)
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
        filepath = target_dir / f"{identifier}.oct"
        
        # Check if file already exists
        if not filepath.exists():
            # Create empty file
            filepath.touch()
            log_term_creation(identifier)
            click.echo(f"Created new concept file: {filepath}")
            click.echo(f"Concept ID: {identifier}")
            return

    # If we get here, we couldn't generate a unique ID
    click.echo(
        f"Error: Could not generate unique identifier after {max_attempts} attempts",
        err=True,
    )
    exit(1)


# ----------------------------------------------------------------
# COMMAND: SEARCH
# ----------------------------------------------------------------
@cli.command()
@click.argument("query", required=True)
@click.option(
    "--directory", "-d", default=None, help="Directory to search (defaults to terms/)"
)
@click.option(
    "--language",
    "-l",
    default="en-GB",
    help="Language code for the concept (defaults to en-GB)",
)
def search(query, directory, language):
    """Search for a concept file by ID or content."""
    if directory:
        search_dir = Path(directory)
    else:
        search_dir = get_terms_directory() / language
    if not search_dir.exists():
        click.echo(f"Directory not found: {search_dir}")
        return
    found = False
    for filepath in search_dir.rglob('*.oct'):
        concept_id = filepath.stem
        if query.lower() in concept_id.lower():
            click.echo(f"Found by filename: {concept_id}")
            found = True
        elif filepath.is_file():
            try:
                content = filepath.read_text(encoding="utf-8")
                if query.lower() in content.lower():
                    click.echo(f"{filepath.name} # {content}")
                    found = True
            except Exception as e:
                click.echo(f"Could not read {filepath}: {e}")
    if not found:
        click.echo("No matches found.")


# ----------------------------------------------------------------
# COMMAND: SIMILAR
# ----------------------------------------------------------------
@cli.command()
@click.argument("query", required=True)
@click.option(
    "--directory", "-d", default=None, help="Directory to search (defaults to terms/)"
)
@click.option(
    "--language",
    "-l",
    default="en-GB",
    help="Language code for the concept (defaults to en-GB)",
)
@click.option(
    "--threshold",
    "-t",
    default=0.2,
    type=float,
    help="Cosine similarity threshold for matching (default: 0.2)",
)
def similar(query, directory, language, threshold):
    """Find concept files similar in meaning to the query using cosine similarity."""
    # Determine search directory
    if directory:
        search_dir = Path(directory)
    else:
        search_dir = get_terms_directory() / language

    if not search_dir.exists():
        click.echo(f"Directory not found: {search_dir}")
        return

    # Read all concept files
    filepaths, texts = [], []
    for filepath in search_dir.glob("*"):
        if filepath.is_file():
            try:
                text = filepath.read_text(encoding="utf-8").strip()
                filepaths.append(filepath)
                texts.append(text)
            except Exception as e:
                click.echo(f"Could not read {filepath}: {e}")

    if not texts:
        click.echo("No readable files found.")
        return

    # Vectorize query and all texts
    vectorizer = TfidfVectorizer().fit([query] + texts)
    vectors = vectorizer.transform([query] + texts)

    # Compute cosine similarity scores
    similarities = cosine_similarity(vectors[0:1], vectors[1:]).flatten()

    # Display results sorted by similarity score
    found = False
    for filepath, score in sorted(
        zip(filepaths, similarities), key=lambda x: x[1], reverse=True
    ):
        if score >= threshold:
            click.echo(f"[{score:.3f}] {filepath.name}")
            found = True

    if not found:
        click.echo("No similar concepts found above the threshold.")


if __name__ == "__main__":
    cli()
# End-of-file (EOF)
