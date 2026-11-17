"""
app.py - Standalone High-Performance Web Server & REST API for PHISHGUARD
Built using Python 3 standard library (zero external dependencies required).
Runs out-of-the-box on any standard Python installation with full SQLite persistence.
"""

import http.server
import socketserver
import urllib.parse
import http.cookies
import json
import os
import mimetypes
import uuid
import database

PORT = 5000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATES_DIR = os.path.join(BASE_DIR, "templates")
STATIC_DIR = os.path.join(BASE_DIR, "static")

# Ensure complete MIME types
mimetypes.add_type("text/css", ".css")
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("image/svg+xml", ".svg")
mimetypes.add_type("text/plain", ".txt")
mimetypes.add_type("application/json", ".json")

# Route mappings for clean URL navigation
ROUTE_MAP = {
    "/": "index.html",
    "/index": "index.html",
    "/index.html": "index.html",
    "/fundamentals": "fundamentals.html",
    "/fundamentals.html": "fundamentals.html",
    "/emails": "email_phishing.html",
    "/email-phishing": "email_phishing.html",
    "/email_phishing.html": "email_phishing.html",
    "/fake-websites": "fake_websites.html",
    "/fake_websites.html": "fake_websites.html",
    "/social-engineering": "social_engineering.html",
    "/social_engineering.html": "social_engineering.html",
    "/case-studies": "case_studies.html",
    "/case_studies.html": "case_studies.html",
    "/quiz": "quiz.html",
    "/quiz.html": "quiz.html",
    "/simulation-lab": "simulation_lab.html",
    "/simulation_lab.html": "simulation_lab.html",
    "/safety-guide": "safety_guide.html",
    "/safety_guide.html": "safety_guide.html",
    "/final-assessment": "final_assessment.html",
    "/final_assessment.html": "final_assessment.html",
    "/dashboard": "dashboard.html",
    "/dashboard.html": "dashboard.html",
}

class PhishGuardRequestHandler(http.server.SimpleHTTPRequestHandler):
    def get_session_id(self, query_params=None):
        """Extract or generate a consistent session identifier."""
        # 1. From query parameter
        if query_params and "session_id" in query_params:
            sid = query_params["session_id"][0].strip()
            if sid:
                return sid
        
        # 2. From X-Session-ID header
        header_sid = self.headers.get("X-Session-ID")
        if header_sid and header_sid.strip():
            return header_sid.strip()

        # 3. From Cookie
        cookie_header = self.headers.get("Cookie")
        if cookie_header:
            cookie = http.cookies.SimpleCookie(cookie_header)
            if "phishguard_sid" in cookie:
                return cookie["phishguard_sid"].value

        # 4. Fallback default
        return "learner_default_session"

    def send_json_response(self, data, status_code=200, set_cookie=None):
        """Helper to send JSON response with standard security headers."""
        response_bytes = json.dumps(data).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(response_bytes)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Session-ID")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "SAMEORIGIN")
        if set_cookie:
            self.send_header("Set-Cookie", f"phishguard_sid={set_cookie}; Path=/; SameSite=Lax")
        self.end_headers()
        self.wfile.write(response_bytes)

    def do_OPTIONS(self):
        """Support CORS pre-flight."""
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Session-ID")
        self.end_headers()

    def do_GET(self):
        """Handle GET requests for static files, HTML templates, and REST API."""
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        # ----------------- REST API Endpoints -----------------
        if path.startswith("/api/"):
            session_id = self.get_session_id(query)

            if path == "/api/user" or path == "/api/session":
                user = database.get_or_create_user(session_id)
                return self.send_json_response(user)

            elif path == "/api/dashboard":
                stats = database.get_dashboard_stats(session_id)
                progress = database.get_user_progress(session_id)
                return self.send_json_response({
                    "status": "success",
                    "session_id": session_id,
                    "stats": stats,
                    "completed_modules": progress
                })

            elif path == "/api/progress":
                progress = database.get_user_progress(session_id)
                return self.send_json_response({
                    "status": "success",
                    "session_id": session_id,
                    "completed_modules": progress
                })

            elif path == "/api/certificate/verify":
                cert_id = query.get("cert_id", [""])[0].strip()
                result = database.verify_certificate(cert_id)
                return self.send_json_response(result)

            elif path == "/api/system/stats":
                overview = database.get_system_overview()
                return self.send_json_response(overview)

            elif path == "/api/health":
                return self.send_json_response({
                    "status": "healthy",
                    "service": "PHISHGUARD REST Engine",
                    "engine": "Python 3 Standard Library",
                    "database": "SQLite 3 Verified"
                })

            else:
                return self.send_json_response({"error": "Endpoint not found"}, 404)

        # ----------------- Downloadable Checklist -----------------
        if path == "/checklist.txt":
            chk_path = os.path.join(BASE_DIR, "checklist.txt")
            if os.path.isfile(chk_path):
                with open(chk_path, "rb") as f:
                    content = f.read()
                self.send_response(200)
                self.send_header("Content-Type", "text/plain; charset=utf-8")
                self.send_header("Content-Disposition", 'attachment; filename="PhishGuard_Cybersecurity_Checklist.txt"')
                self.send_header("Content-Length", str(len(content)))
                self.end_headers()
                self.wfile.write(content)
                return

        # ----------------- Static Files -----------------
        if path.startswith("/static/"):
            rel_path = path[len("/static/"):]
            file_path = os.path.join(STATIC_DIR, rel_path.replace("/", os.sep))
            if os.path.isfile(file_path):
                mime, _ = mimetypes.guess_type(file_path)
                with open(file_path, "rb") as f:
                    content = f.read()
                self.send_response(200)
                self.send_header("Content-Type", mime or "application/octet-stream")
                self.send_header("Content-Length", str(len(content)))
                self.send_header("Cache-Control", "no-cache")
                self.end_headers()
                self.wfile.write(content)
                return
            else:
                self.send_error(404, "Static file not found")
                return

        # ----------------- HTML Template Pages -----------------
        clean_path = path.rstrip("/") if path != "/" else "/"
        template_file = ROUTE_MAP.get(clean_path)

        if not template_file and clean_path.endswith(".html"):
            candidate = os.path.join(TEMPLATES_DIR, os.path.basename(clean_path))
            if os.path.isfile(candidate):
                template_file = os.path.basename(clean_path)

        if template_file:
            full_path = os.path.join(TEMPLATES_DIR, template_file)
            if os.path.isfile(full_path):
                with open(full_path, "r", encoding="utf-8") as f:
                    html_content = f.read()
                
                html_bytes = html_content.encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(html_bytes)))
                self.send_header("X-Content-Type-Options", "nosniff")
                self.end_headers()
                self.wfile.write(html_bytes)
                return

        # Fallback to index.html if route not matched
        fallback = os.path.join(TEMPLATES_DIR, "index.html")
        if os.path.isfile(fallback):
            with open(fallback, "rb") as f:
                content = f.read()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            self.wfile.write(content)
        else:
            self.send_error(404, "Page not found")

    def do_POST(self):
        """Handle POST requests for state updates and quiz submissions."""
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # Read JSON body safely
        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length) if content_length > 0 else b"{}"
        
        try:
            body = json.loads(post_data.decode("utf-8")) if post_data else {}
        except Exception:
            return self.send_json_response({"error": "Malformed JSON payload"}, 400)

        session_id = body.get("session_id") or self.get_session_id()

        # Record module progress
        if path == "/api/progress/module":
            module_id = body.get("module_id")
            if not module_id:
                return self.send_json_response({"error": "Missing module_id"}, 400)
            
            success = database.mark_module_complete(session_id, module_id)
            if not success:
                return self.send_json_response({"error": "Invalid module_id identifier"}, 400)

            stats = database.get_dashboard_stats(session_id)
            return self.send_json_response({
                "status": "success",
                "module_id": module_id,
                "stats": stats
            })

        # Submit practice quiz or final assessment
        elif path == "/api/quiz/submit":
            quiz_type = body.get("quiz_type", "practice_quiz")
            score = int(body.get("score", 0))
            total = int(body.get("total_questions", 15 if quiz_type == "practice_quiz" else 10))
            
            result = database.record_quiz_attempt(session_id, quiz_type, score, total)
            if quiz_type == "practice_quiz":
                database.mark_module_complete(session_id, "quiz")
            elif quiz_type == "final_assessment" and result["passed"]:
                database.mark_module_complete(session_id, "final_assessment")
                
            stats = database.get_dashboard_stats(session_id)
            return self.send_json_response({"status": "success", "result": result, "stats": stats})

        # Generate verified certificate
        elif path == "/api/certificate/generate":
            recipient_name = body.get("recipient_name", "").strip() or "Security Champion"
            score_pct = float(body.get("score_percentage", 0.0))
            
            cert_result = database.issue_certificate(session_id, recipient_name, score_pct)
            if "error" in cert_result:
                return self.send_json_response(cert_result, 400)
            return self.send_json_response({"status": "success", "certificate": cert_result})

        # Log interactive simulation attempt
        elif path == "/api/simulation/log":
            scenario_id = body.get("scenario_id", "unknown")
            user_verdict = body.get("user_verdict", "unknown")
            is_correct = bool(body.get("is_correct", False))
            
            database.log_simulation(session_id, scenario_id, user_verdict, is_correct)
            database.mark_module_complete(session_id, "simulation_lab")
            return self.send_json_response({"status": "success"})

        # Start a brand new clean student session
        elif path == "/api/session/new":
            new_sid = "pg_user_" + uuid.uuid4().hex[:12]
            user = database.get_or_create_user(new_sid, body.get("username", "Cyber Defender"))
            return self.send_json_response({
                "status": "success",
                "session_id": new_sid,
                "user": user
            }, set_cookie=new_sid)

        # Reset user progress
        elif path == "/api/reset":
            database.reset_user_progress(session_id)
            return self.send_json_response({
                "status": "success",
                "message": "All training progress reset to 0% successfully.",
                "session_id": session_id
            })

        else:
            return self.send_json_response({"error": "Unknown API endpoint"}, 404)

def run_server(port=PORT):
    """Start the HTTP server on specified port."""
    database.init_db()
    server_address = ("", port)
    socketserver.TCPServer.allow_reuse_address = True
    
    with socketserver.TCPServer(server_address, PhishGuardRequestHandler) as httpd:
        print("=" * 65)
        print("🛡️  PHISHGUARD - Phishing Awareness & Cybersecurity Training Platform")
        print(f"🚀  Server online at: http://localhost:{port}")
        print("📁  Zero-dependency Python standard library server running.")
        print("=" * 65)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")

if __name__ == "__main__":
    run_server()
