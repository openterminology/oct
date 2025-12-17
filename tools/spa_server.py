#!/usr/bin/env python3
"""Small static server that falls back to /static/index.html for SPA routes.

Usage:
  ./tools/spa_server.py [--port PORT] [--dir ROOT]

Serves files from ROOT (default repo root) and when a GET request
doesn't match an existing file, returns /static/index.html so client-side
routing works.
"""
import http.server
import socketserver
import argparse
import os


class SPARequestHandler(http.server.SimpleHTTPRequestHandler):
    def send_error(self, code, message=None, explain=None):
        # Override to avoid sending default error pages for GET — we'll fallback
        """
        Send an HTTP error response using the base SimpleHTTPRequestHandler implementation.
        
        Parameters:
            code (int): HTTP status code to send.
            message (str | None): Optional short status message to include.
            explain (str | None): Optional detailed explanation to include.
        """
        super().send_error(code, message, explain)

    def do_GET(self):
        # Serve existing files normally
        """
        Handle HTTP GET requests with SPA-friendly fallback.
        
        If the requested path maps to an existing file under the served directory, serve that file normally. If no file matches, serve `<directory>/static/index.html` with a 200 status and `text/html; charset=utf-8` when that fallback file exists. If the fallback file is absent, delegate to the base handler's GET implementation (which produces the normal 404 behavior).
        """
        path = self.translate_path(self.path)
        if os.path.exists(path) and os.path.isfile(path):
            return http.server.SimpleHTTPRequestHandler.do_GET(self)

        # Fallback to /static/index.html for SPA
        fallback = os.path.join(self.directory, 'static', 'index.html')
        if os.path.exists(fallback):
            with open(fallback, 'rb') as f:
                self.send_response(200)
                self.send_header('Content-type', 'text/html; charset=utf-8')
                self.end_headers()
                self.wfile.write(f.read())
            return

        # Otherwise, default 404
        return http.server.SimpleHTTPRequestHandler.do_GET(self)


def main():
    """
    Start a static HTTP server that serves files from a specified directory and falls back to /static/index.html for SPA routes.
    
    Parses command-line options --port (default 8000) and --dir (default: current working directory), changes the process working directory to the provided directory, configures the SPA request handler for that directory, and starts an HTTP server on the given port. Prints a startup message and stops gracefully on KeyboardInterrupt.
    """
    p = argparse.ArgumentParser()
    p.add_argument('--port', type=int, default=8000)
    p.add_argument('--dir', default=os.getcwd())
    args = p.parse_args()

    os.chdir(args.dir)
    handler = SPARequestHandler
    handler.directory = args.dir

    with socketserver.TCPServer(('', args.port), handler) as httpd:
        print(f"Serving {args.dir} on port {args.port} (SPA fallback to /static/index.html)")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print('\nShutting down')


if __name__ == '__main__':
    main()