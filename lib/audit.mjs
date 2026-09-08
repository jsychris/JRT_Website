import {database} from './database.mjs';
// No tokens, passwords, comments, photos or RSVP answers enter this log.
export function audit(actor,action,target){
 const d=database();d.prepare("DELETE FROM security_audit WHERE created_at < datetime('now','-365 days')").run();
 d.prepare('INSERT INTO security_audit(actor_id,action,target_id) VALUES (?,?,?)').run(actor,action,target);
}
