import {database} from '@/lib/database.mjs';
import {currentAccount} from '@/lib/auth';
import {photoPath} from '@/lib/photos.mjs';
import {readFile} from 'node:fs/promises';
export const dynamic='force-dynamic';
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;const photo=database().prepare('SELECT member_id,status FROM photos WHERE id=?').get(id) as any;
 const headers={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'};
 if(!photo)return new Response(null,{status:404,headers});
 if(photo.status!=='approved'){
  const m=await currentAccount();if(!m||!['admin','member'].includes(m.role)||(m.role!=='admin'&&m.id!==photo.member_id))return new Response(null,{status:404,headers});
 }
 try{return new Response(new Uint8Array(await readFile(photoPath(id,new URL(request.url).searchParams.get('size')==='thumb'))),{headers:{...headers,'Content-Type':'image/webp'}});}catch{return new Response(null,{status:404,headers});}
}
