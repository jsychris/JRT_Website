import {trustedOrigin} from '@/lib/origin';
import {NextResponse} from 'next/server';
import {cookies} from 'next/headers';
import {randomUUID} from 'node:crypto';
import {database} from '@/lib/database.mjs';
import {passwordHash,passwordMatches,validPassword,issueSession,clearSession,rateLimit,tokenHash,SESSION_SECONDS} from '@/lib/account-core.mjs';
import {COOKIE} from '@/lib/auth';
import {setupValid} from '@/lib/club';
export const dynamic='force-dynamic';
const error=(message:string,status=400)=>NextResponse.json({error:message},{status,headers:{'Cache-Control':'no-store'}});
export async function POST(request:Request){try{
 if(!trustedOrigin(request))return error('Use the sign-in form on this website.',403);
 const text=await request.text();if(text.length>6000)return error('Request too large.');const p=JSON.parse(text);
 if(!p||typeof p!=='object')return error('Invalid request.');
 if(p.action==='logout'){clearSession((await cookies()).get(COOKIE)?.value);const r=NextResponse.json({ok:true});r.cookies.set(COOKIE,'',{path:'/',maxAge:0,httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax'});return r;}
 const email=typeof p.email==='string'?p.email.trim().toLowerCase():'';
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||!validPassword(p.password))return error('Enter your email and a password of 12–128 characters.');
 if(rateLimit('auth:'+email))return error('Too many attempts. Please try again in 15 minutes.',429);
 const d=database();let id:string;
 if(p.action==='login'){
  const account=d.prepare('SELECT member_id,password_hash FROM accounts WHERE email=?').get(email) as any;
  if(!account||!await passwordMatches(p.password,account.password_hash))return error('Email or password not recognised.',401);
  id=account.member_id;
 }else if(p.action==='register'||p.action==='setup'){
  const name=String(p.name||'').trim();if(!name||name.length>100)return error('Enter your name, up to 100 characters.');
  if(p.action==='setup'&&!await setupValid(String(p.token||'')))return error('Setup code not recognised.',403);
  const hash=await passwordHash(p.password);id=randomUUID();
  d.exec('BEGIN IMMEDIATE');try{
   if(p.action==='setup'){
    if(d.prepare("SELECT value FROM settings WHERE key='admin_claimed'").get())throw new Error('The administrator is already set up.');
    d.prepare("INSERT INTO settings VALUES ('admin_claimed',?)").run(id);
   }else{
    const invitation=d.prepare('SELECT email FROM invitations WHERE token_hash=? AND expires_at>?').get(tokenHash(String(p.token||'')),Date.now()) as any;
    if(!invitation||invitation.email!==email)throw new Error('Invitation expired or does not match this email.');
    d.prepare('DELETE FROM invitations WHERE token_hash=?').run(tokenHash(p.token));
   }
   const existing=d.prepare('SELECT member_id FROM accounts WHERE email=?').get(email) as any;
   if(existing){if(p.action==='setup')throw new Error('An account already exists for this email.');id=existing.member_id;d.prepare('UPDATE accounts SET password_hash=? WHERE member_id=?').run(hash,id);d.prepare('DELETE FROM sessions WHERE member_id=?').run(id);}else{
   d.prepare('INSERT INTO members (id,email,name,role,created) VALUES (?,?,?,?,?)').run(id,email,name,p.action==='setup'?'admin':'member',new Date().toISOString());
   d.prepare('INSERT INTO accounts VALUES (?,?,?)').run(id,email,hash);}
   d.exec('COMMIT');
  }catch(e:any){d.exec('ROLLBACK');return error(e.message);}
 }else return error('Unknown action.');
 const r=NextResponse.json({ok:true},{headers:{'Cache-Control':'no-store'}});r.cookies.set(COOKIE,issueSession(id),{path:'/',httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',maxAge:SESSION_SECONDS});return r;
 }catch(e){console.error('Sign-in unavailable',e);return error('Sign-in is temporarily unavailable. Please try again.',503);}}
