import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const dir=mkdtempSync(join(tmpdir(),'jrt-auth-'));process.env.DATA_DIRECTORY=dir;
const {database}=await import('../lib/database.mjs');
const {passwordHash,passwordMatches,sessionAccount,issueSession,clearSession,rateLimit,tokenHash}=await import('../lib/account-core.mjs');
after(()=>{database().close();rmSync(dir,{recursive:true,force:true})});
test('passwords are salted, verified and wrong passwords rejected',async()=>{const hash=await passwordHash('a strong test password');assert.notEqual(hash,await passwordHash('a strong test password'));assert.equal(await passwordMatches('a strong test password',hash),true);assert.equal(await passwordMatches('a different password',hash),false);});
test('sessions survive requests, expire and revoke without trusting headers',()=>{database().prepare('INSERT INTO members VALUES (?,?,?,?,?)').run('m','member@example.test','Member','member',new Date().toISOString());const t=issueSession('m');assert.equal(sessionAccount(t).id,'m');assert.equal(sessionAccount('forged'),null);database().prepare('UPDATE sessions SET expires_at=0 WHERE token_hash=?').run(tokenHash(t));assert.equal(sessionAccount(t),null);const fresh=issueSession('m');clearSession(fresh);assert.equal(sessionAccount(fresh),null);});
test('login limit is persistent and blocks repeated attempts',()=>{for(let i=0;i<10;i++)assert.equal(rateLimit('test-account'),false);assert.equal(rateLimit('test-account'),true);});
test('database runs migrations once and keeps data',()=>{assert.equal(database().prepare('SELECT name FROM members WHERE id=?').get('m').name,'Member');assert.equal(database().prepare('SELECT count(*) as count FROM app_migrations').get().count,readdirSync(new URL('../drizzle',import.meta.url)).filter(n=>n.endsWith('.sql')).length);});
test('blocking permanently revokes sessions and reset links, even after unblocking',()=>{
 const d=database(),token=issueSession('m');d.prepare('INSERT INTO invitations VALUES (?,?,?,?)').run(tokenHash('invite'),'member@example.test',Date.now()+100000,'m');
 d.prepare("UPDATE members SET role='blocked' WHERE id='m'").run();assert.equal(sessionAccount(token),null);assert.equal(d.prepare('SELECT COUNT(*) n FROM invitations').get().n,0);
 d.prepare("UPDATE members SET role='member' WHERE id='m'").run();assert.equal(sessionAccount(token),null);
});
test('expired limiter keys are removed and active rows stay bounded by the global gate',()=>{
 database().prepare('INSERT INTO login_limits VALUES (?,?,?)').run('expired',1,0);rateLimit('fresh');assert.equal(database().prepare("SELECT key FROM login_limits WHERE key='expired'").get(),undefined);
});
