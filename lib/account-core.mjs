import {randomBytes,scrypt as scryptCallback,timingSafeEqual,createHash} from 'node:crypto';
import {promisify} from 'node:util';
import {database} from './database.mjs';
const scrypt=promisify(scryptCallback);
export const SESSION_SECONDS=30*24*60*60;
export const tokenHash=s=>createHash('sha256').update(s).digest('hex');
export const randomToken=()=>randomBytes(32).toString('base64url');
export function validPassword(password){return typeof password==='string'&&password.length>=12&&password.length<=128;}
const strong={N:131072,r:8,p:1,maxmem:160*1024*1024};
export async function passwordHash(password){const salt=randomBytes(16).toString('hex');const key=await scrypt(password,salt,64,strong);return 's2:'+salt+':'+key.toString('hex');}
export async function passwordMatches(password,stored){
 if(!validPassword(password)||typeof stored!=='string')return false;
 const modern=stored.startsWith('s2:');const parts=stored.split(':');const [salt,hex]=modern?parts.slice(1):parts;
 if(parts.length!==(modern?3:2)||! /^[a-f0-9]{32}$/.test(salt)||! /^[a-f0-9]{128}$/.test(hex))return false;
 const key=await scrypt(password,salt,64,modern?strong:{});return timingSafeEqual(key,Buffer.from(hex,'hex'));
}
// Fixed dummy credential gives unknown accounts the same expensive verification path.
export const DUMMY_HASH='s2:'+'0'.repeat(32)+':'+'0'.repeat(128);
let authActive=0;
export function acquireAuth(){if(authActive>=2)return false;authActive++;return true;}
export function releaseAuth(){authActive--;}
export function sessionAccount(token){if(!token)return null;return database().prepare('SELECT m.id,m.email,m.name,m.role FROM sessions s JOIN members m ON m.id=s.member_id WHERE s.token_hash=? AND s.expires_at>?').get(tokenHash(token),Date.now())||null;}
export function issueSession(id){const d=database();d.prepare('DELETE FROM sessions WHERE member_id=? AND token_hash NOT IN (SELECT token_hash FROM sessions WHERE member_id=? ORDER BY expires_at DESC LIMIT 19)').run(id,id);d.prepare('DELETE FROM sessions WHERE expires_at<=?').run(Date.now());const token=randomToken();d.prepare('INSERT INTO sessions VALUES (?,?,?)').run(tokenHash(token),id,Date.now()+SESSION_SECONDS*1000);return token;}
export function rateLimit(key,limit=10){const d=database();const now=Date.now();d.prepare('DELETE FROM login_limits WHERE resets_at<=?').run(now);const row=d.prepare('INSERT INTO login_limits VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN resets_at<=? THEN 1 ELSE count+1 END,resets_at=CASE WHEN resets_at<=? THEN excluded.resets_at ELSE resets_at END RETURNING count').get(key,now+15*60*1000,now,now);return row.count>limit;}
export function clearSession(token){if(token)database().prepare('DELETE FROM sessions WHERE token_hash=?').run(tokenHash(token));}
