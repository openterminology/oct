# Documentation setup

This project uses [MkDocs](https://www.mkdocs.org/) with the [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/) theme.

## Local setup

From the repository root, ensure your Python environment is active (for example, using the existing `.venv`) and install MkDocs and the Material theme:

```bash
pip install "mkdocs-material>=9.0"
```

## Serving the docs locally

From the repository root (where `mkdocs.yml` lives), run:

```bash
mkdocs serve
```

Then open the URL shown in the terminal (typically `http://127.0.0.1:8000/`).

## Building the static site

To build a static site into the `site/` directory:

```bash
mkdocs build
```

You can then deploy the `site/` directory to any static web host (GitHub Pages, Netlify, Cloudflare Pages, etc.).
