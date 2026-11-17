"""
test_fresh_session.py - Verifies that fresh user sessions strictly start at 0% progress
and that merely loading pages does not artificially complete modules.
"""

import unittest
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import database
import json
import io
from app import PhishGuardRequestHandler

class DummyServer:
    pass

def execute_request(method, path, body=None, headers=None):
    hdrs = headers or {}
    body_bytes = b""
    if body is not None:
        if isinstance(body, dict):
            body_bytes = json.dumps(body).encode("utf-8")
            hdrs["Content-Type"] = "application/json"
        elif isinstance(body, str):
            body_bytes = body.encode("utf-8")
        elif isinstance(body, bytes):
            body_bytes = body
        hdrs["Content-Length"] = str(len(body_bytes))

    header_lines = [f"{k}: {v}" for k, v in hdrs.items()]
    headers_raw = "\r\n".join(header_lines)
    if headers_raw:
        headers_raw = "\r\n" + headers_raw

    raw_req = f"{method} {path} HTTP/1.1\r\nHost: localhost{headers_raw}\r\n\r\n".encode("utf-8") + body_bytes

    class TestHandler(PhishGuardRequestHandler):
        def __init__(self):
            self.rfile = io.BytesIO(raw_req)
            self.wfile = io.BytesIO()
            self.client_address = ('127.0.0.1', 8080)
            self.server = DummyServer()
            self.close_connection = True
            self.handle_one_request()

        def log_message(self, format, *args):
            pass

    handler = TestHandler()
    output = handler.wfile.getvalue()

    header_part, _, body_part = output.partition(b"\r\n\r\n")
    lines = header_part.decode("utf-8", errors="ignore").split("\r\n")
    status_line = lines[0] if lines else "HTTP/1.1 500 ERROR"
    status_code = int(status_line.split()[1]) if len(status_line.split()) >= 2 else 500

    resp_headers = {}
    for line in lines[1:]:
        if ":" in line:
            k, v = line.split(":", 1)
            resp_headers[k.strip().lower()] = v.strip()

    return status_code, resp_headers, body_part

class TestZeroProgressInitialState(unittest.TestCase):
    def setUp(self):
        database.init_db()
        self.fresh_session = "fresh_student_session_zero_test_99"
        database.reset_user_progress(self.fresh_session)

    def test_01_fresh_session_starts_at_zero(self):
        """Verify that dashboard API reports strictly 0 modules and 0.0% progress."""
        status, _, body = execute_request("GET", f"/api/dashboard?session_id={self.fresh_session}")
        self.assertEqual(status, 200)
        data = json.loads(body.decode("utf-8"))
        
        self.assertEqual(data["stats"]["modules_completed"], 0)
        self.assertEqual(data["stats"]["progress_percentage"], 0.0)
        self.assertEqual(data["stats"]["best_quiz_score"], 0)
        self.assertEqual(data["stats"]["assessment_score"], 0)
        self.assertEqual(len(data["completed_modules"]), 0)

    def test_02_loading_templates_does_not_call_backend_automatically(self):
        """Simulate loading fundamentals, emails, and case studies."""
        pages = ["/fundamentals", "/emails", "/fake-websites", "/social-engineering", "/case-studies", "/safety-guide"]
        for p in pages:
            status, _, _ = execute_request("GET", p, headers={"X-Session-ID": self.fresh_session})
            self.assertEqual(status, 200)
        
        # After loading all pages, progress must STILL be 0!
        status, _, body = execute_request("GET", f"/api/dashboard?session_id={self.fresh_session}")
        data = json.loads(body.decode("utf-8"))
        self.assertEqual(data["stats"]["modules_completed"], 0)
        self.assertEqual(data["stats"]["progress_percentage"], 0.0)

    def test_03_explicit_completion_works(self):
        """Explicitly completing module increments progress accurately."""
        status, _, _ = execute_request("POST", "/api/progress/module", 
                                       body={"session_id": self.fresh_session, "module_id": "fundamentals"})
        self.assertEqual(status, 200)
        
        status, _, body = execute_request("GET", f"/api/dashboard?session_id={self.fresh_session}")
        data = json.loads(body.decode("utf-8"))
        self.assertEqual(data["stats"]["modules_completed"], 1)
        self.assertEqual(data["stats"]["progress_percentage"], 10.0)

    def test_04_reset_wipes_to_zero(self):
        """Reset endpoint sets everything back to 0%."""
        status, _, _ = execute_request("POST", "/api/reset", body={"session_id": self.fresh_session})
        self.assertEqual(status, 200)

        status, _, body = execute_request("GET", f"/api/dashboard?session_id={self.fresh_session}")
        data = json.loads(body.decode("utf-8"))
        self.assertEqual(data["stats"]["modules_completed"], 0)
        self.assertEqual(data["stats"]["progress_percentage"], 0.0)

if __name__ == "__main__":
    unittest.main()
