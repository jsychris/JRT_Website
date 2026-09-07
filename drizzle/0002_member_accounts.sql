CREATE TABLE accounts (member_id TEXT PRIMARY KEY REFERENCES members(id), email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL);
CREATE TABLE sessions (token_hash TEXT PRIMARY KEY, member_id TEXT NOT NULL REFERENCES members(id), expires_at INTEGER NOT NULL);
CREATE INDEX sessions_member ON sessions(member_id);
CREATE TABLE invitations (token_hash TEXT PRIMARY KEY, email TEXT NOT NULL, expires_at INTEGER NOT NULL, created_by TEXT NOT NULL REFERENCES members(id));
CREATE TABLE login_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, resets_at INTEGER NOT NULL);
