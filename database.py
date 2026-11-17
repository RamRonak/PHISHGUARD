"""
database.py - SQLite Database Manager for PHISHGUARD Training Platform
Handles persistence for module progress, quiz scores, final assessments,
and verifiable educational certificates with robust transactions and prepared statements.
"""

import sqlite3
import datetime
import uuid
import hashlib
import html
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "phishguard.db")

VALID_MODULES = [
    "fundamentals",
    "email_phishing",
    "fake_websites",
    "social_engineering",
    "case_studies",
    "quiz",
    "simulation_lab",
    "safety_guide",
    "final_assessment"
]

def get_connection():
    """Establish and return an SQLite connection with Row factory and PRAGMA settings."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    """Initialize database tables with proper constraints and indexes."""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        
        # Users / Learners table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT UNIQUE NOT NULL,
            username TEXT DEFAULT 'Learner',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        
        # Module completion progress
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS module_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            module_id TEXT NOT NULL,
            completed INTEGER DEFAULT 1,
            completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(session_id, module_id)
        )
        """)
        
        # Quiz and Assessment attempts
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS quiz_attempts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            quiz_type TEXT NOT NULL, -- 'practice_quiz' or 'final_assessment'
            score INTEGER NOT NULL,
            total_questions INTEGER NOT NULL,
            percentage REAL NOT NULL,
            passed INTEGER NOT NULL,
            attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        
        # Verifiable Certificates
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS certificates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            certificate_id TEXT UNIQUE NOT NULL,
            session_id TEXT NOT NULL,
            recipient_name TEXT NOT NULL,
            course_title TEXT NOT NULL,
            score_percentage REAL NOT NULL,
            issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            verification_hash TEXT NOT NULL
        )
        """)
        
        # Simulation Lab attempts
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS simulation_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            scenario_id TEXT NOT NULL,
            user_verdict TEXT NOT NULL,
            is_correct INTEGER NOT NULL,
            logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)

        # Performance indexes
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_progress_session ON module_progress(session_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_quiz_session ON quiz_attempts(session_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_cert_id ON certificates(certificate_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_cert_session ON certificates(session_id)")
        
        conn.commit()
    finally:
        conn.close()

def get_or_create_user(session_id, username=None):
    """Retrieve existing user or create a new session record."""
    clean_session = str(session_id).strip()[:64]
    clean_username = html.escape(str(username).strip()[:50]) if username else "Cyber Defender"
    
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE session_id = ?", (clean_session,))
        user = cursor.fetchone()
        
        if not user:
            cursor.execute(
                "INSERT INTO users (session_id, username, last_active) VALUES (?, ?, CURRENT_TIMESTAMP)",
                (clean_session, clean_username)
            )
            conn.commit()
            cursor.execute("SELECT * FROM users WHERE session_id = ?", (clean_session,))
            user = cursor.fetchone()
        else:
            if username and clean_username != user["username"]:
                cursor.execute(
                    "UPDATE users SET username = ?, last_active = CURRENT_TIMESTAMP WHERE session_id = ?",
                    (clean_username, clean_session)
                )
            else:
                cursor.execute(
                    "UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE session_id = ?",
                    (clean_session,)
                )
            conn.commit()
        return dict(user)
    finally:
        conn.close()

def mark_module_complete(session_id, module_id):
    """Record completion of a specific learning module with validation."""
    clean_session = str(session_id).strip()[:64]
    clean_module = str(module_id).strip().lower()
    
    # Allow valid curriculum modules
    if clean_module not in VALID_MODULES and clean_module != "overview":
        return False

    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO module_progress (session_id, module_id, completed, completed_at)
        VALUES (?, ?, 1, CURRENT_TIMESTAMP)
        ON CONFLICT(session_id, module_id) DO UPDATE SET
            completed = 1,
            completed_at = CURRENT_TIMESTAMP
        """, (clean_session, clean_module))
        conn.commit()
        return True
    finally:
        conn.close()

def get_user_progress(session_id):
    """Fetch completed modules for a session."""
    clean_session = str(session_id).strip()[:64]
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT module_id, completed_at FROM module_progress WHERE session_id = ?", (clean_session,))
        rows = cursor.fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()

def record_quiz_attempt(session_id, quiz_type, score, total_questions):
    """Record a practice quiz or final assessment attempt with strict bounds checking."""
    clean_session = str(session_id).strip()[:64]
    clean_quiz_type = "final_assessment" if quiz_type == "final_assessment" else "practice_quiz"
    safe_total = max(1, int(total_questions))
    safe_score = max(0, min(safe_total, int(score)))
    
    pct = round((safe_score / safe_total) * 100, 1)
    passed = 1 if pct >= 80.0 else 0
    
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO quiz_attempts (session_id, quiz_type, score, total_questions, percentage, passed)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (clean_session, clean_quiz_type, safe_score, safe_total, pct, passed))
        attempt_id = cursor.lastrowid
        conn.commit()
        return {
            "attempt_id": attempt_id,
            "session_id": clean_session,
            "quiz_type": clean_quiz_type,
            "score": safe_score,
            "total_questions": safe_total,
            "percentage": pct,
            "passed": bool(passed)
        }
    finally:
        conn.close()

def issue_certificate(session_id, recipient_name, score_pct):
    """Generate and store a tamper-evident educational certificate."""
    clean_session = str(session_id).strip()[:64]
    clean_name = html.escape(str(recipient_name).strip()[:80]) or "Security Champion"
    safe_score = float(score_pct)
    
    if safe_score < 80.0:
        return {"error": "Passing score of 80% required for certificate issuance."}
    
    raw_id = f"PG-{datetime.date.today().year}-{uuid.uuid4().hex[:6].upper()}"
    course_title = "Phishing Defense & Social Engineering Awareness"
    
    hash_payload = f"{raw_id}:{clean_session}:{clean_name}:{safe_score}:phishguard_salt_2026"
    verification_hash = hashlib.sha256(hash_payload.encode()).hexdigest()[:16].upper()
    
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO certificates (certificate_id, session_id, recipient_name, course_title, score_percentage, verification_hash)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (raw_id, clean_session, clean_name, course_title, safe_score, verification_hash))
        conn.commit()
        
        cursor.execute("SELECT * FROM certificates WHERE certificate_id = ?", (raw_id,))
        cert = cursor.fetchone()
        return dict(cert)
    finally:
        conn.close()

def verify_certificate(certificate_id):
    """Verify validity of an issued certificate ID."""
    clean_id = str(certificate_id).strip().upper()[:32]
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM certificates WHERE certificate_id = ?", (clean_id,))
        cert = cursor.fetchone()
        if cert:
            return {"valid": True, "certificate": dict(cert)}
        return {"valid": False, "error": "Certificate ID not found in verification registry."}
    finally:
        conn.close()

def log_simulation(session_id, scenario_id, user_verdict, is_correct):
    """Record an interactive email simulation attempt."""
    clean_session = str(session_id).strip()[:64]
    clean_scenario = str(scenario_id).strip()[:50]
    clean_verdict = "phish" if user_verdict == "phish" else "safe"
    
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO simulation_logs (session_id, scenario_id, user_verdict, is_correct)
        VALUES (?, ?, ?, ?)
        """, (clean_session, clean_scenario, clean_verdict, 1 if is_correct else 0))
        conn.commit()
        return True
    finally:
        conn.close()

def get_dashboard_stats(session_id):
    """Compile aggregated progress statistics for the dashboard."""
    clean_session = str(session_id).strip()[:64]
    conn = get_connection()
    try:
        cursor = conn.cursor()
        
        # Modules completed count
        cursor.execute("SELECT COUNT(DISTINCT module_id) as count FROM module_progress WHERE session_id = ?", (clean_session,))
        modules_completed = cursor.fetchone()["count"]
        
        # Fetch actual completed module IDs
        cursor.execute("SELECT module_id FROM module_progress WHERE session_id = ?", (clean_session,))
        completed_ids = [row["module_id"] for row in cursor.fetchall()]
        
        # Best practice quiz score
        cursor.execute("""
        SELECT MAX(percentage) as best_score, MAX(score) as score, total_questions 
        FROM quiz_attempts 
        WHERE session_id = ? AND quiz_type = 'practice_quiz'
        """, (clean_session,))
        best_quiz = cursor.fetchone()
        
        # Best assessment score
        cursor.execute("""
        SELECT MAX(percentage) as best_score, MAX(passed) as passed 
        FROM quiz_attempts 
        WHERE session_id = ? AND quiz_type = 'final_assessment'
        """, (clean_session,))
        best_assessment = cursor.fetchone()
        
        # Certificate status
        cursor.execute("SELECT * FROM certificates WHERE session_id = ? ORDER BY id DESC LIMIT 1", (clean_session,))
        cert = cursor.fetchone()
        
        return {
            "modules_completed": modules_completed,
            "total_modules": 10,
            "progress_percentage": round((modules_completed / 10) * 100, 1) if modules_completed > 0 else 0.0,
            "completed_module_ids": completed_ids,
            "best_quiz_score": best_quiz["best_score"] if best_quiz and best_quiz["best_score"] is not None else 0,
            "assessment_passed": bool(best_assessment["passed"]) if best_assessment and best_assessment["passed"] else False,
            "assessment_score": best_assessment["best_score"] if best_assessment and best_assessment["best_score"] is not None else 0,
            "has_certificate": cert is not None,
            "certificate": dict(cert) if cert else None
        }
    finally:
        conn.close()

def reset_user_progress(session_id):
    """Reset training progress completely for a fresh attempt."""
    clean_session = str(session_id).strip()[:64]
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM module_progress WHERE session_id = ?", (clean_session,))
        cursor.execute("DELETE FROM quiz_attempts WHERE session_id = ?", (clean_session,))
        cursor.execute("DELETE FROM certificates WHERE session_id = ?", (clean_session,))
        cursor.execute("DELETE FROM simulation_logs WHERE session_id = ?", (clean_session,))
        conn.commit()
        return True
    finally:
        conn.close()

def get_system_overview():
    """Return high-level institutional metrics for admin/instructor view."""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(DISTINCT session_id) as total_students FROM users")
        total_students = cursor.fetchone()["total_students"]
        
        cursor.execute("SELECT COUNT(*) as total_certificates FROM certificates")
        total_certs = cursor.fetchone()["total_certificates"]
        
        cursor.execute("SELECT AVG(percentage) as avg_score FROM quiz_attempts")
        avg_row = cursor.fetchone()
        avg_score = round(avg_row["avg_score"], 1) if avg_row and avg_row["avg_score"] is not None else 0.0
        
        return {
            "total_students": total_students,
            "certificates_issued": total_certs,
            "average_quiz_score": avg_score
        }
    finally:
        conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")
