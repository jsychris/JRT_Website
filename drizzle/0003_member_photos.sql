CREATE TABLE photos (
 id TEXT PRIMARY KEY,
 member_id TEXT NOT NULL REFERENCES members(id),
 caption TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
 bytes INTEGER NOT NULL,
 width INTEGER NOT NULL,
 height INTEGER NOT NULL,
 created_at TEXT NOT NULL,
 reviewed_by TEXT REFERENCES members(id),
 reviewed_at TEXT
);
CREATE INDEX photos_status ON photos(status, created_at);
