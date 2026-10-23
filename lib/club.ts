import {adapter} from './database.mjs';
import {currentAccount} from './auth';
import {timingSafeEqual,createHash} from 'node:crypto';
export function db(){return adapter();}
export async function identity(){const m=await currentAccount();return m?{id:m.id,email:m.email}:null;}
export async function member(){return currentAccount();}
export async function publicEvents(){return (await db().prepare("SELECT * FROM events WHERE visibility='public' AND status!='draft' AND starts_at>=? ORDER BY starts_at").bind(new Date().toISOString()).all()).results as any[];}
export async function setupValid(code:string){const expected=process.env.CLUB_SETUP_HASH||'';const actual=createHash('sha256').update(code).digest('hex');return expected.length===64&&timingSafeEqual(Buffer.from(actual),Buffer.from(expected));}
export function allowed(m:any):m is {id:string,email:string,name:string,role:string}{return m&&['member','admin'].includes(m.role);}
