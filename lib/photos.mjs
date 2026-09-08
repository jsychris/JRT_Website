import sharp from 'sharp';
import {join} from 'node:path';
export const MAX_UPLOAD=15*1024*1024;
export function photoPath(id,thumb=false){
 if(!/^[a-f0-9-]{36}$/.test(id))throw new Error('Invalid photo');
 const directory=process.env.RAILWAY_VOLUME_MOUNT_PATH||process.env.DATA_DIRECTORY;
 if(!directory)throw new Error('Photo storage unavailable');
 return join(directory,'photos',id+(thumb?'-thumb':'')+'.webp');
}
export async function optimisePhoto(buffer){
 // Reject unsupported codecs before invoking the native image parser.
 const jpeg=buffer.length>=3&&buffer[0]===255&&buffer[1]===216&&buffer[2]===255;
 const png=buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
 const webp=buffer.toString('ascii',0,4)==='RIFF'&&buffer.toString('ascii',8,12)==='WEBP';
 if(!jpeg&&!png&&!webp)throw new Error('Choose a still JPEG, PNG or WebP photo.');
 const input=sharp(buffer,{limitInputPixels:50_000_000,failOn:'error'});
 const metadata=await input.metadata();
 if(!['jpeg','png','webp'].includes(metadata.format)|| (metadata.pages||1)>1)throw new Error('Choose a still JPEG, PNG or WebP photo.');
 let result=await input.rotate().resize({width:1920,height:1920,fit:'inside',withoutEnlargement:true}).webp({quality:80,effort:4}).toBuffer({resolveWithObject:true});
 if(result.data.length>900*1024)result=await sharp(result.data).resize({width:1600,height:1600,fit:'inside',withoutEnlargement:true}).webp({quality:70}).toBuffer({resolveWithObject:true});
 if(result.data.length>1500*1024)throw new Error('This photo cannot be reduced enough. Please choose a smaller image.');
 const thumbnail=await sharp(result.data).resize({width:480,height:480,fit:'inside',withoutEnlargement:true}).webp({quality:72}).toBuffer();
 return {image:result.data,thumbnail,width:result.info.width,height:result.info.height};
}
