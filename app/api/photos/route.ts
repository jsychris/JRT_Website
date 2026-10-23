import {audit} from '@/lib/audit.mjs';
import {readBody,readJson,RequestError} from '@/lib/request.mjs';
import {trustedOrigin} from '@/lib/origin';
import {currentAccount} from '@/lib/auth';
import {database} from '@/lib/database.mjs';
import {MAX_UPLOAD,optimisePhoto,photoPath} from '@/lib/photos.mjs';
import {mkdir,writeFile,unlink} from 'node:fs/promises';
import {dirname} from 'node:path';
import {randomUUID} from 'node:crypto';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const activeUploads=new Set<string>();
const reply=(data:any,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(){
 const m=await currentAccount();if(!m||!['admin','member'].includes(m.role))return reply({error:'Please sign in with an active membership.'},401);
 const d=database();const photos=m.role==='admin'?d.prepare('SELECT p.*,m.name FROM photos p JOIN members m ON m.id=p.member_id ORDER BY p.created_at DESC LIMIT 1000').all():d.prepare('SELECT * FROM photos WHERE member_id=? ORDER BY created_at DESC LIMIT 1000').all(m.id);
 return reply({photos});
}
export async function POST(request:Request){
 if(!trustedOrigin(request))return reply({error:'Please use the form on this site.'},403);
 const m=await currentAccount();if(!m||!['admin','member'].includes(m.role))return reply({error:'Active membership required.'},401);
 const d=database();
 if(request.headers.get('content-type')?.startsWith('application/json')){
  let p;try{p=await readJson(request,6000);const fresh=await currentAccount();if(!fresh||fresh.id!==m.id||!['admin','member'].includes(fresh.role))return reply({error:'Active membership required.'},401);m.role=fresh.role;}catch(e){return reply({error:e instanceof Error?e.message:'Invalid request.'},e instanceof RequestError?e.status:400);}if(!p||typeof p.id!=='string')return reply({error:'Invalid request.'},400);
  const photo=d.prepare('SELECT * FROM photos WHERE id=?').get(p.id) as any;if(!photo)return reply({error:'Photo not found.'},404);
  if(p.action==='delete'){
   if(m.role!=='admin'&&photo.member_id!==m.id)return reply({error:'You cannot remove this photo.'},403);
   d.prepare('DELETE FROM photos WHERE id=?').run(p.id);audit(m.id,'delete-photo',p.id);
   await Promise.all([unlink(photoPath(p.id)).catch(()=>{}),unlink(photoPath(p.id,true)).catch(()=>{})]);return reply({ok:true});
  }
  if(m.role!=='admin')return reply({error:'Administrator access required.'},403);
  if(!['approve','reject'].includes(p.action))return reply({error:'Invalid action.'},400);
  d.prepare('UPDATE photos SET status=?,reviewed_by=?,reviewed_at=? WHERE id=?').run(p.action==='approve'?'approved':'rejected',m.id,new Date().toISOString(),p.id);audit(m.id,p.action+'-photo',p.id);
  return reply({ok:true});
 }
 const length=Number(request.headers.get('content-length'));if(length>MAX_UPLOAD+10000)return reply({error:'Choose a photo under 15 MB.'},413);
 if(activeUploads.has(m.id)||activeUploads.size>=2)return reply({error:'Photo uploads are busy. Please retry shortly.'},429);
 activeUploads.add(m.id);
 const id=randomUUID();let saved=false;
 try{
  const bytes=await readBody(request,MAX_UPLOAD+10000,30000);
  const form=await new Response(bytes,{headers:{'Content-Type':request.headers.get('content-type')||''}}).formData();
  const uploadId=form.get('uploadId');
  if(uploadId!==null&&(typeof uploadId!=='string'||! /^[a-f0-9-]{36}$/.test(uploadId)))return reply({error:'Invalid upload identifier.'},400);
  if(uploadId&&d.prepare('SELECT id FROM photos WHERE member_id=? AND upload_id=?').get(m.id,uploadId))return reply({ok:true});
  if(form.getAll('photo').length!==1)return reply({error:'Send one photo per request.'},400);
  const file=form.get('photo');const caption=String(form.get('caption')||'').trim();
  if(!(file instanceof File)||!file.size||file.size>MAX_UPLOAD)return reply({error:'Choose a photo under 15 MB.'},400);
  if(caption.length>180)return reply({error:'Captions must be 180 characters or fewer.'},400);
  if(form.get('consent')!=='yes')return reply({error:'Confirm permission to share this photo publicly.'},400);
  const result=await optimisePhoto(Buffer.from(await file.arrayBuffer()));
  const path=photoPath(id);await mkdir(dirname(path),{recursive:true});await writeFile(path,result.image,{flag:'wx'});await writeFile(photoPath(id,true),result.thumbnail,{flag:'wx'});
  d.exec('BEGIN IMMEDIATE');try{
   if(!d.prepare("SELECT id FROM members WHERE id=? AND role IN ('admin','member')").get(m.id))throw new RequestError('Active membership required.',401);
   const pending=d.prepare("SELECT COUNT(*) n FROM photos WHERE member_id=? AND status='pending'").get(m.id) as any;
   const usage=d.prepare('SELECT COALESCE(SUM(bytes),0) n,COUNT(*) count FROM photos').get() as any;
   if(pending.n>=100)throw new Error('You already have 100 photos awaiting review.');
   if(usage.n+result.image.length+result.thumbnail.length>1024*1024*1024||usage.count>=1000)throw new Error('The photo library is full. Ask the administrator to remove some photos.');
   d.prepare('INSERT INTO photos (id,member_id,caption,bytes,width,height,created_at,upload_id) VALUES (?,?,?,?,?,?,?,?)').run(id,m.id,caption,result.image.length+result.thumbnail.length,result.width,result.height,new Date().toISOString(),uploadId);
   d.exec('COMMIT');saved=true;
  }catch(e){d.exec('ROLLBACK');throw e;}
  return reply({ok:true});
 }catch(e:any){if(e instanceof RequestError)return reply({error:e.message},e.status);return reply({error:e.message?.includes('already have')||e.message?.includes('library is full')?e.message:'Unable to upload this photo. Use a still JPEG, PNG or WebP under 15 MB.'},400);}
 finally{activeUploads.delete(m.id);if(!saved)await Promise.all([unlink(photoPath(id)).catch(()=>{}),unlink(photoPath(id,true)).catch(()=>{})]);}
}
