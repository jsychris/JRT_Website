// Bound allocation before parsing, including chunked requests without Content-Length.
export class RequestError extends Error {
 constructor(message,status=400){super(message);this.status=status;}
}
export async function readBody(request,limit,timeoutMs=15000){
 const length=request.headers.get('content-length');
 if(length!==null&&(!/^\d+$/.test(length)||Number(length)>limit))throw new RequestError('Request too large.',413);
 const reader=request.body?.getReader();if(!reader)return Buffer.alloc(0);
 const chunks=[];let size=0;let timer;
 const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>{reject(new RequestError('Request timed out.',408));void reader.cancel().catch(()=>{});},timeoutMs);});
 try{
  while(true){const {done,value}=await Promise.race([reader.read(),timeout]);if(done)break;size+=value.byteLength;if(size>limit){void reader.cancel().catch(()=>{});throw new RequestError('Request too large.',413);}chunks.push(value);}
  return Buffer.concat(chunks,size);
 }finally{clearTimeout(timer);reader.releaseLock();}
}
export async function readJson(request,limit){
 if(request.headers.get('content-type')?.split(';')[0].trim()!=='application/json')throw new RequestError('Send JSON.',415);
 const bytes=await readBody(request,limit);let p;try{p=JSON.parse(bytes.toString('utf8'));}catch{throw new RequestError('Invalid request.');}
 if(!p||typeof p!=='object'||Array.isArray(p))throw new RequestError('Invalid request.');return p;
}
