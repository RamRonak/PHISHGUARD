"""
test_app.py - Automated Unit & Integration Test Suite for PHISHGUARD Platform
Tests database schemas, all 10 frontend templates, static files, and REST API endpoints
using in-memory request-response streams (runs in any sandbox or restricted environment).
"""

import unittest
import os
import sys
import io
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import database
from app import PhishGuardRequestHandler

class DummyServer:
    pass

def execute_request(method, path, body=None, headers=None):
    """Executes a simulated HTTP request directly through PhishGuardRequestHandler."""
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
            # Suppress console logging during unit testing
            pass

    handler = TestHandler()
    output = handler.wfile.getvalue()

    # Parse response
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


class TestDatabase(unittest.TestCase):
    def setUp(self):
        database.init_db()
        self.session_id = "test_user_unit_12345"

    def test_01_user_creation(self):
        user = database.get_or_create_user(self.session_id, "Test Champion")
        self.assertIsNotNone(user)
        self.assertEqual(user["session_id"], self.session_id)
        self.assertEqual(user["username"], "Test Champion")

    def test_02_module_progress(self):
        success = database.mark_module_complete(self.session_id, "fundamentals")
        self.assertTrue(success)
        progress = database.get_user_progress(self.session_id)
        mod_ids = [m["module_id"] for m in progress]
        self.assertIn("fundamentals", mod_ids)

    def test_03_quiz_submission(self):
        result = database.record_quiz_attempt(self.session_id, "practice_quiz", 12, 15)
        self.assertEqual(result["percentage"], 80.0)
        self.assertTrue(result["passed"])

    def test_04_certificate_generation_and_verification(self):
        cert = database.issue_certificate(self.session_id, "Alex Mercer", 90.0)
        self.assertIn("certificate_id", cert)
        cert_id = cert["certificate_id"]

        verify = database.verify_certificate(cert_id)
        self.assertTrue(verify["valid"])
        self.assertEqual(verify["certificate"]["recipient_name"], "Alex Mercer")

        fail_cert = database.issue_certificate(self.session_id, "Alex Mercer", 75.0)
        self.assertIn("error", fail_cert)

    def test_05_dashboard_stats(self):
        database.mark_module_complete(self.session_id, "email_phishing")
        stats = database.get_dashboard_stats(self.session_id)
        self.assertGreaterEqual(stats["modules_completed"], 1)
        self.assertGreaterEqual(stats["best_quiz_score"], 80.0)

    def test_06_simulation_log(self):
        success = database.log_simulation(self.session_id, "sim_m365_doc", "phish", True)
        self.assertTrue(success)

    def test_07_reset(self):
        database.reset_user_progress(self.session_id)
        stats = database.get_dashboard_stats(self.session_id)
        self.assertEqual(stats["modules_completed"], 0)


class TestWebPagesAndTemplates(unittest.TestCase):
    def test_01_all_10_pages_render(self):
        pages = [
            ("/", "Think Before You Click"),
            ("/fundamentals", "Phishing Fundamentals"),
            ("/emails", "Recognizing Phishing Emails"),
            ("/fake-websites", "Fake Website Detection"),
            ("/social-engineering", "Social Engineering Awareness"),
            ("/case-studies", "Real-World Case Studies"),
            ("/quiz", "Phishing Awareness Quiz"),
            ("/simulation-lab", "Phishing Simulation Learning Lab"),
            ("/safety-guide", "Prevention & Cyber Safety Guide"),
            ("/final-assessment", "Final Assessment & Certificate"),
            ("/dashboard", "Defensive Readiness Dashboard")
        ]
        for path, expected_text in pages:
            status, hdrs, body = execute_request("GET", path)
            self.assertEqual(status, 200, f"Page {path} returned status {status}")
            html = body.decode("utf-8")
            self.assertIn("PHISHGUARD", html, f"Page {path} missing brand PHISHGUARD")
            self.assertIn(expected_text, html, f"Page {path} missing expected content '{expected_text}'")

    def test_02_static_assets_serve(self):
        assets = [
            "/static/css/bootstrap.min.css",
            "/static/css/phishguard.css",
            "/static/js/app.js",
            "/static/js/quiz.js",
            "/static/js/assessment.js",
            "/static/js/lab.js",
            "/static/js/urldecoder.js",
            "/static/js/charts.js",
            "/checklist.txt"
        ]
        for asset in assets:
            status, hdrs, body = execute_request("GET", asset)
            self.assertEqual(status, 200, f"Asset {asset} returned {status}")
            self.assertGreater(len(body), 20, f"Asset {asset} was empty")

    def test_03_rest_api_lifecycle(self):
        sid = "integration_test_session_88"

        # 1. User
        st, _, body = execute_request("GET", f"/api/user?session_id={sid}")
        self.assertEqual(st, 200)
        user = json.loads(body.decode("utf-8"))
        self.assertEqual(user["session_id"], sid)

        # 2. Module progress
        st, _, body = execute_request("POST", "/api/progress/module", {"session_id": sid, "module_id": "fundamentals"})
        self.assertEqual(st, 200)
        prog = json.loads(body.decode("utf-8"))
        self.assertEqual(prog["status"], "success")

        # 3. Quiz submit
        st, _, body = execute_request("POST", "/api/quiz/submit", {
            "session_id": sid,
            "quiz_type": "practice_quiz",
            "score": 14,
            "total_questions": 15
        })
        self.assertEqual(st, 200)
        qres = json.loads(body.decode("utf-8"))
        self.assertTrue(qres["result"]["passed"])

        # 4. Certificate generate
        st, _, body = execute_request("POST", "/api/certificate/generate", {
            "session_id": sid,
            "recipient_name": "Taylor Swift",
            "score_percentage": 93.3
        })
        self.assertEqual(st, 200)
        cert = json.loads(body.decode("utf-8"))
        self.assertIn("certificate_id", cert["certificate"])
        cert_id = cert["certificate"]["certificate_id"]

        # 5. Verify Certificate
        st, _, body = execute_request("GET", f"/api/certificate/verify?cert_id={cert_id}")
        self.assertEqual(st, 200)
        ver = json.loads(body.decode("utf-8"))
        self.assertTrue(ver["valid"])

        # 6. Dashboard
        st, _, body = execute_request("GET", f"/api/dashboard?session_id={sid}")
        self.assertEqual(st, 200)
        dash = json.loads(body.decode("utf-8"))
        self.assertGreaterEqual(dash["stats"]["modules_completed"], 1)

if __name__ == "__main__":
    unittest.main()
