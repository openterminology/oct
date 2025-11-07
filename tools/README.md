# OCT Tool

This directory contains the Python-based command-line tool for managing the Open Clinical Terminology (OCT).

## Installation

1. Install Python 3.7 or higher
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

Make the script executable:
```bash
chmod +x oct.py
```

### Available Commands

#### `oct new`
Creates a new concept file with a unique 6-character Crockford Base32 identifier.

```bash
./oct.py new
```

Options:
- `-d, --directory`: Specify a custom directory (defaults to `../terms/`)

Example:
```bash
./oct.py new
# Creates a file like: ../terms/A1B2C3.md

./oct.py new --directory /custom/path
# Creates a file in the specified directory
```
#### `oct search`
seach an existing concept file with a unique 6-character Crockford Base32 identifier.

Example:
```bash
# Search by keyword in file name or content
./oct.py search "delusion"

# Search for a specific concept ID
./oct.py search "A1B2C3"

# Specify a custom directory
./oct.py search "anxiety" --directory ./custom_terms/en-GB

## Technical Details

- Uses Crockford Base32 encoding for identifiers (0123456789ABCDEFGHJKMNPQRSTVWXYZ)
- Excludes confusing characters (0, 1, I, L, O, U are not used)
- Generates cryptographically secure random identifiers
- Automatically checks for duplicates and retries if necessary
- Creates empty `.md` files ready for content addition