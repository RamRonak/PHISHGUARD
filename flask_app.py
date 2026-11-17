"""
flask_app.py - Optional Flask-based implementation for PHISHGUARD.
For environments with Flask installed (pip install flask).
Shares the exact same SQLite database and templates as app.py.
"""

import os
import uuid
import database

try:
    from flask import Flask, render_template, request, jsonify, send_from_directory, send_file, make_response
    FLASK_AVAILABLE = True
except ImportError:
    FLASK_AVAILABLE = False

if FLASK_AVAILABLE:
    app = Flask(__name__, template_folder="templates", static_folder="static")
    database.init_db()

    def get_session_id():
        sid = request.args.get("session_id") or request.headers.get("X-Session-ID") or request.cookies.get("phishguard_sid")
        if not sid:
            sid = "learner_default_session"
        return sid.strip()

    @app.route("/")
    @app.route("/index")
    def index():
        return render_template("index.html")

    @app.route("/fundamentals")
    def fundamentals():
        return render_template("fundamentals.html")

    @app.route("/emails")
    @app.route("/email-phishing")
    def email_phishing():
        return render_template("email_phishing.html")

    @app.route("/fake-websites")
    def fake_websites():
        return render_template("fake_websites.html")

    @app.route("/social-engineering")
    def social_engineering():
        return render_template("social_engineering.html")

    @app.route("/case-studies")
    def case_studies():
        return render_template("case_studies.html")

    @app.route("/quiz")
    def quiz():
        return render_template("quiz.html")

    @app.route("/simulation-lab")
    def simulation_lab():
        return render_template("simulation_lab.html")

    @app.route("/safety-guide")
    def safety_guide():
        return render_template("safety_guide.html")

    @app.route("/final-assessment")
    def final_assessment():
        return render_template("final_assessment.html")

    @app.route("/dashboard")
    def dashboard():
        return render_template("dashboard.html")

    @app.route("/checklist.txt")
    def download_checklist():
        return send_file("checklist.txt", as_attachment=True, download_name="PhishGuard_Cybersecurity_Checklist.txt")

    # REST APIs
    @app.route("/api/user", methods=["GET"])
    @app.route("/api/session", methods=["GET"])
    def api_user():
        session_id = get_session_id()
        return jsonify(database.get_or_create_user(session_id))

    @app.route("/api/dashboard", methods=["GET"])
    def api_dashboard():
        session_id = get_session_id()
        stats = database.get_dashboard_stats(session_id)
        progress = database.get_user_progress(session_id)
        return jsonify({
            "status": "success",
            "session_id": session_id,
            "stats": stats,
            "completed_modules": progress
        })

    @app.route("/api/progress", methods=["GET"])
    def api_progress():
        session_id = get_session_id()
        progress = database.get_user_progress(session_id)
        return jsonify({
            "status": "success",
            "session_id": session_id,
            "completed_modules": progress
        })

    @app.route("/api/progress/module", methods=["POST"])
    def api_progress_module():
        data = request.get_json() or {}
        session_id = data.get("session_id") or get_session_id()
        module_id = data.get("module_id")
        if not module_id:
            return jsonify({"error": "Missing module_id"}), 400
        
        success = database.mark_module_complete(session_id, module_id)
        if not success:
            return jsonify({"error": "Invalid module_id identifier"}), 400
            
        stats = database.get_dashboard_stats(session_id)
        return jsonify({"status": "success", "module_id": module_id, "stats": stats})

    @app.route("/api/quiz/submit", methods=["POST"])
    def api_quiz_submit():
        data = request.get_json() or {}
        session_id = data.get("session_id") or get_session_id()
        quiz_type = data.get("quiz_type", "practice_quiz")
        score = int(data.get("score", 0))
        total = int(data.get("total_questions", 15 if quiz_type == "practice_quiz" else 10))
        result = database.record_quiz_attempt(session_id, quiz_type, score, total)
        if quiz_type == "practice_quiz":
            database.mark_module_complete(session_id, "quiz")
        elif quiz_type == "final_assessment" and result["passed"]:
            database.mark_module_complete(session_id, "final_assessment")
        stats = database.get_dashboard_stats(session_id)
        return jsonify({"status": "success", "result": result, "stats": stats})

    @app.route("/api/certificate/generate", methods=["POST"])
    def api_certificate_generate():
        data = request.get_json() or {}
        session_id = data.get("session_id") or get_session_id()
        recipient = data.get("recipient_name", "Security Champion")
        score_pct = float(data.get("score_percentage", 0.0))
        cert = database.issue_certificate(session_id, recipient, score_pct)
        if "error" in cert:
            return jsonify(cert), 400
        return jsonify({"status": "success", "certificate": cert})

    @app.route("/api/certificate/verify", methods=["GET"])
    def api_certificate_verify():
        cert_id = request.args.get("cert_id", "").strip()
        return jsonify(database.verify_certificate(cert_id))

    @app.route("/api/simulation/log", methods=["POST"])
    def api_simulation_log():
        data = request.get_json() or {}
        session_id = data.get("session_id") or get_session_id()
        scenario_id = data.get("scenario_id", "unknown")
        user_verdict = data.get("user_verdict", "unknown")
        is_correct = bool(data.get("is_correct", False))
        database.log_simulation(session_id, scenario_id, user_verdict, is_correct)
        database.mark_module_complete(session_id, "simulation_lab")
        return jsonify({"status": "success"})

    @app.route("/api/session/new", methods=["POST"])
    def api_session_new():
        data = request.get_json() or {}
        new_sid = "pg_user_" + uuid.uuid4().hex[:12]
        user = database.get_or_create_user(new_sid, data.get("username", "Cyber Defender"))
        resp = make_response(jsonify({"status": "success", "session_id": new_sid, "user": user}))
        resp.set_cookie("phishguard_sid", new_sid, samesite="Lax")
        return resp

    @app.route("/api/reset", methods=["POST"])
    def api_reset():
        data = request.get_json() or {}
        session_id = data.get("session_id") or get_session_id()
        database.reset_user_progress(session_id)
        return jsonify({"status": "success", "message": "All training progress reset to 0% successfully."})

    @app.route("/api/system/stats", methods=["GET"])
    def api_system_stats():
        return jsonify(database.get_system_overview())

if __name__ == "__main__":
    if FLASK_AVAILABLE:
        print("Starting PHISHGUARD with Flask...")
        app.run(host="0.0.0.0", port=5000, debug=True)
    else:
        print("Flask is not installed in this environment.")
        print("Please run 'python app.py' instead (built-in standard library, zero dependencies needed).")
