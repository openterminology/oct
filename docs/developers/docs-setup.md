# Documentation setup

This project uses [Zensical](https://zensical.org/) for documentation.

## Local setup

From the repository root, ensure your Python environment is active (for example, using the existing `.venv`) and install the documentation dependency:

```bash
pip install -r requirements.txt
```

## Serving the docs locally

From the repository root (where `mkdocs.yml` lives), run:

```bash
zensical serve
```

Then open the URL shown in the terminal (typically `http://127.0.0.1:8000/`).

## Building the static site

To build a static site into the `site/` directory:

```bash
zensical build --clean
```

You can then deploy the `site/` directory to any static web host (GitHub Pages, Netlify, Cloudflare Pages, etc.).
