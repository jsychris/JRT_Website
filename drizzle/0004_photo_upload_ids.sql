ALTER TABLE photos ADD COLUMN upload_id TEXT;
CREATE UNIQUE INDEX photos_upload_id ON photos(member_id,upload_id) WHERE upload_id IS NOT NULL;
