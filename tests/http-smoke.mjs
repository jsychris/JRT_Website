import sharp from 'sharp';
import {spawn} from 'node:child_process';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomBytes,createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const dir=mkdtempSync(join(tmpdir(),'jrt-http-'));const base='http://127.0.0.1:3197';const code=randomBytes(24).toString('hex');let logs='';let child;const nativeFetch=globalThis.fetch;globalThis.fetch=(url,options={})=>nativeFetch(url,{...options,signal:AbortSignal.timeout(3000)});
function start(){child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-H','127.0.0.1','-p','3197'],{env:{...process.env,NODE_ENV:'production',DATA_DIRECTORY:dir,APP_URL:base,CLUB_SETUP_HASH:createHash('sha256').update(code).digest('hex')},stdio:['ignore','pipe','pipe']});child.stdout.on('data',x=>logs+=x);child.stderr.on('data',x=>logs+=x);}
async function ready(){for(let i=0;i<20;i++){try{if((await fetch(base+'/api/health')).ok)return;}catch{}await new Promise(r=>setTimeout(r,100));}throw new Error('Server not ready: '+logs);}
async function stop(){if(!child||child.exitCode!==null||child.signalCode!==null)return;await new Promise(r=>{child.once('exit',r);child.kill('SIGTERM')});}
async function post(path,data,cookie=''){const r=await fetch(base+path,{method:'POST',headers:{origin:base,'Content-Type':'application/json',cookie},body:JSON.stringify(data)});return {r,data:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]||''};}
try{
 start();await ready();assert.equal((await fetch(base)).status,200);
 const forged=await fetch(base+'/api/club',{headers:{'oai-authenticated-user-id':'admin','oai-authenticated-user-email':'admin@example.test'}});assert.equal(forged.status,401);
 const setup=await post('/api/auth',{action:'setup',email:'admin@example.test',name:'Admin',password:'strong test passphrase',token:code});assert.equal(setup.r.status,200,JSON.stringify(setup.data));const admin=setup.cookie;
 const e=await post('/api/club',{action:'save-event',event:{title:'Test event',description:'Test description',starts_at:'2099-01-01T19:00:00Z',location:'Hall',category:'Social',visibility:'members',status:'scheduled',guests_allowed:1,cost_pence:1500,questions:[]}},admin);assert.equal(e.r.status,200,JSON.stringify(e.data));
 const invite=await post('/api/club',{action:'invite',email:'member@example.test'},admin);assert.equal(invite.r.status,200);const token=invite.data.invitePath.split('=')[1];
 const register=await post('/api/auth',{action:'register',email:'member@example.test',name:'Member',password:'member test passphrase',token});assert.equal(register.r.status,200,JSON.stringify(register.data));const member=register.cookie;
 const image=await sharp({create:{width:3000,height:2000,channels:3,background:'#dd9911'}}).jpeg().withMetadata({exif:{IFD0:{Artist:'Metadata should be removed'}}}).toBuffer();
 async function upload(bytes=image,cookie=member){const form=new FormData();form.append('photo',new Blob([bytes],{type:'image/jpeg'}),'club.jpg');form.append('caption','Club evening');form.append('consent','yes');return fetch(base+'/api/photos',{method:'POST',headers:{origin:base,cookie},body:form});}
 assert.equal((await upload(image,'')).status,401);
 assert.equal((await upload(Buffer.from('<svg></svg>'))).status,400);
 const uploaded=await upload();assert.equal(uploaded.status,200,await uploaded.text());
 const list=await(await fetch(base+'/api/photos',{headers:{cookie:member}})).json();assert.equal(list.photos.length,1);const photo=list.photos[0];assert.equal(photo.status,'pending');
 assert.equal((await fetch(base+'/api/photos/'+photo.id)).status,404);
 const preview=await fetch(base+'/api/photos/'+photo.id,{headers:{cookie:member}});assert.equal(preview.status,200);const metadata=await sharp(Buffer.from(await preview.arrayBuffer())).metadata();assert.equal(metadata.format,'webp');assert.ok(metadata.width<=1920&&metadata.height<=1920);assert.equal(metadata.exif,undefined);
 assert.equal((await post('/api/photos',{id:photo.id,action:'approve'},member)).r.status,403);
 assert.equal((await post('/api/photos',{id:photo.id,action:'approve'},admin)).r.status,200);
 assert.equal((await fetch(base+'/api/photos/'+photo.id)).status,200);
 assert.ok((await(await fetch(base)).text()).includes('/api/photos/'+photo.id));
 const replay=await post('/api/auth',{action:'register',email:'member@example.test',name:'Member',password:'member test passphrase',token});assert.equal(replay.r.status,400);
 const rsvp=await post('/api/club',{action:'rsvp',eventId:e.data.id,eventRevision:1,response:'going',guests:1,answers:{member:{},guests:[{name:'Friend',answers:{}}]}},member);assert.equal(rsvp.r.status,200,JSON.stringify(rsvp.data));
 const unauthorised=await post('/api/club',{action:'invite',email:'other@example.test'},member);assert.equal(unauthorised.r.status,403);
 await stop();start();await ready();const data=await(await fetch(base+'/api/club?event='+e.data.id,{headers:{cookie:member}})).json();assert.equal(data.detail.responses[0].guests,1);
 assert.equal((await fetch(base+'/api/photos/'+photo.id)).status,200);
 assert.equal((await post('/api/photos',{id:photo.id,action:'reject'},admin)).r.status,200);
 assert.equal((await fetch(base+'/api/photos/'+photo.id)).status,404);
 assert.ok(!(await(await fetch(base)).text()).includes('/api/photos/'+photo.id));
 assert.equal((await post('/api/photos',{id:photo.id,action:'delete'},member)).r.status,200);
 assert.equal((await fetch(base+'/api/photos/'+photo.id,{headers:{cookie:admin}})).status,404);
 const reset=await post('/api/club',{action:'invite',email:'member@example.test'},admin);const changed=await post('/api/auth',{action:'register',email:'member@example.test',name:'Member',password:'changed test passphrase',token:reset.data.invitePath.split('=')[1]});assert.equal(changed.r.status,200);assert.equal((await fetch(base+'/api/club',{headers:{cookie:member}})).status,401);
 const logout=await post('/api/auth',{action:'logout'},changed.cookie);assert.equal(logout.r.status,200);assert.equal((await fetch(base+'/api/club',{headers:{cookie:changed.cookie}})).status,401);
 console.log('Photo upload, compression, private review, approval, removal and restart checks passed. Production HTTP checks passed: setup, invitations, RSVP persistence, restart, password reset, logout and forged-header rejection.');
}finally{await stop();rmSync(dir,{recursive:true,force:true});}
