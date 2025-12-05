# Command: `oct search`

Search for concept files by identifier or content.

## Purpose
- Quickly locate concepts using partial identifiers or keywords in `.oct` files.
- Provide a filesystem-aware search scoped to the terminology tree.

## Behavior
- Default search root is `terms/<language>/` relative to the repository root.
- Recursively searches for files ending in `.oct`.
- Matches are reported when:
  - The query substring matches the filename (identifier), or
  - The query substring appears in the file contents (case-insensitive).
- Outputs matching identifiers or `filename # content` snippets for content matches.
- If no matches are found, prints `No matches found.`

## Arguments & Options
- `query` (positional): Text to search for in filenames or file contents.
- `--directory`, `-d`: Override the search root directory. Defaults to `terms/<language>/`.
- `--language`, `-l`: Language code used to select the default search directory. Defaults to `en-GB`.

## Usage Examples
```bash
./oct search flu
./oct search ABC123 --language en-US
./oct search heart --directory /custom/terms
```

## Validation & Error Handling
- If the search directory does not exist, the command prints `Directory not found: <path>` and exits without scanning.
- Files that cannot be read emit a `Could not read <path>` message and the scan continues.

## Notes for Implementers
- Use `Path.rglob('*.oct')` for recursive discovery to keep behavior consistent across platforms.
- Keep search case-insensitive for both identifiers and contents.
- Avoid truncating content in the output for now; adjust this spec if summarization rules are added.
