"""Standard-library HTTP application for ClaimLens AI."""

from dataclasses import asdict
import json
import mimetypes
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

from src.pipeline import analyze_claim


PROJECT_ROOT = Path(__file__).resolve().parent
CLAIMS_ROOT = PROJECT_ROOT / "data" / "claims"
FRONTEND_ROOT = PROJECT_ROOT / "frontend" / "dist"
SERVER_ADDRESS = ("localhost", 8000)


def _claim_ids() -> list[str]:
    """Return available claim directory names in deterministic order."""

    if not CLAIMS_ROOT.is_dir():
        return []
    return sorted(path.name for path in CLAIMS_ROOT.iterdir() if path.is_dir())


class ClaimLensHandler(BaseHTTPRequestHandler):
    """Handle ClaimLens API requests and static frontend files."""

    def do_GET(self) -> None:
        try:
            request_path = urlsplit(self.path).path
            if request_path == "/api/health":
                self._send_json({"status": "ok"})
            elif request_path == "/api/claims":
                self._send_json({"claims": _claim_ids()})
            elif request_path.startswith("/api/claims/"):
                self._handle_claim_review(request_path)
            else:
                self._serve_static(request_path)
        except Exception as error:
            self._send_json({"error": f"Internal server error: {error}"}, status=500)

    def _handle_claim_review(self, request_path: str) -> None:
        prefix = "/api/claims/"
        suffix = "/review"
        if not request_path.endswith(suffix):
            self._send_json({"error": "Not found"}, status=404)
            return

        claim_id = unquote(request_path[len(prefix) : -len(suffix)]).strip("/")
        if claim_id not in _claim_ids():
            self._send_json({"error": "Claim not found"}, status=404)
            return

        self._send_json(asdict(analyze_claim(claim_id)))

    def _serve_static(self, request_path: str) -> None:
        if not FRONTEND_ROOT.is_dir():
            self._send_json({"error": "Frontend not found"}, status=404)
            return

        relative_path = "index.html" if request_path == "/" else request_path.lstrip("/")
        candidate = (FRONTEND_ROOT / unquote(relative_path)).resolve()
        frontend_root = FRONTEND_ROOT.resolve()
        if frontend_root not in candidate.parents and candidate != frontend_root:
            self._send_json({"error": "Not found"}, status=404)
            return
        if not candidate.is_file():
            self._send_json({"error": "File not found"}, status=404)
            return

        content = candidate.read_bytes()
        content_type = mimetypes.guess_type(candidate.name)[0] or "application/octet-stream"
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)

    def _send_json(self, payload: object, status: int = 200) -> None:
        content = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)


def main() -> None:
    """Start the ClaimLens HTTP server on localhost:8000."""

    server = HTTPServer(SERVER_ADDRESS, ClaimLensHandler)
    print("ClaimLens AI running at http://localhost:8000")
    try:
        server.serve_forever()
    finally:
        server.server_close()


if __name__ == "__main__":
    main()