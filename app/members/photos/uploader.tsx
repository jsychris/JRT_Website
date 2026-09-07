'use client';
import {useRef,useState} from 'react';
type Item={id:string,file:File,caption:string,status:'ready'|'uploading'|'done'|'error',error?:string};
export default function PhotoUploader({disabled,onBusy,onComplete}:{disabled:boolean,onBusy:(v:boolean)=>void,onComplete:()=>Promise<void>}){
 const [items,setItems]=useState<Item[]>([]);const [caption,setCaption]=useState('');const [consent,setConsent]=useState(false);const [running,setRunning]=useState(false);const [notice,setNotice]=useState('');const lock=useRef(false);
 const update=(id:string,patch:Partial<Item>)=>setItems(list=>list.map(x=>x.id===id?{...x,...patch}:x));
 async function upload(){if(lock.current)return;lock.current=true;setRunning(true);onBusy(true);setNotice('');let successes=0,failures=0;
  try{for(const item of items.filter(x=>x.status!=='done')){
   if(!item.file.size||item.file.size>15*1024*1024||!['image/jpeg','image/png','image/webp'].includes(item.file.type)){update(item.id,{status:'error',error:'Choose a JPEG, PNG or WebP photo under 15 MB.'});failures++;continue;}
   const text=(item.caption||caption).trim();if(!text){update(item.id,{status:'error',error:'Add a caption for this photo or the whole batch.'});failures++;continue;}
   update(item.id,{status:'uploading',error:''});const form=new FormData();form.append('photo',item.file);form.append('caption',text);form.append('consent','yes');form.append('uploadId',item.id);
   try{const r=await fetch('/api/photos',{method:'POST',body:form,signal:AbortSignal.timeout(120000)});const d=await r.json();if(!r.ok)throw new Error(d.error||'Upload failed.');update(item.id,{status:'done'});successes++;}
   catch(e:any){update(item.id,{status:'error',error:e.name==='TimeoutError'?'Connection timed out. Retry this photo.':e.message||'Connection lost. Retry this photo.'});failures++;}
  }
  setNotice(`${successes} uploaded${failures?`, ${failures} need attention`:''}. Uploaded photos are waiting for approval.`);
  try{await onComplete()}catch{setNotice(v=>v+' Refresh the page to update your library.');}
  }finally{lock.current=false;setRunning(false);onBusy(false);}
 }
 const remaining=items.filter(x=>x.status!=='done').length;
 return <form className="panel" style={{marginTop:24}} onSubmit={e=>{e.preventDefault();upload()}}>
  <h2 style={{fontSize:28,marginBottom:20}}>Add photos</h2>
  <label className="field"><span>Select up to 20 photos · up to 15 MB each</span><input type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={disabled||running} onChange={e=>{const files=Array.from(e.target.files||[]);if(files.length>20){setNotice('Choose no more than 20 photos at a time.');e.target.value='';return;}setItems(files.map(file=>({id:crypto.randomUUID(),file,caption:'',status:'ready'})));setNotice('');}}/><small>JPEG, PNG or WebP. Photos upload one at a time and are resized automatically. Keep this page open until the batch finishes.</small></label>
  <label className="field"><span>Caption for this batch</span><input maxLength={180} value={caption} onChange={e=>setCaption(e.target.value)} disabled={disabled||running} placeholder="An evening of pétanque with the club"/><small>You can add a different caption to individual photos below.</small></label>
  {items.length>0&&<div className="upload-list">{items.map(item=><div className="upload-item" key={item.id}><div className="upload-name"><b>{item.file.name}</b><span>{(item.file.size/1024/1024).toFixed(1)} MB · {item.status==='done'?'Uploaded':item.status==='uploading'?'Uploading…':item.status==='error'?'Needs attention':'Ready'}</span></div><label className="field"><span className="subtle">Individual caption (optional)</span><input maxLength={180} value={item.caption} disabled={disabled||running||item.status==='done'} onChange={e=>update(item.id,{caption:e.target.value})} placeholder={caption||'Use the batch caption'}/></label>{item.error&&<p className="error">{item.error}</p>}</div>)}</div>}
  <label className="photo-consent"><input type="checkbox" required checked={consent} onChange={e=>setConsent(e.target.checked)} disabled={disabled||running}/><span>I have permission to share all selected photos and for the people pictured to appear on the club’s public website.</span></label>
  {running&&<p role="status" style={{marginBottom:12}}>Uploaded {items.filter(x=>x.status==='done').length} of {items.length} photos…</p>}
  <button className="btn" disabled={disabled||running||!remaining||!consent}>{running?'Uploading…':items.some(x=>x.status==='error')?'Retry remaining photos':`Upload ${remaining||''} photos for approval`}</button>
  {notice&&<p role="status" className="notice">{notice}</p>}
 </form>;
}
