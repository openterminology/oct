# gitehr specification

This document collates the current behavior of the `gitehr` command-line tool as implemented in this repository. It is intended to remain up to date with the code so future tooling and prompts can rely on accurate descriptions of what the CLI does today.

## Overall behavior
- The entry point is the executable `oct` in the repository root, which loads the Click-based CLI from `tools/oct.py` and exposes the `gitehr` commands documented below. The CLI currently reports version `0.1.1`.
- Term data lives under `terms/` by default. Language-specific terms are expected in `terms/<language>/`, and concept creation events are appended to `terms/terms` as a plain-text log containing ISO 8601 timestamps followed by generated identifiers.
- Identifiers use a lowercase Crockford Base32 alphabet (`0123456789abcdefghjkmnpqrstvwxyz`) without the characters `i`, `l`, `o`, or `u`. The default length for generated IDs is six characters.
- All user-facing output goes through Click, and commands prefer to fail fast with clear messages when directories are missing or content cannot be read.
- Dependencies include `click` for argument parsing and `scikit-learn`’s `TfidfVectorizer` and `cosine_similarity` for similarity scoring.

## Commands

### `gitehr new`
Create an empty concept file with a unique identifier.

**Behavior**
- Determines the target directory from `--directory`/`-d` (if provided) or defaults to `terms/<language>/`.
- Ensures the target directory exists before writing.
- Generates random six-character Crockford Base32 identifiers, retrying up to 1000 times to avoid collisions.
- Creates an empty `<id>.oct` file and logs the identifier with a timestamp to `terms/terms`.
- Prints both the created file path and the concept identifier.

**Options**
- `--directory, -d`: Override the output directory (defaults to `terms/<language>/`).
- `--language, -l`: Language code used to select the default directory (default: `en-GB`).

### `gitehr search`
Search term files by identifier substring or content.

**Behavior**
- Scans recursively for `.oct` files under the provided `--directory` or the default `terms/<language>/` tree.
- A match occurs when the query (case-insensitive) appears in the filename stem or anywhere in the file contents.
- Prints matching identifiers or `filename # content` for content matches; reports `No matches found.` when nothing matches.
- If the search directory is missing, prints `Directory not found: <path>` and stops.
- Files that cannot be read emit `Could not read <path>: <error>` and the search continues.

**Arguments and options**
- `query` (positional): Text to match against identifiers or file contents.
- `--directory, -d`: Override the search root (defaults to `terms/<language>/`).
- `--language, -l`: Language code used when choosing the default search directory (default: `en-GB`).

### `gitehr similar`
Find concept files whose contents are similar to a free-text query.

**Behavior**
- Loads `.oct` files from the provided `--directory` or the default `terms/<language>/` folder; the current implementation scans only the immediate files within that directory (non-recursive).
- Builds TF-IDF vectors for the query and each file’s contents, then computes cosine similarity scores.
- Displays results sorted by similarity score in descending order, prefixing each filename with its similarity (e.g., `[0.347] example.oct`).
- Applies a similarity threshold (default `0.2`); files scoring below the threshold are suppressed. If none meet the threshold, the command reports `No similar concepts found above the threshold.`
- If the directory does not exist, prints `Directory not found: <path>` and exits. If no readable files are present, prints `No readable files found.`

**Arguments and options**
- `query` (positional): Free-text query to compare against term contents.
- `--directory, -d`: Directory to scan (defaults to `terms/<language>/`).
- `--language, -l`: Language code used for the default directory (default: `en-GB`).
- `--threshold, -t`: Minimum cosine similarity required to display a result (default: `0.2`).
