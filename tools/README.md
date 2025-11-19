# OCT Tool

This directory contains the Python-based command-line tool for managing the Open Clinical Terminology (OCT).

## Installation

1. Install Python 3.7 or higher
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage
Create and activate a virtual environment (recommended):

```bash
# create a virtual environment in `.venv`
python3 -m venv .venv

# activate the virtual environment (Linux/macOS, bash/zsh)
source .venv/bin/activate

# upgrade pip and install dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

To deactivate the virtual environment:

```bash
deactivate
```

Make the script executable:
```bash
chmod +x oct.py
```

### Available Commands

#### `oct new`
Creates a new concept file with a unique 6-character lowercase Crockford Base32 identifier.

```bash
./oct.py new
```

Options:
- `-d, --directory`: Specify a custom directory (defaults to `../terms/`)

Example:
```bash
./oct.py new
# Creates a file like: ../terms/a1b2c3.oct

./oct.py new --directory /custom/path
# Creates a file in the specified directory
```

## Technical Details

- Uses Crockford Base32 encoding for identifiers (0123456789abcdefghjkmnpqrstvwxyz)
- Excludes confusing letters (i, l, o, u are not used)
- Generates cryptographically secure random identifiers
- Automatically checks for duplicates and retries if necessary
- Creates empty `.oct` files ready for content addition