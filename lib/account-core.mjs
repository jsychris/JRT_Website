import {randomBytes,scrypt as scryptCallback,timingSafeEqual,createHash} from 'node:crypto';
import {promisify} from 'node:util';
import {database} from './database.mjs';
const scrypt=promisify(scryptCallback);
export const SESSION_SECONDS=30*24*60*60;
export const tokenHash=s=>createHash('sha256').update(s).digest('hex');
export const randomToken=()=>randomBytes(32).toString('base64url');
export function validPassword(password){return typeof password==='string'&&password.length>=12&&password.length<=128;}
export async function passwordHash(password){const salt=randomBytes(16).toString('hex');const key=await scrypt(password,salt,64);return salt+':'+key.toString('hex');}
export async function passwordMatches(password,stored){if(!validPassword(password)||typeof stored!=='string')return false;const[salt,hex]=stored.split(':');if(!salt||!hex||hex.length!==128)return false;const key=await scrypt(password,salt,64);return timingSafeEqual(key,Buffer.from(hex,'hex'));}
export function sessionAccount(token){if(!token)return null;return database().prepare('SELECT m.id,m.email,m.name,m.role FROM sessions s JOIN members m ON m.id=s.member_id WHERE s.token_hash=? AND s.expires_at>?').get(tokenHash(token),Date.now())||null;}
export function issueSession(id){const d=database();d.prepare('DELETE FROM sessions WHERE expires_at<=?').run(Date.now());const token=randomToken();d.prepare('INSERT INTO sessions VALUES (?,?,?)').run(tokenHash(token),id,Date.now()+SESSION_SECONDS*1000);return token;}
export function rateLimit(key){const d=database();const now=Date.now();const row=d.prepare('INSERT INTO login_limits VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN resets_at<=? THEN 1 ELSE count+1 END,resets_at=CASE WHEN resets_at<=? THEN excluded.resets_at ELSE resets_at END RETURNING count').get(key,now+15*60*1000,now,now);return row.count>10;}
export function clearSession(token){if(token)database().prepare('DELETE FROM sessions WHERE token_hash=?').run(tokenHash(token));}
