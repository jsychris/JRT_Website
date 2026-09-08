CREATE INDEX login_limits_expiry ON login_limits(resets_at);
CREATE TRIGGER revoke_member_sessions AFTER UPDATE OF role ON members
WHEN NEW.role NOT IN ('admin','member')
BEGIN
 DELETE FROM sessions WHERE member_id=NEW.id;
 DELETE FROM invitations WHERE email=NEW.email;
END;
DELETE FROM sessions WHERE member_id IN (SELECT id FROM members WHERE role NOT IN ('admin','member'));
CREATE TABLE security_audit (id INTEGER PRIMARY KEY, actor_id TEXT, action TEXT NOT NULL, target_id TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
