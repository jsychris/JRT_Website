import {trustedOrigin} from '@/lib/origin';
import {db,identity,member,allowed,setupValid} from '@/lib/club';
import {normaliseQuestions, normaliseAnswers, readQuestions} from '@/lib/event-options';
import {database} from '@/lib/database.mjs';
import {randomToken,tokenHash} from '@/lib/account-core.mjs';
export const dynamic='force-dynamic';
const reply=(data:any,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const fail=(error:string,status=400)=>reply({error},status);
export async function GET(request:Request){try{const u=await identity();if(!u)return fail('Please sign in.',401);const m=await member();const configured=!!(await db().prepare("SELECT value FROM settings WHERE key='admin_claimed'").first());if(!allowed(m))return reply({member:m,configured,events:[]});const events=(await db().prepare(m.role==='admin'?'SELECT * FROM events ORDER BY starts_at':"SELECT * FROM events WHERE status!='draft' ORDER BY starts_at").all()).results;const id=new URL(request.url).searchParams.get('event');let detail=null;if(id){const event=events.find((e:any)=>e.id===id);if(!event)return fail('Event not found.',404);const responses=(await db().prepare('SELECT r.member_id,r.response,r.guests,r.answers_json,r.event_revision,m.name FROM rsvps r JOIN members m ON m.id=r.member_id WHERE r.event_id=?').bind(id).all()).results;const comments=(await db().prepare('SELECT c.id,c.member_id,c.body,c.created,m.name FROM comments c JOIN members m ON m.id=c.member_id WHERE c.event_id=? ORDER BY c.created').bind(id).all()).results;detail={event,responses:responses.map((r:any)=>{const {answers_json,...summary}=r;return {...summary,...(m.role==='admin'||r.member_id===u.id?{answers:JSON.parse(answers_json)}:{})};}),comments};}const members=m.role==='admin'?(await db().prepare('SELECT id,email,name,role FROM members ORDER BY created DESC').all()).results:[];return reply({member:m,configured,events,detail,members});}catch(e){console.error('Club load failed',e);return fail('The club programme could not be loaded. Please try again.',503);}}
export async function POST(request:Request){try{if(!trustedOrigin(request))return fail('Please use the form on this site.',403);const u=await identity();if(!u)return fail('Please sign in.',401);const raw=await request.text();if(raw.length>100000)return fail('This entry is too long.');let p:any;try{p=JSON.parse(raw);}catch{return fail('Invalid request.');}if(!p||typeof p!=='object'||Array.isArray(p))return fail('Invalid request.');const m=await member();const now=new Date().toISOString();const name=String(p.name||'').trim().slice(0,100);
if(!allowed(m))return fail('Club membership approval is required.',403);
if(p.action==='invite'){
 if(m.role!=='admin')return fail('Administrator access required.',403);
 const email=String(p.email||'').trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)return fail('Enter a valid email address.');
 const token=randomToken();const d=database();d.prepare('DELETE FROM invitations WHERE email=? OR expires_at<=?').run(email,Date.now());d.prepare('INSERT INTO invitations VALUES (?,?,?,?)').run(tokenHash(token),email,Date.now()+7*24*60*60*1000,u.id);
 return reply({ok:true,invitePath:'/login#invite='+token});
}
if(p.action==='promote-admin'){
 if(m.role!=='admin')return fail('Administrator access required.',403);
 if(typeof p.id!=='string'||!p.id)return fail('Choose a member.');
 if(p.id===u.id)return fail('You already have administrator access.');
 const promoted=await db().prepare("UPDATE members SET role='admin' WHERE id=? AND role='member' RETURNING id").bind(p.id).first();
 if(!promoted)return fail('Only an active club member can be made an administrator. Refresh the member list and try again.',409);
 return reply({ok:true});
}
if(p.action==='membership'){if(m.role!=='admin')return fail('Administrator access required.',403);if(p.id===u.id)return fail('You cannot change your own administrator access.');if(!['member','blocked'].includes(p.role))return fail('Invalid membership status.');await db().prepare("UPDATE members SET role=? WHERE id=? AND role!='admin'").bind(p.role,p.id).run();return reply({ok:true});}
if(p.action==='save-event'){
  if(m.role!=='admin')return fail('Administrator access required.',403);
  const e=p.event||{};const title=String(e.title||'').trim();const description=String(e.description||'').trim();const date=new Date(e.starts_at);
  if(!title||title.length>140||description.length>8000||isNaN(date.getTime()))return fail('Add a title and valid date; keep the description under 8,000 characters.');
  if(!['public','members'].includes(e.visibility)||!['scheduled','draft','cancelled'].includes(e.status)||!['Social','Community','Fundraising','International','Club meeting'].includes(e.category))return fail('Choose valid event settings.');
  const cost=Number(e.cost_pence??0);if(!Number.isSafeInteger(cost)||cost<0||cost>10000000)return fail('Enter a cost between £0 and £100,000, with at most two decimal places.');
  let questions;try{questions=normaliseQuestions(e.questions??[]);}catch(error:any){return fail(error.message);}
  const values=[title,description,date.toISOString(),String(e.location||'').trim().slice(0,250),e.category,e.visibility,e.status,e.guests_allowed?1:0,cost,JSON.stringify(questions)];
  const id=e.id||crypto.randomUUID();
  if(e.id){
    if(!Number.isInteger(e.revision))return fail('Reload this event before editing it.',409);
    const saved=await db().prepare('UPDATE events SET title=?,description=?,starts_at=?,location=?,category=?,visibility=?,status=?,guests_allowed=?,cost_pence=?,options_json=?,revision=revision+1 WHERE id=? AND revision=? RETURNING id').bind(...values,id,e.revision).first();
    if(!saved)return fail('This event changed while you were editing. Reload it before saving again.',409);
  }else{
    await db().prepare('INSERT INTO events (title,description,starts_at,location,category,visibility,status,guests_allowed,cost_pence,options_json,id,created_by,created) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(...values,id,u.id,now).run();
  }
  return reply({ok:true,id});
}
const event=await db().prepare("SELECT * FROM events WHERE id=?").bind(String(p.eventId||'')).first() as any;if(!event||event.status==='draft'&&m.role!=='admin')return fail('Event not found.',404);
if(p.action==='remove-comment'){const c=await db().prepare('SELECT member_id FROM comments WHERE id=? AND event_id=?').bind(p.id,event.id).first() as any;if(!c||c.member_id!==u.id&&m.role!=='admin')return fail('You cannot remove this comment.',403);await db().prepare('DELETE FROM comments WHERE id=? AND event_id=?').bind(p.id,event.id).run();return reply({ok:true});}
if(event.status!=='scheduled'||event.starts_at<now)return fail('Responses are closed for this event.',409);
if(p.action==='rsvp'){
  if(!['going','maybe','declined'].includes(p.response))return fail('Choose an attendance response.');
  if(p.eventRevision!==event.revision)return fail('The event details have changed. Reload the event and review your response.',409);
  const guests=p.response==='declined'?0:Number(p.guests||0);
  if(!Number.isInteger(guests)||guests<0||guests>20)return fail('Choose between 0 and 20 guests.');
  if(guests&&!event.guests_allowed)return fail('This event does not allow guests.');
  let answers;try{answers=normaliseAnswers(readQuestions(event.options_json),p.answers,guests,p.response);}catch(error:any){return fail(error.message);}
  const saved=await db().prepare("INSERT INTO rsvps (event_id,member_id,response,guests,updated,answers_json,event_revision) SELECT id,?,?,?,?,?,revision FROM events WHERE id=? AND revision=? AND status='scheduled' AND starts_at>=? ON CONFLICT(event_id,member_id) DO UPDATE SET response=excluded.response,guests=excluded.guests,updated=excluded.updated,answers_json=excluded.answers_json,event_revision=excluded.event_revision RETURNING event_id").bind(u.id,p.response,guests,now,JSON.stringify(answers),event.id,p.eventRevision,now).first();
  if(!saved)return fail('The event changed while you were responding. Reload and review it.',409);
  return reply({ok:true});
}
if(p.action==='comment'){const body=String(p.body||'').trim();if(!body||body.length>2000)return fail('Write a comment of 1–2,000 characters.');await db().prepare('INSERT INTO comments (id,event_id,member_id,body,created) VALUES (?,?,?,?,?)').bind(crypto.randomUUID(),event.id,u.id,body,now).run();return reply({ok:true});}return fail('Unknown action.');}catch(e){console.error('Club save failed',e);return fail('Your change could not be saved. Please try again.',503);}}
