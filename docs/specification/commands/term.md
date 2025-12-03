# `oct term`

Commands for managing clinical terminology concepts.

## `oct term new`

Create a new concept file with a unique Crockford Base32 identifier.

### Purpose
- Provide a fast, repeatable way to create empty `.oct` term files.
- Ensure identifiers are globally unique within the terminology dataset.

### Behavior
- Default target directory is `terms/<language>/` relative to the repository root.
- Uses a lowercase Crockford Base32 alphabet (excluding `i`, `l`, `o`, `u`) to generate a 6-character ID.
- Retries up to 1000 times to avoid collisions; aborts with an error if uniqueness cannot be achieved.
- Logs each creation event to `terms/terms` with an ISO 8601 timestamp and the generated identifier.
- Creates an empty file named `<id>.oct` and prints the path and identifier.

### Arguments & Options
- `--directory`, `-d`: Override the target directory for the new file. Defaults to `terms/<language>/`.
- `--language`, `-l`: Language code used to select the default directory. Defaults to `en-GB`.

### Usage Examples
```bash
./oct term new
./oct term new --language en-US
./oct term new --directory /custom/path
```

### Validation & Error Handling
- If the target directory does not exist, it is created (including parent directories).
- If file creation fails after 1000 attempts, the command exits with a non-zero status and an error message.

### Notes
- Use `secrets.choice` for identifier generation to maintain entropy.
- Use `Path.touch()` to create files and `Path` operations for portability.
- Update this spec if the identifier length, alphabet, or logging format changes.
