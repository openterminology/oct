# Caddy Webserver (local development)

This repository includes an optional Caddy configuration and a `docker-compose.yml` to run a lightweight Caddy webserver for local development.

Files added:

- `caddy/Caddyfile` — reverse-proxy configuration (proxies to `localhost:8000`) and optional static file serving from `./static`.
- `docker-compose.yml` — runs the official `caddy:2` image; uses `network_mode: "host"` so Caddy can proxy to services running on the host (useful for local dev servers on Linux).

Quick start (local development):

1. Ensure Docker and Docker Compose are installed.
2. Optionally create a `static/` directory if you want Caddy to serve static files under `/static/`.
3. Start Caddy with Docker Compose:

```bash
docker compose up -d caddy
```

Notes:

- The default Caddyfile proxies requests to `localhost:8000`. If your application listens on a different port, update `caddy/Caddyfile` accordingly.
- `network_mode: "host"` is convenient for local development on Linux; if you prefer isolated networking, remove `network_mode` and expose port `80` on the container, then update the proxy target to the container service name.
- Caddy persists ACME and other runtime state in `caddy/data` and `caddy/config` when running via the provided compose file.

Name / trademark note:

- The UI in this branch is named "Octopus" (Octopus viewer). There is an existing product called "Octopus Viewer" outside this project; before using the same name publicly or publishing releases, please check for any trademark or branding conflicts and consider renaming if necessary. This repository does not perform any trademark clearance — this is a reminder to review naming/branding legally as appropriate for your organization.
