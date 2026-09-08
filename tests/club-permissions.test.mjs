import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import vm from 'node:vm';
import ts from 'typescript';
const sql=readFileSync(new URL('../drizzle/0000_curious_dagger.sql',import.meta.url),'utf8')+readFileSync(new URL('../drizzle/0001_brave_guardian.sql',import.meta.url),'utf8');
const optionExports={};vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../lib/event-options.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:optionExports});
const originExports={};vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../lib/origin.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:originExports,URL,process:{env:{}}});
const source=readFileSync(new URL('../app/api/club/route.ts',import.meta.url),'utf8');
function harness(){const sqlite=new DatabaseSync(':memory:');sqlite.exec(sql);let user=null;const db={prepare(query){return{bind(...args){const statement=sqlite.prepare(query);return{first:async()=>statement.get(...args),all:async()=>({results:statement.all(...args)}),run:async()=>statement.run(...args)}} ,first:async()=>sqlite.prepare(query).get(),all:async()=>({results:sqlite.prepare(query).all()})}},async batch(statements){sqlite.exec('BEGIN');try{const results=[];for(const s of statements)results.push(await s.run());sqlite.exec('COMMIT');return results}catch(e){sqlite.exec('ROLLBACK');throw e}}};const club={db:()=>db,identity:async()=>user,member:async()=>user?sqlite.prepare('SELECT * FROM members WHERE id=?').get(user.id):null,allowed:m=>m&&['member','admin'].includes(m.role),setupValid:async c=>c==='test-code'};const exports={};vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:id=>id==='@/lib/origin'?originExports:id==='@/lib/event-options'?optionExports:club,Response,Request,URL,crypto,console,process:{env:{}}});return{sqlite,as(id){user=id?{id,email:id+'@example.test'}:null},addMember(id,role){sqlite.prepare('INSERT INTO members VALUES (?,?,?,?,?)').run(id,id+'@example.test',id,role,new Date().toISOString())},async post(p,origin='https://club.test'){return exports.POST(new Request('https://club.test/api/club',{method:'POST',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify(p.action==='rsvp'?{eventRevision:1,...p}:p)}))},async get(id=''){return exports.GET(new Request('https://club.test/api/club'+(id?'?event='+id:'')))}}}
const event=(overrides={})=>({title:'Club evening',description:'Private plan',starts_at:'2099-10-01T18:00:00Z',location:'Club venue',category:'Social',visibility:'members',status:'scheduled',guests_allowed:1,revision:1,...overrides});
test('membership approval gates private data; only administrators create and approve',async()=>{const h=harness();assert.equal((await h.get()).status,401);h.addMember('admin','admin');h.addMember('pending','pending');h.addMember('member','member');h.as('admin');const created=await h.post({action:'save-event',event:event()});assert.equal(created.status,200);const{id}=await created.json();h.as('pending');assert.deepEqual((await(await h.get(id)).json()).events,[]);assert.equal((await h.post({action:'rsvp',eventId:id,response:'going'})).status,403);h.as('member');assert.equal((await h.post({action:'save-event',event:event()})).status,403);assert.equal((await h.post({action:'membership',id:'pending',role:'member'})).status,403);h.as('admin');assert.equal((await h.post({action:'membership',id:'pending',role:'member'})).status,200);h.as('pending');assert.equal((await(await h.get(id)).json()).detail.event.id,id)});
test('RSVPs persist, updates do not duplicate, guests validate, cancellation closes responses',async()=>{const h=harness();h.addMember('admin','admin');h.addMember('m','member');h.as('admin');const{id}=await(await h.post({action:'save-event',event:event()})).json();h.as('m');assert.equal((await h.post({action:'rsvp',eventId:id,response:'going',guests:2})).status,200);assert.equal((await h.post({action:'rsvp',eventId:id,response:'going',guests:-1})).status,400);assert.equal((await h.post({action:'rsvp',eventId:id,response:'declined',guests:2})).status,200);let d=await(await h.get(id)).json();assert.equal(d.detail.responses.length,1);assert.equal(d.detail.responses[0].guests,0);h.as('admin');await h.post({action:'save-event',event:event({id,status:'cancelled'})});h.as('m');assert.equal((await h.post({action:'rsvp',eventId:id,response:'going'})).status,409)});
test('draft details hidden, comments owner protected, revoked access and foreign origin rejected',async()=>{const h=harness();h.addMember('a','admin');h.addMember('m','member');h.addMember('n','member');h.as('a');const{id}=await(await h.post({action:'save-event',event:event()})).json();const draft=await(await h.post({action:'save-event',event:event({status:'draft'})})).json();h.as('m');assert.equal((await h.get(draft.id)).status,404);await h.post({action:'comment',eventId:id,body:'See you there'});const d=await(await h.get(id)).json();const cid=d.detail.comments[0].id;h.as('n');assert.equal((await h.post({action:'remove-comment',eventId:id,id:cid})).status,403);assert.equal((await h.post({action:'rsvp',eventId:id,response:'going'},'https://other.test')).status,403);h.as('m');assert.equal((await h.post({action:'remove-comment',eventId:id,id:cid})).status,200);h.as('a');await h.post({action:'membership',id:'m',role:'blocked'});h.as('m');assert.deepEqual((await(await h.get(id)).json()).events,[])});

const menu={id:'menu',label:'Main course',type:'choice',choices:['Fish','Vegetarian'],required:true,per_guest:true};
const transport={id:'transport',label:'Transport',type:'text',choices:[],required:false,per_guest:false};
test('per-person answers persist and private answers are only visible to author and administrator',async()=>{
 const h=harness();h.addMember('a','admin');h.addMember('m','member');h.addMember('other','member');h.as('a');
 const {id}=await(await h.post({action:'save-event',event:event({cost_pence:2250,questions:[menu,transport]})})).json();
 h.as('m');const answers={member:{menu:'Fish',transport:'Own car'},guests:[{name:'Guest name',answers:{menu:'Vegetarian'}}]};
 const result=await h.post({action:'rsvp',eventId:id,response:'going',guests:1,answers});assert.equal(result.status,200);
 let data=await(await h.get(id)).json();assert.deepEqual(data.detail.responses[0].answers,answers);assert.equal(data.detail.event.cost_pence,2250);
 h.as('other');data=await(await h.get(id)).json();assert.equal('answers' in data.detail.responses[0],false);assert.equal('answers_json' in data.detail.responses[0],false);
 h.as('a');data=await(await h.get(id)).json();assert.equal(data.detail.responses[0].answers.guests[0].name,'Guest name');
});
test('required guest answers enforced for Yes, optional for Maybe, invalid options rejected and No clears guests',async()=>{
 const h=harness();h.addMember('a','admin');h.addMember('m','member');h.as('a');const {id}=await(await h.post({action:'save-event',event:event({questions:[menu]})})).json();h.as('m');
 assert.equal((await h.post({action:'rsvp',eventId:id,response:'going',guests:1,answers:{member:{menu:'Fish'}}})).status,400);
 assert.equal((await h.post({action:'rsvp',eventId:id,response:'maybe',guests:1})).status,200);
 assert.equal((await h.post({action:'rsvp',eventId:id,response:'going',guests:0,answers:{member:{menu:'Invented dish'}}})).status,400);
 assert.equal((await h.post({action:'rsvp',eventId:id,response:'going',guests:0,answers:{member:{menu:'Fish'}}})).status,200);
 assert.equal((await h.post({action:'rsvp',eventId:id,response:'declined',guests:1})).status,200);
 const r=(await(await h.get(id)).json()).detail.responses[0];assert.equal(r.guests,0);assert.deepEqual(r.answers,{member:{},guests:[]});
});
test('event edits retain responses and reject stale edits or attendance forms',async()=>{
 const h=harness();h.addMember('a','admin');h.addMember('m','member');h.as('a');const{id}=await(await h.post({action:'save-event',event:event({questions:[menu]})})).json();h.as('m');await h.post({action:'rsvp',eventId:id,response:'going',answers:{member:{menu:'Fish'}}});h.as('a');
 assert.equal((await h.post({action:'save-event',event:event({id,title:'Changed date and menu',questions:[{...menu,choices:['Chicken','Vegetarian']}],cost_pence:3200})})).status,200);
 assert.equal((await h.post({action:'save-event',event:event({id,title:'Stale edit'})})).status,409);
 h.as('m');let data=await(await h.get(id)).json();assert.equal(data.detail.responses[0].answers.member.menu,'Fish');assert.equal(data.detail.responses[0].event_revision,1);assert.equal(data.detail.event.revision,2);
 assert.equal((await h.post({action:'rsvp',eventId:id,response:'going',answers:{member:{menu:'Fish'}}})).status,409);
 assert.equal((await h.post({action:'rsvp',eventId:id,eventRevision:2,response:'going',answers:{member:{menu:'Fish'}}})).status,400);
 assert.equal((await h.post({action:'rsvp',eventId:id,eventRevision:2,response:'going',answers:{member:{menu:'Chicken'}}})).status,200);
});
test('cost and question validation reject malformed organiser settings',async()=>{
 const h=harness();h.addMember('a','admin');h.as('a');
 for(const cost_pence of [-1,2.3,10000001])assert.equal((await h.post({action:'save-event',event:event({cost_pence})})).status,400);
 assert.equal((await h.post({action:'save-event',event:event({questions:[menu,menu]})})).status,400);
 assert.equal((await h.post({action:'save-event',event:event({questions:[{...menu,choices:['Fish']}]})})).status,400);
});
test('schema upgrade preserves existing events and attendance',()=>{
 const d=new DatabaseSync(':memory:');d.exec(readFileSync(new URL('../drizzle/0000_curious_dagger.sql',import.meta.url),'utf8'));
 d.prepare('INSERT INTO members VALUES (?,?,?,?,?)').run('m','m@example.test','Member','member','2026-01-01');
 d.prepare('INSERT INTO events VALUES (?,?,?,?,?,?,?,?,?,?,?)').run('e','Existing event','Original description','2099-01-01','Hall','Social','members','scheduled',1,'m','2026-01-01');
 d.prepare('INSERT INTO rsvps VALUES (?,?,?,?,?)').run('e','m','going',2,'2026-01-01');
 d.exec(readFileSync(new URL('../drizzle/0001_brave_guardian.sql',import.meta.url),'utf8'));
 assert.equal(d.prepare('SELECT description FROM events').get().description,'Original description');assert.equal(d.prepare('SELECT guests FROM rsvps').get().guests,2);assert.equal(d.prepare('SELECT event_revision FROM rsvps').get().event_revision,1);
});
