# OCT CLI Specification

This document summarises how the `oct` command-line interface behaves today, based on `./oct` and `tools/oct.py`. It is intended as a stable reference for contributors and for future prompt-driven tooling.

## CLI Structure
- **Entrypoint**: run `./oct` (executable wrapper) or `python tools/oct.py`.
- **Implementation**: Python CLI built with `click` versioned as `0.1.1`.
- **Default data root**: `terms/` in the repository root, with language subdirectories such as `terms/en-GB/`.
- **Identifiers**: generated with a lowercase Crockford Base32 alphabet (`0123456789abcdefghjkmnpqrstvwxyz`) and default length of 6 characters.

## Command Reference

### `oct term new`
Create an empty concept file with a unique identifier.
- **Options**
  - `--directory, -d`: override the target directory (defaults to `terms/<language>/`).
  - `--language, -l`: language directory to use when no explicit directory is provided (default: `en-GB`).
- **Behavior**
  - Ensures the target directory exists (parents created as needed).
  - Attempts up to 1000 identifier generations; on success touches `<id>.oct` in the target directory and logs the identifier with a timestamp to `terms/terms`.
  - Prints the created path and the identifier.
- **Errors**
  - After 1000 failed attempts to find a free identifier, prints an error and exits non-zero.

### `oct search`
Search for identifiers or content within `.oct` files.
- **Arguments**
  - `query` (positional): substring to find in file names or contents.
- **Options**
  - `--directory, -d`: override the search root (defaults to `terms/<language>/`).
  - `--language, -l`: language directory to search when no explicit directory is given (default: `en-GB`).
- **Behavior**
  - Recursively scans for `*.oct` files under the search root.
  - Reports matches when the query (case-insensitive) appears in the filename or in the file contents. Content matches are printed as `<filename> # <content>`.
  - Prints `No matches found.` when nothing matches.
- **Errors**
  - If the search directory does not exist, prints `Directory not found: <path>` and stops.
  - Files that cannot be read emit `Could not read <path>: <error>` but do not stop the scan.

### `oct similar`
Find concept files with content similar to a query using cosine similarity.
- **Arguments**
  - `query` (positional): text to compare against concept files.
- **Options**
  - `--directory, -d`: override the directory to scan (defaults to `terms/<language>/`).
  - `--language, -l`: language directory to use when no explicit directory is set (default: `en-GB`).
  - `--threshold, -t`: minimum cosine similarity score to report (default: `0.2`).
- **Behavior**
  - Looks only at files directly under the target directory (non-recursive).
  - Reads file contents as UTF-8 and strips whitespace. Unreadable files are reported and skipped.
  - Builds TF-IDF vectors for the query and all readable files, then calculates cosine similarity scores.
  - Outputs matching files sorted by similarity in descending order as `[<score>] <filename>` when the score meets or exceeds the threshold.
  - Prints `No similar concepts found above the threshold.` when nothing qualifies.
- **Errors**
  - If the directory is missing, prints `Directory not found: <path>` and exits.
  - If no readable files are available, prints `No readable files found.` and exits.

## Logging and Side Effects
- `oct new` appends a timestamped entry to `terms/terms` for every created identifier.
- All commands rely on `pathlib.Path` for filesystem access and default to UTF-8 text handling.
