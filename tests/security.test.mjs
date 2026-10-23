import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readBody,readJson} from '../lib/request.mjs';
import {optimisePhoto} from '../lib/photos.mjs';
import {scryptSync} from 'node:crypto';
import {passwordMatches,acquireAuth,releaseAuth} from '../lib/account-core.mjs';
const request=body=>new Request('https://club.test',{method:'POST',headers:{'Content-Type':'application/json'},body});
test('request limits reject oversize chunked bodies before reading the rest',async()=>{
 let cancelled=false;const body=new ReadableStream({pull(c){c.enqueue(new Uint8Array(11));},cancel(){cancelled=true;}});
 await assert.rejects(readBody(new Request('https://club.test',{method:'POST',body,duplex:'half'}),10),e=>e.status===413);assert.equal(cancelled,true);
});
test('slow request times out and releases reader',async()=>{
 const body=new ReadableStream({start(){}});await assert.rejects(readBody(new Request('https://club.test',{method:'POST',body,duplex:'half'}),10,10),e=>e.status===408);
});
test('malformed JSON and non-object payloads fail with 400; byte limits include UTF8',async()=>{
 for(const body of ['null','[]','1','{broken'])await assert.rejects(readJson(request(body),100),e=>e.status===400);
 await assert.rejects(readJson(request('{"s":"éééé"}'),12),e=>e.status===413);
 assert.deepEqual(await readJson(request('{"ok":true}'),20),{ok:true});
});
test('legacy password hashes still authenticate without accepting malformed hashes',async()=>{
 const salt='a'.repeat(32),password='existing member password';const hash=salt+':'+scryptSync(password,salt,64).toString('hex');
 assert.equal(await passwordMatches(password,hash),true);assert.equal(await passwordMatches(password,salt+':'+'z'.repeat(128)),false);
});
test('expensive authentication work has a hard concurrency bound',()=>{
 assert.equal(acquireAuth(),true);assert.equal(acquireAuth(),true);assert.equal(acquireAuth(),false);releaseAuth();assert.equal(acquireAuth(),true);releaseAuth();releaseAuth();
});
test('unsupported native codecs and disguised image uploads are rejected',async()=>{
 for(const content of ['<svg xmlns="http://www.w3.org/2000/svg"></svg>','\0\0\0 ftypavif','%PDF-1.7'])await assert.rejects(optimisePhoto(Buffer.from(content)),/still JPEG/);
});
