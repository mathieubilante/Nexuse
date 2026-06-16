"""
MatchPro backend - minimal auth service
Run with: python app.py
"""
import os
import sqlite3
import datetime
import jwt
from flask import Flask, request, jsonify, g
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

DB_PATH = os.path.join(os.path.dirname(__file__), "matchpro.db")
JWT_SECRET = "dev-secret-key-change-in-production"
JWT_ALGO = "HS256"
TOKEN_EXPIRY_HOURS = 24 * 7

app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://127.0.0.1:5173",
], supports_credentials=True)


# ---------------------------------------------------------------------------
# Database helpers
# ---------------------------------------------------------------------------

def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(exception=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    db = sqlite3.connect(DB_PATH)
    db.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT,
            first_name TEXT,
            last_name TEXT,
            birth_date TEXT,
            birth_place TEXT,
            country TEXT,
            city TEXT,
            phone TEXT,
            domaine TEXT,
            diplome TEXT,
            competences TEXT,
            company_name TEXT,
            sector TEXT,
            profile_completed INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL
        )
    """)

    # Jobs / candidatures
    db.execute("""
        CREATE TABLE IF NOT EXISTS jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            recruiter_user_id INTEGER NOT NULL,
            poste TEXT NOT NULL,
            entreprise TEXT NOT NULL,
            secteur TEXT,
            domaine TEXT,
            competences_requises TEXT,
            country TEXT,
            city TEXT,
            region TEXT,
            status TEXT NOT NULL DEFAULT 'active',
            created_at TEXT NOT NULL
        )
    """)

    db.execute("""
        CREATE TABLE IF NOT EXISTS job_applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            job_id INTEGER NOT NULL,
            candidate_user_id INTEGER NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            message_from_recruiter TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            UNIQUE(job_id, candidate_user_id)
        )
    """)

    # Migration: add any columns missing from an older database file
    existing_cols = {row[1] for row in db.execute("PRAGMA table_info(users)")}
    new_cols = {
        "first_name": "TEXT",
        "last_name": "TEXT",
        "birth_date": "TEXT",
        "birth_place": "TEXT",
        "country": "TEXT",
        "city": "TEXT",
        "phone": "TEXT",
        "domaine": "TEXT",
        "diplome": "TEXT",
        "competences": "TEXT",
        "company_name": "TEXT",
        "sector": "TEXT",
        "profile_completed": "INTEGER NOT NULL DEFAULT 0",
    }
    for col, coltype in new_cols.items():
        if col not in existing_cols:
            db.execute(f"ALTER TABLE users ADD COLUMN {col} {coltype}")
    db.commit()
    db.close()



# ---------------------------------------------------------------------------
# JWT helpers
# ---------------------------------------------------------------------------

def generate_token(user_id):
    payload = {
        "user_id": user_id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=TOKEN_EXPIRY_HOURS),
        "iat": datetime.datetime.utcnow(),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


def decode_token(token):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        return payload.get("user_id")
    except jwt.PyJWTError:
        return None


# IMPORTANT: this list must include every column the frontend may need,
# including profile_completed, competences, company_name, sector, etc.
USER_FIELDS = [
    "id", "email", "role",
    "first_name", "last_name", "birth_date", "birth_place",
    "country", "city", "phone",
    "domaine", "diplome", "competences",
    "company_name", "sector",
    "profile_completed", "created_at",
]


def serialize_user(row):
    d = dict(row)
    if d.get("competences"):
        d["competences"] = d["competences"].split(",")
    else:
        d["competences"] = []
    d["profile_completed"] = bool(d.get("profile_completed"))
    return d


def get_user_from_request():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ", 1)[1]
    user_id = decode_token(token)
    if user_id is None:
        return None
    db = get_db()
    row = db.execute(f"SELECT {', '.join(USER_FIELDS)} FROM users WHERE id = ?", (user_id,)).fetchone()
    return serialize_user(row) if row else None


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


def require_auth():
    user = get_user_from_request()
    if not user:
        return None, (jsonify({"error": "Non authentifie."}), 401)
    return user, None


def require_role(user, expected_roles):
    if user.get("role") not in expected_roles:
        return jsonify({"error": "Acces refuse."}), 403
    return None

@app.route("/api/auth/register", methods=["POST"])
def register():

    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or "@" not in email:
        return jsonify({"error": "Adresse email invalide."}), 400
    if len(password) < 6:
        return jsonify({"error": "Le mot de passe doit contenir au moins 6 caracteres."}), 400

    db = get_db()
    existing = db.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
    if existing:
        return jsonify({"error": "Un compte existe deja avec cet email."}), 409

    password_hash = generate_password_hash(password)
    created_at = datetime.datetime.utcnow().isoformat()
    cursor = db.execute(
        "INSERT INTO users (email, password_hash, role, created_at) VALUES (?, ?, ?, ?)",
        (email, password_hash, None, created_at),
    )
    db.commit()
    user_id = cursor.lastrowid

    token = generate_token(user_id)
    row = db.execute(f"SELECT {', '.join(USER_FIELDS)} FROM users WHERE id = ?", (user_id,)).fetchone()
    return jsonify({
        "token": token,
        "user": serialize_user(row),
    }), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    db = get_db()
    row = db.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    if not row or not check_password_hash(row["password_hash"], password):
        return jsonify({"error": "Email ou mot de passe incorrect."}), 401

    token = generate_token(row["id"])
    full_row = db.execute(f"SELECT {', '.join(USER_FIELDS)} FROM users WHERE id = ?", (row["id"],)).fetchone()
    return jsonify({
        "token": token,
        "user": serialize_user(full_row),
    })


@app.route("/api/auth/role", methods=["POST"])
def set_role():
    user = get_user_from_request()
    if not user:
        return jsonify({"error": "Non authentifie."}), 401

    data = request.get_json(silent=True) or {}
    role = data.get("role")
    if role not in ("candidat", "recruteur"):
        return jsonify({"error": "Role invalide. Attendu: candidat ou recruteur."}), 400

    db = get_db()
    db.execute("UPDATE users SET role = ? WHERE id = ?", (role, user["id"]))
    db.commit()

    row = db.execute(f"SELECT {', '.join(USER_FIELDS)} FROM users WHERE id = ?", (user["id"],)).fetchone()
    return jsonify({"user": serialize_user(row)})


@app.route("/api/users/me/profile", methods=["PUT"])
def update_profile():
    user = get_user_from_request()
    if not user:
        return jsonify({"error": "Non authentifie."}), 401

    data = request.get_json(silent=True) or {}
    db = get_db()

    if user["role"] == "candidat":
        first_name = (data.get("first_name") or "").strip()
        last_name = (data.get("last_name") or "").strip()
        birth_date = (data.get("birth_date") or "").strip()
        birth_place = (data.get("birth_place") or "").strip()
        country = (data.get("country") or "").strip()
        city = (data.get("city") or "").strip()
        phone = (data.get("phone") or "").strip()
        domaine = (data.get("domaine") or "").strip()
        diplome = (data.get("diplome") or "").strip()
        competences = data.get("competences") or []

        if not first_name or not last_name or not country or not city:
            return jsonify({"error": "Prenom, nom, pays et ville sont requis."}), 400

        db.execute("""
            UPDATE users SET
                first_name = ?, last_name = ?, birth_date = ?, birth_place = ?,
                country = ?, city = ?, phone = ?,
                domaine = ?, diplome = ?, competences = ?,
                profile_completed = 1
            WHERE id = ?
        """, (first_name, last_name, birth_date, birth_place, country, city, phone,
              domaine, diplome, ",".join(competences), user["id"]))

    elif user["role"] == "recruteur":
        first_name = (data.get("first_name") or "").strip()
        company_name = (data.get("company_name") or "").strip()
        sector = (data.get("sector") or "").strip()
        country = (data.get("country") or "").strip()
        city = (data.get("city") or "").strip()
        phone = (data.get("phone") or "").strip()

        if not company_name or not country or not city:
            return jsonify({"error": "Nom de l'entreprise, pays et ville sont requis."}), 400

        db.execute("""
            UPDATE users SET
                first_name = ?, company_name = ?, sector = ?,
                country = ?, city = ?, phone = ?,
                profile_completed = 1
            WHERE id = ?
        """, (first_name, company_name, sector, country, city, phone, user["id"]))

    else:
        return jsonify({"error": "Role non defini. Choisissez un role avant de completer le profil."}), 400

    db.commit()
    row = db.execute(f"SELECT {', '.join(USER_FIELDS)} FROM users WHERE id = ?", (user["id"],)).fetchone()
    return jsonify({"user": serialize_user(row)})


@app.route("/api/auth/me", methods=["GET"])
def me():
    user = get_user_from_request()
    if not user:
        return jsonify({"error": "Non authentifie."}), 401
    return jsonify({"user": user})


@app.route("/api/users/me/applications", methods=["GET"])
def my_applications():
    user, err = require_auth()
    if err:
        return err
    if user.get("role") != "candidat":
        return jsonify({"error": "Acces refuse."}), 403

    db = get_db()
    rows = db.execute(
        """
        SELECT a.*, j.poste, j.entreprise, j.city, j.country
        FROM job_applications a
        JOIN jobs j ON j.id = a.job_id
        WHERE a.candidate_user_id = ?
        ORDER BY a.created_at DESC
        """,
        (user["id"],),
    ).fetchall()

    apps = []
    for r in rows:
        d = dict(r)
        apps.append(d)

    return jsonify({"applications": apps})


# ---------------------------------------------------------------------------
# Jobs / applications
# ---------------------------------------------------------------------------


@app.route("/api/jobs", methods=["POST"])
def create_job():
    user, err = require_auth()
    if err:
        return err

    role_err = require_role(user, ["recruteur"])
    if role_err:
        return role_err

    data = request.get_json(silent=True) or {}
    poste = (data.get("poste") or data.get("title") or "").strip()
    entreprise = (data.get("entreprise") or data.get("company_name") or "").strip()
    secteur = (data.get("secteur") or data.get("sector") or "").strip() or None
    domaine = (data.get("domaine") or "").strip() or None
    competences_requises = data.get("competences_requises")

    if isinstance(competences_requises, list):
        competences_requises = ",".join([str(x).strip() for x in competences_requises if str(x).strip()])
    if competences_requises is not None:
        competences_requises = str(competences_requises).strip() or None

    country = (data.get("country") or "").strip() or user.get("country")
    city = (data.get("city") or "").strip() or user.get("city")
    region = (data.get("region") or "").strip() or None

    if not poste or not entreprise:
        return jsonify({"error": "poste et entreprise sont requis."}), 400

    created_at = datetime.datetime.utcnow().isoformat()
    db = get_db()
    cursor = db.execute(
        """
        INSERT INTO jobs (recruiter_user_id, poste, entreprise, secteur, domaine, competences_requises, country, city, region, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
        """,
        (
            user["id"],
            poste,
            entreprise,
            secteur,
            domaine,
            competences_requises,
            country,
            city,
            region,
            created_at,
        ),
    )
    db.commit()
    job_id = cursor.lastrowid

    row = db.execute("SELECT * FROM jobs WHERE id = ?", (job_id,)).fetchone()
    return jsonify({"job": dict(row)}), 201



@app.route("/api/jobs", methods=["GET"])
def list_jobs():
    user, err = require_auth()
    if err:
        return err

    country = request.args.get("country")
    city = request.args.get("city")
    region = request.args.get("region")
    domaine = request.args.get("domaine")

    domain_val = (domaine or "").strip()
    city_val = (city or "").strip()
    region_val = (region or "").strip()
    country_val = (country or "").strip()

    # Filtre par défaut sur la ville/region si non précisé (logique simple)
    if not city_val and user.get("city"):
        city_val = user.get("city")
    if not region_val and user.get("city"):
        # On ne sait pas la region dans le schéma utilisateurs actuel (il y a city, pas region), donc on laisse optionnel.
        pass

    where = ["status = 'active'"]
    params = []

    # Pour un recruteur, on évite les filtres city/country pouvant masquer des offres
    # si le profil n'est pas entièrement complété.
    if user.get("role") == "recruteur":
        where.append("recruiter_user_id = ?")
        params.append(user.get("id"))

    if domain_val:
        where.append("(domaine = ? OR domaine IS NULL)")
        params.append(domain_val)
    if city_val:
        where.append("(city = ? OR city IS NULL)")
        params.append(city_val)
    if country_val:
        where.append("(country = ? OR country IS NULL)")
        params.append(country_val)

    sql = "SELECT * FROM jobs"
    if where:
        sql += " WHERE " + " AND ".join(where)

    sql += " ORDER BY created_at DESC"

    db = get_db()
    rows = db.execute(sql, tuple(params)).fetchall()
    return jsonify({"jobs": [dict(r) for r in rows]})


@app.route("/api/jobs/<int:job_id>/applications", methods=["GET"])
def list_applications_for_job(job_id):
    user, err = require_auth()
    if err:
        return err
    role_err = require_role(user, ["recruteur"])
    if role_err:
        return role_err

    db = get_db()
    job = db.execute("SELECT * FROM jobs WHERE id = ?", (job_id,)).fetchone()
    if not job:
        return jsonify({"error": "Offre introuvable."}), 404
    if job["recruiter_user_id"] != user["id"]:
        return jsonify({"error": "Acces refuse."}), 403

    rows = db.execute(
        """
        SELECT a.*, u.first_name, u.last_name, u.city, u.country, u.domaine, u.diplome, u.competences
        FROM job_applications a
        JOIN users u ON u.id = a.candidate_user_id
        WHERE a.job_id = ?
        ORDER BY a.created_at DESC
        """,
        (job_id,),
    ).fetchall()

    apps = []
    for r in rows:
        d = dict(r)
        if d.get("competences"):
            d["competences"] = d["competences"].split(",")
        else:
            d["competences"] = []
        apps.append(d)

    return jsonify({"applications": apps})


@app.route("/api/jobs/<int:job_id>/apply", methods=["POST"])
def apply_job(job_id):
    user, err = require_auth()
    if err:
        return err
    role_err = require_role(user, ["candidat"])
    if role_err:
        return role_err

    data = request.get_json(silent=True) or {}
    # For now, only store status/payload minimal.
    # Confirmation popup is handled in frontend.

    candidate_id = user["id"]
    db = get_db()
    job = db.execute("SELECT * FROM jobs WHERE id = ?", (job_id,)).fetchone()
    if not job or job["status"] != "active":
        return jsonify({"error": "Offre indisponible."}), 404

    updated_at = datetime.datetime.utcnow().isoformat()

    try:
        db.execute(
            """
            INSERT INTO job_applications (job_id, candidate_user_id, status, message_from_recruiter, created_at, updated_at)
            VALUES (?, ?, 'pending', NULL, ?, ?)
            """,
            (job_id, candidate_id, updated_at, updated_at),
        )
        db.commit()
    except sqlite3.IntegrityError:
        return jsonify({"error": "Vous avez deja postule a cette offre."}), 409

    app_row = db.execute(
        "SELECT * FROM job_applications WHERE job_id = ? AND candidate_user_id = ?",
        (job_id, candidate_id),
    ).fetchone()

    return jsonify({"application": dict(app_row)}), 201


@app.route("/api/jobs/<int:job_id>/pass", methods=["POST"])
def pass_job(job_id):
    user, err = require_auth()
    if err:
        return err
    role_err = require_role(user, ["candidat"])
    if role_err:
        return role_err

    db = get_db()
    db.execute(
        """
        UPDATE job_applications
        SET status = 'rejected', message_from_recruiter = message_from_recruiter, updated_at = ?
        WHERE job_id = ? AND candidate_user_id = ?
        """,
        (datetime.datetime.utcnow().isoformat(), job_id, user["id"]),
    )
    db.commit()
    return jsonify({"ok": True})


@app.route("/api/jobs/<int:job_id>/pause", methods=["POST"])
def pause_job(job_id):
    user, err = require_auth()
    if err:
        return err
    role_err = require_role(user, ["candidat"])
    if role_err:
        return role_err

    db = get_db()
    db.execute(
        """
        UPDATE job_applications
        SET status = 'paused', updated_at = ?
        WHERE job_id = ? AND candidate_user_id = ?
        """,
        (datetime.datetime.utcnow().isoformat(), job_id, user["id"]),
    )
    db.commit()
    return jsonify({"ok": True})


@app.route("/api/jobs/<int:job_id>/applications/<int:app_id>/respond", methods=["POST"])
def respond_application(job_id, app_id):
    user, err = require_auth()
    if err:
        return err
    role_err = require_role(user, ["recruteur"])
    if role_err:
        return role_err

    data = request.get_json(silent=True) or {}
    action = (data.get("action") or "").strip().lower()  # 'accept'|'reject'
    message = (data.get("message") or "").strip()

    if action not in ("accept", "reject"):
        return jsonify({"error": "action invalide (accept|reject)"}), 400

    db = get_db()
    app_row = db.execute(
        "SELECT * FROM job_applications WHERE id = ? AND job_id = ?",
        (app_id, job_id),
    ).fetchone()
    if not app_row:
        return jsonify({"error": "Candidature introuvable."}), 404

    job = db.execute("SELECT * FROM jobs WHERE id = ?", (job_id,)).fetchone()
    if not job or job["recruiter_user_id"] != user["id"]:
        return jsonify({"error": "Acces refuse."}), 403

    new_status = "accepted" if action == "accept" else "rejected"
    updated_at = datetime.datetime.utcnow().isoformat()

    db.execute(
        """
        UPDATE job_applications
        SET status = ?, message_from_recruiter = ?, updated_at = ?
        WHERE id = ?
        """,
        (new_status, message or None, updated_at, app_id),
    )
    db.commit()

    return jsonify({"ok": True})


@app.route("/", methods=["GET"])
def index():
    return jsonify({"service": "MatchPro API", "status": "online", "docs": "/api/health"})



@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)

