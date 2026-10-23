import {DatabaseSync} from 'node:sqlite';
import {mkdirSync,readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
const KEY=Symbol.for('jrt.database');
export function database(){
 if(globalThis[KEY])return globalThis[KEY];
 const directory=process.env.RAILWAY_VOLUME_MOUNT_PATH||process.env.DATA_DIRECTORY;
 if(!directory)throw new Error('Attach a persistent volume or set DATA_DIRECTORY.');
 mkdirSync(directory,{recursive:true});const d=new DatabaseSync(join(directory,'club.sqlite'));
 d.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;');
 d.exec('CREATE TABLE IF NOT EXISTS app_migrations (name TEXT PRIMARY KEY, checksum TEXT NOT NULL)');
 d.exec('BEGIN IMMEDIATE');try{
  for(const name of readdirSync(join(process.cwd(),'drizzle')).filter(n=>n.endsWith('.sql')).sort()){
   const sql=readFileSync(join(process.cwd(),'drizzle',name),'utf8');const checksum=createHash('sha256').update(sql).digest('hex');
   const old=d.prepare('SELECT checksum FROM app_migrations WHERE name=?').get(name);
   if(old){if(old.checksum!==checksum)throw new Error('Applied migration changed: '+name);continue;}
   d.exec(sql);d.prepare('INSERT INTO app_migrations VALUES (?,?)').run(name,checksum);
  }d.exec('COMMIT');
 }catch(e){d.exec('ROLLBACK');d.close();throw e;}
 globalThis[KEY]=d;return d;
}
export function adapter(){const d=database();return {
 prepare(sql){const s=d.prepare(sql);const bound=(args=[])=>({first:async()=>s.get(...args)||null,all:async()=>({results:s.all(...args)}),run:async()=>s.run(...args)});return{...bound(),bind:(...args)=>bound(args)};},
 async batch(items){d.exec('BEGIN IMMEDIATE');try{const out=[];for(const item of items)out.push(await item.run());d.exec('COMMIT');return out;}catch(e){d.exec('ROLLBACK');throw e;}}
};}
