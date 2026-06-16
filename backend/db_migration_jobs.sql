-- MatchPro jobs + applications schema (ETAPE 2)
-- Ne s’exécute pas automatiquement : à appliquer via modifications dans app.py (init_db).

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
);

CREATE TABLE IF NOT EXISTS job_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id INTEGER NOT NULL,
  candidate_user_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  message_from_recruiter TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(job_id, candidate_user_id)
);

